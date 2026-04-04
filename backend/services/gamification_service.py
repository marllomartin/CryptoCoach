"""
Gamification Service for TheCryptoCoach 2.0
Handles XP, levels, achievements, quests, and avatar system
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
    "lesson_complete": 50,
    "quiz_perfect": 100,
    "quiz_pass": 50,
    "exam_pass": 500,
    "first_trade": 25,
    "profitable_trade": 10,
    "daily_login": 15,
    "streak_bonus": lambda streak: min(streak * 5, 100),
    "quest_complete": lambda difficulty: {"easy": 30, "medium": 75, "hard": 150, "legendary": 300}.get(difficulty, 50),
    "achievement_unlock": 200,
}

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
        "xp_reward": 50,
        "condition": {"lessons_completed": 1}
    },
    "streak_beginner": {
        "id": "streak_beginner",
        "name": "Streak Beginner",
        "description": "Start a streak for the first time",
        "icon": "flame",
        "level": 1,
        "xp_reward": 50,
        "condition": {"streak_days": 1}
    },
    "first_trade": {
        "id": "first_trade",
        "name": "First Trade",
        "description": "Execute your first trade in the simulator",
        "icon": "trending-up",
        "level": 1,
        "xp_reward": 100,
        "condition": {"trades_count": 1}
    },
    # ── Level 2 (Silver) ─────────────────────────────────────────────────────
    "knowledge_seeker": {
        "id": "knowledge_seeker",
        "name": "Knowledge Seeker",
        "description": "Complete 10 lessons",
        "icon": "book-open",
        "level": 2,
        "xp_reward": 200,
        "condition": {"lessons_completed": 10}
    },
    "crypto_scholar": {
        "id": "crypto_scholar",
        "name": "Crypto Scholar",
        "description": "Complete all trial courses",
        "icon": "graduation-cap",
        "level": 2,
        "xp_reward": 300,
        "condition": {"trial_courses_complete": True}
    },
    "quiz_master": {
        "id": "quiz_master",
        "name": "Quiz Master",
        "description": "Get 100% on 5 quizzes",
        "icon": "trophy",
        "level": 2,
        "xp_reward": 250,
        "condition": {"perfect_quizzes": 5}
    },
    "trader_apprentice": {
        "id": "trader_apprentice",
        "name": "Trade Apprentice",
        "description": "Execute 50 trades",
        "icon": "bar-chart-2",
        "level": 2,
        "xp_reward": 200,
        "condition": {"trades_count": 50}
    },
    "streak_warrior": {
        "id": "streak_warrior",
        "name": "Streak Warrior",
        "description": "Maintain a 7-day streak",
        "icon": "zap",
        "level": 2,
        "xp_reward": 175,
        "condition": {"streak_days": 7}
    },
    # ── Level 3 (Gold) ───────────────────────────────────────────────────────
    "crypto_connoisseur": {
        "id": "crypto_connoisseur",
        "name": "Crypto Connoisseur",
        "description": "Complete 25 lessons",
        "icon": "star",
        "level": 3,
        "xp_reward": 350,
        "condition": {"lessons_completed": 25}
    },
    "profit_hunter": {
        "id": "profit_hunter",
        "name": "Profit Hunter",
        "description": "Reach $1,000 total profit in simulation",
        "icon": "trending-up",
        "level": 3,
        "xp_reward": 300,
        "condition": {"total_profit": 1000}
    },
    "streak_legend": {
        "id": "streak_legend",
        "name": "Streak Legend",
        "description": "Maintain a 30-day streak",
        "icon": "fire",
        "level": 3,
        "xp_reward": 500,
        "condition": {"streak_days": 30}
    },
    "certified_pro": {
        "id": "certified_pro",
        "name": "Certified Pro",
        "description": "Earn your first certification",
        "icon": "award",
        "level": 3,
        "xp_reward": 400,
        "condition": {"certificates": 1}
    },
    # ── Level 4 (Prismatic) ──────────────────────────────────────────────────
    "crypto_master": {
        "id": "crypto_master",
        "name": "Crypto Master",
        "description": "Reach level 20",
        "icon": "crown",
        "level": 4,
        "xp_reward": 1000,
        "condition": {"level": 20}
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

# Avatar customization options
AVATARS = {
    "base": [
        {"id": "avatar_default", "name": "Débutant", "unlock_level": 1, "cost": 0},
        {"id": "avatar_trader", "name": "Trader", "unlock_level": 5, "cost": 50},
        {"id": "avatar_analyst", "name": "Analyste", "unlock_level": 10, "cost": 100},
        {"id": "avatar_whale", "name": "Whale", "unlock_level": 15, "cost": 200},
        {"id": "avatar_legend", "name": "Légende", "unlock_level": 25, "cost": 500},
    ],
    "frames": [
        {"id": "frame_none", "name": "Sans Cadre", "unlock_level": 1, "cost": 0},
        {"id": "frame_bronze", "name": "Bronze", "unlock_level": 5, "cost": 25},
        {"id": "frame_silver", "name": "Argent", "unlock_level": 10, "cost": 75},
        {"id": "frame_gold", "name": "Or", "unlock_level": 15, "cost": 150},
        {"id": "frame_diamond", "name": "Diamant", "unlock_level": 20, "cost": 300},
        {"id": "frame_legendary", "name": "Légendaire", "unlock_level": 30, "cost": 500},
    ],
    "titles": [
        {"id": "title_newbie", "name": "Nouveau Venu", "unlock_level": 1, "cost": 0},
        {"id": "title_apprentice", "name": "Apprenti", "unlock_level": 3, "cost": 20},
        {"id": "title_trader", "name": "Trader", "unlock_level": 7, "cost": 50},
        {"id": "title_expert", "name": "Expert", "unlock_level": 12, "cost": 100},
        {"id": "title_master", "name": "Maître", "unlock_level": 18, "cost": 200},
        {"id": "title_legend", "name": "Légende Crypto", "unlock_level": 25, "cost": 400},
        {"id": "title_god", "name": "Dieu du Trading", "unlock_level": 35, "cost": 1000},
    ]
}


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
            "coins": user.get("coins", 0),
            "streak_days": user.get("streak_days", 0),
            "avatar": user.get("avatar", {
                "base": "avatar_default",
                "frame": "frame_none",
                "title": "title_newbie"
            }),
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
        if level_up:
            # Award coins for level up
            coins_reward = new_level * 10
            update_data["$inc"]["coins"] = coins_reward
        
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
        
        if level_up:
            result["coins_earned"] = new_level * 10
            result["unlocked_items"] = self._get_unlocked_items_at_level(new_level)
        
        return result
    
    def _get_unlocked_items_at_level(self, level: int) -> List[Dict]:
        """Get items unlocked at a specific level"""
        unlocked = []
        for category, items in AVATARS.items():
            for item in items:
                if item["unlock_level"] == level:
                    unlocked.append({**item, "category": category})
        return unlocked
    
    async def check_and_award_achievements(self, user_id: str) -> List[Dict]:
        """Check and award any newly earned achievements"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return []
        
        current_achievements = set(user.get("achievements", []))
        new_achievements = []
        
        # Fetch trial course lesson IDs from DB to check completion
        trial_courses = await self.db.courses.find({"is_trial": True}, {"_id": 0, "lesson_ids": 1}).to_list(20)
        trial_lesson_ids = set()
        for c in trial_courses:
            trial_lesson_ids.update(c.get("lesson_ids", []))
        completed = set(user.get("completed_lessons", []))
        trial_courses_complete = len(trial_lesson_ids) > 0 and trial_lesson_ids.issubset(completed)

        stats = {
            "lessons_completed": len(completed),
            "perfect_quizzes": user.get("perfect_quizzes_count", 0),
            "trades_count": user.get("trades_count", 0),
            "total_profit": user.get("total_profit", 0),
            "streak_days": user.get("streak_days", 0),
            "certificates": len(user.get("certificates", [])),
            "level": self.calculate_level(user.get("xp_points", 0)),
            "trial_courses_complete": trial_courses_complete,
        }
        
        for ach_id, achievement in ACHIEVEMENTS.items():
            if ach_id in current_achievements:
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
                new_achievements.append(achievement)
                await self.db.users.update_one(
                    {"id": user_id},
                    {
                        "$addToSet": {"achievements": ach_id},
                        "$inc": {"xp_points": achievement["xp_reward"]}
                    }
                )
        
        return new_achievements
    
    async def get_available_avatar_items(self, user_id: str) -> Dict:
        """Get all avatar items available to a user"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {}
        
        level = self.calculate_level(user.get("xp_points", 0))
        owned_items = user.get("owned_avatar_items", [])
        
        result = {}
        for category, items in AVATARS.items():
            category_items = []
            for item in items:
                item_data = {
                    **item,
                    "unlocked": level >= item["unlock_level"],
                    "owned": item["id"] in owned_items or item["cost"] == 0
                }
                category_items.append(item_data)
            result[category] = category_items
        
        return result
    
    async def purchase_avatar_item(self, user_id: str, item_id: str) -> Dict:
        """Purchase an avatar item with coins"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"success": False, "error": "User not found"}
        
        # Find the item
        item = None
        for category, items in AVATARS.items():
            for i in items:
                if i["id"] == item_id:
                    item = {**i, "category": category}
                    break
        
        if not item:
            return {"success": False, "error": "Item not found"}
        
        level = self.calculate_level(user.get("xp_points", 0))
        if level < item["unlock_level"]:
            return {"success": False, "error": f"Niveau {item['unlock_level']} requis"}
        
        owned_items = user.get("owned_avatar_items", [])
        if item_id in owned_items:
            return {"success": False, "error": "Déjà possédé"}
        
        coins = user.get("coins", 0)
        if coins < item["cost"]:
            return {"success": False, "error": "Pas assez de coins"}
        
        # Purchase
        await self.db.users.update_one(
            {"id": user_id},
            {
                "$inc": {"coins": -item["cost"]},
                "$addToSet": {"owned_avatar_items": item_id}
            }
        )
        
        return {"success": True, "item": item, "new_balance": coins - item["cost"]}
    
    async def update_avatar(self, user_id: str, avatar_data: Dict) -> Dict:
        """Update user's avatar configuration"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"success": False, "error": "User not found"}
        
        owned_items = user.get("owned_avatar_items", [])
        
        # Validate that user owns or has access to all items
        for key, value in avatar_data.items():
            if value:
                # Free items are always accessible
                for category, items in AVATARS.items():
                    for item in items:
                        if item["id"] == value:
                            if item["cost"] > 0 and value not in owned_items:
                                return {"success": False, "error": f"Item {value} non possédé"}
        
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {"avatar": avatar_data}}
        )
        
        return {"success": True, "avatar": avatar_data}
    
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
    
    def get_avatar_shop(self) -> Dict:
        """Get all avatar items for the shop"""
        return AVATARS
