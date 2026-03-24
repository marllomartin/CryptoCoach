"""
Notification Service for TheCryptoCoach 2.0
In-app notifications, streak reminders, achievements
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, List, Optional
from datetime import datetime, timezone, timedelta
import uuid

# Notification types
NOTIFICATION_TYPES = {
    "achievement": {"icon": "trophy", "color": "yellow"},
    "level_up": {"icon": "zap", "color": "purple"},
    "quest_complete": {"icon": "target", "color": "green"},
    "streak": {"icon": "flame", "color": "orange"},
    "streak_warning": {"icon": "alert-triangle", "color": "red"},
    "welcome": {"icon": "sparkles", "color": "blue"},
    "comeback": {"icon": "gift", "color": "pink"},
    "chapter_complete": {"icon": "book-open", "color": "cyan"},
    "trade": {"icon": "trending-up", "color": "green"},
    "referral": {"icon": "users", "color": "indigo"},
    "guild": {"icon": "shield", "color": "violet"},
    "system": {"icon": "bell", "color": "gray"},
}


class NotificationService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def create_notification(
        self, 
        user_id: str, 
        notification_type: str,
        title: str,
        message: str,
        title_fr: str = None,
        message_fr: str = None,
        title_ar: str = None,
        message_ar: str = None,
        data: Dict = None,
        priority: str = "normal"
    ) -> Dict:
        """Create a new notification for a user"""
        notification = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "type": notification_type,
            "title": title,
            "message": message,
            "title_fr": title_fr or title,
            "message_fr": message_fr or message,
            "title_ar": title_ar or title,
            "message_ar": message_ar or message,
            "data": data or {},
            "priority": priority,
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await self.db.notifications.insert_one(notification)
        
        # Update unread count
        await self.db.users.update_one(
            {"id": user_id},
            {"$inc": {"unread_notifications": 1}}
        )
        
        return {k: v for k, v in notification.items() if k != "_id"}
    
    async def get_user_notifications(
        self, 
        user_id: str, 
        limit: int = 50,
        unread_only: bool = False
    ) -> List[Dict]:
        """Get notifications for a user"""
        query = {"user_id": user_id}
        if unread_only:
            query["read"] = False
        
        notifications = await self.db.notifications.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return notifications
    
    async def mark_as_read(self, user_id: str, notification_id: str) -> Dict:
        """Mark a notification as read"""
        result = await self.db.notifications.update_one(
            {"id": notification_id, "user_id": user_id, "read": False},
            {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        if result.modified_count > 0:
            await self.db.users.update_one(
                {"id": user_id, "unread_notifications": {"$gt": 0}},
                {"$inc": {"unread_notifications": -1}}
            )
        
        return {"success": result.modified_count > 0}
    
    async def mark_all_as_read(self, user_id: str) -> Dict:
        """Mark all notifications as read"""
        result = await self.db.notifications.update_many(
            {"user_id": user_id, "read": False},
            {"$set": {"read": True, "read_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        await self.db.users.update_one(
            {"id": user_id},
            {"$set": {"unread_notifications": 0}}
        )
        
        return {"success": True, "count": result.modified_count}
    
    async def delete_notification(self, user_id: str, notification_id: str) -> Dict:
        """Delete a notification"""
        notif = await self.db.notifications.find_one(
            {"id": notification_id, "user_id": user_id},
            {"_id": 0, "read": 1}
        )
        
        if notif and not notif.get("read"):
            await self.db.users.update_one(
                {"id": user_id, "unread_notifications": {"$gt": 0}},
                {"$inc": {"unread_notifications": -1}}
            )
        
        result = await self.db.notifications.delete_one(
            {"id": notification_id, "user_id": user_id}
        )
        
        return {"success": result.deleted_count > 0}
    
    async def get_unread_count(self, user_id: str) -> int:
        """Get unread notification count"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0, "unread_notifications": 1})
        return user.get("unread_notifications", 0) if user else 0
    
    # Pre-built notification creators
    async def notify_achievement(self, user_id: str, achievement_name: str, achievement_name_fr: str, xp_reward: int):
        return await self.create_notification(
            user_id=user_id,
            notification_type="achievement",
            title=f"Achievement Unlocked: {achievement_name}!",
            message=f"Congratulations! You earned +{xp_reward} XP",
            title_fr=f"Succès Débloqué : {achievement_name_fr} !",
            message_fr=f"Félicitations ! Vous avez gagné +{xp_reward} XP",
            title_ar=f"إنجاز جديد: {achievement_name}!",
            message_ar=f"تهانينا! لقد ربحت +{xp_reward} XP",
            data={"achievement": achievement_name, "xp": xp_reward},
            priority="high"
        )
    
    async def notify_level_up(self, user_id: str, new_level: int, coins_earned: int):
        return await self.create_notification(
            user_id=user_id,
            notification_type="level_up",
            title=f"Level Up! You reached Level {new_level}!",
            message=f"Amazing progress! You earned {coins_earned} coins",
            title_fr=f"Niveau Supérieur ! Vous avez atteint le Niveau {new_level} !",
            message_fr=f"Progression incroyable ! Vous avez gagné {coins_earned} coins",
            title_ar=f"ارتقاء! وصلت للمستوى {new_level}!",
            message_ar=f"تقدم رائع! لقد ربحت {coins_earned} عملة",
            data={"level": new_level, "coins": coins_earned},
            priority="high"
        )
    
    async def notify_streak_warning(self, user_id: str, current_streak: int):
        return await self.create_notification(
            user_id=user_id,
            notification_type="streak_warning",
            title="Don't lose your streak!",
            message=f"Complete an activity today to keep your {current_streak}-day streak alive!",
            title_fr="Ne perdez pas votre série !",
            message_fr=f"Complétez une activité aujourd'hui pour garder votre série de {current_streak} jours !",
            title_ar="لا تفقد سلسلتك!",
            message_ar=f"أكمل نشاطاً اليوم للحفاظ على سلسلتك البالغة {current_streak} يوم!",
            data={"streak": current_streak},
            priority="high"
        )
    
    async def notify_streak_milestone(self, user_id: str, streak_days: int, bonus_xp: int, bonus_coins: int):
        return await self.create_notification(
            user_id=user_id,
            notification_type="streak",
            title=f"🔥 {streak_days}-Day Streak Milestone!",
            message=f"Incredible dedication! You earned +{bonus_xp} XP and {bonus_coins} coins!",
            title_fr=f"🔥 Milestone de {streak_days} Jours !",
            message_fr=f"Dévotion incroyable ! Vous avez gagné +{bonus_xp} XP et {bonus_coins} coins !",
            title_ar=f"🔥 إنجاز سلسلة {streak_days} يوم!",
            message_ar=f"إصرار رائع! لقد ربحت +{bonus_xp} XP و {bonus_coins} عملة!",
            data={"streak": streak_days, "xp": bonus_xp, "coins": bonus_coins},
            priority="high"
        )
    
    async def notify_welcome(self, user_id: str, user_name: str):
        return await self.create_notification(
            user_id=user_id,
            notification_type="welcome",
            title=f"Welcome to TheCryptoCoach, {user_name}!",
            message="Start your crypto journey today. Complete your first lesson to earn XP!",
            title_fr=f"Bienvenue sur TheCryptoCoach, {user_name} !",
            message_fr="Commencez votre parcours crypto aujourd'hui. Complétez votre première leçon pour gagner des XP !",
            title_ar=f"مرحباً بك في TheCryptoCoach, {user_name}!",
            message_ar="ابدأ رحلتك في العملات المشفرة اليوم. أكمل درسك الأول لكسب XP!",
            priority="normal"
        )
    
    async def notify_comeback(self, user_id: str, days_away: int, bonus_xp: int):
        return await self.create_notification(
            user_id=user_id,
            notification_type="comeback",
            title="Welcome Back! We missed you!",
            message=f"Here's {bonus_xp} bonus XP to help you get back on track!",
            title_fr="Bon retour ! Vous nous avez manqué !",
            message_fr=f"Voici {bonus_xp} XP bonus pour vous aider à reprendre !",
            title_ar="مرحباً بعودتك! افتقدناك!",
            message_ar=f"إليك {bonus_xp} XP إضافية لمساعدتك على العودة!",
            data={"days_away": days_away, "bonus_xp": bonus_xp},
            priority="high"
        )
    
    async def notify_quest_complete(self, user_id: str, quest_name: str, xp_reward: int, coins_reward: int):
        return await self.create_notification(
            user_id=user_id,
            notification_type="quest_complete",
            title=f"Quest Complete: {quest_name}!",
            message=f"Rewards: +{xp_reward} XP, +{coins_reward} coins",
            title_fr=f"Quête Complétée : {quest_name} !",
            message_fr=f"Récompenses : +{xp_reward} XP, +{coins_reward} coins",
            title_ar=f"اكتملت المهمة: {quest_name}!",
            message_ar=f"المكافآت: +{xp_reward} XP, +{coins_reward} عملة",
            data={"quest": quest_name, "xp": xp_reward, "coins": coins_reward},
            priority="normal"
        )
    
    async def notify_chapter_complete(self, user_id: str, chapter_name: str, xp_reward: int, coins_reward: int):
        return await self.create_notification(
            user_id=user_id,
            notification_type="chapter_complete",
            title=f"Chapter Complete: {chapter_name}!",
            message=f"Epic milestone! Bonus: +{xp_reward} XP, +{coins_reward} coins",
            title_fr=f"Chapitre Terminé : {chapter_name} !",
            message_fr=f"Étape épique ! Bonus : +{xp_reward} XP, +{coins_reward} coins",
            title_ar=f"اكتمل الفصل: {chapter_name}!",
            message_ar=f"إنجاز عظيم! المكافأة: +{xp_reward} XP, +{coins_reward} عملة",
            data={"chapter": chapter_name, "xp": xp_reward, "coins": coins_reward},
            priority="high"
        )
