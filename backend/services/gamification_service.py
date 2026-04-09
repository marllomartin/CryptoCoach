"""
Gamification Service for TheCryptoCoach 2.0
Handles XP, levels, achievements, quests, and streaks
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, List, Optional
from datetime import datetime, timezone
import uuid
import math

# Level thresholds (XP required for each level)
LEVEL_THRESHOLDS = [
    0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200,  # 1-10
    6600, 8200, 10000, 12000, 14200, 16600, 19200, 22000, 25000, 28200,  # 11-20
    31600, 35200, 39000, 43000, 47200, 51600, 56200, 61000, 66000, 71200,  # 21-30
    76600, 82200, 88000, 94000, 100200  # 31-35 (Master levels)
]

# XP rewards for different actions
XP_REWARDS = {
    "lesson_complete": 100,
    "quiz_perfect": 100,
    "quiz_pass": 50,
    "exam_pass": 500,
    "first_trade": 25,
    "profitable_trade": 10,
    "daily_login": 15,
    "streak_bonus": lambda streak: min(streak * 5, 100),
}

# XP per achievement tier
ACHIEVEMENT_XP = {1: 75, 2: 150, 3: 300, 4: 600, 5: 375}

# Achievement definitions
# level: 1=Bronze(easy), 2=Silver(medium), 3=Gold(hard), 4=Prismatic(extreme)
ACHIEVEMENTS = {
    # ── Level 1 (Bronze) ─────────────────────────────────────────────────────
    "first_steps": {
        "id": "first_steps",
        "name": "First Steps",
        "description": "Complete your first lesson",
        "icon": "footprints",
        "level": 1,
        "xp_reward": 75,
        "trigger": "lesson",
        "condition": {"lessons_completed": 1}
    },
    "streak_beginner": {
        "id": "streak_beginner",
        "name": "Streak Beginner",
        "description": "Start a streak for the first time",
        "icon": "flame",
        "level": 1,
        "xp_reward": 75,
        "trigger": "lesson",
        "condition": {"streak_days": 1}
    },
    "first_trade": {
        "id": "first_trade",
        "name": "First Trade",
        "description": "Execute your first trade in the Trading Arena",
        "icon": "trending-up",
        "level": 1,
        "xp_reward": 75,
        "trigger": "trade",
        "condition": {"trades_count": 1}
    },
    # ── Level 2 (Silver) ─────────────────────────────────────────────────────
    "sharp_mind": {
        "id": "sharp_mind",
        "name": "Sharp Mind",
        "description": "Get 100% on your first quiz",
        "icon": "zap",
        "level": 2,
        "xp_reward": 150,
        "trigger": "quiz",
        "condition": {"perfect_quizzes": 1}
    },
    "knowledge_seeker": {
        "id": "knowledge_seeker",
        "name": "Knowledge Seeker",
        "description": "Complete 10 lessons",
        "icon": "book-open",
        "level": 2,
        "xp_reward": 150,
        "trigger": "lesson",
        "condition": {"lessons_completed": 10}
    },
    "crypto_scholar": {
        "id": "crypto_scholar",
        "name": "Crypto Scholar",
        "description": "Complete three courses",
        "icon": "graduation-cap",
        "level": 2,
        "xp_reward": 150,
        "trigger": "lesson",
        "condition": {"courses_completed": 3}
    },
    "quiz_master": {
        "id": "quiz_master",
        "name": "Quiz Master",
        "description": "Get 100% on 5 quizzes",
        "icon": "target",
        "level": 2,
        "xp_reward": 150,
        "trigger": "quiz",
        "condition": {"perfect_quizzes": 5}
    },
    "trader_apprentice": {
        "id": "trader_apprentice",
        "name": "Trade Apprentice",
        "description": "Execute 50 trades",
        "icon": "trending-up",
        "level": 2,
        "xp_reward": 150,
        "trigger": "trade",
        "condition": {"trades_count": 50}
    },
    "streak_warrior": {
        "id": "streak_warrior",
        "name": "Streak Warrior",
        "description": "Maintain a 7-day streak",
        "icon": "flame",
        "level": 2,
        "xp_reward": 150,
        "trigger": "lesson",
        "condition": {"streak_days": 7}
    },
    # ── Level 3 (Gold) ───────────────────────────────────────────────────────
    "crypto_connoisseur": {
        "id": "crypto_connoisseur",
        "name": "Crypto Connoisseur",
        "description": "Complete 25 lessons",
        "icon": "star",
        "level": 3,
        "xp_reward": 300,
        "trigger": "lesson",
        "condition": {"lessons_completed": 25}
    },
    "profit_hunter": {
        "id": "profit_hunter",
        "name": "Profit Hunter",
        "description": "Reach $1,000 total profit in the Trading Arena",
        "icon": "bar-chart-2",
        "level": 3,
        "xp_reward": 300,
        "trigger": "grant_only",
        "condition": {}
    },
    "streak_legend": {
        "id": "streak_legend",
        "name": "Streak Legend",
        "description": "Maintain a 30-day streak",
        "icon": "fire",
        "level": 3,
        "xp_reward": 300,
        "trigger": "lesson",
        "condition": {"streak_days": 30}
    },
    "certified_pro": {
        "id": "certified_pro",
        "name": "Certified Pro",
        "description": "Earn your first certification",
        "icon": "award",
        "level": 3,
        "xp_reward": 300,
        "trigger": "exam",
        "condition": {"certificates": 1}
    },
    # ── Level 4 (Prismatic) ──────────────────────────────────────────────────
    "crypto_master": {
        "id": "crypto_master",
        "name": "Crypto Master",
        "description": "Reach level 20",
        "icon": "crown",
        "level": 4,
        "xp_reward": 600,
        "trigger": "any",
        "condition": {"level": 20}
    },
    "streak_unstoppable": {
        "id": "streak_unstoppable",
        "name": "Streak Unstoppable",
        "description": "Maintain a 60-day streak",
        "icon": "flame",
        "level": 4,
        "xp_reward": 600,
        "trigger": "lesson",
        "condition": {"streak_days": 60}
    },
    "fully_certified": {
        "id": "fully_certified",
        "name": "Fully Certified",
        "description": "Earn all 3 certifications",
        "icon": "award",
        "level": 4,
        "xp_reward": 600,
        "trigger": "exam",
        "condition": {"certificates": 3}
    },
    # ── Level 5 (Hidden) ─────────────────────────────────────────────────────
    "night_owl": {
        "id": "night_owl",
        "name": "Night Owl",
        "description": "Complete 5 lessons between midnight and 5am",
        "icon": "moon",
        "level": 5,
        "hidden": True,
        "xp_reward": 375,
        "trigger": "grant_only",
        "condition": {}
    },
    "perfectionist": {
        "id": "perfectionist",
        "name": "Perfectionist",
        "description": "Retake a quiz you've already completed",
        "icon": "refresh-cw",
        "level": 5,
        "hidden": True,
        "xp_reward": 375,
        "trigger": "grant_only",
        "condition": {}
    },
    "resilient": {
        "id": "resilient",
        "name": "Resilient",
        "description": "Fail an exam, then pass it on your next attempt",
        "icon": "shield",
        "level": 5,
        "hidden": True,
        "xp_reward": 375,
        "trigger": "grant_only",
        "condition": {}
    }
}

# Streak milestones
STREAK_MILESTONES = [
    {"days": 3,   "title": "3-Day Streak",   "xp": 50},
    {"days": 7,   "title": "7-Day Streak",   "xp": 175},
    {"days": 14,  "title": "14-Day Streak",  "xp": 250},
    {"days": 30,  "title": "30-Day Streak",  "xp": 500},
    {"days": 60,  "title": "60-Day Streak",  "xp": 750},
    {"days": 100, "title": "100-Day Streak", "xp": 1000},
]


class GamificationService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    def calculate_level(self, xp: int) -> int:
        """Calculate level from XP"""
        for level, threshold in enumerate(LEVEL_THRESHOLDS):
            if xp < threshold:
                return level
        return len(LEVEL_THRESHOLDS)
    
    def get_level_progress(self, xp: int) -> Dict:
        """Get XP progress towards next level"""
        level = self.calculate_level(xp)
        if level >= len(LEVEL_THRESHOLDS):
            return {"level": level, "current_xp": xp, "next_level_xp": None, "progress": 100}
        
        current_threshold = LEVEL_THRESHOLDS[level - 1] if level > 0 else 0
        next_threshold = LEVEL_THRESHOLDS[level]
        xp_in_level = xp - current_threshold
        xp_needed = next_threshold - current_threshold
        progress = (xp_in_level / xp_needed) * 100
        
        return {
            "level": level,
            "current_xp": xp,
            "xp_in_level": xp_in_level,
            "xp_needed": xp_needed,
            "next_level_xp": next_threshold,
            "progress": round(progress, 1)
        }
    
    async def get_user_gamification_profile(self, user_id: str) -> Dict:
        """Get full gamification profile for a user"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return None
        
        xp = user.get("xp_points", 0)
        level_info = self.get_level_progress(xp)
        
        # Get user's achievements
        user_achievements = user.get("achievements", [])

        profile = {
            "user_id": user_id,
            "xp_points": xp,
            "level": level_info["level"],
            "level_progress": level_info,
            "streak_days": user.get("streak_days", 0),
            "achievements": user_achievements,
            "achievements_count": len(user_achievements),
            "stats": {
                "lessons_completed": len(user.get("completed_lessons", [])),
                "quizzes_completed": len(user.get("completed_quizzes", [])),
                "exams_passed": len(user.get("completed_exams", [])),
                "certificates_earned": len(user.get("certificates", [])),
                "trades_count": user.get("trades_count", 0),
                "total_profit": user.get("total_profit", 0),
            }
        }
        
        return profile
    
    async def award_xp(self, user_id: str, action: str, metadata: Dict = None) -> Dict:
        """Award XP for an action and handle level-ups"""
        metadata = metadata or {}
        
        # Calculate XP based on action
        if action in XP_REWARDS:
            reward = XP_REWARDS[action]
            if callable(reward):
                xp_amount = reward(metadata.get("value", 0))
            else:
                xp_amount = reward
        else:
            xp_amount = 10  # Default small reward
        
        # Get current user state
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        old_xp = user.get("xp_points", 0)
        old_level = self.calculate_level(old_xp)
        
        # Award XP
        new_xp = old_xp + xp_amount
        new_level = self.calculate_level(new_xp)
        
        update_data = {
            "$inc": {"xp_points": xp_amount},
            "$set": {"last_activity": datetime.now(timezone.utc).isoformat()}
        }
        
        # Check for level up
        level_up = new_level > old_level

        await self.db.users.update_one({"id": user_id}, update_data)
        
        # Log XP transaction
        await self.db.xp_transactions.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "action": action,
            "xp_amount": xp_amount,
            "old_xp": old_xp,
            "new_xp": new_xp,
            "level_up": level_up,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        result = {
            "xp_earned": xp_amount,
            "new_xp": new_xp,
            "old_level": old_level,
            "new_level": new_level,
            "level_up": level_up,
            "level_progress": self.get_level_progress(new_xp)
        }
        
        return result

    async def check_and_award_achievements(self, user_id: str, trigger: str = "any") -> List[Dict]:
        """Check and award any newly earned achievements"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return []
        
        current_achievements = set(user.get("achievements", []))
        new_achievements = []
        
        completed = set(user.get("completed_lessons", []))

        # Count completed courses (all lessons in a course must be completed)
        all_courses = await self.db.courses.find({}, {"_id": 0, "lesson_ids": 1}).to_list(100)
        courses_completed = sum(
            1 for c in all_courses
            if c.get("lesson_ids") and set(c["lesson_ids"]).issubset(completed)
        )

        stats = {
            "lessons_completed": len(completed),
            "perfect_quizzes": user.get("perfect_quizzes_count", 0),
            "trades_count": user.get("trades_count", 0),
            "streak_days": user.get("streak_days", 0),
            "certificates": len(user.get("certificates", [])),
            "level": self.calculate_level(user.get("xp_points", 0)),
            "courses_completed": courses_completed,
        }
        
        for ach_id, achievement in ACHIEVEMENTS.items():
            if ach_id in current_achievements:
                continue

            ach_trigger = achievement.get("trigger", "any")

            # Hidden/grant_only achievements are never evaluated here — granted explicitly
            if ach_trigger == "grant_only":
                continue

            # Only evaluate achievements that match the current trigger context
            if trigger != "any" and ach_trigger != "any" and ach_trigger != trigger:
                continue

            condition = achievement["condition"]
            earned = True
            
            for key, required_value in condition.items():
                if isinstance(required_value, bool):
                    if stats.get(key) != required_value:
                        earned = False
                        break
                else:
                    if stats.get(key, 0) < required_value:
                        earned = False
                        break
            
            if earned:
                xp_reward = ACHIEVEMENT_XP.get(achievement["level"], achievement["xp_reward"])
                new_achievements.append({**achievement, "xp_reward": xp_reward})
                await self.db.users.update_one(
                    {"id": user_id},
                    {
                        "$addToSet": {"achievements": ach_id},
                        "$inc": {"xp_points": xp_reward}
                    }
                )
        
        return new_achievements
    
    async def grant_achievement(self, user_id: str, achievement_id: str) -> Optional[Dict]:
        """Directly grant a specific achievement (used for grant_only / hidden achievements)."""
        if achievement_id not in ACHIEVEMENTS:
            return None
        achievement = ACHIEVEMENTS[achievement_id]
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0, "achievements": 1})
        if user and achievement_id in user.get("achievements", []):
            return None  # Already earned
        xp_reward = ACHIEVEMENT_XP.get(achievement["level"], achievement["xp_reward"])
        await self.db.users.update_one(
            {"id": user_id},
            {
                "$addToSet": {"achievements": achievement_id},
                "$inc": {"xp_points": xp_reward}
            }
        )
        return {**achievement, "xp_reward": xp_reward}

    async def get_streak_info(self, user_id: str) -> Dict:
        """Get streak information for a user"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return None

        current_streak = user.get("streak_days", 0)
        longest_streak = user.get("longest_streak", current_streak)

        all_milestones = [
            {**m, "claimed": current_streak >= m["days"]}
            for m in STREAK_MILESTONES
        ]

        return {
            "current_streak": current_streak,
            "longest_streak": longest_streak,
            "all_milestones": all_milestones,
        }

    async def update_streak(self, user_id: str) -> Dict:
        """Update user's login streak"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {}

        last_activity = user.get("last_activity")
        current_streak = user.get("streak_days", 0)
        longest_streak = user.get("longest_streak", current_streak)

        now = datetime.now(timezone.utc)
        today = now.date()

        if last_activity:
            last_date = datetime.fromisoformat(last_activity.replace("Z", "+00:00")).date()
            days_diff = (today - last_date).days

            if days_diff == 0:
                # Already logged in today
                return {"streak_days": current_streak, "streak_updated": False}
            elif days_diff == 1:
                # Consecutive day - increase streak
                new_streak = current_streak + 1
            else:
                # Streak broken
                new_streak = 1
        else:
            new_streak = 1

        new_longest = max(longest_streak, new_streak)

        # Award streak bonus XP
        streak_xp = XP_REWARDS["streak_bonus"](new_streak)

        await self.db.users.update_one(
            {"id": user_id},
            {
                "$set": {
                    "streak_days": new_streak,
                    "longest_streak": new_longest,
                    "last_activity": now.isoformat()
                },
                "$inc": {"xp_points": streak_xp}
            }
        )

        return {
            "streak_days": new_streak,
            "streak_updated": True,
            "xp_earned": streak_xp
        }
    
    def get_all_achievements(self) -> List[Dict]:
        """Get all available achievements"""
        return list(ACHIEVEMENTS.values())
    
