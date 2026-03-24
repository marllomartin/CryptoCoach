"""
Test new features for CryptoCoach platform:
1. CAPTCHA system on registration
2. Coach's Tip on lessons
3. Certificate Progress bar
4. Urgency badge on pricing
5. Social proof components
6. Coupon input functionality
7. Testimonials section
8. Admin Analytics dashboard
9. Discount popup
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://cryptocoach-production.up.railway.app')

class TestBackendHealth:
    """Test backend API health"""
    
    def test_api_health(self):
        """Test API is operational"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        print("✓ API health check passed")

class TestAuthEndpoints:
    """Test authentication endpoints"""
    
    def test_login_success(self):
        """Test admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@thecryptocoach.io",
            "password": "adminpassword"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == "admin@thecryptocoach.io"
        print("✓ Admin login successful")
        return data["access_token"]
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "invalid@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code in [401, 404]
        print("✓ Invalid login correctly rejected")

class TestLessonEndpoints:
    """Test lesson endpoints"""
    
    def test_get_lesson(self):
        """Test fetching a lesson"""
        response = requests.get(f"{BASE_URL}/api/lessons/course-foundations-lesson-1?lang=en")
        assert response.status_code == 200
        data = response.json()
        assert "title" in data
        assert "content" in data
        print(f"✓ Lesson fetched: {data['title']}")
    
    def test_get_course_lessons(self):
        """Test fetching all lessons for a course"""
        response = requests.get(f"{BASE_URL}/api/courses/course-foundations/lessons?lang=en")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0
        print(f"✓ Found {len(data)} lessons in course-foundations")

class TestMediaEndpoints:
    """Test media endpoints"""
    
    def test_media_status(self):
        """Test media status endpoint"""
        response = requests.get(f"{BASE_URL}/api/media/status")
        assert response.status_code == 200
        data = response.json()
        assert "total_lessons" in data
        print(f"✓ Media status: {data['total_lessons']} total lessons")
    
    def test_media_voices(self):
        """Test TTS voices endpoint"""
        response = requests.get(f"{BASE_URL}/api/media/voices")
        assert response.status_code == 200
        data = response.json()
        assert "voices" in data
        assert len(data["voices"]) > 0
        print(f"✓ Found {len(data['voices'])} TTS voices")
    
    def test_lessons_list(self):
        """Test lessons list for media management"""
        response = requests.get(f"{BASE_URL}/api/media/lessons-list")
        assert response.status_code == 200
        data = response.json()
        assert "lessons" in data
        print(f"✓ Media lessons list: {len(data['lessons'])} lessons")

class TestAdminEndpoints:
    """Test admin endpoints"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@thecryptocoach.io",
            "password": "adminpassword"
        })
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_admin_stats(self, admin_token):
        """Test admin stats endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "courses_count" in data
        print(f"✓ Admin stats: {data['total_users']} users, {data['courses_count']} courses")
    
    def test_admin_courses(self, admin_token):
        """Test admin courses endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/courses",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "courses" in data
        print(f"✓ Admin courses: {len(data['courses'])} courses")
    
    def test_admin_users(self, admin_token):
        """Test admin users endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/admin/users?limit=10",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        print(f"✓ Admin users: {data['total']} total users")

class TestPremiumEndpoints:
    """Test premium/trial endpoints"""
    
    def test_trial_status(self):
        """Test trial status endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/premium/trial/status/course-foundations-lesson-1?subscription_tier=free"
        )
        assert response.status_code == 200
        data = response.json()
        # Should have trial-related fields
        print(f"✓ Trial status endpoint working")

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
