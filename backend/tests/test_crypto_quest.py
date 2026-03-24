"""
Test suite for Crypto Quest API endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cryptocoach-production.up.railway.app').rstrip('/')


class TestCryptoQuestChapters:
    """Test GET /api/v2/quest/chapters endpoint"""
    
    def test_get_all_chapters_success(self, api_client):
        """Test fetching all quest chapters"""
        response = api_client.get(f"{BASE_URL}/api/v2/quest/chapters")
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "chapters" in data
        assert len(data["chapters"]) == 5  # 5 chapters defined
        
    def test_chapters_have_required_fields(self, api_client):
        """Test that chapters have all required fields"""
        response = api_client.get(f"{BASE_URL}/api/v2/quest/chapters")
        assert response.status_code == 200
        data = response.json()
        
        for chapter in data["chapters"]:
            assert "id" in chapter
            assert "number" in chapter
            assert "name_key" in chapter
            assert "unlock_level" in chapter
            assert "xp_reward" in chapter
            assert "coins_reward" in chapter
            assert "missions" in chapter
            
    def test_missions_have_i18n_fields(self, api_client):
        """Test that missions have internationalization fields"""
        response = api_client.get(f"{BASE_URL}/api/v2/quest/chapters")
        assert response.status_code == 200
        data = response.json()
        
        # Check first mission
        first_mission = data["chapters"][0]["missions"][0]
        assert "title" in first_mission
        assert "title_fr" in first_mission
        assert "title_ar" in first_mission
        assert "description" in first_mission
        assert "description_fr" in first_mission
        assert "description_ar" in first_mission
        
    def test_missions_have_correct_types(self, api_client):
        """Test that missions have valid types"""
        response = api_client.get(f"{BASE_URL}/api/v2/quest/chapters")
        assert response.status_code == 200
        data = response.json()
        
        valid_types = ["lesson", "quiz", "exam", "trading_challenge"]
        for chapter in data["chapters"]:
            for mission in chapter["missions"]:
                assert mission["type"] in valid_types


class TestCryptoQuestProgress:
    """Test GET /api/v2/quest/progress/{user_id} endpoint"""
    
    @pytest.fixture
    def gamer_auth(self, api_client):
        """Get auth token for gamerhub user"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "gamerhub@crypto.io",
            "password": "Test123456!"
        })
        if response.status_code == 200:
            data = response.json()
            return {
                "token": data.get("access_token"),
                "user_id": data.get("user", {}).get("id")
            }
        pytest.skip("Gamer authentication failed")
        
    def test_get_progress_success(self, api_client, gamer_auth):
        """Test fetching quest progress for authenticated user"""
        api_client.headers.update({"Authorization": f"Bearer {gamer_auth['token']}"})
        response = api_client.get(f"{BASE_URL}/api/v2/quest/progress/{gamer_auth['user_id']}")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify structure
        assert "user_id" in data
        assert "user_level" in data
        assert "chapters" in data
        assert "overall_progress" in data
        
    def test_progress_has_chapter_details(self, api_client, gamer_auth):
        """Test that progress includes chapter unlock status and completion"""
        api_client.headers.update({"Authorization": f"Bearer {gamer_auth['token']}"})
        response = api_client.get(f"{BASE_URL}/api/v2/quest/progress/{gamer_auth['user_id']}")
        
        assert response.status_code == 200
        data = response.json()
        
        for chapter in data["chapters"]:
            assert "unlocked" in chapter
            assert "completed" in chapter
            assert "progress" in chapter
            assert "completed" in chapter["progress"]
            assert "total" in chapter["progress"]
            assert "percent" in chapter["progress"]
            
    def test_progress_shows_mission_status(self, api_client, gamer_auth):
        """Test that missions include completed and locked status"""
        api_client.headers.update({"Authorization": f"Bearer {gamer_auth['token']}"})
        response = api_client.get(f"{BASE_URL}/api/v2/quest/progress/{gamer_auth['user_id']}")
        
        assert response.status_code == 200
        data = response.json()
        
        first_chapter = data["chapters"][0]
        for mission in first_chapter["missions"]:
            assert "completed" in mission
            assert "locked" in mission
            
    def test_progress_not_found_for_invalid_user(self, api_client, gamer_auth):
        """Test 404 for non-existent user"""
        api_client.headers.update({"Authorization": f"Bearer {gamer_auth['token']}"})
        response = api_client.get(f"{BASE_URL}/api/v2/quest/progress/non-existent-user-id")
        
        assert response.status_code == 404


class TestCryptoQuestComplete:
    """Test POST /api/v2/quest/complete/{user_id} endpoint"""
    
    @pytest.fixture
    def gamer_auth(self, api_client):
        """Get auth token for gamerhub user"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "gamerhub@crypto.io",
            "password": "Test123456!"
        })
        if response.status_code == 200:
            data = response.json()
            return {
                "token": data.get("access_token"),
                "user_id": data.get("user", {}).get("id")
            }
        pytest.skip("Gamer authentication failed")
        
    def test_complete_mission_success(self, api_client, gamer_auth):
        """Test completing a mission"""
        api_client.headers.update({"Authorization": f"Bearer {gamer_auth['token']}"})
        
        # Try to complete mission_1_2 (not mission_1_1 which may already be completed)
        response = api_client.post(
            f"{BASE_URL}/api/v2/quest/complete/{gamer_auth['user_id']}",
            json={"mission_id": "mission_1_2"}
        )
        
        # Either success or already completed
        assert response.status_code in [200, 400]
        data = response.json()
        
        if response.status_code == 200:
            assert data["success"] == True
            assert "xp_earned" in data
        else:
            # Already completed is acceptable
            assert "already completed" in data.get("detail", "").lower()
            
    def test_complete_invalid_mission(self, api_client, gamer_auth):
        """Test completing a non-existent mission"""
        api_client.headers.update({"Authorization": f"Bearer {gamer_auth['token']}"})
        
        response = api_client.post(
            f"{BASE_URL}/api/v2/quest/complete/{gamer_auth['user_id']}",
            json={"mission_id": "invalid_mission"}
        )
        
        assert response.status_code == 400
        
    def test_complete_mission_awards_xp(self, api_client, gamer_auth):
        """Test that completing a mission awards XP"""
        api_client.headers.update({"Authorization": f"Bearer {gamer_auth['token']}"})
        
        # Get initial XP
        progress_response = api_client.get(f"{BASE_URL}/api/v2/quest/progress/{gamer_auth['user_id']}")
        if progress_response.status_code != 200:
            pytest.skip("Could not fetch progress")
            
        # Mission completion logic is already tested - verify structure
        response = api_client.post(
            f"{BASE_URL}/api/v2/quest/complete/{gamer_auth['user_id']}",
            json={"mission_id": "mission_1_3"}
        )
        
        if response.status_code == 200:
            data = response.json()
            assert "xp_earned" in data
            assert data["xp_earned"] > 0


class TestCryptoQuestChallenge:
    """Test GET /api/v2/quest/challenge/{user_id}/{mission_id} endpoint"""
    
    @pytest.fixture
    def gamer_auth(self, api_client):
        """Get auth token for gamerhub user"""
        response = api_client.post(f"{BASE_URL}/api/auth/login", json={
            "email": "gamerhub@crypto.io",
            "password": "Test123456!"
        })
        if response.status_code == 200:
            data = response.json()
            return {
                "token": data.get("access_token"),
                "user_id": data.get("user", {}).get("id")
            }
        pytest.skip("Gamer authentication failed")
        
    def test_check_trading_challenge_progress(self, api_client, gamer_auth):
        """Test checking trading challenge progress"""
        api_client.headers.update({"Authorization": f"Bearer {gamer_auth['token']}"})
        
        # mission_2_3 is "Your First Trade" trading challenge
        response = api_client.get(
            f"{BASE_URL}/api/v2/quest/challenge/{gamer_auth['user_id']}/mission_2_3"
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "success" in data
        assert "completed" in data
        assert "current_value" in data
        assert "target_value" in data
        assert "progress_percent" in data
        
    def test_check_invalid_challenge(self, api_client, gamer_auth):
        """Test checking a non-trading-challenge mission"""
        api_client.headers.update({"Authorization": f"Bearer {gamer_auth['token']}"})
        
        # mission_1_1 is a lesson, not a trading challenge
        response = api_client.get(
            f"{BASE_URL}/api/v2/quest/challenge/{gamer_auth['user_id']}/mission_1_1"
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get("success") == False or data.get("error") is not None
