"""
Gamification API Routes for TheCryptoCoach 2.0
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Dict, List, Optional
import os
from motor.motor_asyncio import AsyncIOMotorClient

# Import the service
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from services.gamification_service import GamificationService, ACHIEVEMENTS

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


@router.post("/achievements/konami")
async def unlock_konami_achievement(authorization: str = Header(...)):
    """Grant the konami_code hidden achievement to the authenticated user"""
    user_id = await get_current_user_id(authorization)
    awarded = await gamification_service.grant_achievement(user_id, "konami_code")
    if not awarded:
        return {"already_unlocked": True}
    return {
        "already_unlocked": False,
        "achievement": {
            "id": awarded["id"],
            "name": awarded["name"],
            "description": awarded.get("description", ""),
            "xp": awarded["xp_reward"],
            "icon": awarded.get("icon", "trophy"),
            "level": awarded.get("level", 1),
        }
    }


@router.get("/achievements/{user_id}")
async def get_user_achievements(user_id: str):
    """Get achievements for a specific user"""
    profile = await gamification_service.get_user_gamification_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    
    all_achievements = ACHIEVEMENTS
    user_achievements = set(profile.get("achievements", []))
    achievement_dates = profile.get("achievement_dates", {})

    result = []
    hidden_count = 0
    for ach_id, achievement in all_achievements.items():
        earned = ach_id in user_achievements
        is_hidden = achievement.get("hidden", False)
        if is_hidden and not earned:
            hidden_count += 1
        else:
            entry = {**achievement, "earned": earned}
            if earned and ach_id in achievement_dates:
                entry["earned_at"] = achievement_dates[ach_id]
            result.append(entry)

    return {"achievements": result, "hidden_count": hidden_count}



@router.get("/streak/{user_id}")
async def get_streak_info(user_id: str):
    """Get streak info for a user"""
    info = await gamification_service.get_streak_info(user_id)
    if not info:
        raise HTTPException(status_code=404, detail="User not found")
    return info


@router.post("/streak/{user_id}")
async def update_streak(user_id: str):
    """Update user's login streak"""
    result = await gamification_service.update_streak(user_id)
    return result


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
