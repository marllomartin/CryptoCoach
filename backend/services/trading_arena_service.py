"""
Trading Arena Service for TheCryptoCoach 2.0
Professional trading simulator with live market data
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta
import uuid
import httpx
import asyncio
import logging

logger = logging.getLogger(__name__)

# Supported cryptocurrencies mapping (CoinGecko IDs)
SUPPORTED_CRYPTOS = {
    "BTC": {"id": "bitcoin", "name": "Bitcoin", "symbol": "BTC"},
    "ETH": {"id": "ethereum", "name": "Ethereum", "symbol": "ETH"},
    "SOL": {"id": "solana", "name": "Solana", "symbol": "SOL"},
    "XRP": {"id": "ripple", "name": "XRP", "symbol": "XRP"},
    "ADA": {"id": "cardano", "name": "Cardano", "symbol": "ADA"},
    "DOGE": {"id": "dogecoin", "name": "Dogecoin", "symbol": "DOGE"},
    "DOT": {"id": "polkadot", "name": "Polkadot", "symbol": "DOT"},
    "LINK": {"id": "chainlink", "name": "Chainlink", "symbol": "LINK"},
    "AVAX": {"id": "avalanche-2", "name": "Avalanche", "symbol": "AVAX"},
    "MATIC": {"id": "matic-network", "name": "Polygon", "symbol": "MATIC"},
    "UNI": {"id": "uniswap", "name": "Uniswap", "symbol": "UNI"},
    "ATOM": {"id": "cosmos", "name": "Cosmos", "symbol": "ATOM"},
}

# Career mode levels
CAREER_LEVELS = [
    {"level": 1, "name": "Stagiaire", "capital": 1000, "unlock_xp": 0},
    {"level": 2, "name": "Junior Trader", "capital": 5000, "unlock_xp": 500},
    {"level": 3, "name": "Trader", "capital": 10000, "unlock_xp": 1500},
    {"level": 4, "name": "Senior Trader", "capital": 25000, "unlock_xp": 3500},
    {"level": 5, "name": "Lead Trader", "capital": 50000, "unlock_xp": 7000},
    {"level": 6, "name": "Portfolio Manager", "capital": 100000, "unlock_xp": 12000},
    {"level": 7, "name": "Head of Trading", "capital": 250000, "unlock_xp": 20000},
    {"level": 8, "name": "Chief Investment Officer", "capital": 500000, "unlock_xp": 35000},
    {"level": 9, "name": "Hedge Fund Manager", "capital": 1000000, "unlock_xp": 55000},
    {"level": 10, "name": "Crypto Legend", "capital": 5000000, "unlock_xp": 100000},
]

# Historical scenarios for practice
HISTORICAL_SCENARIOS = [
    {
        "id": "btc_2017_bull",
        "name": "Bitcoin Bull Run 2017",
        "description": "Naviguez la montée historique du BTC de 1000$ à 20000$",
        "start_date": "2017-01-01",
        "end_date": "2017-12-31",
        "difficulty": "medium",
        "starting_capital": 10000,
        "coins": ["BTC", "ETH", "LTC"]
    },
    {
        "id": "eth_defi_summer",
        "name": "DeFi Summer 2020",
        "description": "L'explosion de la DeFi et des yield farms",
        "start_date": "2020-06-01",
        "end_date": "2020-09-30",
        "difficulty": "hard",
        "starting_capital": 10000,
        "coins": ["ETH", "LINK", "UNI"]
    },
    {
        "id": "crash_2022",
        "name": "Crypto Winter 2022",
        "description": "Survivez au bear market et au crash de Luna",
        "start_date": "2022-01-01",
        "end_date": "2022-12-31",
        "difficulty": "expert",
        "starting_capital": 50000,
        "coins": ["BTC", "ETH", "SOL"]
    },
    {
        "id": "altcoin_rally_2021",
        "name": "Altcoin Season 2021",
        "description": "Profitez de la folie des altcoins",
        "start_date": "2021-01-01",
        "end_date": "2021-05-31",
        "difficulty": "medium",
        "starting_capital": 10000,
        "coins": ["SOL", "DOGE", "ADA", "DOT"]
    }
]


class TradingArenaService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.price_cache = {}
        self.cache_ttl = 30  # seconds
        self.coingecko_base_url = "https://api.coingecko.com/api/v3"
    
    async def get_live_prices(self, symbols: List[str] = None) -> Dict:
        """Get live prices from CoinGecko API"""
        if symbols is None:
            symbols = list(SUPPORTED_CRYPTOS.keys())
        
        # Check cache
        cache_key = "live_prices"
        cached = self.price_cache.get(cache_key)
        if cached and (datetime.now(timezone.utc) - cached["timestamp"]).seconds < self.cache_ttl:
            return cached["data"]
        
        # Build CoinGecko IDs
        coin_ids = [SUPPORTED_CRYPTOS[s]["id"] for s in symbols if s in SUPPORTED_CRYPTOS]
        
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(
                    f"{self.coingecko_base_url}/simple/price",
                    params={
                        "ids": ",".join(coin_ids),
                        "vs_currencies": "usd",
                        "include_24hr_change": "true",
                        "include_24hr_vol": "true",
                        "include_market_cap": "true"
                    }
                )
                response.raise_for_status()
                data = response.json()
        except Exception as e:
            logger.error(f"CoinGecko API error: {e}")
            # Return cached data or fallback prices
            if cached:
                return cached["data"]
            return self._get_fallback_prices(symbols)
        
        # Transform data to our format
        prices = {}
        for symbol, crypto in SUPPORTED_CRYPTOS.items():
            if symbol in symbols and crypto["id"] in data:
                coin_data = data[crypto["id"]]
                prices[symbol] = {
                    "symbol": symbol,
                    "name": crypto["name"],
                    "price": coin_data.get("usd", 0),
                    "change_24h": coin_data.get("usd_24h_change", 0),
                    "volume_24h": coin_data.get("usd_24h_vol", 0),
                    "market_cap": coin_data.get("usd_market_cap", 0)
                }
        
        # Update cache
        self.price_cache[cache_key] = {
            "data": prices,
            "timestamp": datetime.now(timezone.utc)
        }
        
        return prices
    
    def _get_fallback_prices(self, symbols: List[str]) -> Dict:
        """Generate fallback prices when API is unavailable"""
        import random
        fallback = {
            "BTC": 98000, "ETH": 3500, "SOL": 195, "XRP": 2.4,
            "ADA": 0.95, "DOGE": 0.38, "DOT": 8.5, "LINK": 24,
            "AVAX": 42, "MATIC": 0.65, "UNI": 12, "ATOM": 9.5
        }
        prices = {}
        for symbol in symbols:
            if symbol in fallback:
                base_price = fallback[symbol]
                # Add some variance
                price = base_price * (1 + random.uniform(-0.02, 0.02))
                prices[symbol] = {
                    "symbol": symbol,
                    "name": SUPPORTED_CRYPTOS.get(symbol, {}).get("name", symbol),
                    "price": round(price, 6 if price < 1 else 2),
                    "change_24h": round(random.uniform(-5, 5), 2),
                    "volume_24h": 0,
                    "market_cap": 0,
                    "is_fallback": True
                }
        return prices
    
    async def get_historical_prices(self, symbol: str, days: int = 30) -> List[Dict]:
        """Get historical price data for charts"""
        if symbol not in SUPPORTED_CRYPTOS:
            return []
        
        coin_id = SUPPORTED_CRYPTOS[symbol]["id"]
        cache_key = f"history_{symbol}_{days}"
        
        # Check cache (5 min TTL for historical data)
        cached = self.price_cache.get(cache_key)
        if cached and (datetime.now(timezone.utc) - cached["timestamp"]).seconds < 300:
            return cached["data"]
        
        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(
                    f"{self.coingecko_base_url}/coins/{coin_id}/market_chart",
                    params={
                        "vs_currency": "usd",
                        "days": days
                    }
                )
                response.raise_for_status()
                data = response.json()
        except Exception as e:
            logger.error(f"CoinGecko historical API error: {e}")
            return []
        
        # Transform to chart-friendly format
        history = []
        for timestamp, price in data.get("prices", []):
            history.append({
                "timestamp": datetime.fromtimestamp(timestamp / 1000, tz=timezone.utc).isoformat(),
                "price": price
            })
        
        # Update cache
        self.price_cache[cache_key] = {
            "data": history,
            "timestamp": datetime.now(timezone.utc)
        }
        
        return history
    
    async def get_user_portfolio(self, user_id: str) -> Dict:
        """Get user's trading portfolio"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return None
        
        portfolio = user.get("portfolio", {})
        balance = user.get("virtual_balance", 10000.0)
        initial_capital = user.get("initial_capital", 10000.0)
        
        # Get current prices
        if portfolio:
            prices = await self.get_live_prices(list(portfolio.keys()))
        else:
            prices = {}
        
        # Calculate portfolio value
        holdings_value = 0
        holdings = []
        for symbol, amount in portfolio.items():
            if symbol in prices and amount > 0:
                current_price = prices[symbol]["price"]
                value = amount * current_price
                holdings_value += value
                
                # Get average buy price from trades
                avg_price = await self._get_average_buy_price(user_id, symbol)
                pnl = (current_price - avg_price) * amount if avg_price > 0 else 0
                pnl_percent = ((current_price / avg_price) - 1) * 100 if avg_price > 0 else 0
                
                holdings.append({
                    "symbol": symbol,
                    "name": SUPPORTED_CRYPTOS.get(symbol, {}).get("name", symbol),
                    "amount": amount,
                    "current_price": current_price,
                    "value": value,
                    "avg_buy_price": avg_price,
                    "pnl": pnl,
                    "pnl_percent": pnl_percent,
                    "change_24h": prices[symbol].get("change_24h", 0)
                })
        
        total_value = balance + holdings_value
        total_pnl = total_value - initial_capital
        total_pnl_percent = ((total_value / initial_capital) - 1) * 100 if initial_capital > 0 else 0
        
        return {
            "user_id": user_id,
            "balance": balance,
            "holdings_value": holdings_value,
            "total_value": total_value,
            "initial_capital": initial_capital,
            "total_pnl": total_pnl,
            "total_pnl_percent": total_pnl_percent,
            "holdings": holdings,
            "career_level": self._get_career_level(user.get("xp_points", 0))
        }
    
    async def _get_average_buy_price(self, user_id: str, symbol: str) -> float:
        """Calculate average buy price for a symbol"""
        trades = await self.db.trades.find({
            "user_id": user_id,
            "symbol": symbol,
            "action": "buy"
        }, {"_id": 0}).to_list(1000)
        
        if not trades:
            return 0
        
        total_cost = sum(t["amount"] * t["price"] for t in trades)
        total_amount = sum(t["amount"] for t in trades)
        
        return total_cost / total_amount if total_amount > 0 else 0
    
    def _get_career_level(self, xp: int) -> Dict:
        """Get user's career level based on XP"""
        current_level = CAREER_LEVELS[0]
        next_level = CAREER_LEVELS[1] if len(CAREER_LEVELS) > 1 else None
        
        for i, level in enumerate(CAREER_LEVELS):
            if xp >= level["unlock_xp"]:
                current_level = level
                next_level = CAREER_LEVELS[i + 1] if i + 1 < len(CAREER_LEVELS) else None
        
        return {
            "current": current_level,
            "next": next_level,
            "xp": xp
        }
    
    async def execute_trade(self, user_id: str, symbol: str, action: str, amount: float, price: float = None) -> Dict:
        """Execute a buy or sell trade"""
        if symbol not in SUPPORTED_CRYPTOS:
            return {"success": False, "error": "Crypto non supportée"}
        
        if action not in ["buy", "sell"]:
            return {"success": False, "error": "Action invalide"}
        
        if amount <= 0:
            return {"success": False, "error": "Montant invalide"}
        
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"success": False, "error": "Utilisateur non trouvé"}
        
        # Get current price if not provided
        if price is None:
            prices = await self.get_live_prices([symbol])
            if symbol not in prices:
                return {"success": False, "error": "Prix non disponible"}
            price = prices[symbol]["price"]
        
        balance = user.get("virtual_balance", 10000.0)
        portfolio = dict(user.get("portfolio", {}))  # Make a copy
        total_cost = amount * price
        realized_pnl = 0
        
        if action == "buy":
            if total_cost > balance:
                return {"success": False, "error": f"Solde insuffisant (requis: ${total_cost:.2f}, disponible: ${balance:.2f})"}
            
            new_balance = balance - total_cost
            current_amount = portfolio.get(symbol, 0)
            portfolio[symbol] = current_amount + amount
            
        else:  # sell
            current_amount = portfolio.get(symbol, 0)
            if amount > current_amount:
                return {"success": False, "error": f"Quantité insuffisante (disponible: {current_amount})"}
            
            new_balance = balance + total_cost
            portfolio[symbol] = current_amount - amount
            
            # Remove from portfolio if zero
            if portfolio[symbol] <= 0:
                del portfolio[symbol]
            
            # Calculate realized PnL
            avg_price = await self._get_average_buy_price(user_id, symbol)
            realized_pnl = (price - avg_price) * amount if avg_price > 0 else 0
        
        # Update user
        update_data = {
            "$set": {
                "virtual_balance": new_balance,
                "portfolio": portfolio
            },
            "$inc": {"trades_count": 1}
        }
        
        # Update total profit for sells
        if action == "sell" and realized_pnl != 0:
            update_data["$inc"]["total_profit"] = realized_pnl
        
        await self.db.users.update_one({"id": user_id}, update_data)
        
        # Record trade
        trade_id = str(uuid.uuid4())
        trade = {
            "id": trade_id,
            "user_id": user_id,
            "symbol": symbol,
            "action": action,
            "amount": amount,
            "price": price,
            "total_value": total_cost,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        if action == "sell":
            trade["realized_pnl"] = realized_pnl
        
        await self.db.trades.insert_one(trade)
        
        # Return clean serializable response
        return {
            "success": True,
            "trade": {
                "id": trade_id,
                "symbol": symbol,
                "action": action,
                "amount": amount,
                "price": price,
                "total_value": total_cost
            },
            "new_balance": new_balance,
            "portfolio": portfolio
        }
    
    async def get_trade_history(self, user_id: str, limit: int = 50) -> List[Dict]:
        """Get user's trade history"""
        trades = await self.db.trades.find(
            {"user_id": user_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return trades
    
    async def reset_portfolio(self, user_id: str, starting_capital: float = 10000.0) -> Dict:
        """Reset user's portfolio to initial state"""
        await self.db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "virtual_balance": starting_capital,
                    "initial_capital": starting_capital,
                    "portfolio": {},
                    "total_profit": 0
                }
            }
        )
        
        return {
            "success": True,
            "balance": starting_capital,
            "portfolio": {}
        }
    
    async def get_leaderboard(self, limit: int = 50) -> List[Dict]:
        """Get trading leaderboard by total profit"""
        users = await self.db.users.find(
            {"trades_count": {"$gt": 0}},
            {
                "_id": 0,
                "id": 1,
                "full_name": 1,
                "total_profit": 1,
                "trades_count": 1,
                "virtual_balance": 1,
                "initial_capital": 1,
                "avatar": 1
            }
        ).sort("total_profit", -1).limit(limit).to_list(limit)
        
        leaderboard = []
        for i, user in enumerate(users):
            initial = user.get("initial_capital", 10000)
            profit = user.get("total_profit", 0)
            roi = (profit / initial) * 100 if initial > 0 else 0
            
            leaderboard.append({
                "rank": i + 1,
                "user_id": user["id"],
                "name": user["full_name"],
                "total_profit": profit,
                "roi_percent": roi,
                "trades_count": user.get("trades_count", 0),
                "avatar": user.get("avatar", {})
            })
        
        return leaderboard
    
    def get_supported_cryptos(self) -> List[Dict]:
        """Get list of supported cryptocurrencies"""
        return [
            {"symbol": k, **v}
            for k, v in SUPPORTED_CRYPTOS.items()
        ]
    
    def get_career_levels(self) -> List[Dict]:
        """Get all career levels"""
        return CAREER_LEVELS
    
    def get_historical_scenarios(self) -> List[Dict]:
        """Get available historical trading scenarios"""
        return HISTORICAL_SCENARIOS
    
    async def start_scenario(self, user_id: str, scenario_id: str) -> Dict:
        """Start a historical trading scenario"""
        scenario = next((s for s in HISTORICAL_SCENARIOS if s["id"] == scenario_id), None)
        if not scenario:
            return {"success": False, "error": "Scénario non trouvé"}
        
        # Create scenario session
        session = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "scenario_id": scenario_id,
            "scenario_name": scenario["name"],
            "starting_capital": scenario["starting_capital"],
            "current_balance": scenario["starting_capital"],
            "portfolio": {},
            "current_date": scenario["start_date"],
            "end_date": scenario["end_date"],
            "trades": [],
            "started_at": datetime.now(timezone.utc).isoformat(),
            "completed": False
        }
        
        await self.db.scenario_sessions.insert_one(session)
        
        return {
            "success": True,
            "session": {k: v for k, v in session.items() if k != "_id"}
        }
    
    async def get_market_overview(self) -> Dict:
        """Get overall market overview"""
        prices = await self.get_live_prices()
        
        # Calculate market stats
        total_market_cap = sum(p.get("market_cap", 0) for p in prices.values())
        avg_change = sum(p.get("change_24h", 0) for p in prices.values()) / len(prices) if prices else 0
        
        # Top gainers and losers
        sorted_by_change = sorted(prices.values(), key=lambda x: x.get("change_24h", 0), reverse=True)
        
        return {
            "prices": prices,
            "total_market_cap": total_market_cap,
            "average_24h_change": avg_change,
            "market_sentiment": "bullish" if avg_change > 0 else "bearish",
            "top_gainers": sorted_by_change[:3] if len(sorted_by_change) >= 3 else sorted_by_change,
            "top_losers": sorted_by_change[-3:] if len(sorted_by_change) >= 3 else [],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
