"""
Gamification API Routes for TheCryptoCoach 2.0
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Import the service
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.gamification_service import GamificationService, ACHIEVEMENTS, AVATARS

router = APIRouter(prefix="/api/v2/gamification", tags=["Gamification"])

# Database connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Service instance
gamification_service = GamificationService(db)


# Pydantic models
class AwardXPRequest(BaseModel):
    action: str
    metadata: Optional[Dict] = None


class UpdateAvatarRequest(BaseModel):
    base: Optional[str] = None
    frame: Optional[str] = None
    title: Optional[str] = None


class PurchaseItemRequest(BaseModel):
    item_id: str


# Helper to get user from token (reuse from main server)
async def get_current_user_id(authorization: str) -> str:
    """Extract user ID from JWT token"""
    import jwt
    try:
        token = authorization.replace("Bearer ", "")
        JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


@router.get("/profile/{user_id}")
async def get_gamification_profile(user_id: str):
    """Get full gamification profile for a user"""
    profile = await gamification_service.get_user_gamification_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    return profile


@router.post("/xp/award/{user_id}")
async def award_xp(user_id: str, request: AwardXPRequest):
    """Award XP to a user for an action"""
    result = await gamification_service.award_xp(user_id, request.action, request.metadata)
    
    # Check for new achievements
    new_achievements = await gamification_service.check_and_award_achievements(user_id)
    result["new_achievements"] = new_achievements
    
    return result


@router.get("/achievements")
async def get_all_achievements():
    """Get all available achievements"""
    return gamification_service.get_all_achievements()


@router.get("/achievements/{user_id}")
async def get_user_achievements(user_id: str):
    """Get achievements for a specific user"""
    profile = await gamification_service.get_user_gamification_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    all_achievements = ACHIEVEMENTS
    user_achievements = set(profile.get("achievements", []))
    
    result = []
    for ach_id, achievement in all_achievements.items():
        result.append({
            **achievement,
            "earned": ach_id in user_achievements
        })
    
    return result


@router.get("/quests/{user_id}")
async def get_user_quests(user_id: str):
    """Get active quests for a user"""
    # Generate daily quests if needed
    daily_quests = await gamification_service.generate_daily_quests(user_id)
    
    return {
        "daily": daily_quests,
        "weekly": []  # TODO: Implement weekly quests
    }


@router.post("/quests/{user_id}/progress")
async def update_quest_progress(user_id: str, quest_type: str, progress: int = 1):
    """Update progress on quests"""
    completed = await gamification_service.update_quest_progress(user_id, quest_type, progress)
    return {"completed_quests": completed}


@router.get("/avatar/shop")
async def get_avatar_shop():
    """Get all avatar items in the shop"""
    return gamification_service.get_avatar_shop()


@router.get("/avatar/available/{user_id}")
async def get_available_avatar_items(user_id: str):
    """Get avatar items available to a user (unlocked/owned status)"""
    items = await gamification_service.get_available_avatar_items(user_id)
    return items


@router.post("/avatar/purchase/{user_id}")
async def purchase_avatar_item(user_id: str, request: PurchaseItemRequest):
    """Purchase an avatar item"""
    result = await gamification_service.purchase_avatar_item(user_id, request.item_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.put("/avatar/{user_id}")
async def update_avatar(user_id: str, request: UpdateAvatarRequest):
    """Update user's avatar configuration"""
    avatar_data = request.model_dump(exclude_none=True)
    result = await gamification_service.update_avatar(user_id, avatar_data)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/streak/{user_id}")
async def update_streak(user_id: str):
    """Update user's login streak"""
    result = await gamification_service.update_streak(user_id)
    return result


@router.get("/leaderboard")
async def get_leaderboard(limit: int = 50):
    """Get gamification leaderboard"""
    leaderboard = await gamification_service.get_leaderboard(limit)
    return leaderboard


@router.get("/level-info")
async def get_level_info():
    """Get level thresholds and info"""
    from services.gamification_service import LEVEL_THRESHOLDS, XP_REWARDS
    
    levels = []
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if i == 0:
            continue
        levels.append({
            "level": i,
            "xp_required": threshold,
            "xp_from_previous": threshold - LEVEL_THRESHOLDS[i-1] if i > 0 else threshold
        })
    
    return {
        "levels": levels,
        "xp_rewards": {k: v if not callable(v) else "varies" for k, v in XP_REWARDS.items()}
    }
