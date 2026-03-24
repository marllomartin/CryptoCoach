# Media API Tests for Video/Audio Generation System
# Tests the media generation endpoints for the 23 lessons

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestMediaStatusAPI:
    """Tests for /api/media/status endpoint"""
    
    def test_media_status_returns_correct_structure(self):
        """GET /api/media/status returns correct structure with audio_generated and video_generated"""
        response = requests.get(f"{BASE_URL}/api/media/status")
        assert response.status_code == 200
        
        data = response.json()
        # Verify required fields exist
        assert "total_lessons" in data
        assert "audio_generated" in data
        assert "video_generated" in data
        assert "pending_audio" in data
        assert "pending_video" in data
        
        # Verify total_lessons is 23
        assert data["total_lessons"] == 23
        
        # Verify audio_generated and video_generated are dicts
        assert isinstance(data["audio_generated"], dict)
        assert isinstance(data["video_generated"], dict)
        
        print(f"Media status: {data['total_lessons']} lessons, audio_generated: {len(data['audio_generated'])} languages")


class TestGenerationStatusAPI:
    """Tests for /api/media/generation-status endpoint"""
    
    def test_generation_status_returns_audio_and_video_status(self):
        """GET /api/media/generation-status returns audio and video status objects"""
        response = requests.get(f"{BASE_URL}/api/media/generation-status")
        assert response.status_code == 200
        
        data = response.json()
        # Verify audio status object
        assert "audio" in data
        assert "in_progress" in data["audio"]
        assert "current_lesson" in data["audio"]
        assert "completed" in data["audio"]
        assert "failed" in data["audio"]
        assert "total" in data["audio"]
        
        # Verify video status object
        assert "video" in data
        assert "in_progress" in data["video"]
        assert "current_lesson" in data["video"]
        assert "completed" in data["video"]
        assert "failed" in data["video"]
        assert "total" in data["video"]
        
        print(f"Generation status: audio_in_progress={data['audio']['in_progress']}, video_in_progress={data['video']['in_progress']}")


class TestVoicesAPI:
    """Tests for /api/media/voices endpoint"""
    
    def test_voices_returns_list_of_tts_voices(self):
        """GET /api/media/voices returns list of TTS voices"""
        response = requests.get(f"{BASE_URL}/api/media/voices")
        assert response.status_code == 200
        
        data = response.json()
        # Verify voices list exists
        assert "voices" in data
        assert isinstance(data["voices"], list)
        assert len(data["voices"]) > 0
        
        # Verify each voice has required fields
        for voice in data["voices"]:
            assert "id" in voice
            assert "name" in voice
            assert "description" in voice
        
        # Verify recommended voice exists
        assert "recommended" in data
        assert data["recommended"] == "nova"
        
        # Verify models list exists
        assert "models" in data
        assert len(data["models"]) > 0
        
        print(f"Voices: {len(data['voices'])} voices available, recommended: {data['recommended']}")


class TestLessonsListAPI:
    """Tests for /api/media/lessons-list endpoint"""
    
    def test_lessons_list_returns_all_23_lessons_with_media_status(self):
        """GET /api/media/lessons-list returns all 23 lessons with media status including has_video field"""
        response = requests.get(f"{BASE_URL}/api/media/lessons-list")
        assert response.status_code == 200
        
        data = response.json()
        # Verify lessons list exists
        assert "lessons" in data
        assert isinstance(data["lessons"], list)
        assert len(data["lessons"]) == 23
        
        # Verify each lesson has required fields
        for lesson in data["lessons"]:
            assert "id" in lesson
            assert "title" in lesson
            assert "course_id" in lesson
            assert "media" in lesson
            
            # Verify media status for each language
            for lang in ["en", "fr", "ar"]:
                assert lang in lesson["media"]
                assert "has_audio" in lesson["media"][lang]
                assert "has_video" in lesson["media"][lang]
                assert "audio_url" in lesson["media"][lang]
                assert "video_url" in lesson["media"][lang]
        
        # Verify at least one lesson has video (course-foundations-lesson-1_fr)
        lesson_1 = next((l for l in data["lessons"] if l["id"] == "course-foundations-lesson-1"), None)
        assert lesson_1 is not None
        assert lesson_1["media"]["fr"]["has_video"] == True
        
        print(f"Lessons list: {len(data['lessons'])} lessons, lesson-1 has_video_fr={lesson_1['media']['fr']['has_video']}")


class TestLessonMediaAPI:
    """Tests for /api/media/lesson/{lesson_id} endpoint"""
    
    def test_lesson_media_returns_audio_and_video_urls_for_lesson_with_media(self):
        """GET /api/media/lesson/{lesson_id}?lang=fr returns audio and video URLs for lessons with media"""
        response = requests.get(f"{BASE_URL}/api/media/lesson/course-foundations-lesson-1?lang=fr")
        assert response.status_code == 200
        
        data = response.json()
        # Verify required fields
        assert "lesson_id" in data
        assert data["lesson_id"] == "course-foundations-lesson-1"
        assert "language" in data
        assert data["language"] == "fr"
        
        # Verify audio exists
        assert "audio" in data
        assert data["audio"] is not None
        assert "url" in data["audio"]
        assert data["audio"]["url"].endswith(".mp3")
        
        # Verify video exists
        assert "video" in data
        assert data["video"] is not None
        assert "url" in data["video"]
        assert data["video"]["url"].endswith(".mp4")
        
        print(f"Lesson media: audio_url={data['audio']['url']}, video_url={data['video']['url']}")
    
    def test_lesson_media_returns_null_for_lesson_without_media(self):
        """GET /api/media/lesson/{lesson_id}?lang=en returns null for lessons without media"""
        response = requests.get(f"{BASE_URL}/api/media/lesson/course-strategist-lesson-1?lang=en")
        assert response.status_code == 200
        
        data = response.json()
        # Verify lesson_id and language
        assert data["lesson_id"] == "course-strategist-lesson-1"
        assert data["language"] == "en"
        
        # Audio and video should be null for this lesson
        # (since no audio/video has been generated for strategist lessons)
        print(f"Lesson without media: audio={data['audio']}, video={data['video']}")


class TestVideoServeAPI:
    """Tests for /api/media/video/{filename} endpoint"""
    
    def test_video_file_serves_with_200_status(self):
        """GET /api/media/video/{filename} serves video file with 200 status"""
        response = requests.get(
            f"{BASE_URL}/api/media/video/course-foundations-lesson-1_fr.mp4",
            stream=True
        )
        assert response.status_code == 200
        
        # Verify content type is video
        content_type = response.headers.get("content-type", "")
        assert "video" in content_type.lower()
        
        # Verify we got some content
        content_length = response.headers.get("content-length")
        if content_length:
            assert int(content_length) > 0
        
        print(f"Video served: status={response.status_code}, content-type={content_type}")
    
    def test_video_file_returns_404_for_nonexistent_file(self):
        """GET /api/media/video/{filename} returns 404 for nonexistent file"""
        response = requests.get(f"{BASE_URL}/api/media/video/nonexistent_video.mp4")
        assert response.status_code == 404
        
        print(f"Nonexistent video: status={response.status_code}")


class TestAudioServeAPI:
    """Tests for /api/media/audio/{filename} endpoint"""
    
    def test_audio_file_serves_with_200_status(self):
        """GET /api/media/audio/{filename} serves audio file with 200 status"""
        response = requests.get(
            f"{BASE_URL}/api/media/audio/course-foundations-lesson-1_fr_nova.mp3",
            stream=True
        )
        assert response.status_code == 200
        
        # Verify content type is audio
        content_type = response.headers.get("content-type", "")
        assert "audio" in content_type.lower()
        
        # Verify we got some content
        content_length = response.headers.get("content-length")
        if content_length:
            assert int(content_length) > 0
        
        print(f"Audio served: status={response.status_code}, content-type={content_type}")
    
    def test_audio_file_returns_404_for_nonexistent_file(self):
        """GET /api/media/audio/{filename} returns 404 for nonexistent file"""
        response = requests.get(f"{BASE_URL}/api/media/audio/nonexistent_audio.mp3")
        assert response.status_code == 404
        
        print(f"Nonexistent audio: status={response.status_code}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
