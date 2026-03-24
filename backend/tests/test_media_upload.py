"""
Test suite for Media Upload API - Video Upload Feature
Tests the new video upload functionality replacing auto-generation
"""
import pytest
import requests
import os
import tempfile

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://broker-briefing.preview.emergentagent.com')

class TestMediaUploadAPI:
    """Tests for the video upload endpoint and media management"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.admin_email = "admin@thecryptocoach.io"
        self.admin_password = "adminpassword"
        self.token = None
        
    def get_auth_token(self):
        """Get authentication token for admin user"""
        if self.token:
            return self.token
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": self.admin_email, "password": self.admin_password}
        )
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            return self.token
        return None
    
    def test_media_status_endpoint(self):
        """Test GET /api/media/status returns correct structure"""
        response = requests.get(f"{BASE_URL}/api/media/status")
        assert response.status_code == 200
        
        data = response.json()
        assert "total_lessons" in data
        assert "audio_generated" in data
        assert "video_generated" in data
        assert data["total_lessons"] == 23
        print(f"PASS: Media status shows {data['total_lessons']} lessons")
    
    def test_lessons_list_endpoint(self):
        """Test GET /api/media/lessons-list returns all lessons"""
        response = requests.get(f"{BASE_URL}/api/media/lessons-list")
        assert response.status_code == 200
        
        data = response.json()
        assert "lessons" in data
        assert len(data["lessons"]) == 23
        
        # Verify lesson structure
        lesson = data["lessons"][0]
        assert "id" in lesson
        assert "title" in lesson
        assert "media" in lesson
        print(f"PASS: Lessons list returns {len(data['lessons'])} lessons")
    
    def test_voices_endpoint(self):
        """Test GET /api/media/voices returns available TTS voices"""
        response = requests.get(f"{BASE_URL}/api/media/voices")
        assert response.status_code == 200
        
        data = response.json()
        assert "voices" in data
        assert "recommended" in data
        assert len(data["voices"]) > 0
        assert data["recommended"] == "nova"
        print(f"PASS: Voices endpoint returns {len(data['voices'])} voices")
    
    def test_video_upload_endpoint_success(self):
        """Test POST /api/media/upload-video with valid video file"""
        token = self.get_auth_token()
        assert token is not None, "Failed to get auth token"
        
        # Create a small test video file
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
            # Write minimal MP4 header (not a real video, but enough for upload test)
            f.write(b'\x00' * 1024)
            temp_path = f.name
        
        try:
            with open(temp_path, 'rb') as video_file:
                response = requests.post(
                    f"{BASE_URL}/api/media/upload-video",
                    headers={"Authorization": f"Bearer {token}"},
                    files={"video": ("test_video.mp4", video_file, "video/mp4")},
                    data={"lesson_id": "course-foundations-lesson-2", "language": "en"}
                )
            
            assert response.status_code == 200
            data = response.json()
            assert data["success"] == True
            assert "filename" in data
            assert "url" in data
            print(f"PASS: Video upload successful - {data['filename']}")
        finally:
            os.unlink(temp_path)
    
    def test_video_upload_invalid_lesson(self):
        """Test POST /api/media/upload-video with invalid lesson_id"""
        token = self.get_auth_token()
        assert token is not None, "Failed to get auth token"
        
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
            f.write(b'\x00' * 1024)
            temp_path = f.name
        
        try:
            with open(temp_path, 'rb') as video_file:
                response = requests.post(
                    f"{BASE_URL}/api/media/upload-video",
                    headers={"Authorization": f"Bearer {token}"},
                    files={"video": ("test_video.mp4", video_file, "video/mp4")},
                    data={"lesson_id": "invalid-lesson-id", "language": "en"}
                )
            
            assert response.status_code == 404
            print("PASS: Invalid lesson_id correctly returns 404")
        finally:
            os.unlink(temp_path)
    
    def test_video_upload_invalid_language(self):
        """Test POST /api/media/upload-video with invalid language"""
        token = self.get_auth_token()
        assert token is not None, "Failed to get auth token"
        
        with tempfile.NamedTemporaryFile(suffix='.mp4', delete=False) as f:
            f.write(b'\x00' * 1024)
            temp_path = f.name
        
        try:
            with open(temp_path, 'rb') as video_file:
                response = requests.post(
                    f"{BASE_URL}/api/media/upload-video",
                    headers={"Authorization": f"Bearer {token}"},
                    files={"video": ("test_video.mp4", video_file, "video/mp4")},
                    data={"lesson_id": "course-foundations-lesson-1", "language": "invalid"}
                )
            
            assert response.status_code == 400
            print("PASS: Invalid language correctly returns 400")
        finally:
            os.unlink(temp_path)
    
    def test_video_upload_invalid_file_type(self):
        """Test POST /api/media/upload-video with invalid file type"""
        token = self.get_auth_token()
        assert token is not None, "Failed to get auth token"
        
        with tempfile.NamedTemporaryFile(suffix='.txt', delete=False) as f:
            f.write(b'This is not a video file')
            temp_path = f.name
        
        try:
            with open(temp_path, 'rb') as text_file:
                response = requests.post(
                    f"{BASE_URL}/api/media/upload-video",
                    headers={"Authorization": f"Bearer {token}"},
                    files={"video": ("test.txt", text_file, "text/plain")},
                    data={"lesson_id": "course-foundations-lesson-1", "language": "en"}
                )
            
            assert response.status_code == 400
            print("PASS: Invalid file type correctly returns 400")
        finally:
            os.unlink(temp_path)
    
    def test_lesson_media_endpoint(self):
        """Test GET /api/media/lesson/{lesson_id} returns media info"""
        response = requests.get(f"{BASE_URL}/api/media/lesson/course-foundations-lesson-1?lang=en")
        assert response.status_code == 200
        
        data = response.json()
        assert "audio" in data
        assert "video" in data
        print(f"PASS: Lesson media endpoint returns correct structure")
    
    def test_generation_status_endpoint(self):
        """Test GET /api/media/generation-status returns status"""
        response = requests.get(f"{BASE_URL}/api/media/generation-status")
        assert response.status_code == 200
        
        data = response.json()
        assert "audio" in data
        assert "video" in data
        print("PASS: Generation status endpoint works")


class TestAudioGeneration:
    """Tests for audio generation functionality (should still work)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test fixtures"""
        self.admin_email = "admin@thecryptocoach.io"
        self.admin_password = "adminpassword"
        self.token = None
        
    def get_auth_token(self):
        """Get authentication token for admin user"""
        if self.token:
            return self.token
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": self.admin_email, "password": self.admin_password}
        )
        if response.status_code == 200:
            self.token = response.json().get("access_token")
            return self.token
        return None
    
    def test_audio_generation_endpoint_exists(self):
        """Test POST /api/media/generate-audio endpoint exists"""
        # Just verify the endpoint exists and accepts requests
        response = requests.post(
            f"{BASE_URL}/api/media/generate-audio",
            json={"lesson_id": "course-foundations-lesson-1", "language": "en", "voice": "nova"}
        )
        # Should not return 404 (endpoint exists)
        assert response.status_code != 404
        print("PASS: Audio generation endpoint exists")
    
    def test_batch_audio_generation_endpoint_exists(self):
        """Test POST /api/media/generate-batch endpoint exists"""
        response = requests.post(
            f"{BASE_URL}/api/media/generate-batch",
            json={"language": "en", "voice": "nova"}
        )
        # Should not return 404 (endpoint exists)
        # May return 409 if already in progress
        assert response.status_code in [200, 409, 500]
        print("PASS: Batch audio generation endpoint exists")


class TestAdminAuth:
    """Tests for admin authentication"""
    
    def test_admin_login_success(self):
        """Test admin login with correct credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@thecryptocoach.io", "password": "adminpassword"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert "user" in data
        assert data["user"]["email"] == "admin@thecryptocoach.io"
        assert data["user"]["role"] == "admin"
        print("PASS: Admin login successful")
    
    def test_admin_login_wrong_password(self):
        """Test admin login with wrong password"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@thecryptocoach.io", "password": "wrongpassword"}
        )
        assert response.status_code == 401
        print("PASS: Wrong password correctly returns 401")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
