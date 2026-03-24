"""
Referral System Service for TheCryptoCoach 2.0
Referral links, tracking, rewards
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, List, Optional
from datetime import datetime, timezone
import uuid
import hashlib

# Referral rewards
REFERRAL_REWARDS = {
    "referrer": {"xp": 200, "coins": 50},  # Person who refers
    "referee": {"xp": 100, "coins": 25},   # Person who signs up
    "milestones": {
        5: {"xp": 500, "coins": 100, "title": "Social Starter"},
        10: {"xp": 1000, "coins": 250, "title": "Network Builder"},
        25: {"xp": 2500, "coins": 500, "title": "Community Champion"},
        50: {"xp": 5000, "coins": 1000, "title": "Influencer"},
        100: {"xp": 10000, "coins": 2500, "title": "Ambassador"}
    }
}


class ReferralService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    def generate_referral_code(self, user_id: str) -> str:
        """Generate a unique referral code for a user"""
        # Create a short hash from user_id
        hash_input = f"{user_id}-thecryptocoach"
        code = hashlib.md5(hash_input.encode()).hexdigest()[:8].upper()
        return code
    
    async def get_or_create_referral_code(self, user_id: str) -> Dict:
        """Get existing referral code or create new one"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"error": "User not found"}
        
        existing_code = user.get("referral_code")
        
        if not existing_code:
            existing_code = self.generate_referral_code(user_id)
            await self.db.users.update_one(
                {"id": user_id},
                {"$set": {"referral_code": existing_code}}
            )
        
        return {
            "referral_code": existing_code,
            "referral_link": f"https://thecryptocoach.io/register?ref={existing_code}"
        }
    
    async def apply_referral(self, new_user_id: str, referral_code: str) -> Dict:
        """Apply referral code when a new user signs up"""
        if not referral_code:
            return {"success": False, "error": "No referral code provided"}
        
        # Find the referrer
        referrer = await self.db.users.find_one(
            {"referral_code": referral_code.upper()},
            {"_id": 0}
        )
        
        if not referrer:
            return {"success": False, "error": "Invalid referral code"}
        
        if referrer["id"] == new_user_id:
            return {"success": False, "error": "Cannot refer yourself"}
        
        # Check if already referred
        new_user = await self.db.users.find_one({"id": new_user_id}, {"_id": 0})
        if new_user and new_user.get("referred_by"):
            return {"success": False, "error": "Already referred"}
        
        # Apply rewards
        referrer_rewards = REFERRAL_REWARDS["referrer"]
        referee_rewards = REFERRAL_REWARDS["referee"]
        
        # Update referrer
        await self.db.users.update_one(
            {"id": referrer["id"]},
            {
                "$inc": {
                    "xp_points": referrer_rewards["xp"],
                    "coins": referrer_rewards["coins"],
                    "referral_count": 1
                },
                "$push": {
                    "referred_users": {
                        "user_id": new_user_id,
                        "date": datetime.now(timezone.utc).isoformat()
                    }
                }
            }
        )
        
        # Update new user (referee)
        await self.db.users.update_one(
            {"id": new_user_id},
            {
                "$set": {"referred_by": referrer["id"]},
                "$inc": {
                    "xp_points": referee_rewards["xp"],
                    "coins": referee_rewards["coins"]
                }
            }
        )
        
        # Check for referrer milestones
        updated_referrer = await self.db.users.find_one({"id": referrer["id"]}, {"_id": 0})
        referral_count = updated_referrer.get("referral_count", 0)
        claimed_milestones = set(updated_referrer.get("claimed_referral_milestones", []))
        
        milestone_reached = None
        for count, rewards in REFERRAL_REWARDS["milestones"].items():
            if referral_count >= count and str(count) not in claimed_milestones:
                milestone_reached = {
                    "count": count,
                    "title": rewards["title"],
                    "xp": rewards["xp"],
                    "coins": rewards["coins"]
                }
                
                await self.db.users.update_one(
                    {"id": referrer["id"]},
                    {
                        "$addToSet": {"claimed_referral_milestones": str(count)},
                        "$inc": {
                            "xp_points": rewards["xp"],
                            "coins": rewards["coins"]
                        }
                    }
                )
                break
        
        # Record referral
        referral_record = {
            "id": str(uuid.uuid4()),
            "referrer_id": referrer["id"],
            "referee_id": new_user_id,
            "referral_code": referral_code.upper(),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.referrals.insert_one(referral_record)
        
        return {
            "success": True,
            "referrer_id": referrer["id"],
            "referrer_rewards": referrer_rewards,
            "referee_rewards": referee_rewards,
            "milestone_reached": milestone_reached
        }
    
    async def get_referral_stats(self, user_id: str) -> Dict:
        """Get user's referral statistics"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return None
        
        referral_code = user.get("referral_code")
        if not referral_code:
            # Generate code if not exists
            code_info = await self.get_or_create_referral_code(user_id)
            referral_code = code_info.get("referral_code")
        
        referral_count = user.get("referral_count", 0)
        referred_users = user.get("referred_users", [])
        claimed_milestones = user.get("claimed_referral_milestones", [])
        
        # Calculate total earned from referrals
        base_rewards = REFERRAL_REWARDS["referrer"]
        total_xp = referral_count * base_rewards["xp"]
        total_coins = referral_count * base_rewards["coins"]
        
        for milestone in claimed_milestones:
            if int(milestone) in REFERRAL_REWARDS["milestones"]:
                rewards = REFERRAL_REWARDS["milestones"][int(milestone)]
                total_xp += rewards["xp"]
                total_coins += rewards["coins"]
        
        # Find next milestone
        next_milestone = None
        for count, rewards in sorted(REFERRAL_REWARDS["milestones"].items()):
            if referral_count < count:
                next_milestone = {
                    "count": count,
                    "remaining": count - referral_count,
                    "rewards": rewards
                }
                break
        
        return {
            "referral_code": referral_code,
            "referral_link": f"https://thecryptocoach.io/register?ref={referral_code}",
            "referral_count": referral_count,
            "total_xp_earned": total_xp,
            "total_coins_earned": total_coins,
            "referred_users": referred_users[-10:],  # Last 10
            "next_milestone": next_milestone,
            "all_milestones": [
                {
                    "count": count,
                    "claimed": str(count) in claimed_milestones,
                    **rewards
                }
                for count, rewards in sorted(REFERRAL_REWARDS["milestones"].items())
            ]
        }
    
    async def get_referral_leaderboard(self, limit: int = 20) -> List[Dict]:
        """Get top referrers leaderboard"""
        users = await self.db.users.find(
            {"referral_count": {"$gt": 0}},
            {"_id": 0, "id": 1, "full_name": 1, "referral_count": 1, "avatar": 1}
        ).sort("referral_count", -1).limit(limit).to_list(limit)
        
        return [
            {
                "rank": i + 1,
                "user_id": u["id"],
                "name": u["full_name"],
                "referral_count": u["referral_count"],
                "avatar": u.get("avatar", {})
            }
            for i, u in enumerate(users)
        ]
