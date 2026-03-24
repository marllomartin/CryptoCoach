"""
Trading Arena API Routes for TheCryptoCoach 2.0
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Import the service
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.trading_arena_service import TradingArenaService

router = APIRouter(prefix="/api/v2/trading", tags=["Trading Arena"])

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Service instance
trading_service = TradingArenaService(db)


# Pydantic models
class TradeRequest(BaseModel):
    symbol: str
    action: str  # "buy" or "sell"
    amount: float
    price: Optional[float] = None  # If not provided, uses current market price


class ResetPortfolioRequest(BaseModel):
    starting_capital: float = 10000.0


class StartScenarioRequest(BaseModel):
    scenario_id: str


@router.get("/market/prices")
async def get_live_prices(symbols: Optional[str] = None):
    """Get live cryptocurrency prices"""
    symbol_list = symbols.split(",") if symbols else None
    prices = await trading_service.get_live_prices(symbol_list)
    return {
        "prices": prices,
        "count": len(prices)
    }


@router.get("/market/overview")
async def get_market_overview():
    """Get overall market overview with stats"""
    overview = await trading_service.get_market_overview()
    return overview


@router.get("/market/history/{symbol}")
async def get_price_history(symbol: str, days: int = 30):
    """Get historical price data for charts"""
    if days > 365:
        days = 365
    
    history = await trading_service.get_historical_prices(symbol.upper(), days)
    if not history:
        raise HTTPException(status_code=404, detail="Historical data not found")
    
    return {
        "symbol": symbol.upper(),
        "days": days,
        "data": history
    }


@router.get("/cryptos")
async def get_supported_cryptos():
    """Get list of supported cryptocurrencies"""
    cryptos = trading_service.get_supported_cryptos()
    return {"cryptos": cryptos}


@router.get("/portfolio/{user_id}")
async def get_portfolio(user_id: str):
    """Get user's trading portfolio"""
    portfolio = await trading_service.get_user_portfolio(user_id)
    if not portfolio:
        raise HTTPException(status_code=404, detail="User not found")
    return portfolio


@router.post("/trade/{user_id}")
async def execute_trade(user_id: str, request: TradeRequest):
    """Execute a buy or sell trade"""
    result = await trading_service.execute_trade(
        user_id=user_id,
        symbol=request.symbol.upper(),
        action=request.action.lower(),
        amount=request.amount,
        price=request.price
    )
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result


@router.get("/trades/{user_id}")
async def get_trade_history(user_id: str, limit: int = 50):
    """Get user's trade history"""
    if limit > 200:
        limit = 200
    
    trades = await trading_service.get_trade_history(user_id, limit)
    return {"trades": trades, "count": len(trades)}


@router.post("/portfolio/{user_id}/reset")
async def reset_portfolio(user_id: str, request: ResetPortfolioRequest):
    """Reset user's portfolio to initial state"""
    result = await trading_service.reset_portfolio(user_id, request.starting_capital)
    return result


@router.get("/leaderboard")
async def get_trading_leaderboard(limit: int = 50):
    """Get trading leaderboard by profit"""
    if limit > 100:
        limit = 100
    
    leaderboard = await trading_service.get_leaderboard(limit)
    return {"leaderboard": leaderboard}


@router.get("/career/levels")
async def get_career_levels():
    """Get all career levels and requirements"""
    levels = trading_service.get_career_levels()
    return {"levels": levels}


@router.get("/scenarios")
async def get_scenarios():
    """Get available historical trading scenarios"""
    scenarios = trading_service.get_historical_scenarios()
    return {"scenarios": scenarios}


@router.post("/scenarios/start/{user_id}")
async def start_scenario(user_id: str, request: StartScenarioRequest):
    """Start a historical trading scenario"""
    result = await trading_service.start_scenario(user_id, request.scenario_id)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return result
