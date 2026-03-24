# TheCryptoCoach 2.0 - Gamification & Ecosystem Engine
# Core models and configuration for the immersive crypto education platform

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from enum import Enum
import random

# ==================== PLAYER CLASSES ====================

class PlayerClass(str, Enum):
    TRADER = "trader"
    HOLDER = "holder"
    DEFI_EXPLORER = "defi_explorer"
    NFT_COLLECTOR = "nft_collector"

PLAYER_CLASSES = {
    "trader": {
        "name": "Trader",
        "description": "Maîtrisez l'art du trading et de l'analyse technique",
        "icon": "📈",
        "color": "#10B981",
        "bonuses": {
            "trading_xp": 1.2,
            "simulator_rewards": 1.15
        },
        "starting_skills": ["chart_reading", "risk_management"]
    },
    "holder": {
        "name": "Holder",
        "description": "La patience est votre force. HODL jusqu'à la lune",
        "icon": "💎",
        "color": "#3B82F6",
        "bonuses": {
            "staking_rewards": 1.25,
            "long_term_bonus": 1.2
        },
        "starting_skills": ["patience", "portfolio_management"]
    },
    "defi_explorer": {
        "name": "DeFi Explorer",
        "description": "Explorez les protocoles décentralisés et maximisez vos yields",
        "icon": "🔮",
        "color": "#8B5CF6",
        "bonuses": {
            "defi_xp": 1.3,
            "yield_bonus": 1.2
        },
        "starting_skills": ["smart_contracts", "yield_farming"]
    },
    "nft_collector": {
        "name": "NFT Collector",
        "description": "Découvrez et collectionnez les actifs numériques uniques",
        "icon": "🎨",
        "color": "#EC4899",
        "bonuses": {
            "nft_rewards": 1.25,
            "rare_drop_chance": 1.3
        },
        "starting_skills": ["digital_art", "market_analysis"]
    }
}

# ==================== LEVEL SYSTEM ====================

def calculate_level(xp: int) -> dict:
    """Calculate level from XP with exponential scaling"""
    level = 1
    xp_for_next = 100
    total_xp_needed = 0
    
    while xp >= total_xp_needed + xp_for_next:
        total_xp_needed += xp_for_next
        level += 1
        xp_for_next = int(xp_for_next * 1.15)  # 15% more XP needed each level
    
    current_level_xp = xp - total_xp_needed
    
    # Determine rank
    if level < 10:
        rank = "Novice Crypto"
        rank_icon = "🌱"
    elif level < 25:
        rank = "Investisseur Éclairé"
        rank_icon = "💡"
    elif level < 50:
        rank = "Stratège Confirmé"
        rank_icon = "🎯"
    elif level < 75:
        rank = "Expert Blockchain"
        rank_icon = "⚡"
    elif level < 100:
        rank = "Maître Crypto"
        rank_icon = "👑"
    else:
        rank = "Légende"
        rank_icon = "🏆"
    
    return {
        "level": level,
        "rank": rank,
        "rank_icon": rank_icon,
        "current_xp": current_level_xp,
        "xp_for_next_level": xp_for_next,
        "total_xp": xp,
        "progress_percent": int((current_level_xp / xp_for_next) * 100)
    }

# ==================== ACHIEVEMENTS ====================

ACHIEVEMENTS = {
    # Learning achievements
    "first_lesson": {
        "id": "first_lesson",
        "name": "Premier Pas",
        "description": "Complétez votre première leçon",
        "icon": "🎓",
        "xp_reward": 50,
        "rarity": "common",
        "category": "learning"
    },
    "course_complete": {
        "id": "course_complete",
        "name": "Diplômé",
        "description": "Terminez un cours complet",
        "icon": "📜",
        "xp_reward": 500,
        "rarity": "uncommon",
        "category": "learning"
    },
    "perfect_quiz": {
        "id": "perfect_quiz",
        "name": "Sans Faute",
        "description": "Obtenez 100% à un quiz",
        "icon": "✨",
        "xp_reward": 100,
        "rarity": "common",
        "category": "learning"
    },
    "knowledge_master": {
        "id": "knowledge_master",
        "name": "Maître du Savoir",
        "description": "Complétez tous les cours disponibles",
        "icon": "🧠",
        "xp_reward": 2000,
        "rarity": "legendary",
        "category": "learning"
    },
    
    # Trading achievements
    "first_trade": {
        "id": "first_trade",
        "name": "Premier Trade",
        "description": "Effectuez votre premier trade simulé",
        "icon": "💹",
        "xp_reward": 50,
        "rarity": "common",
        "category": "trading"
    },
    "profit_100": {
        "id": "profit_100",
        "name": "Dans le Vert",
        "description": "Réalisez 100€ de profit simulé",
        "icon": "💰",
        "xp_reward": 200,
        "rarity": "uncommon",
        "category": "trading"
    },
    "profit_1000": {
        "id": "profit_1000",
        "name": "Trader Confirmé",
        "description": "Réalisez 1000€ de profit simulé",
        "icon": "💎",
        "xp_reward": 500,
        "rarity": "rare",
        "category": "trading"
    },
    "diamond_hands": {
        "id": "diamond_hands",
        "name": "Diamond Hands",
        "description": "Holdez une position pendant 30 jours",
        "icon": "💎🙌",
        "xp_reward": 300,
        "rarity": "rare",
        "category": "trading"
    },
    "buy_the_dip": {
        "id": "buy_the_dip",
        "name": "Buy The Dip",
        "description": "Achetez pendant une baisse de >10%",
        "icon": "🎯",
        "xp_reward": 150,
        "rarity": "uncommon",
        "category": "trading"
    },
    "portfolio_10x": {
        "id": "portfolio_10x",
        "name": "To The Moon",
        "description": "Multipliez votre portfolio par 10",
        "icon": "🚀",
        "xp_reward": 2000,
        "rarity": "legendary",
        "category": "trading"
    },
    
    # Streak achievements
    "streak_7": {
        "id": "streak_7",
        "name": "Une Semaine",
        "description": "Connectez-vous 7 jours consécutifs",
        "icon": "🔥",
        "xp_reward": 100,
        "rarity": "common",
        "category": "engagement"
    },
    "streak_30": {
        "id": "streak_30",
        "name": "Un Mois",
        "description": "Connectez-vous 30 jours consécutifs",
        "icon": "🔥🔥",
        "xp_reward": 500,
        "rarity": "rare",
        "category": "engagement"
    },
    "streak_100": {
        "id": "streak_100",
        "name": "Centurion",
        "description": "Connectez-vous 100 jours consécutifs",
        "icon": "🔥🔥🔥",
        "xp_reward": 2000,
        "rarity": "legendary",
        "category": "engagement"
    },
    
    # Community achievements
    "helper": {
        "id": "helper",
        "name": "Bon Samaritain",
        "description": "Aidez 10 membres de la communauté",
        "icon": "🤝",
        "xp_reward": 300,
        "rarity": "uncommon",
        "category": "community"
    },
    "mentor": {
        "id": "mentor",
        "name": "Mentor",
        "description": "Guidez 5 nouveaux membres",
        "icon": "🎖️",
        "xp_reward": 500,
        "rarity": "rare",
        "category": "community"
    },
    
    # Special achievements
    "early_adopter": {
        "id": "early_adopter",
        "name": "Early Adopter",
        "description": "Rejoignez la plateforme dans ses débuts",
        "icon": "⭐",
        "xp_reward": 500,
        "rarity": "rare",
        "category": "special"
    },
    "whale": {
        "id": "whale",
        "name": "Whale",
        "description": "Atteignez 100,000€ de portfolio simulé",
        "icon": "🐋",
        "xp_reward": 5000,
        "rarity": "legendary",
        "category": "special"
    }
}

RARITY_COLORS = {
    "common": "#9CA3AF",
    "uncommon": "#10B981",
    "rare": "#3B82F6",
    "epic": "#8B5CF6",
    "legendary": "#F59E0B"
}

# ==================== DAILY QUESTS ====================

DAILY_QUESTS = [
    {
        "id": "complete_lesson",
        "name": "Étudiant Assidu",
        "description": "Complétez 1 leçon",
        "icon": "📚",
        "xp_reward": 50,
        "target": 1,
        "type": "lesson_complete"
    },
    {
        "id": "perfect_quiz",
        "name": "Perfectionniste",
        "description": "Obtenez 100% à un quiz",
        "icon": "✅",
        "xp_reward": 75,
        "target": 1,
        "type": "quiz_perfect"
    },
    {
        "id": "make_trade",
        "name": "Trader du Jour",
        "description": "Effectuez 3 trades simulés",
        "icon": "📊",
        "xp_reward": 60,
        "target": 3,
        "type": "trade_count"
    },
    {
        "id": "checkpoint_master",
        "name": "Checkpoint Master",
        "description": "Réussissez 5 checkpoints",
        "icon": "🎯",
        "xp_reward": 80,
        "target": 5,
        "type": "checkpoint_correct"
    },
    {
        "id": "time_spent",
        "name": "Dévoué",
        "description": "Passez 30 minutes sur la plateforme",
        "icon": "⏱️",
        "xp_reward": 40,
        "target": 30,
        "type": "time_minutes"
    }
]

# ==================== WEEKLY CHALLENGES ====================

WEEKLY_CHALLENGES = [
    {
        "id": "sniper",
        "name": "Le Sniper",
        "description": "Achetez dans les 5% du plus bas de la semaine",
        "icon": "🎯",
        "xp_reward": 500,
        "coins_reward": 100,
        "difficulty": "hard"
    },
    {
        "id": "patient",
        "name": "Le Patient",
        "description": "Holdez toutes vos positions pendant 7 jours",
        "icon": "🧘",
        "xp_reward": 300,
        "coins_reward": 50,
        "difficulty": "medium"
    },
    {
        "id": "analyst",
        "name": "L'Analyste",
        "description": "Prédisez correctement 5 mouvements de marché",
        "icon": "🔮",
        "xp_reward": 400,
        "coins_reward": 75,
        "difficulty": "hard"
    },
    {
        "id": "professor",
        "name": "Le Professeur",
        "description": "Complétez un cours entier cette semaine",
        "icon": "🎓",
        "xp_reward": 600,
        "coins_reward": 100,
        "difficulty": "medium"
    },
    {
        "id": "diversifier",
        "name": "Le Diversificateur",
        "description": "Ayez au moins 5 cryptos différentes en portfolio",
        "icon": "🎨",
        "xp_reward": 200,
        "coins_reward": 40,
        "difficulty": "easy"
    }
]

# ==================== NARRATIVE CHAPTERS ====================

STORY_CHAPTERS = {
    "chapter_1": {
        "id": "chapter_1",
        "title": "L'Éveil",
        "subtitle": "Vos premiers pas dans le monde crypto",
        "description": "Vous découvrez un message mystérieux de Satoshi Nakamoto. Votre mission : comprendre ce qu'il a créé...",
        "level_required": 1,
        "course_id": "course-1",
        "missions": [
            {
                "id": "mission_1_1",
                "title": "Le Message de Satoshi",
                "description": "Découvrez le whitepaper Bitcoin et comprenez la révolution",
                "objectives": [
                    "Lire la leçon sur la blockchain",
                    "Comprendre le problème de la double dépense",
                    "Réussir le quiz avec 80%+"
                ],
                "rewards": {"xp": 100, "coins": 20},
                "lessons": ["course-foundations-lesson-1"]
            },
            {
                "id": "mission_1_2",
                "title": "Créer votre Identité",
                "description": "Générez votre première adresse wallet (simulation)",
                "objectives": [
                    "Comprendre les clés publiques/privées",
                    "Créer un wallet virtuel",
                    "Sécuriser votre seed phrase"
                ],
                "rewards": {"xp": 150, "coins": 30, "item": "virtual_wallet"},
                "lessons": ["course-foundations-lesson-4"]
            },
            {
                "id": "mission_1_3",
                "title": "Premier Achat",
                "description": "Achetez votre premier Bitcoin (simulé)",
                "objectives": [
                    "Connecter votre wallet à l'exchange simulé",
                    "Acheter 0.01 BTC",
                    "Vérifier la transaction"
                ],
                "rewards": {"xp": 200, "coins": 50, "achievement": "first_trade"},
                "requires_simulator": True
            }
        ],
        "boss_mission": {
            "id": "boss_1",
            "title": "L'Examen de Satoshi",
            "description": "Prouvez que vous avez compris les fondamentaux",
            "type": "exam",
            "passing_score": 80,
            "rewards": {"xp": 500, "coins": 100, "badge": "chapter_1_complete"}
        }
    },
    "chapter_2": {
        "id": "chapter_2",
        "title": "La Chute du Système",
        "subtitle": "Comprendre pourquoi la crypto existe",
        "description": "Les banques s'effondrent. Seule solution : la décentralisation...",
        "level_required": 10,
        "course_id": "course-1",
        "missions": [
            {
                "id": "mission_2_1",
                "title": "La Crise de 2008",
                "description": "Comprenez pourquoi Bitcoin a été créé",
                "objectives": [
                    "Étudier la crise financière",
                    "Comprendre le rôle des banques",
                    "Découvrir l'alternative décentralisée"
                ],
                "rewards": {"xp": 150, "coins": 30}
            },
            {
                "id": "mission_2_2",
                "title": "Sécuriser vos Actifs",
                "description": "Apprenez à protéger vos cryptos",
                "objectives": [
                    "Comprendre les différents types de wallets",
                    "Configurer la sécurité 2FA",
                    "Créer une stratégie de backup"
                ],
                "rewards": {"xp": 200, "coins": 40, "item": "security_shield"},
                "lessons": ["course-foundations-lesson-3"]
            }
        ]
    },
    "chapter_3": {
        "id": "chapter_3",
        "title": "L'Ascension",
        "subtitle": "Votre premier bull market",
        "description": "Vous avez 50,000€ à investir. Le bull market commence...",
        "level_required": 25,
        "course_id": "course-2",
        "missions": [
            {
                "id": "mission_3_1",
                "title": "Construire un Portfolio",
                "description": "Créez une stratégie d'investissement diversifiée",
                "objectives": [
                    "Analyser les top 10 cryptos",
                    "Définir une allocation",
                    "Implémenter le DCA"
                ],
                "rewards": {"xp": 300, "coins": 60},
                "requires_simulator": True
            },
            {
                "id": "mission_3_2",
                "title": "Surfer la Vague",
                "description": "Profitez du momentum haussier",
                "objectives": [
                    "Identifier les signaux de bull market",
                    "Doubler votre portfolio simulé",
                    "Prendre des profits stratégiques"
                ],
                "rewards": {"xp": 500, "coins": 100, "achievement": "profit_1000"}
            }
        ]
    },
    "chapter_4": {
        "id": "chapter_4",
        "title": "La Tempête",
        "subtitle": "Survivre au bear market",
        "description": "Le marché crash de 80%. Que faites-vous ?",
        "level_required": 50,
        "course_id": "course-2",
        "scenario_based": True,
        "missions": [
            {
                "id": "mission_4_1",
                "title": "Garder son Calme",
                "description": "Ne paniquez pas. Analysez la situation.",
                "type": "scenario",
                "scenarios": [
                    {
                        "situation": "Votre portfolio a chuté de 50% en une semaine.",
                        "choices": [
                            {"text": "Tout vendre pour limiter les pertes", "outcome": "panic_sell", "xp": 50},
                            {"text": "Analyser et potentiellement acheter plus", "outcome": "buy_dip", "xp": 200},
                            {"text": "Ne rien faire et attendre", "outcome": "hold", "xp": 150}
                        ]
                    }
                ],
                "rewards": {"xp": 300, "coins": 50}
            }
        ]
    },
    "chapter_5": {
        "id": "chapter_5",
        "title": "La Maîtrise",
        "subtitle": "Devenir un vétéran",
        "description": "Vous êtes maintenant un vétéran. Transmettez votre savoir...",
        "level_required": 75,
        "course_id": "course-3",
        "missions": [
            {
                "id": "mission_5_1",
                "title": "Stratégies Avancées",
                "description": "Maîtrisez le yield farming et le staking",
                "objectives": [
                    "Comprendre les pools de liquidité",
                    "Optimiser vos rendements",
                    "Gérer les risques DeFi"
                ],
                "rewards": {"xp": 500, "coins": 100}
            },
            {
                "id": "mission_5_2",
                "title": "Devenir Mentor",
                "description": "Guidez les nouveaux membres",
                "objectives": [
                    "Répondre à 10 questions dans le forum",
                    "Avoir 5 réponses acceptées",
                    "Mentorer un nouveau membre"
                ],
                "rewards": {"xp": 1000, "coins": 200, "badge": "mentor", "title": "Mentor Certifié"}
            }
        ]
    }
}

# ==================== SKILL TREE ====================

SKILL_TREE = {
    "fundamentals": {
        "name": "Fondamentaux",
        "icon": "📚",
        "skills": [
            {"id": "blockchain_basics", "name": "Bases Blockchain", "description": "Comprendre la technologie", "xp_cost": 100},
            {"id": "wallet_mastery", "name": "Maîtrise Wallet", "description": "Gérer vos clés", "xp_cost": 150, "requires": ["blockchain_basics"]},
            {"id": "security_expert", "name": "Expert Sécurité", "description": "Protéger vos actifs", "xp_cost": 200, "requires": ["wallet_mastery"]}
        ]
    },
    "trading": {
        "name": "Trading",
        "icon": "📈",
        "skills": [
            {"id": "chart_reading", "name": "Lecture de Charts", "description": "Analyser les graphiques", "xp_cost": 150},
            {"id": "technical_analysis", "name": "Analyse Technique", "description": "Indicateurs et patterns", "xp_cost": 250, "requires": ["chart_reading"]},
            {"id": "risk_management", "name": "Gestion du Risque", "description": "Protéger votre capital", "xp_cost": 200},
            {"id": "trading_psychology", "name": "Psychologie Trading", "description": "Maîtriser vos émotions", "xp_cost": 300, "requires": ["risk_management"]}
        ]
    },
    "defi": {
        "name": "DeFi",
        "icon": "🔮",
        "skills": [
            {"id": "smart_contracts", "name": "Smart Contracts", "description": "Comprendre les contrats", "xp_cost": 200},
            {"id": "yield_farming", "name": "Yield Farming", "description": "Maximiser les rendements", "xp_cost": 300, "requires": ["smart_contracts"]},
            {"id": "liquidity_pools", "name": "Pools de Liquidité", "description": "Fournir de la liquidité", "xp_cost": 350, "requires": ["yield_farming"]}
        ]
    },
    "investment": {
        "name": "Investissement",
        "icon": "💎",
        "skills": [
            {"id": "portfolio_management", "name": "Gestion Portfolio", "description": "Diversifier efficacement", "xp_cost": 150},
            {"id": "dca_strategy", "name": "Stratégie DCA", "description": "Investir régulièrement", "xp_cost": 100},
            {"id": "market_cycles", "name": "Cycles de Marché", "description": "Comprendre les cycles", "xp_cost": 250, "requires": ["portfolio_management"]}
        ]
    }
}

# ==================== GUILDS ====================

GUILD_RANKS = [
    {"level": 1, "name": "Bronze", "icon": "🥉", "members_required": 0},
    {"level": 2, "name": "Silver", "icon": "🥈", "members_required": 10},
    {"level": 3, "name": "Gold", "icon": "🥇", "members_required": 25},
    {"level": 4, "name": "Platinum", "icon": "💠", "members_required": 50},
    {"level": 5, "name": "Diamond", "icon": "💎", "members_required": 100},
    {"level": 6, "name": "Legend", "icon": "👑", "members_required": 250}
]

# ==================== HELPER FUNCTIONS ====================

def get_random_daily_quests(count: int = 4) -> list:
    """Get random daily quests for a user"""
    return random.sample(DAILY_QUESTS, min(count, len(DAILY_QUESTS)))

def get_weekly_challenge() -> dict:
    """Get the current weekly challenge"""
    # In production, this would be based on the week number
    return random.choice(WEEKLY_CHALLENGES)

def calculate_streak_bonus(streak_days: int) -> float:
    """Calculate XP multiplier based on streak"""
    if streak_days < 3:
        return 1.0
    elif streak_days < 7:
        return 1.1
    elif streak_days < 14:
        return 1.25
    elif streak_days < 30:
        return 1.5
    elif streak_days < 100:
        return 2.0
    else:
        return 2.5
