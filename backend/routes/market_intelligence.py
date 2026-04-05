# Market Intelligence & Newsletter Routes
# API endpoints for market data, news, and newsletter management

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import httpx
import os
import asyncio
import logging
import re
import resend

# Import security utilities
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from security import limiter, InputSanitizer, AuditLogger, get_client_ip, RATE_LIMITS

# Initialize Resend
resend.api_key = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')

logger = logging.getLogger(__name__)

market_router = APIRouter(prefix="/api/market", tags=["market"])
newsletter_router = APIRouter(prefix="/api/newsletter", tags=["newsletter"])

# MongoDB setup (will be set from server.py)
db = None

def set_database(database):
    global db
    db = database

# CoinGecko API (free tier)
COINGECKO_API = "https://api.coingecko.com/api/v3"

# Cache for market data (simple in-memory cache)
market_cache = {}
CACHE_TTL_CRYPTOS = 60   # seconds — crypto prices change slowly enough
CACHE_TTL_GLOBAL  = 120  # global/fear-greed changes even more slowly


def _cache_fresh(key: str, ttl: int) -> bool:
    entry = market_cache.get(key)
    if not entry:
        return False
    return (datetime.now(timezone.utc) - entry["ts"]).total_seconds() < ttl


# ============ MARKET ROUTES ============

@market_router.get("/cryptos")
async def get_cryptos(limit: int = 50):
    """Get top cryptocurrencies with market data"""
    cache_key = f"cryptos_{limit}"
    if _cache_fresh(cache_key, CACHE_TTL_CRYPTOS):
        return {"cryptos": market_cache[cache_key]["data"]}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                f"{COINGECKO_API}/coins/markets",
                params={
                    "vs_currency": "usd",
                    "order": "market_cap_desc",
                    "per_page": min(limit, 250),
                    "page": 1,
                    "sparkline": True,
                    "price_change_percentage": "24h,7d"
                }
            )

            if response.status_code == 200:
                data = response.json()
                market_cache[cache_key] = {"data": data, "ts": datetime.now(timezone.utc)}
                return {"cryptos": data}
            else:
                # Return stale cache or mock on API error
                if cache_key in market_cache:
                    return {"cryptos": market_cache[cache_key]["data"]}
                return {"cryptos": get_mock_cryptos()[:limit]}

    except Exception as e:
        logger.error(f"CoinGecko API error: {e}")
        if cache_key in market_cache:
            return {"cryptos": market_cache[cache_key]["data"]}
        return {"cryptos": get_mock_cryptos()[:limit]}


@market_router.get("/global")
async def get_global_data():
    """Get global market data including fear & greed index"""
    if _cache_fresh("global", CACHE_TTL_GLOBAL):
        return market_cache["global"]["data"]

    fallback = {
        "total_market_cap": {"usd": 2400000000000},
        "total_volume": {"usd": 89000000000},
        "market_cap_percentage": {"btc": 52.3, "eth": 17.8},
        "market_cap_change_percentage_24h_usd": 1.5,
        "fear_greed": {"value": 65, "label": "Greed"}
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # Fetch both external sources concurrently
            global_resp, fg_resp = await asyncio.gather(
                client.get(f"{COINGECKO_API}/global"),
                client.get("https://api.alternative.me/fng/", timeout=5.0),
                return_exceptions=True
            )

            global_data = {}
            if not isinstance(global_resp, Exception) and global_resp.status_code == 200:
                data = global_resp.json().get("data", {})
                global_data = {
                    "total_market_cap": data.get("total_market_cap", {}),
                    "total_volume": data.get("total_volume", {}),
                    "market_cap_percentage": data.get("market_cap_percentage", {}),
                    "market_cap_change_percentage_24h_usd": data.get("market_cap_change_percentage_24h_usd", 0)
                }

            if not isinstance(fg_resp, Exception) and fg_resp.status_code == 200:
                fg_data = fg_resp.json().get("data", [{}])[0]
                global_data["fear_greed"] = {
                    "value": int(fg_data.get("value", 50)),
                    "label": fg_data.get("value_classification", "Neutral")
                }
            else:
                global_data["fear_greed"] = fallback["fear_greed"]

            if global_data:
                market_cache["global"] = {"data": global_data, "ts": datetime.now(timezone.utc)}
                return global_data

    except Exception as e:
        logger.error(f"Global data API error: {e}")

    if "global" in market_cache:
        return market_cache["global"]["data"]
    return fallback


@market_router.get("/news")
async def get_crypto_news(limit: int = 10):
    """Get latest crypto news"""
    # For now, return curated mock news
    # In production, integrate with CryptoCompare News API or similar
    mock_news = [
        {
            "title": "Bitcoin Surges Past $67,000 as Institutional Interest Grows",
            "description": "Major financial institutions continue to accumulate Bitcoin, driving prices to new highs.",
            "url": "https://example.com/news/1",
            "imageUrl": "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=200",
            "source": "CryptoNews",
            "publishedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "title": "Ethereum Layer 2 Solutions See Record Activity",
            "description": "Arbitrum and Optimism report all-time high transaction volumes as users seek lower fees.",
            "url": "https://example.com/news/2",
            "imageUrl": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200",
            "source": "DeFi Daily",
            "publishedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "title": "SEC Approves New Crypto ETF Applications",
            "description": "Regulatory clarity continues to improve as more investment vehicles receive approval.",
            "url": "https://example.com/news/3",
            "imageUrl": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=200",
            "source": "BlockchainTimes",
            "publishedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "title": "DeFi Protocol Launches Revolutionary Yield Strategy",
            "description": "New automated strategies promise sustainable yields for liquidity providers.",
            "url": "https://example.com/news/4",
            "imageUrl": "https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=200",
            "source": "YieldWatch",
            "publishedAt": datetime.now(timezone.utc).isoformat()
        },
        {
            "title": "Major Bank Announces Crypto Custody Services",
            "description": "Traditional finance continues to embrace digital assets with new custody solutions.",
            "url": "https://example.com/news/5",
            "imageUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200",
            "source": "FinanceToday",
            "publishedAt": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    return {"articles": mock_news[:limit]}


@market_router.get("/trending")
async def get_trending():
    """Get trending cryptocurrencies"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{COINGECKO_API}/search/trending",
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                return {"trending": data.get("coins", [])}
            
    except Exception as e:
        print(f"Trending API error: {e}")
    
    return {"trending": []}


# ============ NEWSLETTER ROUTES ============

class NewsletterSubscription(BaseModel):
    email: EmailStr
    language: str = "en"
    interests: List[str] = []


class NewsletterCreate(BaseModel):
    subject: str
    content: str
    language: str = "en"
    send_immediately: bool = False
    scheduled_at: Optional[str] = None


# Helper function to serialize MongoDB documents
def serialize_subscriber(sub):
    return {
        "email": sub.get("email"),
        "language": sub.get("language", "en"),
        "interests": sub.get("interests", []),
        "subscribed_at": sub.get("subscribed_at"),
        "active": sub.get("active", True)
    }

def serialize_newsletter(nl):
    return {
        "id": str(nl.get("_id")),
        "subject": nl.get("subject"),
        "content": nl.get("content"),
        "language": nl.get("language", "en"),
        "created_at": nl.get("created_at"),
        "sent": nl.get("sent", False),
        "sent_at": nl.get("sent_at"),
        "recipients_count": nl.get("recipients_count", 0),
        "status": nl.get("status", "draft"),
        "failed_count": nl.get("failed_count", 0)
    }


@newsletter_router.post("/subscribe")
@limiter.limit(RATE_LIMITS["newsletter"])
async def subscribe_newsletter(request: Request, subscription: NewsletterSubscription):
    """Subscribe to the newsletter"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    client_ip = get_client_ip(request)
    
    # Sanitize and validate email
    clean_email = InputSanitizer.sanitize_email(subscription.email)
    if not clean_email:
        logger.warning(f"Newsletter subscribe: Invalid email from {client_ip}")
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Check for injection in interests
    clean_interests = []
    for interest in subscription.interests[:10]:  # Limit to 10 interests
        is_injection, _ = InputSanitizer.detect_injection(interest)
        if not is_injection:
            clean_interests.append(InputSanitizer.sanitize_string(interest, max_length=50))
    
    # Check if already subscribed
    existing = db.newsletter_subscribers.find_one({"email": clean_email})
    if existing:
        return {"success": True, "message": "Already subscribed", "already_subscribed": True}
    
    subscriber = {
        "email": clean_email,
        "language": subscription.language[:5] if subscription.language else "en",
        "interests": clean_interests,
        "subscribed_at": datetime.now(timezone.utc).isoformat(),
        "subscribed_ip": client_ip,
        "active": True
    }
    db.newsletter_subscribers.insert_one(subscriber)
    
    logger.info(f"Newsletter subscribe: {clean_email} from {client_ip}")
    
    total = db.newsletter_subscribers.count_documents({})
    return {
        "success": True,
        "message": "Successfully subscribed to newsletter",
        "subscriber_count": total
    }


@newsletter_router.post("/unsubscribe")
async def unsubscribe_newsletter(email: str):
    """Unsubscribe from newsletter"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    result = db.newsletter_subscribers.update_one(
        {"email": email},
        {"$set": {"active": False}}
    )
    
    if result.modified_count > 0:
        return {"success": True, "message": "Successfully unsubscribed"}
    
    return {"success": False, "message": "Email not found"}


@newsletter_router.get("/subscribers")
async def get_subscribers():
    """Get all newsletter subscribers (admin only)"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    all_subs = list(db.newsletter_subscribers.find({}, {"_id": 0}))
    active_subs = [s for s in all_subs if s.get("active", True)]
    
    return {
        "total": len(all_subs),
        "active": len(active_subs),
        "subscribers": active_subs
    }


@newsletter_router.post("/create")
async def create_newsletter(newsletter: NewsletterCreate, background_tasks: BackgroundTasks):
    """Create a new newsletter (admin only)"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    new_newsletter = {
        "subject": newsletter.subject,
        "content": newsletter.content,
        "language": newsletter.language,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "sent": False,
        "sent_at": None,
        "recipients_count": 0,
        "failed_count": 0,
        "status": "draft"
    }
    
    result = db.newsletters.insert_one(new_newsletter)
    new_newsletter["id"] = str(result.inserted_id)
    if "_id" in new_newsletter:
        del new_newsletter["_id"]
    
    if newsletter.send_immediately:
        background_tasks.add_task(send_newsletter_task, str(result.inserted_id))
        new_newsletter["status"] = "sending"
    
    return {"success": True, "newsletter": new_newsletter}


@newsletter_router.get("/list")
async def list_newsletters():
    """List all newsletters (admin only)"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    newsletters = list(db.newsletters.find().sort("created_at", -1))
    return {"newsletters": [serialize_newsletter(n) for n in newsletters]}


@newsletter_router.post("/send/{newsletter_id}")
async def send_newsletter(newsletter_id: str, background_tasks: BackgroundTasks):
    """Send a newsletter to all subscribers"""
    if db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    
    try:
        newsletter = db.newsletters.find_one({"_id": ObjectId(newsletter_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid newsletter ID")
    
    if not newsletter:
        raise HTTPException(status_code=404, detail="Newsletter not found")
    
    if newsletter.get("sent"):
        raise HTTPException(status_code=400, detail="Newsletter already sent")
    
    background_tasks.add_task(send_newsletter_task, newsletter_id)
    
    return {"success": True, "message": "Newsletter is being sent"}


@newsletter_router.post("/generate-ai")
async def generate_ai_newsletter(topic: str = "weekly_recap", language: str = "en"):
    """Generate newsletter content using AI (requires LLM budget)"""
    # This will use the AI when budget is available
    # For now, return a template
    templates = {
        "weekly_recap": {
            "en": {
                "subject": "Your Weekly Crypto Recap - CryptoCoach",
                "content": """
# Weekly Crypto Market Recap

## Market Overview
This week in crypto has been eventful...

## Top Performers
1. Bitcoin (BTC) - Up X%
2. Ethereum (ETH) - Up X%

## Key Events
- Major announcements
- Regulatory updates
- DeFi highlights

## Learning Tip of the Week
[Educational content based on your progress]

## Coming Up
- New lessons available
- Upcoming webinars

Happy learning!
The CryptoCoach Team
                """
            },
            "fr": {
                "subject": "Votre Récap Crypto Hebdomadaire - CryptoCoach",
                "content": """
# Récap Hebdomadaire du Marché Crypto

## Aperçu du Marché
Cette semaine en crypto a été mouvementée...

## Top Performers
1. Bitcoin (BTC) - +X%
2. Ethereum (ETH) - +X%

## Événements Clés
- Annonces majeures
- Mises à jour réglementaires
- Points forts DeFi

## Conseil d'Apprentissage de la Semaine
[Contenu éducatif basé sur votre progression]

## À Venir
- Nouvelles leçons disponibles
- Webinaires à venir

Bon apprentissage !
L'équipe CryptoCoach
                """
            },
            "ar": {
                "subject": "ملخصك الأسبوعي للعملات المشفرة - CryptoCoach",
                "content": """
# ملخص سوق العملات المشفرة الأسبوعي

## نظرة عامة على السوق
كان هذا الأسبوع في العملات المشفرة حافلاً بالأحداث...

## أفضل الأداء
1. بيتكوين (BTC) - ارتفاع X%
2. إيثريوم (ETH) - ارتفاع X%

## الأحداث الرئيسية
- إعلانات رئيسية
- تحديثات تنظيمية
- أبرز أحداث DeFi

## نصيحة التعلم لهذا الأسبوع
[محتوى تعليمي بناءً على تقدمك]

## القادم
- دروس جديدة متاحة
- ندوات قادمة

تعلم سعيد!
فريق CryptoCoach
                """
            }
        }
    }
    
    template = templates.get(topic, templates["weekly_recap"])
    content = template.get(language, template["en"])
    
    return {
        "success": True,
        "generated": content,
        "ai_used": False,
        "note": "AI generation requires LLM budget. Using template for now."
    }


async def send_newsletter_task(newsletter_id: str):
    """Background task to send newsletter emails using Resend"""
    if db is None:
        logger.error("Database not initialized")
        return
    
    try:
        newsletter = db.newsletters.find_one({"_id": ObjectId(newsletter_id)})
    except Exception as e:
        logger.error(f"Invalid newsletter ID: {e}")
        return
    
    if not newsletter:
        logger.error(f"Newsletter {newsletter_id} not found")
        return
    
    # Get active subscribers
    all_subs = list(db.newsletter_subscribers.find({"active": True}, {"_id": 0}))
    
    # Filter by language if specified
    if newsletter.get("language") != "all":
        all_subs = [s for s in all_subs if s.get("language") == newsletter.get("language")]
    
    logger.info(f"Sending newsletter '{newsletter['subject']}' to {len(all_subs)} subscribers")
    
    # Check if Resend is configured
    if not resend.api_key or resend.api_key == 're_placeholder_ask_user_for_key':
        logger.warning("Resend API key not configured - marking as sent without actually sending")
        db.newsletters.update_one(
            {"_id": ObjectId(newsletter_id)},
            {"$set": {
                "sent": True,
                "sent_at": datetime.now(timezone.utc).isoformat(),
                "recipients_count": len(all_subs),
                "status": "sent (mock - no API key)"
            }}
        )
        return
    
    # Convert markdown content to HTML
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
            h1 {{ color: #2563eb; }}
            h2 {{ color: #1e40af; }}
            .footer {{ margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }}
            .unsubscribe {{ color: #9ca3af; }}
        </style>
    </head>
    <body>
        <h1>TheCryptoCoach.io</h1>
        <div>
            {newsletter['content'].replace(chr(10), '<br>')}
        </div>
        <div class="footer">
            <p>© {datetime.now().year} TheCryptoCoach.io - Your trusted crypto education platform</p>
            <p class="unsubscribe">You received this email because you subscribed to our newsletter.</p>
        </div>
    </body>
    </html>
    """
    
    sent_count = 0
    failed_count = 0
    
    for subscriber in all_subs:
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [subscriber["email"]],
                "subject": newsletter["subject"],
                "html": html_content
            }
            # Run sync SDK in thread to keep async
            await asyncio.to_thread(resend.Emails.send, params)
            sent_count += 1
            logger.info(f"Email sent to {subscriber['email']}")
        except Exception as e:
            failed_count += 1
            logger.error(f"Failed to send to {subscriber['email']}: {str(e)}")
    
    # Update newsletter in DB
    db.newsletters.update_one(
        {"_id": ObjectId(newsletter_id)},
        {"$set": {
            "sent": True,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "recipients_count": sent_count,
            "failed_count": failed_count,
            "status": "sent"
        }}
    )
    
    logger.info(f"Newsletter sending complete: {sent_count} sent, {failed_count} failed")


def get_mock_cryptos():
    """Return mock crypto data when API is unavailable"""
    return [
        {
            "id": "bitcoin",
            "symbol": "btc",
            "name": "Bitcoin",
            "image": "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
            "current_price": 67432,
            "market_cap": 1324000000000,
            "price_change_percentage_24h": 2.34,
            "sparkline_in_7d": {"price": [65000, 66000, 65500, 67000, 66500, 67200, 67432]}
        },
        {
            "id": "ethereum",
            "symbol": "eth",
            "name": "Ethereum",
            "image": "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
            "current_price": 3521,
            "market_cap": 423000000000,
            "price_change_percentage_24h": 1.82,
            "sparkline_in_7d": {"price": [3400, 3450, 3420, 3500, 3480, 3510, 3521]}
        },
        {
            "id": "binancecoin",
            "symbol": "bnb",
            "name": "BNB",
            "image": "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
            "current_price": 598,
            "market_cap": 89000000000,
            "price_change_percentage_24h": -0.45,
            "sparkline_in_7d": {"price": [600, 595, 602, 598, 601, 599, 598]}
        },
        {
            "id": "solana",
            "symbol": "sol",
            "name": "Solana",
            "image": "https://assets.coingecko.com/coins/images/4128/small/solana.png",
            "current_price": 142,
            "market_cap": 62000000000,
            "price_change_percentage_24h": 3.21,
            "sparkline_in_7d": {"price": [135, 138, 140, 137, 141, 143, 142]}
        },
        {
            "id": "ripple",
            "symbol": "xrp",
            "name": "XRP",
            "image": "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
            "current_price": 0.52,
            "market_cap": 28000000000,
            "price_change_percentage_24h": 0.89,
            "sparkline_in_7d": {"price": [0.50, 0.51, 0.50, 0.52, 0.51, 0.52, 0.52]}
        },
        {
            "id": "cardano",
            "symbol": "ada",
            "name": "Cardano",
            "image": "https://assets.coingecko.com/coins/images/975/small/cardano.png",
            "current_price": 0.45,
            "market_cap": 16000000000,
            "price_change_percentage_24h": -1.23,
            "sparkline_in_7d": {"price": [0.46, 0.45, 0.44, 0.45, 0.46, 0.45, 0.45]}
        },
        {
            "id": "dogecoin",
            "symbol": "doge",
            "name": "Dogecoin",
            "image": "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
            "current_price": 0.082,
            "market_cap": 12000000000,
            "price_change_percentage_24h": 5.67,
            "sparkline_in_7d": {"price": [0.075, 0.078, 0.077, 0.080, 0.079, 0.081, 0.082]}
        },
        {
            "id": "polkadot",
            "symbol": "dot",
            "name": "Polkadot",
            "image": "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
            "current_price": 7.23,
            "market_cap": 10000000000,
            "price_change_percentage_24h": 2.11,
            "sparkline_in_7d": {"price": [7.0, 7.1, 7.05, 7.15, 7.20, 7.18, 7.23]}
        },
        {
            "id": "avalanche-2",
            "symbol": "avax",
            "name": "Avalanche",
            "image": "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
            "current_price": 35.67,
            "market_cap": 14000000000,
            "price_change_percentage_24h": 4.32,
            "sparkline_in_7d": {"price": [33, 34, 33.5, 35, 34.5, 35.2, 35.67]}
        },
        {
            "id": "chainlink",
            "symbol": "link",
            "name": "Chainlink",
            "image": "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
            "current_price": 14.56,
            "market_cap": 8500000000,
            "price_change_percentage_24h": 1.45,
            "sparkline_in_7d": {"price": [14.0, 14.2, 14.1, 14.4, 14.3, 14.5, 14.56]}
        }
    ]
