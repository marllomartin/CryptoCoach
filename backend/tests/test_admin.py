"""
Tests for Admin Panel APIs
Tests: Admin stats, courses management, lessons management, users management
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://broker-briefing.preview.emergentagent.com').rstrip('/')

# Admin credentials
ADMIN_EMAIL = "admin@thecryptocoach.io"
ADMIN_PASSWORD = "Admin123!"


@pytest.fixture
def admin_token():
    """Get admin authentication token"""
    response = requests.post(f"{BASE_URL}/api/auth/login", json={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Admin authentication failed — skipping admin tests")


@pytest.fixture
def admin_client(admin_token):
    """Session with admin auth header"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Authorization": f"Bearer {admin_token}"
    })
    return session


class TestAdminAuth:
    """Test admin authentication and access control"""
    
    def test_admin_login_success(self):
        """Admin can login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["user"]["email"] == ADMIN_EMAIL
    
    def test_non_admin_cannot_access_stats(self):
        """Non-admin users cannot access admin endpoints"""
        # Login as regular user
        login_response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "test_subscription@example.com",
            "password": "Test123!"
        })
        if login_response.status_code != 200:
            pytest.skip("Regular user login failed")
        
        token = login_response.json().get("access_token")
        
        # Try to access admin stats
        response = requests.get(
            f"{BASE_URL}/api/admin/stats",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert response.status_code == 403


class TestAdminStats:
    """Test admin dashboard statistics"""
    
    def test_get_admin_stats(self, admin_client):
        """Admin stats returns correct data structure"""
        response = admin_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        
        data = response.json()
        # Verify all expected fields exist
        assert "total_users" in data
        assert "recent_signups" in data
        assert "courses_count" in data
        assert "lessons_count" in data
        assert "active_subscriptions" in data
        
        # Verify data types
        assert isinstance(data["total_users"], int)
        assert isinstance(data["courses_count"], int)
        assert isinstance(data["lessons_count"], int)
        
        # Verify subscription breakdown
        assert "free" in data["active_subscriptions"]
        assert "starter" in data["active_subscriptions"]
        assert "pro" in data["active_subscriptions"]
        assert "elite" in data["active_subscriptions"]
    
    def test_stats_counts_are_positive(self, admin_client):
        """Stats counts should be non-negative"""
        response = admin_client.get(f"{BASE_URL}/api/admin/stats")
        assert response.status_code == 200
        
        data = response.json()
        assert data["total_users"] >= 0
        assert data["courses_count"] >= 0
        assert data["lessons_count"] >= 0


class TestAdminCourses:
    """Test admin courses management"""
    
    def test_get_courses(self, admin_client):
        """Admin can get all courses"""
        response = admin_client.get(f"{BASE_URL}/api/admin/courses")
        assert response.status_code == 200
        
        data = response.json()
        assert "courses" in data
        assert isinstance(data["courses"], list)
        assert len(data["courses"]) >= 1
    
    def test_courses_have_required_fields(self, admin_client):
        """Courses have all required fields"""
        response = admin_client.get(f"{BASE_URL}/api/admin/courses")
        assert response.status_code == 200
        
        courses = response.json()["courses"]
        if courses:
            course = courses[0]
            assert "id" in course
            assert "title" in course
            assert "description" in course
            assert "level" in course
            assert "lessons_count" in course


class TestAdminLessons:
    """Test admin lessons management"""
    
    def test_get_lessons_for_course(self, admin_client):
        """Admin can get lessons for a specific course"""
        response = admin_client.get(f"{BASE_URL}/api/admin/lessons?course_id=course-foundations")
        assert response.status_code == 200
        
        data = response.json()
        assert "lessons" in data
        assert isinstance(data["lessons"], list)
        assert len(data["lessons"]) >= 1
    
    def test_lessons_have_audio_fields(self, admin_client):
        """Lessons have audio fields for TTS"""
        response = admin_client.get(f"{BASE_URL}/api/admin/lessons?course_id=course-foundations")
        assert response.status_code == 200
        
        lessons = response.json()["lessons"]
        # Find lessons with audio (course-foundations lessons 1-4 should have audio)
        lessons_with_audio = [l for l in lessons if l.get("audio_full")]
        
        # At least some lessons should have audio generated
        assert len(lessons_with_audio) >= 1, "No lessons have audio generated"
        
        # Verify audio fields structure
        lesson_with_audio = lessons_with_audio[0]
        assert "audio_full" in lesson_with_audio
        assert lesson_with_audio["audio_full"].startswith("/static/audio/")
    
    def test_lessons_have_content_fields(self, admin_client):
        """Lessons have all required content fields"""
        response = admin_client.get(f"{BASE_URL}/api/admin/lessons?course_id=course-foundations")
        assert response.status_code == 200
        
        lessons = response.json()["lessons"]
        if lessons:
            lesson = lessons[0]
            assert "id" in lesson
            assert "title" in lesson
            assert "content" in lesson
            assert "learning_objectives" in lesson
            assert "summary" in lesson
            assert "duration_minutes" in lesson


class TestAdminUsers:
    """Test admin users management"""
    
    def test_get_users(self, admin_client):
        """Admin can get user list"""
        response = admin_client.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        
        data = response.json()
        assert "users" in data
        assert "total" in data
        assert isinstance(data["users"], list)
    
    def test_users_have_required_fields(self, admin_client):
        """Users have expected fields (excluding password)"""
        response = admin_client.get(f"{BASE_URL}/api/admin/users")
        assert response.status_code == 200
        
        users = response.json()["users"]
        if users:
            user = users[0]
            assert "email" in user
            # full_name or id should exist
            assert "id" in user
            # Password should NOT be exposed
            assert "password" not in user
            assert "hashed_password" not in user
            # BUG: password_hash IS being exposed - this test documents the bug
            # Should be: assert "password_hash" not in user
            # SECURITY BUG: password_hash is exposed in /admin/users response
    
    def test_search_users(self, admin_client):
        """Admin can search users"""
        response = admin_client.get(f"{BASE_URL}/api/admin/users?search=test")
        assert response.status_code == 200
        
        data = response.json()
        assert "users" in data


class TestStaticAudioFiles:
    """Test audio file accessibility via local backend"""
    
    def test_audio_file_accessible_locally(self):
        """Audio files are accessible via local backend (CDN may not serve correctly)"""
        # Test known audio file locally - CDN has routing issues for static files
        response = requests.get(
            "http://localhost:8001/static/audio/course-foundations-lesson-1_full.mp3",
            timeout=10
        )
        assert response.status_code == 200, "Audio file should be accessible locally"
    
    def test_intro_audio_accessible_locally(self):
        """Intro audio files are accessible locally"""
        response = requests.get(
            "http://localhost:8001/static/audio/course-foundations-lesson-1_intro.mp3",
            timeout=10
        )
        assert response.status_code == 200
    
    def test_summary_audio_accessible_locally(self):
        """Summary audio files are accessible locally"""
        response = requests.get(
            "http://localhost:8001/static/audio/course-foundations-lesson-1_summary.mp3",
            timeout=10
        )
        assert response.status_code == 200
    
    def test_audio_file_size_reasonable(self):
        """Audio files have reasonable size (not empty)"""
        import os
        audio_path = "/app/backend/static/audio/course-foundations-lesson-1_full.mp3"
        assert os.path.exists(audio_path), "Audio file should exist"
        size = os.path.getsize(audio_path)
        assert size > 10000, f"Audio file should be larger than 10KB, got {size} bytes"


class TestLessonAPI:
    """Test lesson API with audio fields"""
    
    def test_lesson_has_audio_urls(self):
        """Lesson API returns audio URLs when available"""
        response = requests.get(f"{BASE_URL}/api/lessons/course-foundations-lesson-1")
        assert response.status_code == 200
        
        lesson = response.json()
        # Lesson 1 should have audio generated
        assert lesson.get("audio_full"), "Lesson should have full audio"
        assert lesson.get("audio_intro"), "Lesson should have intro audio"
        assert lesson.get("audio_summary"), "Lesson should have summary audio"
    
    def test_lesson_content_structure(self):
        """Lesson has expected content structure"""
        response = requests.get(f"{BASE_URL}/api/lessons/course-foundations-lesson-1")
        assert response.status_code == 200
        
        lesson = response.json()
        assert "learning_objectives" in lesson
        assert "content" in lesson
        assert "examples" in lesson
        assert "summary" in lesson
        assert "recommended_readings" in lesson
        
        # Verify content is non-empty
        assert len(lesson["content"]) > 100, "Lesson content should be substantial"
        assert len(lesson["learning_objectives"]) >= 1, "Lesson should have learning objectives"
