# Premium Features Routes
# Free trial, enhanced referrals, annual bundles, preview access

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime, timezone, timedelta
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Import auth helper
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

premium_router = APIRouter(prefix="/api/premium", tags=["Premium"])

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Trial configuration
TRIAL_CONFIG = {
    "lesson_1_trial_days": 3,  # 3 days free access to lesson 1 videos
    "preview_seconds": 30,     # 30 seconds preview for premium content
    "referral_bonus_days": 7,  # 7 days trial for each successful referral
}

# Annual bundle pricing
ANNUAL_BUNDLES = {
    "starter_annual": {
        "name": "Starter Annuel",
        "monthly_price": 9.99,
        "annual_price": 79.99,  # 2 mois gratuits
        "savings": 39.89,
        "savings_percent": 33
    },
    "pro_annual": {
        "name": "Pro Annuel", 
        "monthly_price": 19.99,
        "annual_price": 159.99,  # 2 mois gratuits
        "savings": 79.89,
        "savings_percent": 33
    },
    "elite_annual": {
        "name": "Elite Annuel",
        "monthly_price": 25.0,
        "annual_price": 199.99,  # 2 mois gratuits
        "savings": 100.01,
        "savings_percent": 33
    }
}


class TrialStatus(BaseModel):
    has_trial: bool
    trial_active: bool
    days_remaining: int
    trial_end_date: Optional[str]
    lesson_id: str
    can_access_video: bool
    can_access_audio: bool
    is_preview_only: bool
    preview_seconds: int = 30


class ReferralBonusRequest(BaseModel):
    referrer_user_id: str
    referred_user_id: str


def calculate_trial_status(user_created_at: str, lesson_id: str, subscription_tier: str, is_admin: bool = False) -> TrialStatus:
    """Calculate trial status for a user and lesson"""
    
    # Check if this is one of the first 3 free lessons
    FREE_LESSONS = [
        "course-foundations-lesson-1",
        "course-foundations-lesson-2", 
        "course-foundations-lesson-3"
    ]
    is_free_lesson = lesson_id in FREE_LESSONS
    
    # Admins always have full access
    if is_admin:
        return TrialStatus(
            has_trial=False,
            trial_active=False,
            days_remaining=0,
            trial_end_date=None,
            lesson_id=lesson_id,
            can_access_video=True,
            can_access_audio=True,
            is_preview_only=False,
            preview_seconds=0
        )
    
    # Paid users always have full access
    if subscription_tier in ["starter", "pro", "elite"]:
        return TrialStatus(
            has_trial=False,
            trial_active=False,
            days_remaining=0,
            trial_end_date=None,
            lesson_id=lesson_id,
            can_access_video=True,
            can_access_audio=True,
            is_preview_only=False,
            preview_seconds=0
        )
    
    # First 3 lessons are ALWAYS FREE for everyone
    if is_free_lesson:
        return TrialStatus(
            has_trial=False,
            trial_active=False,
            days_remaining=0,
            trial_end_date=None,
            lesson_id=lesson_id,
            can_access_video=True,
            can_access_audio=True,
            is_preview_only=False,
            preview_seconds=0
        )
    
    # Other lessons - preview only for free users
    return TrialStatus(
        has_trial=False,
        trial_active=False,
        days_remaining=0,
        trial_end_date=None,
        lesson_id=lesson_id,
        can_access_video=False,
        can_access_audio=False,
        is_preview_only=True,
        preview_seconds=TRIAL_CONFIG["preview_seconds"]
    )


@premium_router.get("/trial/status/{lesson_id}")
async def get_trial_status(
    lesson_id: str,
    user_created_at: Optional[str] = None,
    subscription_tier: str = "free",
    is_admin: bool = False
):
    """Get trial status for a specific lesson"""
    
    # Admins always have full access
    if is_admin:
        return TrialStatus(
            has_trial=False,
            trial_active=False,
            days_remaining=0,
            trial_end_date=None,
            lesson_id=lesson_id,
            can_access_video=True,
            can_access_audio=True,
            is_preview_only=False,
            preview_seconds=0
        )
    
    # Check if lesson is one of the 3 free lessons
    FREE_LESSONS = [
        "course-foundations-lesson-1",
        "course-foundations-lesson-2", 
        "course-foundations-lesson-3"
    ]
    
    # Free lessons are accessible to everyone
    if lesson_id in FREE_LESSONS:
        return TrialStatus(
            has_trial=False,
            trial_active=False,
            days_remaining=0,
            trial_end_date=None,
            lesson_id=lesson_id,
            can_access_video=True,
            can_access_audio=True,
            is_preview_only=False,
            preview_seconds=0
        )
    
    if not user_created_at:
        # Guest user on non-free lesson - preview only
        return TrialStatus(
            has_trial=False,
            trial_active=False,
            days_remaining=0,
            trial_end_date=None,
            lesson_id=lesson_id,
            can_access_video=False,
            can_access_audio=False,
            is_preview_only=True,
            preview_seconds=TRIAL_CONFIG["preview_seconds"]
        )
    
    return calculate_trial_status(user_created_at, lesson_id, subscription_tier, is_admin)


@premium_router.get("/trial/config")
async def get_trial_config():
    """Get trial configuration"""
    return TRIAL_CONFIG


@premium_router.get("/bundles/annual")
async def get_annual_bundles():
    """Get annual subscription bundles with savings"""
    return {
        "bundles": ANNUAL_BUNDLES,
        "message": "Économisez 33% avec un abonnement annuel!"
    }


@premium_router.get("/preview/config")
async def get_preview_config():
    """Get preview configuration for premium content"""
    return {
        "preview_seconds": TRIAL_CONFIG["preview_seconds"],
        "preview_enabled": True,
        "message": "Aperçu de 30 secondes disponible pour le contenu premium"
    }


@premium_router.post("/referral/bonus")
async def apply_referral_bonus(request: ReferralBonusRequest):
    """Apply referral bonus - extend trial by 7 days"""
    # This would be called when a referral is confirmed
    # In a real implementation, this would update the database
    
    # Create notification for the referrer
    try:
        await db.notifications.insert_one({
            "user_id": request.referrer_user_id,
            "type": "referral_bonus",
            "title": "Bonus de Parrainage!",
            "message": f"Félicitations! Vous avez gagné {TRIAL_CONFIG['referral_bonus_days']} jours d'essai gratuit grâce à votre parrainage!",
            "icon": "gift",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    except Exception as e:
        print(f"Error creating notification: {e}")
    
    return {
        "success": True,
        "bonus_days": TRIAL_CONFIG["referral_bonus_days"],
        "message": f"Félicitations! Vous avez gagné {TRIAL_CONFIG['referral_bonus_days']} jours d'essai gratuit!"
    }


@premium_router.post("/trial/expiry-reminder/{user_id}")
async def send_trial_expiry_reminder(user_id: str, days_remaining: int = 1):
    """Send trial expiry reminder notification"""
    try:
        await db.notifications.insert_one({
            "user_id": user_id,
            "type": "trial_expiry",
            "title": "Votre essai expire bientôt!",
            "message": f"Il vous reste {days_remaining} jour{'s' if days_remaining > 1 else ''} pour profiter de l'accès vidéo gratuit. Passez à un abonnement pour continuer.",
            "icon": "clock",
            "action_url": "/pricing",
            "action_label": "Voir les offres",
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        return {"success": True, "message": "Reminder sent"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@premium_router.get("/user/access-summary")
async def get_user_access_summary(
    user_created_at: Optional[str] = None,
    subscription_tier: str = "free",
    referral_count: int = 0
):
    """Get comprehensive access summary for a user"""
    
    # Calculate base trial
    if user_created_at:
        try:
            created_date = datetime.fromisoformat(user_created_at.replace('Z', '+00:00'))
        except ValueError:
            created_date = datetime.now(timezone.utc)
        
        # Base trial + referral bonuses
        base_trial_days = TRIAL_CONFIG["lesson_1_trial_days"]
        referral_bonus_days = referral_count * TRIAL_CONFIG["referral_bonus_days"]
        total_trial_days = base_trial_days + referral_bonus_days
        
        trial_end = created_date + timedelta(days=total_trial_days)
        now = datetime.now(timezone.utc)
        days_remaining = max(0, (trial_end - now).days)
    else:
        days_remaining = 0
        total_trial_days = 0
        referral_bonus_days = 0
    
    # Determine access level
    if subscription_tier in ["elite"]:
        access_level = "full"
        features = ["all_courses", "ai_mentor", "certificates", "simulator", "videos", "audio"]
    elif subscription_tier in ["pro"]:
        access_level = "pro"
        features = ["all_courses", "certificates", "simulator", "videos", "audio"]
    elif subscription_tier in ["starter"]:
        access_level = "starter"
        features = ["level_1_2", "simulator", "videos", "audio"]
    else:
        access_level = "free"
        features = ["level_1", "trial_videos"]
    
    return {
        "subscription_tier": subscription_tier,
        "access_level": access_level,
        "features": features,
        "trial": {
            "base_days": TRIAL_CONFIG["lesson_1_trial_days"],
            "referral_bonus_days": referral_bonus_days,
            "total_days": total_trial_days,
            "days_remaining": days_remaining,
            "is_active": days_remaining > 0
        },
        "upgrade_options": ANNUAL_BUNDLES if subscription_tier == "free" else {}
    }
