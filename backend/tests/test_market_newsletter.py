# Market Intelligence & Newsletter API Tests
# Tests for the new Market Intelligence Center and Newsletter System

import pytest
import requests
import os
import time
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cryptocoach-production.up.railway.app')

class TestMarketIntelligenceAPI:
    """Tests for Market Intelligence endpoints"""
    
    def test_get_cryptos_returns_list(self):
        """GET /api/market/cryptos returns crypto list"""
        response = requests.get(f"{BASE_URL}/api/market/cryptos?limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert "cryptos" in data
        assert isinstance(data["cryptos"], list)
        assert len(data["cryptos"]) > 0
        
        # Verify crypto structure
        crypto = data["cryptos"][0]
        assert "id" in crypto
        assert "symbol" in crypto
        assert "name" in crypto
        assert "current_price" in crypto
        print(f"PASS: Got {len(data['cryptos'])} cryptos, first: {crypto['name']} at ${crypto['current_price']}")
    
    def test_get_cryptos_respects_limit(self):
        """GET /api/market/cryptos respects limit parameter"""
        response = requests.get(f"{BASE_URL}/api/market/cryptos?limit=3")
        assert response.status_code == 200
        
        data = response.json()
        assert len(data["cryptos"]) <= 3
        print(f"PASS: Limit parameter works, got {len(data['cryptos'])} cryptos")
    
    def test_get_global_market_data(self):
        """GET /api/market/global returns market cap and fear & greed"""
        response = requests.get(f"{BASE_URL}/api/market/global")
        assert response.status_code == 200
        
        data = response.json()
        # Fear & greed is always returned (from alternative.me API)
        assert "fear_greed" in data
        
        # Verify fear & greed structure
        fg = data["fear_greed"]
        assert "value" in fg
        assert "label" in fg
        assert isinstance(fg["value"], int)
        assert 0 <= fg["value"] <= 100
        
        # Market cap data may be missing if CoinGecko API is rate limited
        if "total_market_cap" in data:
            print(f"PASS: Global data - Market Cap: ${data['total_market_cap'].get('usd', 'N/A')}, Fear & Greed: {fg['value']} ({fg['label']})")
        else:
            print(f"PASS: Global data (CoinGecko rate limited) - Fear & Greed: {fg['value']} ({fg['label']})")
    
    def test_get_crypto_news(self):
        """GET /api/market/news returns news articles"""
        response = requests.get(f"{BASE_URL}/api/market/news?limit=5")
        assert response.status_code == 200
        
        data = response.json()
        assert "articles" in data
        assert isinstance(data["articles"], list)
        assert len(data["articles"]) > 0
        
        # Verify article structure
        article = data["articles"][0]
        assert "title" in article
        assert "description" in article
        assert "url" in article
        assert "source" in article
        print(f"PASS: Got {len(data['articles'])} news articles, first: '{article['title'][:50]}...'")
    
    def test_get_trending(self):
        """GET /api/market/trending returns trending cryptos"""
        response = requests.get(f"{BASE_URL}/api/market/trending")
        assert response.status_code == 200
        
        data = response.json()
        assert "trending" in data
        # Trending may be empty if API rate limited
        print(f"PASS: Trending endpoint works, got {len(data['trending'])} trending items")


class TestNewsletterAPI:
    """Tests for Newsletter endpoints"""
    
    @pytest.fixture
    def unique_email(self):
        """Generate unique email for each test"""
        return f"test_{uuid.uuid4().hex[:8]}@example.com"
    
    def test_subscribe_newsletter(self, unique_email):
        """POST /api/newsletter/subscribe subscribes email"""
        response = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={
                "email": unique_email,
                "language": "en",
                "interests": ["market_updates", "educational"]
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "message" in data
        assert "subscriber_count" in data
        print(f"PASS: Subscribed {unique_email}, total subscribers: {data['subscriber_count']}")
    
    def test_subscribe_duplicate_email(self, unique_email):
        """POST /api/newsletter/subscribe handles duplicate gracefully"""
        # First subscription
        requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": unique_email, "language": "en", "interests": []}
        )
        
        # Second subscription with same email
        response = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": unique_email, "language": "en", "interests": []}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data.get("already_subscribed") == True
        print(f"PASS: Duplicate subscription handled correctly")
    
    def test_subscribe_invalid_email(self):
        """POST /api/newsletter/subscribe rejects invalid email"""
        response = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": "not-an-email", "language": "en", "interests": []}
        )
        # Should return 422 for validation error
        assert response.status_code == 422
        print(f"PASS: Invalid email rejected with 422")
    
    def test_get_subscribers(self):
        """GET /api/newsletter/subscribers returns subscriber list"""
        response = requests.get(f"{BASE_URL}/api/newsletter/subscribers")
        assert response.status_code == 200
        
        data = response.json()
        assert "total" in data
        assert "active" in data
        assert "subscribers" in data
        assert isinstance(data["subscribers"], list)
        print(f"PASS: Got {data['total']} total subscribers, {data['active']} active")
    
    def test_create_newsletter_draft(self):
        """POST /api/newsletter/create creates newsletter draft"""
        response = requests.post(
            f"{BASE_URL}/api/newsletter/create",
            json={
                "subject": f"Test Newsletter {uuid.uuid4().hex[:6]}",
                "content": "# Test Content\n\nThis is a test newsletter from pytest.",
                "language": "en",
                "send_immediately": False
            }
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "newsletter" in data
        
        newsletter = data["newsletter"]
        assert "id" in newsletter
        assert newsletter["status"] == "draft"
        assert newsletter["sent"] == False
        print(f"PASS: Created newsletter draft with ID {newsletter['id']}")
        return newsletter["id"]
    
    def test_list_newsletters(self):
        """GET /api/newsletter/list returns newsletters"""
        response = requests.get(f"{BASE_URL}/api/newsletter/list")
        assert response.status_code == 200
        
        data = response.json()
        assert "newsletters" in data
        assert isinstance(data["newsletters"], list)
        print(f"PASS: Got {len(data['newsletters'])} newsletters")
    
    def test_send_newsletter(self):
        """POST /api/newsletter/send/{id} sends newsletter (mocked)"""
        # First create a newsletter
        create_response = requests.post(
            f"{BASE_URL}/api/newsletter/create",
            json={
                "subject": f"Send Test {uuid.uuid4().hex[:6]}",
                "content": "Test content for sending",
                "language": "en",
                "send_immediately": False
            }
        )
        newsletter_id = create_response.json()["newsletter"]["id"]
        
        # Now send it
        response = requests.post(f"{BASE_URL}/api/newsletter/send/{newsletter_id}")
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "message" in data
        print(f"PASS: Newsletter {newsletter_id} sent (mocked - no API key)")
    
    def test_send_nonexistent_newsletter(self):
        """POST /api/newsletter/send/{id} returns 404 for nonexistent"""
        response = requests.post(f"{BASE_URL}/api/newsletter/send/99999")
        assert response.status_code == 404
        print(f"PASS: Nonexistent newsletter returns 404")
    
    def test_generate_ai_newsletter(self):
        """POST /api/newsletter/generate-ai returns template"""
        response = requests.post(
            f"{BASE_URL}/api/newsletter/generate-ai",
            params={"topic": "weekly_recap", "language": "en"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "generated" in data
        assert "subject" in data["generated"]
        assert "content" in data["generated"]
        print(f"PASS: AI newsletter generated (template mode)")


class TestNewsletterMultiLanguage:
    """Tests for newsletter multi-language support"""
    
    def test_subscribe_french(self):
        """Subscribe with French language preference"""
        email = f"test_fr_{uuid.uuid4().hex[:6]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": email, "language": "fr", "interests": ["market_updates"]}
        )
        assert response.status_code == 200
        assert response.json()["success"] == True
        print(f"PASS: French subscription works")
    
    def test_subscribe_arabic(self):
        """Subscribe with Arabic language preference"""
        email = f"test_ar_{uuid.uuid4().hex[:6]}@example.com"
        response = requests.post(
            f"{BASE_URL}/api/newsletter/subscribe",
            json={"email": email, "language": "ar", "interests": ["educational"]}
        )
        assert response.status_code == 200
        assert response.json()["success"] == True
        print(f"PASS: Arabic subscription works")
    
    def test_generate_ai_newsletter_french(self):
        """Generate AI newsletter in French"""
        response = requests.post(
            f"{BASE_URL}/api/newsletter/generate-ai",
            params={"topic": "weekly_recap", "language": "fr"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "Récap" in data["generated"]["subject"] or "Hebdomadaire" in data["generated"]["subject"]
        print(f"PASS: French AI newsletter template generated")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
