"""
Shop & Coins Economy Service for TheCryptoCoach 2.0
Items, boosters, cosmetics, purchases
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta
import uuid

# Shop categories and items
SHOP_ITEMS = {
    "boosters": [
        {
            "id": "xp_boost_2x",
            "name": "2x XP Boost (1 hour)",
            "name_fr": "Boost XP 2x (1 heure)",
            "name_ar": "تعزيز XP 2x (ساعة)",
            "description": "Double your XP earnings for 1 hour",
            "description_fr": "Doublez vos gains XP pendant 1 heure",
            "price": 50,
            "duration_hours": 1,
            "effect": {"xp_multiplier": 2},
            "icon": "zap",
            "category": "boosters"
        },
        {
            "id": "xp_boost_2x_day",
            "name": "2x XP Boost (24 hours)",
            "name_fr": "Boost XP 2x (24 heures)",
            "name_ar": "تعزيز XP 2x (24 ساعة)",
            "description": "Double your XP earnings for 24 hours",
            "description_fr": "Doublez vos gains XP pendant 24 heures",
            "price": 200,
            "duration_hours": 24,
            "effect": {"xp_multiplier": 2},
            "icon": "zap",
            "category": "boosters"
        },
        {
            "id": "coins_boost_2x",
            "name": "2x Coins Boost (1 hour)",
            "name_fr": "Boost Coins 2x (1 heure)",
            "name_ar": "تعزيز العملات 2x (ساعة)",
            "description": "Double your coin earnings for 1 hour",
            "description_fr": "Doublez vos gains de coins pendant 1 heure",
            "price": 75,
            "duration_hours": 1,
            "effect": {"coins_multiplier": 2},
            "icon": "coins",
            "category": "boosters"
        },
        {
            "id": "streak_freeze",
            "name": "Streak Freeze",
            "name_fr": "Gel de Série",
            "name_ar": "تجميد السلسلة",
            "description": "Protect your streak for one missed day",
            "description_fr": "Protégez votre série pour un jour manqué",
            "price": 50,
            "effect": {"streak_freeze": 1},
            "icon": "snowflake",
            "category": "boosters",
            "max_owned": 3
        }
    ],
    "quiz_powerups": [
        {
            "id": "quiz_5050",
            "name": "50/50 (removes 2 wrong answers)",
            "name_fr": "50/50 (supprime 2 mauvaises réponses)",
            "name_ar": "50/50 (يزيل إجابتين خاطئتين)",
            "description": "Use during quizzes to eliminate 2 wrong options",
            "description_fr": "Utilisez pendant les quiz pour éliminer 2 options",
            "price": 25,
            "effect": {"quiz_5050": 1},
            "icon": "scissors",
            "category": "quiz_powerups"
        },
        {
            "id": "quiz_skip",
            "name": "Skip Question",
            "name_fr": "Passer la Question",
            "name_ar": "تخطي السؤال",
            "description": "Skip one question and count it as correct",
            "description_fr": "Passez une question et comptez-la comme correcte",
            "price": 40,
            "effect": {"quiz_skip": 1},
            "icon": "fast-forward",
            "category": "quiz_powerups"
        },
        {
            "id": "quiz_hint",
            "name": "Hint (shows correct answer)",
            "name_fr": "Indice (montre la bonne réponse)",
            "name_ar": "تلميح (يظهر الإجابة الصحيحة)",
            "description": "Get a hint showing the correct answer",
            "description_fr": "Obtenez un indice montrant la bonne réponse",
            "price": 30,
            "effect": {"quiz_hint": 1},
            "icon": "lightbulb",
            "category": "quiz_powerups"
        }
    ],
    "cosmetics": [
        {
            "id": "avatar_trader_pro",
            "name": "Pro Trader Avatar",
            "name_fr": "Avatar Trader Pro",
            "name_ar": "صورة المتداول المحترف",
            "description": "Exclusive avatar for serious traders",
            "description_fr": "Avatar exclusif pour traders sérieux",
            "price": 150,
            "effect": {"avatar_base": "avatar_trader_pro"},
            "icon": "user",
            "category": "cosmetics"
        },
        {
            "id": "frame_neon",
            "name": "Neon Frame",
            "name_fr": "Cadre Néon",
            "name_ar": "إطار نيون",
            "description": "A glowing neon frame for your avatar",
            "description_fr": "Un cadre néon lumineux pour votre avatar",
            "price": 100,
            "effect": {"avatar_frame": "frame_neon"},
            "icon": "square",
            "category": "cosmetics"
        },
        {
            "id": "title_whale",
            "name": "Whale Title",
            "name_fr": "Titre Whale",
            "name_ar": "لقب الحوت",
            "description": "Display 'Crypto Whale' as your title",
            "description_fr": "Affichez 'Crypto Whale' comme titre",
            "price": 200,
            "effect": {"avatar_title": "title_whale"},
            "icon": "award",
            "category": "cosmetics"
        },
        {
            "id": "profile_banner_bull",
            "name": "Bull Market Banner",
            "name_fr": "Bannière Bull Market",
            "name_ar": "لافتة السوق الصاعد",
            "description": "A bullish banner for your profile",
            "description_fr": "Une bannière haussière pour votre profil",
            "price": 75,
            "effect": {"profile_banner": "banner_bull"},
            "icon": "image",
            "category": "cosmetics"
        }
    ],
    "special": [
        {
            "id": "name_change",
            "name": "Name Change Token",
            "name_fr": "Jeton Changement de Nom",
            "name_ar": "رمز تغيير الاسم",
            "description": "Change your display name once",
            "description_fr": "Changez votre nom affiché une fois",
            "price": 100,
            "effect": {"name_change": 1},
            "icon": "edit",
            "category": "special"
        },
        {
            "id": "portfolio_reset_bonus",
            "name": "Portfolio Reset + Bonus",
            "name_fr": "Reset Portfolio + Bonus",
            "name_ar": "إعادة تعيين المحفظة + مكافأة",
            "description": "Reset your portfolio with $15,000 instead of $10,000",
            "description_fr": "Réinitialisez votre portfolio avec 15 000$ au lieu de 10 000$",
            "price": 150,
            "effect": {"portfolio_reset_bonus": 15000},
            "icon": "refresh-cw",
            "category": "special"
        }
    ]
}


class ShopService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    def get_all_items(self) -> Dict:
        """Get all shop items organized by category"""
        return SHOP_ITEMS
    
    def get_item_by_id(self, item_id: str) -> Optional[Dict]:
        """Get a specific item by ID"""
        for category, items in SHOP_ITEMS.items():
            for item in items:
                if item["id"] == item_id:
                    return {**item, "category": category}
        return None
    
    async def purchase_item(self, user_id: str, item_id: str) -> Dict:
        """Purchase an item from the shop"""
        item = self.get_item_by_id(item_id)
        if not item:
            return {"success": False, "error": "Item not found"}
        
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"success": False, "error": "User not found"}
        
        coins = user.get("coins", 0)
        if coins < item["price"]:
            return {"success": False, "error": f"Not enough coins (need {item['price']}, have {coins})"}
        
        # Check max owned for certain items
        if "max_owned" in item:
            inventory = user.get("inventory", {})
            current_owned = inventory.get(item_id, 0)
            if current_owned >= item["max_owned"]:
                return {"success": False, "error": f"Maximum {item['max_owned']} allowed"}
        
        # Process purchase
        new_balance = coins - item["price"]
        
        # Add to inventory or apply effect
        update_data = {
            "$inc": {"coins": -item["price"]},
            "$set": {"last_purchase": datetime.now(timezone.utc).isoformat()}
        }
        
        # Handle different item types
        if item["category"] == "boosters":
            if "duration_hours" in item:
                # Activate time-limited booster
                expires_at = datetime.now(timezone.utc) + timedelta(hours=item["duration_hours"])
                active_booster = {
                    "item_id": item_id,
                    "effect": item["effect"],
                    "expires_at": expires_at.isoformat()
                }
                update_data["$push"] = {"active_boosters": active_booster}
            else:
                # Add to inventory (like streak freeze)
                update_data["$inc"][f"inventory.{item_id}"] = 1
                if "streak_freeze" in item["effect"]:
                    update_data["$inc"]["streak_freezes"] = 1
        
        elif item["category"] == "quiz_powerups":
            update_data["$inc"][f"inventory.{item_id}"] = 1
        
        elif item["category"] == "cosmetics":
            update_data["$addToSet"] = {"owned_cosmetics": item_id}
        
        elif item["category"] == "special":
            update_data["$inc"][f"inventory.{item_id}"] = 1
        
        await self.db.users.update_one({"id": user_id}, update_data)
        
        # Record transaction
        transaction = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": "purchase",
            "item_id": item_id,
            "item_name": item["name"],
            "coins_spent": item["price"],
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        await self.db.coin_transactions.insert_one(transaction)
        
        return {
            "success": True,
            "item": item,
            "new_balance": new_balance,
            "transaction_id": transaction["id"]
        }
    
    async def get_user_inventory(self, user_id: str) -> Dict:
        """Get user's inventory and active boosters"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return None
        
        inventory = user.get("inventory", {})
        active_boosters = user.get("active_boosters", [])
        owned_cosmetics = user.get("owned_cosmetics", [])
        
        # Filter expired boosters
        now = datetime.now(timezone.utc)
        active_boosters = [
            b for b in active_boosters 
            if datetime.fromisoformat(b["expires_at"].replace("Z", "+00:00")) > now
        ]
        
        return {
            "coins": user.get("coins", 0),
            "inventory": inventory,
            "active_boosters": active_boosters,
            "owned_cosmetics": owned_cosmetics,
            "streak_freezes": user.get("streak_freezes", 0)
        }
    
    async def use_item(self, user_id: str, item_id: str) -> Dict:
        """Use a consumable item from inventory"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"success": False, "error": "User not found"}
        
        inventory = user.get("inventory", {})
        if inventory.get(item_id, 0) <= 0:
            return {"success": False, "error": "Item not in inventory"}
        
        item = self.get_item_by_id(item_id)
        if not item:
            return {"success": False, "error": "Item not found"}
        
        # Decrement from inventory
        await self.db.users.update_one(
            {"id": user_id},
            {"$inc": {f"inventory.{item_id}": -1}}
        )
        
        return {
            "success": True,
            "item": item,
            "effect": item["effect"],
            "remaining": inventory.get(item_id, 1) - 1
        }
    
    async def get_active_multipliers(self, user_id: str) -> Dict:
        """Get current active XP and coin multipliers"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"xp_multiplier": 1, "coins_multiplier": 1}
        
        active_boosters = user.get("active_boosters", [])
        now = datetime.now(timezone.utc)
        
        xp_mult = 1
        coins_mult = 1
        
        for booster in active_boosters:
            expires = datetime.fromisoformat(booster["expires_at"].replace("Z", "+00:00"))
            if expires > now:
                effect = booster.get("effect", {})
                xp_mult = max(xp_mult, effect.get("xp_multiplier", 1))
                coins_mult = max(coins_mult, effect.get("coins_multiplier", 1))
        
        return {
            "xp_multiplier": xp_mult,
            "coins_multiplier": coins_mult
        }
