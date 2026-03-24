"""
Backend API Tests for Retention & Engagement Features
Tests: Shop, Guild, Referral, Notifications, Streak APIs
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://broker-briefing.preview.emergentagent.com')

# Test credentials
TEST_EMAIL = "retention_test@test.com"
TEST_PASSWORD = "TestPass123!"
TEST_USER_NAME = "Retention Test User"


class TestShopAPI:
    """Shop endpoint tests - items, inventory, purchases"""
    
    def test_get_shop_items(self):
        """GET /api/v2/shop/items - Should return all shop items by category"""
        response = requests.get(f"{BASE_URL}/api/v2/shop/items")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "items" in data, "Response should contain 'items' key"
        
        items = data["items"]
        # Verify all categories exist
        assert "boosters" in items, "Should have boosters category"
        assert "quiz_powerups" in items, "Should have quiz_powerups category"
        assert "cosmetics" in items, "Should have cosmetics category"
        assert "special" in items, "Should have special category"
        
        # Verify boosters have required fields
        boosters = items["boosters"]
        assert len(boosters) > 0, "Should have at least one booster"
        for booster in boosters:
            assert "id" in booster, "Booster should have id"
            assert "name" in booster, "Booster should have name"
            assert "price" in booster, "Booster should have price"
            assert "icon" in booster, "Booster should have icon"
        
        print(f"✓ Shop items API returned {len(boosters)} boosters, {len(items['quiz_powerups'])} powerups, {len(items['cosmetics'])} cosmetics, {len(items['special'])} special items")


class TestGuildAPI:
    """Guild endpoint tests - search, leaderboard, create"""
    
    def test_guild_leaderboard(self):
        """GET /api/v2/guild/leaderboard - Should return guild leaderboard"""
        response = requests.get(f"{BASE_URL}/api/v2/guild/leaderboard?limit=10")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "leaderboard" in data, "Response should contain 'leaderboard' key"
        assert isinstance(data["leaderboard"], list), "Leaderboard should be a list"
        
        print(f"✓ Guild leaderboard API returned {len(data['leaderboard'])} guilds")
    
    def test_guild_search(self):
        """GET /api/v2/guild/search - Should return search results"""
        response = requests.get(f"{BASE_URL}/api/v2/guild/search?query=&limit=10")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "guilds" in data, "Response should contain 'guilds' key"
        assert isinstance(data["guilds"], list), "Guilds should be a list"
        
        print(f"✓ Guild search API returned {len(data['guilds'])} guilds")
    
    def test_guild_search_with_query(self):
        """GET /api/v2/guild/search - Should filter by query"""
        response = requests.get(f"{BASE_URL}/api/v2/guild/search?query=test&limit=10")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "guilds" in data, "Response should contain 'guilds' key"
        
        print(f"✓ Guild search with query returned {len(data['guilds'])} guilds")


class TestReferralAPI:
    """Referral endpoint tests - leaderboard, stats"""
    
    def test_referral_leaderboard(self):
        """GET /api/v2/referral/leaderboard - Should return referral leaderboard"""
        response = requests.get(f"{BASE_URL}/api/v2/referral/leaderboard?limit=10")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "leaderboard" in data, "Response should contain 'leaderboard' key"
        assert isinstance(data["leaderboard"], list), "Leaderboard should be a list"
        
        print(f"✓ Referral leaderboard API returned {len(data['leaderboard'])} referrers")


class TestAuthenticatedAPIs:
    """Tests requiring authentication"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get token"""
        # Try to login first
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data["access_token"]
            self.user_id = data["user"]["id"]
        else:
            # Register new user
            register_response = requests.post(
                f"{BASE_URL}/api/auth/register",
                json={
                    "email": TEST_EMAIL,
                    "password": TEST_PASSWORD,
                    "full_name": TEST_USER_NAME
                }
            )
            if register_response.status_code == 200:
                data = register_response.json()
                self.token = data["access_token"]
                self.user_id = data["user"]["id"]
            else:
                pytest.skip("Could not authenticate - skipping authenticated tests")
        
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_get_notifications(self):
        """GET /api/v2/notifications/{user_id} - Should return user notifications"""
        response = requests.get(
            f"{BASE_URL}/api/v2/notifications/{self.user_id}",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "notifications" in data, "Response should contain 'notifications' key"
        assert "unread_count" in data, "Response should contain 'unread_count' key"
        assert isinstance(data["notifications"], list), "Notifications should be a list"
        
        print(f"✓ Notifications API returned {len(data['notifications'])} notifications, {data['unread_count']} unread")
    
    def test_get_notification_count(self):
        """GET /api/v2/notifications/{user_id}/count - Should return unread count"""
        response = requests.get(
            f"{BASE_URL}/api/v2/notifications/{self.user_id}/count",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "unread_count" in data, "Response should contain 'unread_count' key"
        assert isinstance(data["unread_count"], int), "Unread count should be an integer"
        
        print(f"✓ Notification count API returned {data['unread_count']} unread")
    
    def test_get_referral_stats(self):
        """GET /api/v2/referral/stats/{user_id} - Should return referral stats"""
        response = requests.get(
            f"{BASE_URL}/api/v2/referral/stats/{self.user_id}",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "referral_code" in data, "Response should contain 'referral_code'"
        assert "referral_link" in data, "Response should contain 'referral_link'"
        assert "referral_count" in data, "Response should contain 'referral_count'"
        assert "all_milestones" in data, "Response should contain 'all_milestones'"
        
        # Verify milestones structure
        milestones = data["all_milestones"]
        assert len(milestones) > 0, "Should have at least one milestone"
        for milestone in milestones:
            assert "count" in milestone, "Milestone should have count"
            assert "title" in milestone, "Milestone should have title"
            assert "xp" in milestone, "Milestone should have xp"
            assert "coins" in milestone, "Milestone should have coins"
        
        print(f"✓ Referral stats API returned code: {data['referral_code']}, count: {data['referral_count']}")
    
    def test_get_referral_code(self):
        """GET /api/v2/referral/code/{user_id} - Should return referral code"""
        response = requests.get(
            f"{BASE_URL}/api/v2/referral/code/{self.user_id}",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "referral_code" in data, "Response should contain 'referral_code'"
        assert "referral_link" in data, "Response should contain 'referral_link'"
        assert len(data["referral_code"]) == 8, "Referral code should be 8 characters"
        
        print(f"✓ Referral code API returned code: {data['referral_code']}")
    
    def test_get_user_inventory(self):
        """GET /api/v2/shop/inventory/{user_id} - Should return user inventory"""
        response = requests.get(
            f"{BASE_URL}/api/v2/shop/inventory/{self.user_id}",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "coins" in data, "Response should contain 'coins'"
        assert "inventory" in data, "Response should contain 'inventory'"
        assert "active_boosters" in data, "Response should contain 'active_boosters'"
        assert "owned_cosmetics" in data, "Response should contain 'owned_cosmetics'"
        
        print(f"✓ Inventory API returned coins: {data['coins']}, items: {len(data['inventory'])}")
    
    def test_get_user_guild(self):
        """GET /api/v2/guild/user/{user_id} - Should return user's guild"""
        response = requests.get(
            f"{BASE_URL}/api/v2/guild/user/{self.user_id}",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "guild" in data, "Response should contain 'guild' key"
        # Guild can be null if user is not in a guild
        
        print(f"✓ User guild API returned guild: {data['guild'] is not None}")
    
    def test_get_streak_info(self):
        """GET /api/v2/streak/{user_id} - Should return streak info"""
        response = requests.get(
            f"{BASE_URL}/api/v2/streak/{self.user_id}",
            headers=self.headers
        )
        # May return 404 if user not found in streak system
        if response.status_code == 404:
            print("✓ Streak API returned 404 (user not in streak system yet)")
            return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "current_streak" in data, "Response should contain 'current_streak'"
        
        print(f"✓ Streak API returned current streak: {data.get('current_streak', 0)}")
    
    def test_get_gamification_profile(self):
        """GET /api/v2/gamification/profile/{user_id} - Should return gamification profile"""
        response = requests.get(
            f"{BASE_URL}/api/v2/gamification/profile/{self.user_id}",
            headers=self.headers
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "level" in data, "Response should contain 'level'"
        assert "xp_points" in data, "Response should contain 'xp_points'"
        
        print(f"✓ Gamification profile API returned level: {data['level']}, xp: {data['xp_points']}")


class TestGuildCreateAndJoin:
    """Tests for guild creation and joining"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Login and get token"""
        login_response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD}
        )
        
        if login_response.status_code == 200:
            data = login_response.json()
            self.token = data["access_token"]
            self.user_id = data["user"]["id"]
            self.headers = {"Authorization": f"Bearer {self.token}"}
        else:
            pytest.skip("Could not authenticate - skipping guild tests")
    
    def test_create_guild(self):
        """POST /api/v2/guild/create/{user_id} - Should create a guild"""
        # First check if user is already in a guild
        user_guild_response = requests.get(
            f"{BASE_URL}/api/v2/guild/user/{self.user_id}",
            headers=self.headers
        )
        
        if user_guild_response.status_code == 200:
            data = user_guild_response.json()
            if data.get("guild"):
                print("✓ User already in a guild, skipping create test")
                return
        
        # Create a new guild
        guild_name = f"Test Guild {uuid.uuid4().hex[:6]}"
        response = requests.post(
            f"{BASE_URL}/api/v2/guild/create/{self.user_id}",
            json={
                "name": guild_name,
                "description": "Test guild for automated testing",
                "is_public": True
            },
            headers=self.headers
        )
        
        # May fail if user already in a guild
        if response.status_code == 400:
            error = response.json().get("detail", "")
            if "Already in a guild" in error:
                print("✓ User already in a guild (expected)")
                return
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data.get("success") == True, "Guild creation should succeed"
        assert "guild" in data, "Response should contain 'guild'"
        
        print(f"✓ Guild created: {guild_name}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
