"""
Crypto Quest API Routes for TheCryptoCoach 2.0
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Import the service
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.crypto_quest_service import CryptoQuestService

router = APIRouter(prefix="/api/v2/quest", tags=["Crypto Quest"])

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Service instance
quest_service = CryptoQuestService(db)


class CompleteMissionRequest(BaseModel):
    mission_id: str


@router.get("/progress/{user_id}")
async def get_quest_progress(user_id: str):
    """Get user's Crypto Quest progress"""
    progress = await quest_service.get_user_quest_progress(user_id)
    if not progress:
        raise HTTPException(status_code=404, detail="User not found")
    return progress


@router.get("/chapters")
async def get_all_chapters():
    """Get all quest chapters structure"""
    chapters = quest_service.get_all_chapters()
    return {"chapters": chapters}


@router.post("/complete/{user_id}")
async def complete_mission(user_id: str, request: CompleteMissionRequest):
    """Complete a mission and earn rewards"""
    result = await quest_service.complete_mission(user_id, request.mission_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result.get("error", "Failed to complete mission"))
    return result


@router.get("/challenge/{user_id}/{mission_id}")
async def check_trading_challenge(user_id: str, mission_id: str):
    """Check progress on a trading challenge mission"""
    result = await quest_service.check_trading_challenge(user_id, mission_id)
    return result
