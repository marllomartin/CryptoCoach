"""
Guild/Community Service for TheCryptoCoach 2.0
Guilds, membership, events, chat
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta
import uuid

# Guild ranks
GUILD_RANKS = {
    "member": {"level": 1, "permissions": ["chat", "participate"]},
    "elder": {"level": 2, "permissions": ["chat", "participate", "invite"]},
    "officer": {"level": 3, "permissions": ["chat", "participate", "invite", "kick", "events"]},
    "leader": {"level": 4, "permissions": ["chat", "participate", "invite", "kick", "events", "settings", "promote", "disband"]}
}

# Guild benefits
GUILD_BENEFITS = {
    "xp_bonus": 0.05,  # 5% XP bonus for guild members
    "coins_bonus": 0.05,  # 5% coins bonus
}


class GuildService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def create_guild(
        self, 
        leader_id: str, 
        name: str, 
        description: str = "",
        is_public: bool = True
    ) -> Dict:
        """Create a new guild"""
        # Check if user already in a guild
        user = await self.db.users.find_one({"id": leader_id}, {"_id": 0})
        if not user:
            return {"success": False, "error": "User not found"}
        
        if user.get("guild_id"):
            return {"success": False, "error": "Already in a guild"}
        
        # Check if name is taken
        existing = await self.db.guilds.find_one({"name": name})
        if existing:
            return {"success": False, "error": "Guild name already taken"}
        
        guild_id = str(uuid.uuid4())
        guild = {
            "id": guild_id,
            "name": name,
            "description": description,
            "leader_id": leader_id,
            "is_public": is_public,
            "member_count": 1,
            "max_members": 50,
            "total_xp": user.get("xp_points", 0),
            "weekly_xp": 0,
            "level": 1,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "settings": {
                "join_level_required": 1,
                "auto_accept": is_public
            }
        }
        
        await self.db.guilds.insert_one(guild)
        
        # Add leader as member
        membership = {
            "id": str(uuid.uuid4()),
            "guild_id": guild_id,
            "user_id": leader_id,
            "rank": "leader",
            "joined_at": datetime.now(timezone.utc).isoformat(),
            "weekly_contribution": 0
        }
        await self.db.guild_members.insert_one(membership)
        
        # Update user
        await self.db.users.update_one(
            {"id": leader_id},
            {"$set": {"guild_id": guild_id, "guild_rank": "leader"}}
        )
        
        return {
            "success": True,
            "guild": {k: v for k, v in guild.items() if k != "_id"}
        }
    
    async def join_guild(self, user_id: str, guild_id: str) -> Dict:
        """Join a guild"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"success": False, "error": "User not found"}
        
        if user.get("guild_id"):
            return {"success": False, "error": "Already in a guild"}
        
        guild = await self.db.guilds.find_one({"id": guild_id}, {"_id": 0})
        if not guild:
            return {"success": False, "error": "Guild not found"}
        
        if guild["member_count"] >= guild["max_members"]:
            return {"success": False, "error": "Guild is full"}
        
        if not guild["is_public"]:
            return {"success": False, "error": "Guild is private - request to join"}
        
        # Check level requirement
        from services.gamification_service import GamificationService
        gamification = GamificationService(self.db)
        user_level = gamification.calculate_level(user.get("xp_points", 0))
        
        if user_level < guild["settings"].get("join_level_required", 1):
            return {"success": False, "error": f"Level {guild['settings']['join_level_required']} required"}
        
        # Add member
        membership = {
            "id": str(uuid.uuid4()),
            "guild_id": guild_id,
            "user_id": user_id,
            "rank": "member",
            "joined_at": datetime.now(timezone.utc).isoformat(),
            "weekly_contribution": 0
        }
        await self.db.guild_members.insert_one(membership)
        
        # Update guild
        await self.db.guilds.update_one(
            {"id": guild_id},
            {
                "$inc": {
                    "member_count": 1,
                    "total_xp": user.get("xp_points", 0)
                }
            }
        )
        
        # Update user
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {"guild_id": guild_id, "guild_rank": "member"}}
        )
        
        return {"success": True, "guild_id": guild_id, "rank": "member"}
    
    async def leave_guild(self, user_id: str) -> Dict:
        """Leave current guild"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"success": False, "error": "User not found"}
        
        guild_id = user.get("guild_id")
        if not guild_id:
            return {"success": False, "error": "Not in a guild"}
        
        guild = await self.db.guilds.find_one({"id": guild_id}, {"_id": 0})
        if guild and guild["leader_id"] == user_id:
            return {"success": False, "error": "Leaders must transfer ownership or disband"}
        
        # Remove membership
        await self.db.guild_members.delete_one({"guild_id": guild_id, "user_id": user_id})
        
        # Update guild
        await self.db.guilds.update_one(
            {"id": guild_id},
            {
                "$inc": {
                    "member_count": -1,
                    "total_xp": -user.get("xp_points", 0)
                }
            }
        )
        
        # Update user
        await self.db.users.update_one(
            {"id": user_id},
            {"$unset": {"guild_id": "", "guild_rank": ""}}
        )
        
        return {"success": True}
    
    async def get_guild(self, guild_id: str) -> Optional[Dict]:
        """Get guild details with members"""
        guild = await self.db.guilds.find_one({"id": guild_id}, {"_id": 0})
        if not guild:
            return None
        
        # Get members
        members = await self.db.guild_members.find(
            {"guild_id": guild_id},
            {"_id": 0}
        ).to_list(100)
        
        # Get member details
        member_details = []
        for member in members:
            user = await self.db.users.find_one(
                {"id": member["user_id"]},
                {"_id": 0, "id": 1, "full_name": 1, "xp_points": 1, "avatar": 1}
            )
            if user:
                member_details.append({
                    **member,
                    "name": user["full_name"],
                    "xp_points": user.get("xp_points", 0),
                    "avatar": user.get("avatar", {})
                })
        
        guild["members"] = sorted(member_details, key=lambda x: GUILD_RANKS.get(x["rank"], {}).get("level", 0), reverse=True)
        
        return guild
    
    async def get_user_guild(self, user_id: str) -> Optional[Dict]:
        """Get the guild a user belongs to"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user or not user.get("guild_id"):
            return None
        
        return await self.get_guild(user["guild_id"])
    
    async def search_guilds(self, query: str = "", limit: int = 20) -> List[Dict]:
        """Search for public guilds"""
        filter_query = {"is_public": True}
        if query:
            filter_query["name"] = {"$regex": query, "$options": "i"}
        
        guilds = await self.db.guilds.find(
            filter_query,
            {"_id": 0}
        ).sort("total_xp", -1).limit(limit).to_list(limit)
        
        return guilds
    
    async def get_guild_leaderboard(self, limit: int = 20) -> List[Dict]:
        """Get top guilds by total XP"""
        guilds = await self.db.guilds.find(
            {},
            {"_id": 0, "id": 1, "name": 1, "total_xp": 1, "member_count": 1, "level": 1}
        ).sort("total_xp", -1).limit(limit).to_list(limit)
        
        return [
            {**g, "rank": i + 1}
            for i, g in enumerate(guilds)
        ]
    
    async def send_guild_message(self, user_id: str, message: str) -> Dict:
        """Send a message to guild chat"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user or not user.get("guild_id"):
            return {"success": False, "error": "Not in a guild"}
        
        if len(message) > 500:
            return {"success": False, "error": "Message too long (max 500)"}
        
        chat_message = {
            "id": str(uuid.uuid4()),
            "guild_id": user["guild_id"],
            "user_id": user_id,
            "user_name": user["full_name"],
            "message": message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.guild_chat.insert_one(chat_message)
        
        return {"success": True, "message": {k: v for k, v in chat_message.items() if k != "_id"}}
    
    async def get_guild_chat(self, guild_id: str, limit: int = 50) -> List[Dict]:
        """Get recent guild chat messages"""
        messages = await self.db.guild_chat.find(
            {"guild_id": guild_id},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return list(reversed(messages))
    
    async def contribute_xp_to_guild(self, user_id: str, xp_amount: int):
        """Record XP contribution to guild"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user or not user.get("guild_id"):
            return
        
        guild_id = user["guild_id"]
        
        # Update guild total
        await self.db.guilds.update_one(
            {"id": guild_id},
            {"$inc": {"total_xp": xp_amount, "weekly_xp": xp_amount}}
        )
        
        # Update member contribution
        await self.db.guild_members.update_one(
            {"guild_id": guild_id, "user_id": user_id},
            {"$inc": {"weekly_contribution": xp_amount}}
        )
