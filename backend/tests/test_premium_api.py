"""
Premium Features API Tests
Tests for trial system, annual bundles, preview config, and user access summary
"""
import pytest
import requests
import os
from datetime import datetime, timezone, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestTrialConfig:
    """Trial configuration endpoint tests"""
    
    def test_get_trial_config(self):
        """GET /api/premium/trial/config returns trial configuration"""
        response = requests.get(f"{BASE_URL}/api/premium/trial/config")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "lesson_1_trial_days" in data, "Missing lesson_1_trial_days"
        assert "preview_seconds" in data, "Missing preview_seconds"
        assert "referral_bonus_days" in data, "Missing referral_bonus_days"
        
        # Verify expected values
        assert data["lesson_1_trial_days"] == 3, f"Expected 3 days trial, got {data['lesson_1_trial_days']}"
        assert data["preview_seconds"] == 30, f"Expected 30 seconds preview, got {data['preview_seconds']}"
        assert data["referral_bonus_days"] == 7, f"Expected 7 days referral bonus, got {data['referral_bonus_days']}"
        
        print(f"✓ Trial config: {data}")


class TestAnnualBundles:
    """Annual bundles endpoint tests"""
    
    def test_get_annual_bundles(self):
        """GET /api/premium/bundles/annual returns annual bundles with savings"""
        response = requests.get(f"{BASE_URL}/api/premium/bundles/annual")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "bundles" in data, "Missing bundles"
        assert "message" in data, "Missing message"
        
        bundles = data["bundles"]
        
        # Check all three bundles exist
        assert "starter_annual" in bundles, "Missing starter_annual bundle"
        assert "pro_annual" in bundles, "Missing pro_annual bundle"
        assert "elite_annual" in bundles, "Missing elite_annual bundle"
        
        # Verify starter bundle structure and 33% savings
        starter = bundles["starter_annual"]
        assert "name" in starter, "Missing name in starter bundle"
        assert "monthly_price" in starter, "Missing monthly_price"
        assert "annual_price" in starter, "Missing annual_price"
        assert "savings" in starter, "Missing savings"
        assert "savings_percent" in starter, "Missing savings_percent"
        assert starter["savings_percent"] == 33, f"Expected 33% savings, got {starter['savings_percent']}"
        
        # Verify pro bundle
        pro = bundles["pro_annual"]
        assert pro["savings_percent"] == 33, f"Expected 33% savings for pro, got {pro['savings_percent']}"
        
        # Verify elite bundle
        elite = bundles["elite_annual"]
        assert elite["savings_percent"] == 33, f"Expected 33% savings for elite, got {elite['savings_percent']}"
        
        print(f"✓ Annual bundles: {list(bundles.keys())}")
        print(f"✓ Starter: €{starter['annual_price']}/year (saves €{starter['savings']})")
        print(f"✓ Pro: €{pro['annual_price']}/year (saves €{pro['savings']})")
        print(f"✓ Elite: €{elite['annual_price']}/year (saves €{elite['savings']})")


class TestTrialStatus:
    """Trial status endpoint tests"""
    
    def test_trial_status_lesson_1_free_user_active_trial(self):
        """GET /api/premium/trial/status/{lesson_id} returns active trial for free user on lesson 1"""
        lesson_id = "course-foundations-lesson-1"
        # User created just now - should have active trial
        user_created_at = datetime.now(timezone.utc).isoformat()
        
        response = requests.get(
            f"{BASE_URL}/api/premium/trial/status/{lesson_id}",
            params={
                "user_created_at": user_created_at,
                "subscription_tier": "free"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["has_trial"] == True, "Expected has_trial=True for lesson 1"
        assert data["trial_active"] == True, "Expected trial_active=True for new user"
        assert data["days_remaining"] >= 2, f"Expected at least 2 days remaining, got {data['days_remaining']}"
        assert data["can_access_video"] == True, "Expected can_access_video=True during trial"
        assert data["can_access_audio"] == True, "Expected can_access_audio=True during trial"
        assert data["is_preview_only"] == False, "Expected is_preview_only=False during active trial"
        assert data["lesson_id"] == lesson_id, f"Expected lesson_id={lesson_id}"
        
        print(f"✓ Trial status for lesson 1 (new free user): active, {data['days_remaining']} days remaining")
    
    def test_trial_status_lesson_1_expired_trial(self):
        """GET /api/premium/trial/status/{lesson_id} returns expired trial for old free user"""
        lesson_id = "course-foundations-lesson-1"
        # User created 10 days ago - trial should be expired
        user_created_at = (datetime.now(timezone.utc) - timedelta(days=10)).isoformat()
        
        response = requests.get(
            f"{BASE_URL}/api/premium/trial/status/{lesson_id}",
            params={
                "user_created_at": user_created_at,
                "subscription_tier": "free"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["has_trial"] == True, "Expected has_trial=True for lesson 1"
        assert data["trial_active"] == False, "Expected trial_active=False for old user"
        assert data["days_remaining"] == 0, f"Expected 0 days remaining, got {data['days_remaining']}"
        assert data["is_preview_only"] == True, "Expected is_preview_only=True after trial expires"
        assert data["preview_seconds"] == 30, f"Expected 30 seconds preview, got {data['preview_seconds']}"
        
        print(f"✓ Trial status for lesson 1 (expired): preview_only with {data['preview_seconds']}s preview")
    
    def test_trial_status_premium_lesson_free_user(self):
        """GET /api/premium/trial/status/{lesson_id} returns preview_only for premium lessons"""
        lesson_id = "course-investor-lesson-1"  # Not lesson 1 of foundations
        user_created_at = datetime.now(timezone.utc).isoformat()
        
        response = requests.get(
            f"{BASE_URL}/api/premium/trial/status/{lesson_id}",
            params={
                "user_created_at": user_created_at,
                "subscription_tier": "free"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["has_trial"] == False, "Expected has_trial=False for non-lesson-1"
        assert data["is_preview_only"] == True, "Expected is_preview_only=True for premium content"
        assert data["preview_seconds"] == 30, f"Expected 30 seconds preview, got {data['preview_seconds']}"
        assert data["can_access_video"] == False, "Expected can_access_video=False for premium content"
        
        print(f"✓ Trial status for premium lesson (free user): preview_only with {data['preview_seconds']}s")
    
    def test_trial_status_paid_user(self):
        """GET /api/premium/trial/status/{lesson_id} returns full access for paid user"""
        lesson_id = "course-investor-lesson-1"
        user_created_at = datetime.now(timezone.utc).isoformat()
        
        response = requests.get(
            f"{BASE_URL}/api/premium/trial/status/{lesson_id}",
            params={
                "user_created_at": user_created_at,
                "subscription_tier": "pro"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["has_trial"] == False, "Expected has_trial=False for paid user"
        assert data["is_preview_only"] == False, "Expected is_preview_only=False for paid user"
        assert data["can_access_video"] == True, "Expected can_access_video=True for paid user"
        assert data["can_access_audio"] == True, "Expected can_access_audio=True for paid user"
        
        print(f"✓ Trial status for paid user: full access")
    
    def test_trial_status_guest_user(self):
        """GET /api/premium/trial/status/{lesson_id} returns preview_only for guest"""
        lesson_id = "course-foundations-lesson-1"
        
        # No user_created_at = guest user
        response = requests.get(
            f"{BASE_URL}/api/premium/trial/status/{lesson_id}",
            params={"subscription_tier": "free"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["is_preview_only"] == True, "Expected is_preview_only=True for guest"
        assert data["preview_seconds"] == 30, f"Expected 30 seconds preview, got {data['preview_seconds']}"
        
        print(f"✓ Trial status for guest: preview_only with {data['preview_seconds']}s")


class TestPreviewConfig:
    """Preview configuration endpoint tests"""
    
    def test_get_preview_config(self):
        """GET /api/premium/preview/config returns 30 seconds preview config"""
        response = requests.get(f"{BASE_URL}/api/premium/preview/config")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "preview_seconds" in data, "Missing preview_seconds"
        assert "preview_enabled" in data, "Missing preview_enabled"
        assert "message" in data, "Missing message"
        
        assert data["preview_seconds"] == 30, f"Expected 30 seconds, got {data['preview_seconds']}"
        assert data["preview_enabled"] == True, "Expected preview_enabled=True"
        
        print(f"✓ Preview config: {data['preview_seconds']}s, enabled={data['preview_enabled']}")


class TestUserAccessSummary:
    """User access summary endpoint tests"""
    
    def test_access_summary_free_user_with_trial(self):
        """GET /api/premium/user/access-summary returns access summary with trial info"""
        user_created_at = datetime.now(timezone.utc).isoformat()
        
        response = requests.get(
            f"{BASE_URL}/api/premium/user/access-summary",
            params={
                "user_created_at": user_created_at,
                "subscription_tier": "free",
                "referral_count": 0
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "subscription_tier" in data, "Missing subscription_tier"
        assert "access_level" in data, "Missing access_level"
        assert "features" in data, "Missing features"
        assert "trial" in data, "Missing trial"
        
        assert data["subscription_tier"] == "free"
        assert data["access_level"] == "free"
        
        trial = data["trial"]
        assert trial["base_days"] == 3, f"Expected 3 base days, got {trial['base_days']}"
        assert trial["is_active"] == True, "Expected trial to be active"
        assert trial["days_remaining"] >= 2, f"Expected at least 2 days remaining"
        
        print(f"✓ Access summary (free user): {data['access_level']}, trial active with {trial['days_remaining']} days")
    
    def test_access_summary_with_referrals(self):
        """GET /api/premium/user/access-summary includes referral bonus days"""
        user_created_at = datetime.now(timezone.utc).isoformat()
        
        response = requests.get(
            f"{BASE_URL}/api/premium/user/access-summary",
            params={
                "user_created_at": user_created_at,
                "subscription_tier": "free",
                "referral_count": 2  # 2 referrals = 14 bonus days
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        trial = data["trial"]
        
        assert trial["referral_bonus_days"] == 14, f"Expected 14 bonus days (2*7), got {trial['referral_bonus_days']}"
        assert trial["total_days"] == 17, f"Expected 17 total days (3+14), got {trial['total_days']}"
        
        print(f"✓ Access summary with referrals: {trial['total_days']} total days ({trial['base_days']} base + {trial['referral_bonus_days']} bonus)")
    
    def test_access_summary_elite_user(self):
        """GET /api/premium/user/access-summary returns full features for elite"""
        response = requests.get(
            f"{BASE_URL}/api/premium/user/access-summary",
            params={
                "subscription_tier": "elite"
            }
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert data["access_level"] == "full", f"Expected full access, got {data['access_level']}"
        assert "ai_mentor" in data["features"], "Expected ai_mentor in elite features"
        assert "all_courses" in data["features"], "Expected all_courses in elite features"
        
        print(f"✓ Access summary (elite): {data['access_level']}, features: {data['features']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
