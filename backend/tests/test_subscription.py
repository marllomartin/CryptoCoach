import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://broker-briefing.preview.emergentagent.com').rstrip('/')


class TestSubscriptionTiers:
    """Test subscription tier endpoints"""
    
    def test_get_subscription_tiers(self, api_client):
        """Test GET /api/subscription/tiers returns all 4 tiers"""
        response = api_client.get(f"{BASE_URL}/api/subscription/tiers")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        # Verify all 4 tiers exist
        assert "free" in data, "Missing 'free' tier"
        assert "starter" in data, "Missing 'starter' tier"
        assert "pro" in data, "Missing 'pro' tier"
        assert "elite" in data, "Missing 'elite' tier"
        
    def test_free_tier_details(self, api_client):
        """Test free tier has correct price and features"""
        response = api_client.get(f"{BASE_URL}/api/subscription/tiers")
        data = response.json()
        
        free_tier = data.get("free", {})
        assert free_tier.get("name") == "Free"
        assert free_tier.get("price") == 0.0
        assert "features" in free_tier
        assert len(free_tier.get("features", [])) >= 1
        
    def test_starter_tier_details(self, api_client):
        """Test starter tier has correct price ($9.99)"""
        response = api_client.get(f"{BASE_URL}/api/subscription/tiers")
        data = response.json()
        
        starter_tier = data.get("starter", {})
        assert starter_tier.get("name") == "Starter"
        assert starter_tier.get("price") == 9.99
        
    def test_pro_tier_details(self, api_client):
        """Test pro tier has correct price ($19.99)"""
        response = api_client.get(f"{BASE_URL}/api/subscription/tiers")
        data = response.json()
        
        pro_tier = data.get("pro", {})
        assert pro_tier.get("name") == "Pro"
        assert pro_tier.get("price") == 19.99
        
    def test_elite_tier_details(self, api_client):
        """Test elite tier has correct price ($25)"""
        response = api_client.get(f"{BASE_URL}/api/subscription/tiers")
        data = response.json()
        
        elite_tier = data.get("elite", {})
        assert elite_tier.get("name") == "Elite"
        assert elite_tier.get("price") == 25.0
        assert elite_tier.get("access", {}).get("ai_mentor") == True, "Elite should have AI mentor access"


class TestUserSubscription:
    """Test user subscription status endpoints"""
    
    def test_get_my_subscription_authenticated(self, authenticated_client):
        """Test authenticated user can get their subscription status"""
        response = authenticated_client.get(f"{BASE_URL}/api/subscription/my-subscription")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "tier" in data
        assert "name" in data
        assert "price" in data
        assert "features" in data
        assert "access" in data
        
    def test_get_my_subscription_unauthenticated(self, api_client):
        """Test unauthenticated request is rejected"""
        response = api_client.get(f"{BASE_URL}/api/subscription/my-subscription")
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestSubscriptionCheckout:
    """Test Stripe checkout session creation"""
    
    def test_create_checkout_session_starter(self, authenticated_client):
        """Test creating checkout session for starter tier"""
        response = authenticated_client.post(
            f"{BASE_URL}/api/subscription/create-checkout",
            json={
                "tier": "starter",
                "origin_url": "https://broker-briefing.preview.emergentagent.com"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        assert "url" in data, "Response should contain checkout URL"
        assert "session_id" in data, "Response should contain session ID"
        assert "checkout.stripe.com" in data["url"], "URL should be Stripe checkout"
        
    def test_create_checkout_session_pro(self, authenticated_client):
        """Test creating checkout session for pro tier"""
        response = authenticated_client.post(
            f"{BASE_URL}/api/subscription/create-checkout",
            json={
                "tier": "pro",
                "origin_url": "https://broker-briefing.preview.emergentagent.com"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "url" in data
        assert "session_id" in data
        
    def test_create_checkout_session_elite(self, authenticated_client):
        """Test creating checkout session for elite tier"""
        response = authenticated_client.post(
            f"{BASE_URL}/api/subscription/create-checkout",
            json={
                "tier": "elite",
                "origin_url": "https://broker-briefing.preview.emergentagent.com"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "url" in data
        assert "session_id" in data
        
    def test_create_checkout_invalid_tier(self, authenticated_client):
        """Test creating checkout with invalid tier returns error"""
        response = authenticated_client.post(
            f"{BASE_URL}/api/subscription/create-checkout",
            json={
                "tier": "invalid_tier",
                "origin_url": "https://broker-briefing.preview.emergentagent.com"
            }
        )
        
        # Should return 400 or similar error
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
        
    def test_create_checkout_unauthenticated(self, api_client):
        """Test checkout creation requires authentication"""
        response = api_client.post(
            f"{BASE_URL}/api/subscription/create-checkout",
            json={
                "tier": "starter",
                "origin_url": "https://broker-briefing.preview.emergentagent.com"
            }
        )
        
        assert response.status_code in [401, 403], f"Expected 401/403, got {response.status_code}"


class TestCheckoutStatus:
    """Test checkout status verification"""
    
    def test_checkout_status_invalid_session(self, authenticated_client):
        """Test checking status of invalid session ID"""
        response = authenticated_client.get(
            f"{BASE_URL}/api/subscription/checkout-status/invalid_session_123"
        )
        
        # Should return some response (may be 200 with error status or 404)
        assert response.status_code in [200, 404], f"Unexpected status {response.status_code}"


class TestAuthFlow:
    """Test authentication flow"""
    
    def test_login_success(self, api_client):
        """Test successful login"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test_subscription@example.com",
                "password": "Test123!"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        data = response.json()
        
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "test_subscription@example.com"
        
    def test_login_invalid_credentials(self, api_client):
        """Test login with wrong password"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/login",
            json={
                "email": "test_subscription@example.com",
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        
    def test_register_duplicate_email(self, api_client):
        """Test registration with existing email fails"""
        response = api_client.post(
            f"{BASE_URL}/api/auth/register",
            json={
                "email": "test_subscription@example.com",
                "password": "Test123!",
                "full_name": "Test User"
            }
        )
        
        assert response.status_code == 400, f"Expected 400, got {response.status_code}"
