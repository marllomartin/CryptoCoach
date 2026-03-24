"""
Backend Tests for Gamification and Trading Arena APIs
TheCryptoCoach 2.0
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cryptocoach-production.up.railway.app').rstrip('/')

# Test user credentials
TEST_EMAIL = "gamerhub@crypto.io"
TEST_PASSWORD = "Test123456!"


@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


@pytest.fixture
def test_user_auth(api_client):
    """Get test user auth token and user_id"""
    # Login
    response = api_client.post(f"{BASE_URL}/api/auth/login", json={
        "email": TEST_EMAIL,
        "password": TEST_PASSWORD
    })
    
    if response.status_code != 200:
        pytest.skip(f"Login failed: {response.text}")
    
    data = response.json()
    return {
        "token": data.get("access_token"),
        "user_id": data.get("user", {}).get("id")
    }


@pytest.fixture
def authenticated_client(api_client, test_user_auth):
    """Session with auth header"""
    api_client.headers.update({"Authorization": f"Bearer {test_user_auth['token']}"})
    return api_client


class TestGamificationProfile:
    """Tests for GET /api/v2/gamification/profile/{user_id}"""
    
    def test_get_gamification_profile(self, authenticated_client, test_user_auth):
        """Test fetching gamification profile"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/gamification/profile/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify required fields
        assert "user_id" in data
        assert data["user_id"] == user_id
        assert "xp_points" in data
        assert "level" in data
        assert "level_progress" in data
        assert "coins" in data
        assert "streak_days" in data
        assert "avatar" in data
        assert "achievements" in data
        assert "achievements_count" in data
        assert "active_quests" in data
        assert "stats" in data
        
    def test_gamification_profile_level_progress_structure(self, authenticated_client, test_user_auth):
        """Test level_progress has correct structure"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/gamification/profile/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        level_progress = data["level_progress"]
        assert "level" in level_progress
        assert "current_xp" in level_progress
        assert "xp_needed" in level_progress
        assert "progress" in level_progress
        
    def test_gamification_profile_avatar_structure(self, authenticated_client, test_user_auth):
        """Test avatar has correct structure"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/gamification/profile/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        avatar = data["avatar"]
        assert "base" in avatar
        assert "frame" in avatar
        assert "title" in avatar
        
    def test_gamification_profile_stats_structure(self, authenticated_client, test_user_auth):
        """Test stats has correct structure"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/gamification/profile/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        stats = data["stats"]
        assert "lessons_completed" in stats
        assert "quizzes_completed" in stats
        assert "exams_passed" in stats
        assert "certificates_earned" in stats
        assert "trades_count" in stats
        assert "total_profit" in stats
        
    def test_gamification_profile_not_found(self, authenticated_client):
        """Test 404 for non-existent user"""
        fake_id = str(uuid.uuid4())
        response = authenticated_client.get(f"{BASE_URL}/api/v2/gamification/profile/{fake_id}")
        
        assert response.status_code == 404


class TestGamificationQuests:
    """Tests for GET /api/v2/gamification/quests/{user_id}"""
    
    def test_get_user_quests(self, authenticated_client, test_user_auth):
        """Test fetching user quests"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/gamification/quests/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "daily" in data
        assert "weekly" in data
        assert isinstance(data["daily"], list)
        assert isinstance(data["weekly"], list)
        
    def test_daily_quest_structure(self, authenticated_client, test_user_auth):
        """Test daily quest has correct structure"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/gamification/quests/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["daily"]) > 0:
            quest = data["daily"][0]
            assert "id" in quest
            assert "name" in quest
            assert "description" in quest
            assert "difficulty" in quest
            assert "target" in quest
            assert "progress" in quest
            assert "completed" in quest
            assert "coins_reward" in quest
            assert "xp_reward" in quest
            
    def test_daily_quests_generated(self, authenticated_client, test_user_auth):
        """Test that daily quests are auto-generated"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/gamification/quests/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should have 3 daily quests (lesson, quiz, trade)
        assert len(data["daily"]) == 3


class TestGamificationAchievements:
    """Tests for GET /api/v2/gamification/achievements"""
    
    def test_get_all_achievements(self, api_client):
        """Test fetching all available achievements"""
        response = api_client.get(f"{BASE_URL}/api/v2/gamification/achievements")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        assert len(data) > 0
        
        # Check first achievement structure
        achievement = data[0]
        assert "id" in achievement
        assert "name" in achievement
        assert "description" in achievement
        assert "icon" in achievement
        assert "xp_reward" in achievement
        assert "condition" in achievement


class TestGamificationLeaderboard:
    """Tests for GET /api/v2/gamification/leaderboard"""
    
    def test_get_leaderboard(self, api_client):
        """Test fetching gamification leaderboard"""
        response = api_client.get(f"{BASE_URL}/api/v2/gamification/leaderboard")
        
        assert response.status_code == 200
        data = response.json()
        
        assert isinstance(data, list)
        
        if len(data) > 0:
            entry = data[0]
            assert "rank" in entry
            assert "user_id" in entry
            assert "name" in entry
            assert "xp_points" in entry
            assert "level" in entry


class TestTradingMarketPrices:
    """Tests for GET /api/v2/trading/market/prices"""
    
    def test_get_market_prices(self, api_client):
        """Test fetching live market prices"""
        response = api_client.get(f"{BASE_URL}/api/v2/trading/market/prices")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "prices" in data
        assert "count" in data
        assert isinstance(data["prices"], dict)
        
    def test_market_price_structure(self, api_client):
        """Test individual price data structure"""
        response = api_client.get(f"{BASE_URL}/api/v2/trading/market/prices")
        
        assert response.status_code == 200
        data = response.json()
        
        if len(data["prices"]) > 0:
            # Get first price entry
            symbol = list(data["prices"].keys())[0]
            price_data = data["prices"][symbol]
            
            assert "symbol" in price_data
            assert "name" in price_data
            assert "price" in price_data
            assert "change_24h" in price_data
            assert isinstance(price_data["price"], (int, float))
            assert isinstance(price_data["change_24h"], (int, float))


class TestTradingPortfolio:
    """Tests for GET /api/v2/trading/portfolio/{user_id}"""
    
    def test_get_portfolio(self, authenticated_client, test_user_auth):
        """Test fetching user portfolio"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/trading/portfolio/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "user_id" in data
        assert data["user_id"] == user_id
        assert "balance" in data
        assert "holdings_value" in data
        assert "total_value" in data
        assert "initial_capital" in data
        assert "total_pnl" in data
        assert "total_pnl_percent" in data
        assert "holdings" in data
        assert "career_level" in data
        
    def test_portfolio_career_level_structure(self, authenticated_client, test_user_auth):
        """Test career_level structure"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/trading/portfolio/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        career = data["career_level"]
        assert "current" in career
        assert "next" in career
        
        if career["current"]:
            assert "level" in career["current"]
            assert "name" in career["current"]
            assert "capital" in career["current"]
            
    def test_portfolio_holdings_structure(self, authenticated_client, test_user_auth):
        """Test holdings array structure"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/trading/portfolio/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        holdings = data["holdings"]
        assert isinstance(holdings, list)
        
        if len(holdings) > 0:
            holding = holdings[0]
            assert "symbol" in holding
            assert "name" in holding
            assert "amount" in holding
            assert "current_price" in holding
            assert "value" in holding
            assert "pnl" in holding
            assert "pnl_percent" in holding
            
    def test_portfolio_not_found(self, authenticated_client):
        """Test 404 for non-existent user"""
        fake_id = str(uuid.uuid4())
        response = authenticated_client.get(f"{BASE_URL}/api/v2/trading/portfolio/{fake_id}")
        
        assert response.status_code == 404


class TestTradingExecute:
    """Tests for POST /api/v2/trading/trade/{user_id}"""
    
    def test_execute_buy_trade(self, authenticated_client, test_user_auth):
        """Test executing a buy trade"""
        user_id = test_user_auth['user_id']
        
        # First get market prices to find available symbol
        prices_response = authenticated_client.get(f"{BASE_URL}/api/v2/trading/market/prices")
        assert prices_response.status_code == 200
        prices = prices_response.json()["prices"]
        
        if not prices:
            pytest.skip("No market prices available")
            
        symbol = list(prices.keys())[0]  # Use first available symbol
        
        response = authenticated_client.post(
            f"{BASE_URL}/api/v2/trading/trade/{user_id}",
            json={
                "symbol": symbol,
                "action": "buy",
                "amount": 0.001
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert "trade" in data
        assert "new_balance" in data
        assert "portfolio" in data
        
        trade = data["trade"]
        assert trade["symbol"] == symbol
        assert trade["action"] == "buy"
        assert trade["amount"] == 0.001
        
    def test_execute_sell_trade(self, authenticated_client, test_user_auth):
        """Test executing a sell trade"""
        user_id = test_user_auth['user_id']
        
        # Get portfolio to find a holding to sell
        portfolio_response = authenticated_client.get(f"{BASE_URL}/api/v2/trading/portfolio/{user_id}")
        assert portfolio_response.status_code == 200
        portfolio = portfolio_response.json()
        
        holdings = portfolio.get("holdings", [])
        if not holdings:
            pytest.skip("No holdings to sell")
            
        # Sell a small amount of first holding
        holding = holdings[0]
        sell_amount = min(0.001, holding["amount"])
        
        response = authenticated_client.post(
            f"{BASE_URL}/api/v2/trading/trade/{user_id}",
            json={
                "symbol": holding["symbol"],
                "action": "sell",
                "amount": sell_amount
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["success"] == True
        assert data["trade"]["action"] == "sell"
        
    def test_trade_invalid_symbol(self, authenticated_client, test_user_auth):
        """Test trade with invalid symbol"""
        user_id = test_user_auth['user_id']
        
        response = authenticated_client.post(
            f"{BASE_URL}/api/v2/trading/trade/{user_id}",
            json={
                "symbol": "INVALIDCRYPTO",
                "action": "buy",
                "amount": 1
            }
        )
        
        assert response.status_code == 400
        
    def test_trade_invalid_amount(self, authenticated_client, test_user_auth):
        """Test trade with invalid amount"""
        user_id = test_user_auth['user_id']
        
        response = authenticated_client.post(
            f"{BASE_URL}/api/v2/trading/trade/{user_id}",
            json={
                "symbol": "ETH",
                "action": "buy",
                "amount": -1
            }
        )
        
        assert response.status_code == 400
        
    def test_trade_insufficient_balance(self, authenticated_client, test_user_auth):
        """Test trade with insufficient balance"""
        user_id = test_user_auth['user_id']
        
        # Try to buy way more than balance allows
        response = authenticated_client.post(
            f"{BASE_URL}/api/v2/trading/trade/{user_id}",
            json={
                "symbol": "ETH",
                "action": "buy",
                "amount": 10000  # Would cost millions
            }
        )
        
        assert response.status_code == 400
        data = response.json()
        assert "insuffisant" in data["detail"].lower() or "insufficient" in data["detail"].lower()


class TestTradingAdditionalEndpoints:
    """Tests for additional trading endpoints"""
    
    def test_get_supported_cryptos(self, api_client):
        """Test GET /api/v2/trading/cryptos"""
        response = api_client.get(f"{BASE_URL}/api/v2/trading/cryptos")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "cryptos" in data
        assert isinstance(data["cryptos"], list)
        
        if len(data["cryptos"]) > 0:
            crypto = data["cryptos"][0]
            assert "symbol" in crypto
            assert "name" in crypto
            
    def test_get_career_levels(self, api_client):
        """Test GET /api/v2/trading/career/levels"""
        response = api_client.get(f"{BASE_URL}/api/v2/trading/career/levels")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "levels" in data
        assert isinstance(data["levels"], list)
        assert len(data["levels"]) > 0
        
        level = data["levels"][0]
        assert "level" in level
        assert "name" in level
        assert "capital" in level
        
    def test_get_trade_history(self, authenticated_client, test_user_auth):
        """Test GET /api/v2/trading/trades/{user_id}"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.get(f"{BASE_URL}/api/v2/trading/trades/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "trades" in data
        assert "count" in data
        assert isinstance(data["trades"], list)
        
    def test_get_market_overview(self, api_client):
        """Test GET /api/v2/trading/market/overview"""
        response = api_client.get(f"{BASE_URL}/api/v2/trading/market/overview")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "prices" in data
        assert "market_sentiment" in data
        assert "timestamp" in data


class TestGamificationStreak:
    """Tests for streak functionality"""
    
    def test_update_streak(self, authenticated_client, test_user_auth):
        """Test POST /api/v2/gamification/streak/{user_id}"""
        user_id = test_user_auth['user_id']
        response = authenticated_client.post(f"{BASE_URL}/api/v2/gamification/streak/{user_id}")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "streak_days" in data
        assert "streak_updated" in data
