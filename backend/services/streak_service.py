"""
Enhanced Streak & Comeback Service for TheCryptoCoach 2.0
Streak milestones, freeze, comeback bonuses
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta
import uuid

# Streak milestones and rewards
STREAK_MILESTONES = {
    7: {"xp": 100, "coins": 25, "title": "Week Warrior"},
    14: {"xp": 250, "coins": 50, "title": "Fortnight Fighter"},
    30: {"xp": 500, "coins": 100, "title": "Monthly Master"},
    60: {"xp": 1000, "coins": 200, "title": "Diamond Dedication"},
    100: {"xp": 2000, "coins": 500, "title": "Century Champion"},
    365: {"xp": 10000, "coins": 2500, "title": "Legendary Learner"}
}

# Comeback bonuses based on days away
COMEBACK_BONUSES = {
    7: {"xp": 50, "message": "A week away? Here's a boost!"},
    14: {"xp": 100, "message": "Two weeks! Welcome back!"},
    30: {"xp": 200, "message": "A month! We really missed you!"},
    60: {"xp": 400, "message": "Two months! Amazing to see you again!"},
    90: {"xp": 600, "message": "Three months! Here's a huge bonus!"}
}


class StreakService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def check_and_update_streak(self, user_id: str) -> Dict:
        """Check user's streak and handle updates, milestones, comebacks"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"error": "User not found"}
        
        last_activity = user.get("last_activity")
        current_streak = user.get("streak_days", 0)
        longest_streak = user.get("longest_streak", 0)
        streak_freezes = user.get("streak_freezes", 0)
        claimed_milestones = set(user.get("claimed_streak_milestones", []))
        
        now = datetime.now(timezone.utc)
        today = now.date()
        
        result = {
            "streak_days": current_streak,
            "streak_updated": False,
            "level_up": False,
            "milestone_reached": None,
            "comeback_bonus": None,
            "streak_lost": False,
            "xp_earned": 0,
            "coins_earned": 0
        }
        
        if last_activity:
            try:
                last_date = datetime.fromisoformat(last_activity.replace("Z", "+00:00")).date()
            except:
                last_date = None
            
            if last_date:
                days_diff = (today - last_date).days
                
                if days_diff == 0:
                    # Already active today
                    result["streak_days"] = current_streak
                    return result
                
                elif days_diff == 1:
                    # Consecutive day - increase streak
                    new_streak = current_streak + 1
                    result["streak_updated"] = True
                    
                elif days_diff == 2 and streak_freezes > 0:
                    # Use streak freeze
                    new_streak = current_streak + 1
                    result["streak_updated"] = True
                    result["freeze_used"] = True
                    await self.db.users.update_one(
                        {"id": user_id},
                        {"$inc": {"streak_freezes": -1}}
                    )
                
                elif days_diff > 1:
                    # Streak broken - check for comeback bonus
                    if days_diff >= 7:
                        comeback = self._calculate_comeback_bonus(days_diff)
                        if comeback:
                            result["comeback_bonus"] = comeback
                            result["xp_earned"] += comeback["xp"]
                    
                    new_streak = 1
                    result["streak_lost"] = True
                    result["previous_streak"] = current_streak
                
                else:
                    new_streak = 1
            else:
                new_streak = 1
        else:
            new_streak = 1
        
        # Calculate daily streak XP
        daily_xp = min(5 + (new_streak * 2), 50)  # 5 base + 2 per day, max 50
        result["xp_earned"] += daily_xp
        
        # Check for milestones
        for milestone_days, rewards in STREAK_MILESTONES.items():
            if new_streak >= milestone_days and str(milestone_days) not in claimed_milestones:
                result["milestone_reached"] = {
                    "days": milestone_days,
                    "title": rewards["title"],
                    "xp": rewards["xp"],
                    "coins": rewards["coins"]
                }
                result["xp_earned"] += rewards["xp"]
                result["coins_earned"] += rewards["coins"]
                
                await self.db.users.update_one(
                    {"id": user_id},
                    {"$addToSet": {"claimed_streak_milestones": str(milestone_days)}}
                )
                break  # Only one milestone at a time
        
        # Update longest streak
        if new_streak > longest_streak:
            longest_streak = new_streak
        
        # Update user
        update_data = {
            "$set": {
                "streak_days": new_streak,
                "longest_streak": longest_streak,
                "last_activity": now.isoformat()
            },
            "$inc": {
                "xp_points": result["xp_earned"],
                "coins": result["coins_earned"]
            }
        }
        
        await self.db.users.update_one({"id": user_id}, update_data)
        
        result["streak_days"] = new_streak
        result["longest_streak"] = longest_streak
        
        return result
    
    def _calculate_comeback_bonus(self, days_away: int) -> Optional[Dict]:
        """Calculate comeback bonus based on days away"""
        bonus = None
        for threshold, reward in sorted(COMEBACK_BONUSES.items(), reverse=True):
            if days_away >= threshold:
                bonus = {
                    "days_away": days_away,
                    "xp": reward["xp"],
                    "message": reward["message"]
                }
                break
        return bonus
    
    async def purchase_streak_freeze(self, user_id: str) -> Dict:
        """Purchase a streak freeze with coins"""
        FREEZE_COST = 50
        
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"success": False, "error": "User not found"}
        
        coins = user.get("coins", 0)
        current_freezes = user.get("streak_freezes", 0)
        
        if current_freezes >= 3:
            return {"success": False, "error": "Maximum 3 freezes allowed"}
        
        if coins < FREEZE_COST:
            return {"success": False, "error": f"Not enough coins (need {FREEZE_COST})"}
        
        await self.db.users.update_one(
            {"id": user_id},
            {
                "$inc": {"coins": -FREEZE_COST, "streak_freezes": 1}
            }
        )
        
        return {
            "success": True,
            "freezes_owned": current_freezes + 1,
            "coins_spent": FREEZE_COST,
            "new_balance": coins - FREEZE_COST
        }
    
    async def get_streak_info(self, user_id: str) -> Dict:
        """Get detailed streak information for a user"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return None
        
        current_streak = user.get("streak_days", 0)
        longest_streak = user.get("longest_streak", 0)
        claimed_milestones = user.get("claimed_streak_milestones", [])
        
        # Find next milestone
        next_milestone = None
        for days, rewards in sorted(STREAK_MILESTONES.items()):
            if current_streak < days:
                next_milestone = {
                    "days": days,
                    "days_remaining": days - current_streak,
                    "rewards": rewards
                }
                break
        
        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "streak_freezes": user.get("streak_freezes", 0),
            "claimed_milestones": claimed_milestones,
            "next_milestone": next_milestone,
            "all_milestones": [
                {
                    "days": days,
                    "claimed": str(days) in claimed_milestones,
                    **rewards
                }
                for days, rewards in sorted(STREAK_MILESTONES.items())
            ]
        }
