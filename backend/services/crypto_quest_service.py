"""
Crypto Quest Service for TheCryptoCoach 2.0
Story-driven learning journey with chapters and missions
"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Dict, List, Optional
from datetime import datetime, timezone
import uuid

# Crypto Quest Chapters with missions
QUEST_CHAPTERS = [
    {
        "id": "chapter_1",
        "number": 1,
        "name_key": "ch1",
        "unlock_level": 1,
        "xp_reward": 200,
        "coins_reward": 50,
        "missions": [
            {
                "id": "mission_1_1",
                "number": 1,
                "title": "What is Cryptocurrency?",
                "title_fr": "Qu'est-ce que la Cryptomonnaie ?",
                "title_ar": "ما هي العملة المشفرة؟",
                "description": "Discover the revolutionary world of digital currencies",
                "description_fr": "Découvrez le monde révolutionnaire des monnaies numériques",
                "description_ar": "اكتشف عالم العملات الرقمية الثوري",
                "linked_lesson_id": "lesson-1-1",
                "xp_reward": 50,
                "type": "lesson"
            },
            {
                "id": "mission_1_2",
                "number": 2,
                "title": "Understanding Blockchain",
                "title_fr": "Comprendre la Blockchain",
                "title_ar": "فهم البلوكتشين",
                "description": "Learn how blockchain technology works",
                "description_fr": "Apprenez comment fonctionne la technologie blockchain",
                "description_ar": "تعلم كيف تعمل تقنية البلوكتشين",
                "linked_lesson_id": "lesson-1-2",
                "xp_reward": 50,
                "type": "lesson"
            },
            {
                "id": "mission_1_3",
                "number": 3,
                "title": "The Birth of Bitcoin",
                "title_fr": "La Naissance du Bitcoin",
                "title_ar": "ولادة البيتكوين",
                "description": "Explore the history of the first cryptocurrency",
                "description_fr": "Explorez l'histoire de la première cryptomonnaie",
                "description_ar": "استكشف تاريخ أول عملة مشفرة",
                "linked_lesson_id": "lesson-1-3",
                "xp_reward": 50,
                "type": "lesson"
            },
            {
                "id": "mission_1_quiz",
                "number": 4,
                "title": "Chapter 1 Challenge",
                "title_fr": "Défi du Chapitre 1",
                "title_ar": "تحدي الفصل الأول",
                "description": "Test your knowledge of crypto basics",
                "description_fr": "Testez vos connaissances sur les bases de la crypto",
                "description_ar": "اختبر معرفتك بأساسيات العملات المشفرة",
                "linked_quiz_id": "quiz-1",
                "xp_reward": 100,
                "type": "quiz"
            }
        ]
    },
    {
        "id": "chapter_2",
        "number": 2,
        "name_key": "ch2",
        "unlock_level": 3,
        "xp_reward": 300,
        "coins_reward": 75,
        "missions": [
            {
                "id": "mission_2_1",
                "number": 1,
                "title": "Crypto Wallets",
                "title_fr": "Portefeuilles Crypto",
                "title_ar": "محافظ العملات المشفرة",
                "description": "Learn to safely store your digital assets",
                "description_fr": "Apprenez à stocker vos actifs numériques en sécurité",
                "description_ar": "تعلم تخزين أصولك الرقمية بأمان",
                "linked_lesson_id": "lesson-1-4",
                "xp_reward": 50,
                "type": "lesson"
            },
            {
                "id": "mission_2_2",
                "number": 2,
                "title": "Security Best Practices",
                "title_fr": "Meilleures Pratiques de Sécurité",
                "title_ar": "أفضل ممارسات الأمان",
                "description": "Protect yourself from scams and hacks",
                "description_fr": "Protégez-vous des arnaques et des piratages",
                "description_ar": "احمِ نفسك من الاحتيال والقرصنة",
                "linked_lesson_id": "lesson-1-5",
                "xp_reward": 50,
                "type": "lesson"
            },
            {
                "id": "mission_2_3",
                "number": 3,
                "title": "Your First Trade",
                "title_fr": "Votre Premier Trade",
                "title_ar": "صفقتك الأولى",
                "description": "Execute your first simulated trade",
                "description_fr": "Exécutez votre premier trade simulé",
                "description_ar": "نفذ أول صفقة محاكاة",
                "xp_reward": 75,
                "type": "trading_challenge",
                "challenge_type": "first_trade"
            },
            {
                "id": "mission_2_quiz",
                "number": 4,
                "title": "Chapter 2 Challenge",
                "title_fr": "Défi du Chapitre 2",
                "title_ar": "تحدي الفصل الثاني",
                "description": "Prove your security knowledge",
                "description_fr": "Prouvez vos connaissances en sécurité",
                "description_ar": "أثبت معرفتك بالأمان",
                "linked_quiz_id": "quiz-2",
                "xp_reward": 100,
                "type": "quiz"
            }
        ]
    },
    {
        "id": "chapter_3",
        "number": 3,
        "name_key": "ch3",
        "unlock_level": 6,
        "xp_reward": 400,
        "coins_reward": 100,
        "missions": [
            {
                "id": "mission_3_1",
                "number": 1,
                "title": "DeFi Revolution",
                "title_fr": "La Révolution DeFi",
                "title_ar": "ثورة التمويل اللامركزي",
                "description": "Understand decentralized finance",
                "description_fr": "Comprenez la finance décentralisée",
                "description_ar": "افهم التمويل اللامركزي",
                "linked_lesson_id": "lesson-2-1",
                "xp_reward": 75,
                "type": "lesson"
            },
            {
                "id": "mission_3_2",
                "number": 2,
                "title": "NFT Universe",
                "title_fr": "L'Univers NFT",
                "title_ar": "عالم NFT",
                "description": "Explore non-fungible tokens",
                "description_fr": "Explorez les tokens non-fongibles",
                "description_ar": "استكشف الرموز غير القابلة للاستبدال",
                "linked_lesson_id": "lesson-2-2",
                "xp_reward": 75,
                "type": "lesson"
            },
            {
                "id": "mission_3_3",
                "number": 3,
                "title": "Portfolio Builder",
                "title_fr": "Constructeur de Portfolio",
                "title_ar": "بناء المحفظة",
                "description": "Build a diversified crypto portfolio",
                "description_fr": "Construisez un portfolio crypto diversifié",
                "description_ar": "أنشئ محفظة عملات مشفرة متنوعة",
                "xp_reward": 100,
                "type": "trading_challenge",
                "challenge_type": "diversify_portfolio"
            }
        ]
    },
    {
        "id": "chapter_4",
        "number": 4,
        "name_key": "ch4",
        "unlock_level": 10,
        "xp_reward": 500,
        "coins_reward": 150,
        "missions": [
            {
                "id": "mission_4_1",
                "number": 1,
                "title": "Technical Analysis",
                "title_fr": "Analyse Technique",
                "title_ar": "التحليل الفني",
                "description": "Master chart reading and indicators",
                "description_fr": "Maîtrisez la lecture des graphiques et indicateurs",
                "description_ar": "أتقن قراءة الرسوم البيانية والمؤشرات",
                "linked_lesson_id": "lesson-3-1",
                "xp_reward": 100,
                "type": "lesson"
            },
            {
                "id": "mission_4_2",
                "number": 2,
                "title": "Risk Management",
                "title_fr": "Gestion des Risques",
                "title_ar": "إدارة المخاطر",
                "description": "Learn to manage trading risks",
                "description_fr": "Apprenez à gérer les risques de trading",
                "description_ar": "تعلم إدارة مخاطر التداول",
                "linked_lesson_id": "lesson-3-2",
                "xp_reward": 100,
                "type": "lesson"
            },
            {
                "id": "mission_4_3",
                "number": 3,
                "title": "Profit Master",
                "title_fr": "Maître du Profit",
                "title_ar": "خبير الربح",
                "description": "Make $500 profit in simulation",
                "description_fr": "Réalisez 500$ de profit en simulation",
                "description_ar": "حقق ربح 500$ في المحاكاة",
                "xp_reward": 150,
                "type": "trading_challenge",
                "challenge_type": "profit_target",
                "target_value": 500
            }
        ]
    },
    {
        "id": "chapter_5",
        "number": 5,
        "name_key": "ch5",
        "unlock_level": 15,
        "xp_reward": 750,
        "coins_reward": 250,
        "missions": [
            {
                "id": "mission_5_1",
                "number": 1,
                "title": "Macro Analysis",
                "title_fr": "Analyse Macro",
                "title_ar": "التحليل الكلي",
                "description": "Understand market cycles and trends",
                "description_fr": "Comprenez les cycles et tendances du marché",
                "description_ar": "افهم دورات واتجاهات السوق",
                "linked_lesson_id": "lesson-3-5",
                "xp_reward": 150,
                "type": "lesson"
            },
            {
                "id": "mission_5_2",
                "number": 2,
                "title": "Final Exam",
                "title_fr": "Examen Final",
                "title_ar": "الامتحان النهائي",
                "description": "Complete the master certification exam",
                "description_fr": "Passez l'examen de certification maître",
                "description_ar": "أكمل امتحان الشهادة الرئيسية",
                "linked_exam_id": "exam-3",
                "xp_reward": 300,
                "type": "exam"
            },
            {
                "id": "mission_5_3",
                "number": 3,
                "title": "Legend Status",
                "title_fr": "Statut Légendaire",
                "title_ar": "مرتبة الأسطورة",
                "description": "Achieve $2000 total profit",
                "description_fr": "Atteignez 2000$ de profit total",
                "description_ar": "حقق 2000$ ربح إجمالي",
                "xp_reward": 500,
                "type": "trading_challenge",
                "challenge_type": "profit_target",
                "target_value": 2000
            }
        ]
    }
]


class CryptoQuestService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
    
    async def get_user_quest_progress(self, user_id: str) -> Dict:
        """Get user's overall quest progress"""
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return None
        
        # Get user's level for chapter unlocking
        xp = user.get("xp_points", 0)
        from services.gamification_service import GamificationService
        gamification = GamificationService(self.db)
        user_level = gamification.calculate_level(xp)
        
        # Get completed missions
        completed_missions = set(user.get("completed_missions", []))
        completed_lessons = set(user.get("completed_lessons", []))
        completed_quizzes = set(user.get("completed_quizzes", []))
        completed_exams = set(user.get("completed_exams", []))
        
        # Build progress data
        chapters_progress = []
        total_missions = 0
        completed_count = 0
        
        for chapter in QUEST_CHAPTERS:
            chapter_unlocked = user_level >= chapter["unlock_level"]
            chapter_missions = []
            chapter_completed = 0
            
            for mission in chapter["missions"]:
                total_missions += 1
                
                # Check if mission is completed
                mission_completed = mission["id"] in completed_missions
                
                # Also check linked content completion
                if not mission_completed:
                    if mission["type"] == "lesson" and mission.get("linked_lesson_id") in completed_lessons:
                        mission_completed = True
                    elif mission["type"] == "quiz" and mission.get("linked_quiz_id") in completed_quizzes:
                        mission_completed = True
                    elif mission["type"] == "exam" and mission.get("linked_exam_id") in completed_exams:
                        mission_completed = True
                
                if mission_completed:
                    completed_count += 1
                    chapter_completed += 1
                
                chapter_missions.append({
                    "id": mission["id"],
                    "number": mission["number"],
                    "title": mission["title"],
                    "title_fr": mission.get("title_fr", mission["title"]),
                    "title_ar": mission.get("title_ar", mission["title"]),
                    "description": mission["description"],
                    "description_fr": mission.get("description_fr", mission["description"]),
                    "description_ar": mission.get("description_ar", mission["description"]),
                    "type": mission["type"],
                    "xp_reward": mission["xp_reward"],
                    "completed": mission_completed,
                    "locked": not chapter_unlocked,
                    "linked_lesson_id": mission.get("linked_lesson_id"),
                    "linked_quiz_id": mission.get("linked_quiz_id"),
                    "linked_exam_id": mission.get("linked_exam_id"),
                    "challenge_type": mission.get("challenge_type"),
                    "target_value": mission.get("target_value")
                })
            
            all_missions_complete = chapter_completed == len(chapter["missions"])
            
            chapters_progress.append({
                "id": chapter["id"],
                "number": chapter["number"],
                "name_key": chapter["name_key"],
                "unlock_level": chapter["unlock_level"],
                "unlocked": chapter_unlocked,
                "completed": all_missions_complete,
                "xp_reward": chapter["xp_reward"],
                "coins_reward": chapter["coins_reward"],
                "missions": chapter_missions,
                "progress": {
                    "completed": chapter_completed,
                    "total": len(chapter["missions"]),
                    "percent": round((chapter_completed / len(chapter["missions"])) * 100) if chapter["missions"] else 0
                }
            })
        
        return {
            "user_id": user_id,
            "user_level": user_level,
            "chapters": chapters_progress,
            "overall_progress": {
                "completed": completed_count,
                "total": total_missions,
                "percent": round((completed_count / total_missions) * 100) if total_missions else 0
            }
        }
    
    async def complete_mission(self, user_id: str, mission_id: str) -> Dict:
        """Mark a mission as completed and award XP"""
        # Find the mission
        mission = None
        chapter = None
        for ch in QUEST_CHAPTERS:
            for m in ch["missions"]:
                if m["id"] == mission_id:
                    mission = m
                    chapter = ch
                    break
            if mission:
                break
        
        if not mission:
            return {"success": False, "error": "Mission not found"}
        
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"success": False, "error": "User not found"}
        
        completed_missions = set(user.get("completed_missions", []))
        
        if mission_id in completed_missions:
            return {"success": False, "error": "Mission already completed"}
        
        # Award XP and mark as complete
        xp_reward = mission["xp_reward"]
        
        await self.db.users.update_one(
            {"id": user_id},
            {
                "$addToSet": {"completed_missions": mission_id},
                "$inc": {"xp_points": xp_reward}
            }
        )
        
        # Check if chapter is now complete
        updated_user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        updated_completed = set(updated_user.get("completed_missions", []))
        
        chapter_complete = all(m["id"] in updated_completed for m in chapter["missions"])
        chapter_reward_given = False
        
        if chapter_complete:
            # Check if chapter reward already given
            completed_chapters = set(user.get("completed_chapters", []))
            if chapter["id"] not in completed_chapters:
                await self.db.users.update_one(
                    {"id": user_id},
                    {
                        "$addToSet": {"completed_chapters": chapter["id"]},
                        "$inc": {
                            "xp_points": chapter["xp_reward"],
                            "coins": chapter["coins_reward"]
                        }
                    }
                )
                chapter_reward_given = True
        
        result = {
            "success": True,
            "mission_id": mission_id,
            "xp_earned": xp_reward,
            "chapter_complete": chapter_complete
        }
        
        if chapter_reward_given:
            result["chapter_bonus"] = {
                "xp": chapter["xp_reward"],
                "coins": chapter["coins_reward"]
            }
        
        return result
    
    async def check_trading_challenge(self, user_id: str, mission_id: str) -> Dict:
        """Check if a trading challenge mission is completed"""
        # Find the mission
        mission = None
        for ch in QUEST_CHAPTERS:
            for m in ch["missions"]:
                if m["id"] == mission_id:
                    mission = m
                    break
            if mission:
                break
        
        if not mission or mission["type"] != "trading_challenge":
            return {"success": False, "completed": False, "error": "Invalid mission"}
        
        user = await self.db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            return {"success": False, "completed": False, "error": "User not found"}
        
        challenge_type = mission.get("challenge_type")
        completed = False
        current_value = 0
        target_value = mission.get("target_value", 0)
        
        if challenge_type == "first_trade":
            trades_count = user.get("trades_count", 0)
            completed = trades_count >= 1
            current_value = trades_count
            target_value = 1
            
        elif challenge_type == "diversify_portfolio":
            portfolio = user.get("portfolio", {})
            unique_assets = len([k for k, v in portfolio.items() if v > 0])
            completed = unique_assets >= 3
            current_value = unique_assets
            target_value = 3
            
        elif challenge_type == "profit_target":
            total_profit = user.get("total_profit", 0)
            completed = total_profit >= target_value
            current_value = total_profit
        
        # Auto-complete mission if criteria met
        if completed:
            completed_missions = set(user.get("completed_missions", []))
            if mission_id not in completed_missions:
                await self.complete_mission(user_id, mission_id)
        
        return {
            "success": True,
            "completed": completed,
            "current_value": current_value,
            "target_value": target_value,
            "progress_percent": min(100, round((current_value / target_value) * 100)) if target_value else 0
        }
    
    def get_all_chapters(self) -> List[Dict]:
        """Get all quest chapters structure"""
        return QUEST_CHAPTERS
