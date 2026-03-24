# TheCryptoCoach 2.0 - Ecosystem API Routes
# Complete API for gamification, trading arena, missions, and social features

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid
import random

# Import game engine
from engine.gamification import (
    PLAYER_CLASSES, ACHIEVEMENTS, DAILY_QUESTS, WEEKLY_CHALLENGES,
    STORY_CHAPTERS, SKILL_TREE, GUILD_RANKS, RARITY_COLORS,
    calculate_level, get_random_daily_quests, get_weekly_challenge, calculate_streak_bonus
)
from engine.trading_arena import (
    get_trading_arena, SUPPORTED_CRYPTOS, LEAGUES, STARTING_BALANCE,
    TournamentManager
)

ecosystem_router = APIRouter(prefix="/ecosystem", tags=["ecosystem"])

# ==================== MODELS ====================

class CreateProfileRequest(BaseModel):
    player_class: str
    avatar_style: Optional[str] = "default"

class TradeRequest(BaseModel):
    action: str  # "buy" or "sell"
    symbol: str
    amount_eur: float
    leverage: int = 1

class ClosePositionRequest(BaseModel):
    position_id: str

class QuestProgressRequest(BaseModel):
    quest_id: str
    progress: int

class GuildCreateRequest(BaseModel):
    name: str
    description: str
    is_public: bool = True

class MissionCompleteRequest(BaseModel):
    mission_id: str
    chapter_id: str
    score: Optional[int] = None

# ==================== PROFILE & GAMIFICATION ====================

def create_ecosystem_routes(db, get_current_user):
    """Create all ecosystem routes with database dependency"""
    
    @ecosystem_router.post("/profile/create")
    async def create_game_profile(
        request: CreateProfileRequest,
        current_user: dict = Depends(get_current_user)
    ):
        """Create a new game profile for the user"""
        
        # Check if profile already exists
        existing = await db.user_profiles.find_one({"user_id": current_user["id"]})
        if existing:
            raise HTTPException(status_code=400, detail="Profile already exists")
        
        if request.player_class not in PLAYER_CLASSES:
            raise HTTPException(status_code=400, detail="Invalid player class")
        
        player_class = PLAYER_CLASSES[request.player_class]
        
        profile = {
            "id": str(uuid.uuid4()),
            "user_id": current_user["id"],
            "username": current_user.get("full_name", "Player"),
            "player_class": request.player_class,
            "avatar_style": request.avatar_style,
            
            # XP & Level
            "xp": 0,
            "level": 1,
            "rank": "Novice Crypto",
            
            # Achievements & Progress
            "achievements": [],
            "unlocked_skills": player_class["starting_skills"],
            "completed_lessons": [],
            "completed_courses": [],
            "completed_missions": [],
            "current_chapter": "chapter_1",
            
            # Trading Stats
            "portfolio_balance": STARTING_BALANCE,
            "positions": [],
            "trade_history": [],
            "total_profit": 0,
            "total_trades": 0,
            "win_rate": 0,
            "best_trade": 0,
            "worst_trade": 0,
            "league": "bronze",
            
            # Engagement
            "streak_days": 0,
            "last_login": datetime.now(timezone.utc).isoformat(),
            "total_time_minutes": 0,
            "daily_quests": get_random_daily_quests(4),
            "daily_quests_progress": {},
            "weekly_challenge": get_weekly_challenge(),
            "weekly_challenge_progress": 0,
            
            # Social
            "guild_id": None,
            "friends": [],
            "mentor_id": None,
            "mentees": [],
            "reputation": 0,
            
            # Currency
            "crypto_coins": 100,  # Starting coins
            
            # Inventory
            "inventory": [
                {"id": "starter_badge", "type": "badge", "name": "Early Adopter"}
            ],
            "equipped_items": {},
            
            # Timestamps
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.user_profiles.insert_one(profile)
        
        # Update user with profile reference
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"has_game_profile": True}}
        )
        
        # Grant early adopter achievement
        await grant_achievement(db, current_user["id"], "early_adopter")
        
        del profile["_id"]
        return profile
    
    @ecosystem_router.get("/profile")
    async def get_game_profile(current_user: dict = Depends(get_current_user)):
        """Get the user's game profile with calculated stats"""
        
        profile = await db.user_profiles.find_one(
            {"user_id": current_user["id"]},
            {"_id": 0}
        )
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found. Create one first.")
        
        # Calculate level from XP
        level_info = calculate_level(profile.get("xp", 0))
        profile["level_info"] = level_info
        
        # Check and update streak
        profile = await update_streak(db, profile)
        
        # Get player class info
        profile["class_info"] = PLAYER_CLASSES.get(profile.get("player_class", "trader"))
        
        # Get league info
        arena = get_trading_arena()
        profile["league_info"] = arena.get_league(profile.get("total_profit", 0))
        
        return profile
    
    @ecosystem_router.get("/profile/stats")
    async def get_profile_stats(current_user: dict = Depends(get_current_user)):
        """Get detailed statistics for the user"""
        
        profile = await db.user_profiles.find_one(
            {"user_id": current_user["id"]},
            {"_id": 0}
        )
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        level_info = calculate_level(profile.get("xp", 0))
        
        return {
            "xp": profile.get("xp", 0),
            "level": level_info["level"],
            "rank": level_info["rank"],
            "rank_icon": level_info["rank_icon"],
            "progress_to_next": level_info["progress_percent"],
            
            "achievements_count": len(profile.get("achievements", [])),
            "total_achievements": len(ACHIEVEMENTS),
            
            "courses_completed": len(profile.get("completed_courses", [])),
            "lessons_completed": len(profile.get("completed_lessons", [])),
            "missions_completed": len(profile.get("completed_missions", [])),
            
            "portfolio_value": profile.get("portfolio_balance", 0),
            "total_profit": profile.get("total_profit", 0),
            "total_trades": profile.get("total_trades", 0),
            "win_rate": profile.get("win_rate", 0),
            
            "streak_days": profile.get("streak_days", 0),
            "crypto_coins": profile.get("crypto_coins", 0),
            
            "league": profile.get("league", "bronze"),
            "guild_id": profile.get("guild_id")
        }
    
    @ecosystem_router.post("/xp/add")
    async def add_xp(
        amount: int,
        reason: str,
        current_user: dict = Depends(get_current_user)
    ):
        """Add XP to user profile (internal use)"""
        
        profile = await db.user_profiles.find_one({"user_id": current_user["id"]})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Apply streak bonus
        streak_bonus = calculate_streak_bonus(profile.get("streak_days", 0))
        final_xp = int(amount * streak_bonus)
        
        # Apply class bonus
        player_class = PLAYER_CLASSES.get(profile.get("player_class", "trader"), {})
        bonuses = player_class.get("bonuses", {})
        
        if "trading" in reason.lower() and "trading_xp" in bonuses:
            final_xp = int(final_xp * bonuses["trading_xp"])
        
        new_xp = profile.get("xp", 0) + final_xp
        old_level = calculate_level(profile.get("xp", 0))["level"]
        new_level_info = calculate_level(new_xp)
        
        update_data = {
            "xp": new_xp,
            "level": new_level_info["level"],
            "rank": new_level_info["rank"],
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.user_profiles.update_one(
            {"user_id": current_user["id"]},
            {"$set": update_data}
        )
        
        # Check for level up
        leveled_up = new_level_info["level"] > old_level
        
        return {
            "xp_gained": final_xp,
            "streak_bonus": streak_bonus,
            "new_total_xp": new_xp,
            "level": new_level_info["level"],
            "rank": new_level_info["rank"],
            "leveled_up": leveled_up,
            "progress_percent": new_level_info["progress_percent"]
        }
    
    # ==================== ACHIEVEMENTS ====================
    
    @ecosystem_router.get("/achievements")
    async def get_achievements(current_user: dict = Depends(get_current_user)):
        """Get all achievements with user's unlocked status"""
        
        profile = await db.user_profiles.find_one(
            {"user_id": current_user["id"]},
            {"_id": 0, "achievements": 1}
        )
        
        user_achievements = profile.get("achievements", []) if profile else []
        
        all_achievements = []
        for ach_id, ach in ACHIEVEMENTS.items():
            all_achievements.append({
                **ach,
                "unlocked": ach_id in user_achievements,
                "rarity_color": RARITY_COLORS.get(ach.get("rarity", "common"))
            })
        
        return {
            "achievements": all_achievements,
            "unlocked_count": len(user_achievements),
            "total_count": len(ACHIEVEMENTS)
        }
    
    @ecosystem_router.get("/achievements/recent")
    async def get_recent_achievements(
        limit: int = 10,
        current_user: dict = Depends(get_current_user)
    ):
        """Get recently unlocked achievements"""
        
        # Get from activity log
        activities = await db.activity_log.find(
            {"user_id": current_user["id"], "type": "achievement"},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(length=limit)
        
        return activities
    
    # ==================== DAILY QUESTS ====================
    
    @ecosystem_router.get("/quests/daily")
    async def get_daily_quests(current_user: dict = Depends(get_current_user)):
        """Get today's daily quests with progress"""
        
        profile = await db.user_profiles.find_one(
            {"user_id": current_user["id"]},
            {"_id": 0, "daily_quests": 1, "daily_quests_progress": 1, "streak_days": 1}
        )
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        quests = profile.get("daily_quests", get_random_daily_quests(4))
        progress = profile.get("daily_quests_progress", {})
        
        # Add progress to each quest
        for quest in quests:
            quest["current_progress"] = progress.get(quest["id"], 0)
            quest["completed"] = quest["current_progress"] >= quest["target"]
        
        # Calculate streak bonus
        streak_bonus = calculate_streak_bonus(profile.get("streak_days", 0))
        
        return {
            "quests": quests,
            "streak_days": profile.get("streak_days", 0),
            "streak_bonus": f"{streak_bonus}x",
            "all_completed": all(q["completed"] for q in quests)
        }
    
    @ecosystem_router.post("/quests/daily/progress")
    async def update_quest_progress(
        request: QuestProgressRequest,
        current_user: dict = Depends(get_current_user)
    ):
        """Update progress on a daily quest"""
        
        profile = await db.user_profiles.find_one({"user_id": current_user["id"]})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        progress = profile.get("daily_quests_progress", {})
        quests = profile.get("daily_quests", [])
        
        # Find the quest
        quest = next((q for q in quests if q["id"] == request.quest_id), None)
        if not quest:
            raise HTTPException(status_code=404, detail="Quest not found")
        
        # Update progress
        old_progress = progress.get(request.quest_id, 0)
        new_progress = min(request.progress, quest["target"])
        progress[request.quest_id] = new_progress
        
        # Check if completed
        was_completed = old_progress >= quest["target"]
        now_completed = new_progress >= quest["target"]
        
        xp_earned = 0
        if now_completed and not was_completed:
            # Quest just completed!
            xp_earned = quest["xp_reward"]
            streak_bonus = calculate_streak_bonus(profile.get("streak_days", 0))
            xp_earned = int(xp_earned * streak_bonus)
            
            await db.user_profiles.update_one(
                {"user_id": current_user["id"]},
                {"$inc": {"xp": xp_earned}}
            )
        
        await db.user_profiles.update_one(
            {"user_id": current_user["id"]},
            {"$set": {"daily_quests_progress": progress}}
        )
        
        return {
            "quest_id": request.quest_id,
            "progress": new_progress,
            "target": quest["target"],
            "completed": now_completed,
            "xp_earned": xp_earned
        }
    
    # ==================== WEEKLY CHALLENGE ====================
    
    @ecosystem_router.get("/challenge/weekly")
    async def get_weekly_challenge_route(current_user: dict = Depends(get_current_user)):
        """Get the current weekly challenge"""
        
        profile = await db.user_profiles.find_one(
            {"user_id": current_user["id"]},
            {"_id": 0, "weekly_challenge": 1, "weekly_challenge_progress": 1}
        )
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        challenge = profile.get("weekly_challenge", get_weekly_challenge())
        progress = profile.get("weekly_challenge_progress", 0)
        
        return {
            "challenge": challenge,
            "progress": progress,
            "completed": progress >= 100
        }
    
    # ==================== STORY MISSIONS ====================
    
    @ecosystem_router.get("/story/chapters")
    async def get_story_chapters(current_user: dict = Depends(get_current_user)):
        """Get all story chapters with unlock status"""
        
        profile = await db.user_profiles.find_one(
            {"user_id": current_user["id"]},
            {"_id": 0, "level": 1, "completed_missions": 1, "current_chapter": 1}
        )
        
        user_level = profile.get("level", 1) if profile else 1
        completed_missions = profile.get("completed_missions", []) if profile else []
        current_chapter = profile.get("current_chapter", "chapter_1") if profile else "chapter_1"
        
        chapters = []
        for chapter_id, chapter in STORY_CHAPTERS.items():
            is_unlocked = user_level >= chapter["level_required"]
            
            # Calculate chapter progress
            chapter_missions = chapter.get("missions", [])
            completed_in_chapter = sum(
                1 for m in chapter_missions 
                if m["id"] in completed_missions
            )
            
            chapters.append({
                "id": chapter_id,
                "title": chapter["title"],
                "subtitle": chapter["subtitle"],
                "description": chapter["description"],
                "level_required": chapter["level_required"],
                "is_unlocked": is_unlocked,
                "is_current": chapter_id == current_chapter,
                "missions_count": len(chapter_missions),
                "missions_completed": completed_in_chapter,
                "progress_percent": int((completed_in_chapter / len(chapter_missions)) * 100) if chapter_missions else 0
            })
        
        return {"chapters": chapters, "current_chapter": current_chapter}
    
    @ecosystem_router.get("/story/chapter/{chapter_id}")
    async def get_chapter_detail(
        chapter_id: str,
        current_user: dict = Depends(get_current_user)
    ):
        """Get detailed chapter information with missions"""
        
        if chapter_id not in STORY_CHAPTERS:
            raise HTTPException(status_code=404, detail="Chapter not found")
        
        chapter = STORY_CHAPTERS[chapter_id]
        
        profile = await db.user_profiles.find_one(
            {"user_id": current_user["id"]},
            {"_id": 0, "level": 1, "completed_missions": 1}
        )
        
        user_level = profile.get("level", 1) if profile else 1
        completed_missions = profile.get("completed_missions", []) if profile else []
        
        if user_level < chapter["level_required"]:
            raise HTTPException(
                status_code=403, 
                detail=f"Level {chapter['level_required']} required to access this chapter"
            )
        
        # Build missions with status
        missions = []
        for mission in chapter.get("missions", []):
            missions.append({
                **mission,
                "completed": mission["id"] in completed_missions
            })
        
        return {
            **chapter,
            "missions": missions,
            "boss_mission": chapter.get("boss_mission")
        }
    
    @ecosystem_router.post("/story/mission/complete")
    async def complete_mission(
        request: MissionCompleteRequest,
        current_user: dict = Depends(get_current_user)
    ):
        """Mark a mission as complete and grant rewards"""
        
        if request.chapter_id not in STORY_CHAPTERS:
            raise HTTPException(status_code=404, detail="Chapter not found")
        
        chapter = STORY_CHAPTERS[request.chapter_id]
        mission = next(
            (m for m in chapter.get("missions", []) if m["id"] == request.mission_id),
            None
        )
        
        if not mission:
            raise HTTPException(status_code=404, detail="Mission not found")
        
        profile = await db.user_profiles.find_one({"user_id": current_user["id"]})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Check if already completed
        if request.mission_id in profile.get("completed_missions", []):
            return {"already_completed": True}
        
        # Grant rewards
        rewards = mission.get("rewards", {})
        xp_reward = rewards.get("xp", 0)
        coins_reward = rewards.get("coins", 0)
        
        update_ops = {
            "$push": {"completed_missions": request.mission_id},
            "$inc": {
                "xp": xp_reward,
                "crypto_coins": coins_reward
            },
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
        }
        
        # Grant achievement if specified
        achievement_id = rewards.get("achievement")
        if achievement_id:
            await grant_achievement(db, current_user["id"], achievement_id)
        
        # Add item to inventory if specified
        if "item" in rewards:
            update_ops["$push"]["inventory"] = {
                "id": rewards["item"],
                "type": "item",
                "obtained_at": datetime.now(timezone.utc).isoformat()
            }
        
        await db.user_profiles.update_one(
            {"user_id": current_user["id"]},
            update_ops
        )
        
        return {
            "completed": True,
            "rewards": {
                "xp": xp_reward,
                "coins": coins_reward,
                "achievement": achievement_id,
                "item": rewards.get("item")
            }
        }
    
    # ==================== TRADING ARENA ====================
    
    @ecosystem_router.get("/arena/prices")
    async def get_live_prices():
        """Get live cryptocurrency prices"""
        arena = get_trading_arena()
        prices = await arena.get_live_prices()
        return {"prices": prices, "timestamp": datetime.now(timezone.utc).isoformat()}
    
    @ecosystem_router.get("/arena/price-history/{crypto_id}")
    async def get_price_history(crypto_id: str, days: int = 30):
        """Get historical price data for charts"""
        arena = get_trading_arena()
        history = await arena.get_price_history(crypto_id, days)
        return {"crypto_id": crypto_id, "days": days, "data": history}
    
    @ecosystem_router.get("/arena/portfolio")
    async def get_portfolio(current_user: dict = Depends(get_current_user)):
        """Get user's trading portfolio"""
        
        profile = await db.user_profiles.find_one(
            {"user_id": current_user["id"]},
            {"_id": 0, "portfolio_balance": 1, "positions": 1, "total_profit": 1, "league": 1}
        )
        
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Get live prices to calculate current values
        arena = get_trading_arena()
        prices = await arena.get_live_prices()
        
        positions = profile.get("positions", [])
        total_value = profile.get("portfolio_balance", STARTING_BALANCE)
        
        # Calculate current value of each position
        for position in positions:
            symbol = position.get("symbol")
            if symbol in prices:
                current_price = prices[symbol]["price_eur"]
                pnl_info = arena.calculate_pnl(position, current_price)
                position["current_price"] = current_price
                position["pnl"] = pnl_info
                total_value += pnl_info["current_value"]
        
        league_info = arena.get_league(profile.get("total_profit", 0))
        
        return {
            "balance_eur": profile.get("portfolio_balance", STARTING_BALANCE),
            "positions": positions,
            "total_value": round(total_value, 2),
            "total_profit": profile.get("total_profit", 0),
            "league": league_info
        }
    
    @ecosystem_router.post("/arena/trade")
    async def execute_trade(
        request: TradeRequest,
        current_user: dict = Depends(get_current_user)
    ):
        """Execute a simulated trade"""
        
        profile = await db.user_profiles.find_one({"user_id": current_user["id"]})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        # Validate
        if request.symbol not in [c["symbol"] for c in SUPPORTED_CRYPTOS.values()]:
            raise HTTPException(status_code=400, detail="Unsupported cryptocurrency")
        
        if request.amount_eur <= 0:
            raise HTTPException(status_code=400, detail="Invalid amount")
        
        balance = profile.get("portfolio_balance", STARTING_BALANCE)
        
        if request.action == "buy" and request.amount_eur > balance:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Get current price
        arena = get_trading_arena()
        prices = await arena.get_live_prices()
        
        if request.symbol not in prices:
            raise HTTPException(status_code=400, detail="Price data unavailable")
        
        current_price = prices[request.symbol]["price_eur"]
        
        # Calculate trade
        trade = arena.calculate_trade(
            action=request.action,
            symbol=request.symbol,
            amount_eur=request.amount_eur,
            current_price=current_price,
            leverage=request.leverage
        )
        
        trade["id"] = str(uuid.uuid4())
        
        # Update portfolio
        if request.action == "buy":
            new_balance = balance - request.amount_eur
            
            # Add position
            position = {
                "id": trade["id"],
                "symbol": request.symbol,
                "action": "buy",
                "amount_eur": request.amount_eur,
                "crypto_amount": trade["crypto_amount"],
                "price_at_trade": current_price,
                "leverage": request.leverage,
                "opened_at": datetime.now(timezone.utc).isoformat()
            }
            
            await db.user_profiles.update_one(
                {"user_id": current_user["id"]},
                {
                    "$set": {"portfolio_balance": new_balance},
                    "$push": {
                        "positions": position,
                        "trade_history": trade
                    },
                    "$inc": {"total_trades": 1}
                }
            )
        
        # Grant first trade achievement
        if profile.get("total_trades", 0) == 0:
            await grant_achievement(db, current_user["id"], "first_trade")
        
        # Update daily quest progress
        await update_quest_progress_internal(
            db, current_user["id"], "make_trade", 1
        )
        
        return {
            "trade": trade,
            "new_balance": balance - request.amount_eur if request.action == "buy" else balance,
            "message": f"Successfully {request.action} {trade['crypto_amount']:.6f} {request.symbol}"
        }
    
    @ecosystem_router.post("/arena/close-position")
    async def close_position(
        request: ClosePositionRequest,
        current_user: dict = Depends(get_current_user)
    ):
        """Close an open position"""
        
        profile = await db.user_profiles.find_one({"user_id": current_user["id"]})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        positions = profile.get("positions", [])
        position = next((p for p in positions if p["id"] == request.position_id), None)
        
        if not position:
            raise HTTPException(status_code=404, detail="Position not found")
        
        # Get current price
        arena = get_trading_arena()
        prices = await arena.get_live_prices()
        current_price = prices.get(position["symbol"], {}).get("price_eur", 0)
        
        if not current_price:
            raise HTTPException(status_code=400, detail="Price data unavailable")
        
        # Calculate PnL
        pnl_info = arena.calculate_pnl(position, current_price)
        
        # Update balance and stats
        new_balance = profile.get("portfolio_balance", 0) + pnl_info["current_value"]
        new_total_profit = profile.get("total_profit", 0) + pnl_info["pnl_eur"]
        
        # Update win rate
        total_trades = profile.get("total_trades", 0)
        wins = (profile.get("win_rate", 0) * total_trades / 100) + (1 if pnl_info["is_profit"] else 0)
        new_win_rate = (wins / (total_trades + 1)) * 100 if total_trades > 0 else (100 if pnl_info["is_profit"] else 0)
        
        # Track best/worst trade
        best_trade = max(profile.get("best_trade", 0), pnl_info["pnl_eur"])
        worst_trade = min(profile.get("worst_trade", 0), pnl_info["pnl_eur"])
        
        # Determine league
        league = arena.get_league(new_total_profit)["id"]
        
        # Remove position
        await db.user_profiles.update_one(
            {"user_id": current_user["id"]},
            {
                "$set": {
                    "portfolio_balance": new_balance,
                    "total_profit": new_total_profit,
                    "win_rate": round(new_win_rate, 1),
                    "best_trade": best_trade,
                    "worst_trade": worst_trade,
                    "league": league
                },
                "$pull": {"positions": {"id": request.position_id}},
                "$push": {
                    "trade_history": {
                        **position,
                        "closed_at": datetime.now(timezone.utc).isoformat(),
                        "close_price": current_price,
                        "pnl": pnl_info["pnl_eur"],
                        "pnl_percent": pnl_info["pnl_percent"]
                    }
                }
            }
        )
        
        # Check profit achievements
        if new_total_profit >= 100:
            await grant_achievement(db, current_user["id"], "profit_100")
        if new_total_profit >= 1000:
            await grant_achievement(db, current_user["id"], "profit_1000")
        
        return {
            "closed": True,
            "pnl": pnl_info,
            "new_balance": new_balance,
            "total_profit": new_total_profit,
            "league": league
        }
    
    @ecosystem_router.get("/arena/leaderboard")
    async def get_leaderboard(limit: int = 100):
        """Get global trading leaderboard"""
        
        profiles = await db.user_profiles.find(
            {"total_profit": {"$gt": -float("inf")}},
            {"_id": 0, "user_id": 1, "username": 1, "total_profit": 1, "level": 1, "rank": 1, "league": 1, "player_class": 1}
        ).sort("total_profit", -1).limit(limit).to_list(length=limit)
        
        for i, p in enumerate(profiles):
            p["position"] = i + 1
            arena = get_trading_arena()
            p["league_info"] = arena.get_league(p.get("total_profit", 0))
        
        return {"leaderboard": profiles}
    
    # ==================== SKILL TREE ====================
    
    @ecosystem_router.get("/skills")
    async def get_skill_tree(current_user: dict = Depends(get_current_user)):
        """Get skill tree with unlock status"""
        
        profile = await db.user_profiles.find_one(
            {"user_id": current_user["id"]},
            {"_id": 0, "unlocked_skills": 1, "xp": 1}
        )
        
        unlocked = profile.get("unlocked_skills", []) if profile else []
        user_xp = profile.get("xp", 0) if profile else 0
        
        skill_tree = {}
        for category_id, category in SKILL_TREE.items():
            skills = []
            for skill in category["skills"]:
                # Check if prerequisites are met
                requires = skill.get("requires", [])
                can_unlock = all(r in unlocked for r in requires)
                
                skills.append({
                    **skill,
                    "unlocked": skill["id"] in unlocked,
                    "can_unlock": can_unlock and skill["id"] not in unlocked,
                    "can_afford": user_xp >= skill["xp_cost"]
                })
            
            skill_tree[category_id] = {
                "name": category["name"],
                "icon": category["icon"],
                "skills": skills
            }
        
        return {"skill_tree": skill_tree, "available_xp": user_xp}
    
    @ecosystem_router.post("/skills/unlock/{skill_id}")
    async def unlock_skill(skill_id: str, current_user: dict = Depends(get_current_user)):
        """Unlock a skill using XP"""
        
        # Find skill
        skill = None
        for category in SKILL_TREE.values():
            for s in category["skills"]:
                if s["id"] == skill_id:
                    skill = s
                    break
        
        if not skill:
            raise HTTPException(status_code=404, detail="Skill not found")
        
        profile = await db.user_profiles.find_one({"user_id": current_user["id"]})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        unlocked = profile.get("unlocked_skills", [])
        
        # Check if already unlocked
        if skill_id in unlocked:
            raise HTTPException(status_code=400, detail="Skill already unlocked")
        
        # Check prerequisites
        requires = skill.get("requires", [])
        if not all(r in unlocked for r in requires):
            raise HTTPException(status_code=400, detail="Prerequisites not met")
        
        # Check XP cost
        if profile.get("xp", 0) < skill["xp_cost"]:
            raise HTTPException(status_code=400, detail="Not enough XP")
        
        # Unlock skill
        await db.user_profiles.update_one(
            {"user_id": current_user["id"]},
            {
                "$push": {"unlocked_skills": skill_id},
                "$inc": {"xp": -skill["xp_cost"]}
            }
        )
        
        return {
            "unlocked": True,
            "skill": skill,
            "xp_spent": skill["xp_cost"]
        }
    
    # ==================== GUILDS ====================
    
    @ecosystem_router.get("/guilds")
    async def get_guilds(limit: int = 50):
        """Get list of public guilds"""
        
        guilds = await db.guilds.find(
            {"is_public": True},
            {"_id": 0}
        ).sort("total_xp", -1).limit(limit).to_list(length=limit)
        
        return {"guilds": guilds}
    
    @ecosystem_router.post("/guilds/create")
    async def create_guild(
        request: GuildCreateRequest,
        current_user: dict = Depends(get_current_user)
    ):
        """Create a new guild"""
        
        profile = await db.user_profiles.find_one({"user_id": current_user["id"]})
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        
        if profile.get("guild_id"):
            raise HTTPException(status_code=400, detail="Already in a guild")
        
        # Check cost (100 coins)
        if profile.get("crypto_coins", 0) < 100:
            raise HTTPException(status_code=400, detail="Need 100 CryptoCoins to create a guild")
        
        guild = {
            "id": str(uuid.uuid4()),
            "name": request.name,
            "description": request.description,
            "is_public": request.is_public,
            "leader_id": current_user["id"],
            "members": [current_user["id"]],
            "member_count": 1,
            "total_xp": profile.get("xp", 0),
            "rank": 1,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.guilds.insert_one(guild)
        
        # Update user profile
        await db.user_profiles.update_one(
            {"user_id": current_user["id"]},
            {
                "$set": {"guild_id": guild["id"]},
                "$inc": {"crypto_coins": -100}
            }
        )
        
        del guild["_id"]
        return guild
    
    @ecosystem_router.post("/guilds/{guild_id}/join")
    async def join_guild(guild_id: str, current_user: dict = Depends(get_current_user)):
        """Join a guild"""
        
        guild = await db.guilds.find_one({"id": guild_id})
        if not guild:
            raise HTTPException(status_code=404, detail="Guild not found")
        
        profile = await db.user_profiles.find_one({"user_id": current_user["id"]})
        if profile.get("guild_id"):
            raise HTTPException(status_code=400, detail="Already in a guild")
        
        # Add to guild
        await db.guilds.update_one(
            {"id": guild_id},
            {
                "$push": {"members": current_user["id"]},
                "$inc": {"member_count": 1, "total_xp": profile.get("xp", 0)}
            }
        )
        
        # Update profile
        await db.user_profiles.update_one(
            {"user_id": current_user["id"]},
            {"$set": {"guild_id": guild_id}}
        )
        
        return {"joined": True, "guild_id": guild_id}
    
    return ecosystem_router


# ==================== HELPER FUNCTIONS ====================

async def grant_achievement(db, user_id: str, achievement_id: str):
    """Grant an achievement to a user"""
    
    if achievement_id not in ACHIEVEMENTS:
        return None
    
    achievement = ACHIEVEMENTS[achievement_id]
    
    # Check if already has achievement
    profile = await db.user_profiles.find_one({"user_id": user_id})
    if profile and achievement_id in profile.get("achievements", []):
        return None
    
    # Grant achievement
    await db.user_profiles.update_one(
        {"user_id": user_id},
        {
            "$push": {"achievements": achievement_id},
            "$inc": {"xp": achievement["xp_reward"]}
        }
    )
    
    # Log activity
    await db.activity_log.insert_one({
        "user_id": user_id,
        "type": "achievement",
        "achievement_id": achievement_id,
        "achievement_name": achievement["name"],
        "xp_reward": achievement["xp_reward"],
        "timestamp": datetime.now(timezone.utc).isoformat()
    })
    
    return achievement


async def update_streak(db, profile: dict) -> dict:
    """Update user's login streak"""
    
    last_login = profile.get("last_login")
    if not last_login:
        return profile
    
    last_login_dt = datetime.fromisoformat(last_login.replace('Z', '+00:00'))
    now = datetime.now(timezone.utc)
    
    # Check if it's a new day
    days_diff = (now.date() - last_login_dt.date()).days
    
    if days_diff == 0:
        # Same day, no update needed
        return profile
    elif days_diff == 1:
        # Consecutive day, increment streak
        new_streak = profile.get("streak_days", 0) + 1
    else:
        # Streak broken
        new_streak = 1
    
    await db.user_profiles.update_one(
        {"user_id": profile["user_id"]},
        {
            "$set": {
                "streak_days": new_streak,
                "last_login": now.isoformat()
            }
        }
    )
    
    profile["streak_days"] = new_streak
    
    # Check streak achievements
    if new_streak >= 7:
        await grant_achievement(db, profile["user_id"], "streak_7")
    if new_streak >= 30:
        await grant_achievement(db, profile["user_id"], "streak_30")
    if new_streak >= 100:
        await grant_achievement(db, profile["user_id"], "streak_100")
    
    return profile


async def update_quest_progress_internal(db, user_id: str, quest_type: str, amount: int):
    """Internal function to update quest progress"""
    
    profile = await db.user_profiles.find_one({"user_id": user_id})
    if not profile:
        return
    
    daily_quests = profile.get("daily_quests", [])
    progress = profile.get("daily_quests_progress", {})
    
    for quest in daily_quests:
        if quest.get("type") == quest_type:
            quest_id = quest["id"]
            current = progress.get(quest_id, 0)
            progress[quest_id] = current + amount
    
    await db.user_profiles.update_one(
        {"user_id": user_id},
        {"$set": {"daily_quests_progress": progress}}
    )
