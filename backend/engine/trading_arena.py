# TheCryptoCoach 2.0 - Trading Arena Engine
# Real-time trading simulation with live market data

import httpx
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
import logging
import random

logger = logging.getLogger(__name__)

# CoinGecko API for live prices
COINGECKO_API = "https://api.coingecko.com/api/v3"

# Supported cryptocurrencies
SUPPORTED_CRYPTOS = {
    "bitcoin": {"symbol": "BTC", "name": "Bitcoin", "icon": "₿", "color": "#F7931A"},
    "ethereum": {"symbol": "ETH", "name": "Ethereum", "icon": "Ξ", "color": "#627EEA"},
    "binancecoin": {"symbol": "BNB", "name": "BNB", "icon": "🔶", "color": "#F3BA2F"},
    "solana": {"symbol": "SOL", "name": "Solana", "icon": "◎", "color": "#00FFA3"},
    "cardano": {"symbol": "ADA", "name": "Cardano", "icon": "₳", "color": "#0033AD"},
    "ripple": {"symbol": "XRP", "name": "XRP", "icon": "✕", "color": "#23292F"},
    "polkadot": {"symbol": "DOT", "name": "Polkadot", "icon": "●", "color": "#E6007A"},
    "dogecoin": {"symbol": "DOGE", "name": "Dogecoin", "icon": "Ð", "color": "#C2A633"},
    "avalanche-2": {"symbol": "AVAX", "name": "Avalanche", "icon": "🔺", "color": "#E84142"},
    "chainlink": {"symbol": "LINK", "name": "Chainlink", "icon": "⬡", "color": "#375BD2"},
    "polygon": {"symbol": "MATIC", "name": "Polygon", "icon": "⬡", "color": "#8247E5"},
    "uniswap": {"symbol": "UNI", "name": "Uniswap", "icon": "🦄", "color": "#FF007A"}
}

# Trading Arena Configuration
STARTING_BALANCE = 10000.0  # €10,000 starting capital
TRADING_FEE_PERCENT = 0.1  # 0.1% trading fee
MAX_LEVERAGE = 5  # Maximum leverage allowed

# Leagues configuration
LEAGUES = {
    "bronze": {"name": "Bronze", "icon": "🥉", "min_profit": 0, "color": "#CD7F32"},
    "silver": {"name": "Silver", "icon": "🥈", "min_profit": 1000, "color": "#C0C0C0"},
    "gold": {"name": "Gold", "icon": "🥇", "min_profit": 5000, "color": "#FFD700"},
    "platinum": {"name": "Platinum", "icon": "💠", "min_profit": 15000, "color": "#E5E4E2"},
    "diamond": {"name": "Diamond", "icon": "💎", "min_profit": 50000, "color": "#B9F2FF"},
    "legendary": {"name": "Legendary", "icon": "👑", "min_profit": 100000, "color": "#FF6B6B"}
}

class TradingArena:
    """Main trading simulation engine"""
    
    def __init__(self):
        self._price_cache = {}
        self._cache_time = None
        self._cache_duration = 60  # Cache prices for 60 seconds
    
    async def get_live_prices(self, force_refresh: bool = False) -> Dict[str, Any]:
        """Fetch live cryptocurrency prices from CoinGecko"""
        
        # Check cache
        if not force_refresh and self._cache_time:
            if datetime.now(timezone.utc) - self._cache_time < timedelta(seconds=self._cache_duration):
                return self._price_cache
        
        try:
            crypto_ids = ",".join(SUPPORTED_CRYPTOS.keys())
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{COINGECKO_API}/simple/price",
                    params={
                        "ids": crypto_ids,
                        "vs_currencies": "eur,usd",
                        "include_24hr_change": "true",
                        "include_24hr_vol": "true",
                        "include_market_cap": "true"
                    },
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Format response
                    prices = {}
                    for crypto_id, price_data in data.items():
                        if crypto_id in SUPPORTED_CRYPTOS:
                            crypto_info = SUPPORTED_CRYPTOS[crypto_id]
                            prices[crypto_info["symbol"]] = {
                                "id": crypto_id,
                                "symbol": crypto_info["symbol"],
                                "name": crypto_info["name"],
                                "icon": crypto_info["icon"],
                                "color": crypto_info["color"],
                                "price_eur": price_data.get("eur", 0),
                                "price_usd": price_data.get("usd", 0),
                                "change_24h": price_data.get("eur_24h_change", 0),
                                "volume_24h": price_data.get("eur_24h_vol", 0),
                                "market_cap": price_data.get("eur_market_cap", 0)
                            }
                    
                    self._price_cache = prices
                    self._cache_time = datetime.now(timezone.utc)
                    return prices
                else:
                    logger.warning(f"CoinGecko API returned {response.status_code}")
                    return self._price_cache or {}
                    
        except Exception as e:
            logger.error(f"Error fetching prices: {e}")
            return self._price_cache or self._get_fallback_prices()
    
    def _get_fallback_prices(self) -> Dict[str, Any]:
        """Fallback prices if API fails"""
        return {
            "BTC": {"id": "bitcoin", "symbol": "BTC", "name": "Bitcoin", "price_eur": 45000, "change_24h": 2.5},
            "ETH": {"id": "ethereum", "symbol": "ETH", "name": "Ethereum", "price_eur": 2500, "change_24h": 1.8},
            "BNB": {"id": "binancecoin", "symbol": "BNB", "name": "BNB", "price_eur": 350, "change_24h": -0.5},
            "SOL": {"id": "solana", "symbol": "SOL", "name": "Solana", "price_eur": 120, "change_24h": 5.2},
            "ADA": {"id": "cardano", "symbol": "ADA", "name": "Cardano", "price_eur": 0.45, "change_24h": -1.2}
        }
    
    async def get_price_history(self, crypto_id: str, days: int = 30) -> List[Dict]:
        """Get historical price data for charts"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{COINGECKO_API}/coins/{crypto_id}/market_chart",
                    params={"vs_currency": "eur", "days": days},
                    timeout=10.0
                )
                
                if response.status_code == 200:
                    data = response.json()
                    prices = data.get("prices", [])
                    return [
                        {"timestamp": p[0], "price": p[1]}
                        for p in prices
                    ]
                return []
        except Exception as e:
            logger.error(f"Error fetching price history: {e}")
            return []
    
    def calculate_trade(
        self, 
        action: str,  # "buy" or "sell"
        symbol: str,
        amount_eur: float,
        current_price: float,
        leverage: int = 1
    ) -> Dict[str, Any]:
        """Calculate trade details"""
        
        if leverage > MAX_LEVERAGE:
            leverage = MAX_LEVERAGE
        
        # Calculate fees
        fee = amount_eur * (TRADING_FEE_PERCENT / 100)
        net_amount = amount_eur - fee
        
        # Calculate crypto amount
        if action == "buy":
            crypto_amount = (net_amount * leverage) / current_price
        else:
            crypto_amount = amount_eur / current_price
        
        return {
            "action": action,
            "symbol": symbol,
            "amount_eur": amount_eur,
            "crypto_amount": crypto_amount,
            "price_at_trade": current_price,
            "fee": fee,
            "leverage": leverage,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def calculate_pnl(
        self,
        position: Dict,
        current_price: float
    ) -> Dict[str, Any]:
        """Calculate profit/loss for a position"""
        
        entry_price = position["price_at_trade"]
        crypto_amount = position["crypto_amount"]
        leverage = position.get("leverage", 1)
        
        if position["action"] == "buy":
            # Long position
            pnl_percent = ((current_price - entry_price) / entry_price) * 100 * leverage
            pnl_eur = (current_price - entry_price) * crypto_amount
        else:
            # Short position
            pnl_percent = ((entry_price - current_price) / entry_price) * 100 * leverage
            pnl_eur = (entry_price - current_price) * crypto_amount
        
        current_value = crypto_amount * current_price
        
        return {
            "pnl_percent": round(pnl_percent, 2),
            "pnl_eur": round(pnl_eur, 2),
            "current_value": round(current_value, 2),
            "entry_price": entry_price,
            "current_price": current_price,
            "is_profit": pnl_eur > 0
        }
    
    def get_league(self, total_profit: float) -> Dict[str, Any]:
        """Determine player's league based on total profit"""
        current_league = "bronze"
        
        for league_id, league_info in LEAGUES.items():
            if total_profit >= league_info["min_profit"]:
                current_league = league_id
        
        league = LEAGUES[current_league]
        return {
            "id": current_league,
            "name": league["name"],
            "icon": league["icon"],
            "color": league["color"],
            "total_profit": total_profit
        }
    
    def generate_market_event(self) -> Optional[Dict[str, Any]]:
        """Generate random market events for scenarios"""
        events = [
            {
                "type": "news",
                "title": "Breaking: Major Institution Adopts Bitcoin",
                "impact": "bullish",
                "affected_cryptos": ["BTC", "ETH"],
                "price_impact_percent": random.uniform(2, 8)
            },
            {
                "type": "news",
                "title": "Regulatory Concerns in Major Market",
                "impact": "bearish",
                "affected_cryptos": ["BTC", "ETH", "BNB"],
                "price_impact_percent": random.uniform(-5, -2)
            },
            {
                "type": "technical",
                "title": "Bitcoin Breaks Key Resistance",
                "impact": "bullish",
                "affected_cryptos": ["BTC"],
                "price_impact_percent": random.uniform(3, 10)
            },
            {
                "type": "whale",
                "title": "Whale Alert: Large BTC Transfer Detected",
                "impact": "neutral",
                "affected_cryptos": ["BTC"],
                "price_impact_percent": random.uniform(-2, 2)
            },
            {
                "type": "defi",
                "title": "New DeFi Protocol Launches with High APY",
                "impact": "bullish",
                "affected_cryptos": ["ETH", "UNI", "LINK"],
                "price_impact_percent": random.uniform(1, 5)
            }
        ]
        
        # 20% chance of event occurring
        if random.random() < 0.2:
            return random.choice(events)
        return None


class TournamentManager:
    """Manage trading tournaments and competitions"""
    
    def __init__(self, db):
        self.db = db
    
    async def create_tournament(
        self,
        name: str,
        start_time: datetime,
        end_time: datetime,
        starting_balance: float = 10000,
        entry_fee_coins: int = 0
    ) -> Dict[str, Any]:
        """Create a new tournament"""
        tournament = {
            "id": f"tournament-{datetime.now().timestamp()}",
            "name": name,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "starting_balance": starting_balance,
            "entry_fee_coins": entry_fee_coins,
            "participants": [],
            "status": "upcoming",
            "prize_pool": {},
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.tournaments.insert_one(tournament)
        return tournament
    
    async def join_tournament(self, tournament_id: str, user_id: str) -> Dict[str, Any]:
        """Join a tournament"""
        tournament = await self.db.tournaments.find_one({"id": tournament_id})
        if not tournament:
            return {"error": "Tournament not found"}
        
        if user_id in tournament.get("participants", []):
            return {"error": "Already participating"}
        
        # Create tournament portfolio for user
        portfolio = {
            "user_id": user_id,
            "tournament_id": tournament_id,
            "balance_eur": tournament["starting_balance"],
            "positions": [],
            "trades_history": [],
            "total_pnl": 0,
            "rank": 0
        }
        
        await self.db.tournament_portfolios.insert_one(portfolio)
        await self.db.tournaments.update_one(
            {"id": tournament_id},
            {"$push": {"participants": user_id}}
        )
        
        return {"success": True, "portfolio": portfolio}
    
    async def get_leaderboard(self, tournament_id: str = None, limit: int = 100) -> List[Dict]:
        """Get tournament or global leaderboard"""
        if tournament_id:
            portfolios = await self.db.tournament_portfolios.find(
                {"tournament_id": tournament_id},
                {"_id": 0}
            ).sort("total_pnl", -1).limit(limit).to_list(length=limit)
        else:
            # Global leaderboard from user profiles
            portfolios = await self.db.user_profiles.find(
                {},
                {"_id": 0, "user_id": 1, "username": 1, "total_profit": 1, "level": 1}
            ).sort("total_profit", -1).limit(limit).to_list(length=limit)
        
        # Add rank
        for i, p in enumerate(portfolios):
            p["rank"] = i + 1
        
        return portfolios


# Singleton instance
_trading_arena = None

def get_trading_arena() -> TradingArena:
    global _trading_arena
    if _trading_arena is None:
        _trading_arena = TradingArena()
    return _trading_arena
