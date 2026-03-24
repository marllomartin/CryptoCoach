# Video/Audio Generation Service for Lessons
# Generates professional TTS audio and video presentations

import os
import asyncio
import base64
import uuid
import tempfile
import httpx
from typing import Dict, List, Optional
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

# Check if openai is available
try:
    from openai import AsyncOpenAI
    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    print("Warning: openai not available for TTS")

# Check if moviepy is available
try:
    from moviepy import ImageClip, AudioFileClip, CompositeVideoClip, TextClip
    MOVIEPY_AVAILABLE = True
except ImportError:
    MOVIEPY_AVAILABLE = False
    print("Warning: moviepy not available for video generation")

from services.content_aggregator import ALL_PREMIUM_LESSONS, get_localized_lesson
from services.lesson_images import get_lesson_images

# Storage directories
AUDIO_DIR = "/app/backend/static/audio"
VIDEO_DIR = "/app/backend/static/video"
os.makedirs(AUDIO_DIR, exist_ok=True)
os.makedirs(VIDEO_DIR, exist_ok=True)

# Video/Audio metadata storage
MEDIA_METADATA = {}

class LessonMediaGenerator:
    """Generates audio narration and video presentations for lessons"""
    
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.tts = None
        if TTS_AVAILABLE and self.api_key:
            self.tts = AsyncOpenAI(api_key=self.api_key)
    
    def _split_text_into_chunks(self, text: str, max_chars: int = 4000) -> List[str]:
        """Split text into chunks respecting sentence boundaries"""
        if len(text) <= max_chars:
            return [text]
        
        chunks = []
        current_chunk = ""
        
        # Split by paragraphs first
        paragraphs = text.split('\n\n')
        
        for para in paragraphs:
            if len(current_chunk) + len(para) + 2 <= max_chars:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                
                # If single paragraph is too long, split by sentences
                if len(para) > max_chars:
                    sentences = para.replace('. ', '.|').replace('? ', '?|').replace('! ', '!|').split('|')
                    current_chunk = ""
                    for sentence in sentences:
                        if len(current_chunk) + len(sentence) + 1 <= max_chars:
                            current_chunk += sentence + " "
                        else:
                            if current_chunk:
                                chunks.append(current_chunk.strip())
                            current_chunk = sentence + " "
                else:
                    current_chunk = para + "\n\n"
        
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def _clean_content_for_speech(self, content: str) -> str:
        """Clean markdown content for better speech"""
        import re
        
        # Remove markdown formatting
        content = re.sub(r'#{1,6}\s*', '', content)  # Headers
        content = re.sub(r'\*\*([^*]+)\*\*', r'\1', content)  # Bold
        content = re.sub(r'\*([^*]+)\*', r'\1', content)  # Italic
        content = re.sub(r'`([^`]+)`', r'\1', content)  # Code
        content = re.sub(r'```[\s\S]*?```', '', content)  # Code blocks
        content = re.sub(r'\|[^\n]+\|', '', content)  # Tables
        content = re.sub(r'[-*]\s+', '', content)  # List bullets
        content = re.sub(r'\d+\.\s+', '', content)  # Numbered lists
        content = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', content)  # Links
        
        # Clean up whitespace
        content = re.sub(r'\n{3,}', '\n\n', content)
        content = re.sub(r'  +', ' ', content)
        
        return content.strip()
    
    def _create_speech_script(self, lesson: Dict, language: str) -> str:
        """Create a professional narration script from lesson content"""
        
        # Language-specific intros
        intros = {
            "en": f"Welcome to {lesson.get('title', 'this lesson')}. ",
            "fr": f"Bienvenue dans {lesson.get('title', 'cette leçon')}. ",
            "ar": f"مرحباً بكم في {lesson.get('title', 'هذا الدرس')}. "
        }
        
        # Language-specific outros
        outros = {
            "en": "\n\nThis concludes our lesson. Thank you for learning with TheCryptoCoach.",
            "fr": "\n\nCeci conclut notre leçon. Merci d'apprendre avec TheCryptoCoach.",
            "ar": "\n\nهذا يختتم درسنا. شكراً للتعلم مع TheCryptoCoach."
        }
        
        # Build script
        script = intros.get(language, intros["en"])
        
        # Add subtitle if available
        if lesson.get('subtitle'):
            script += lesson['subtitle'] + ". "
        
        # Add learning objectives
        objectives = lesson.get('learning_objectives', [])
        if objectives:
            if language == "fr":
                script += "\n\nDans cette leçon, vous allez: "
            elif language == "ar":
                script += "\n\nفي هذا الدرس، ستتعلم: "
            else:
                script += "\n\nIn this lesson, you will: "
            script += ", ".join(objectives) + ". "
        
        # Add main content
        content = lesson.get('content', '')
        if content:
            cleaned_content = self._clean_content_for_speech(content)
            script += "\n\n" + cleaned_content
        
        # Add summary
        if lesson.get('summary'):
            if language == "fr":
                script += "\n\nEn résumé: "
            elif language == "ar":
                script += "\n\nباختصار: "
            else:
                script += "\n\nIn summary: "
            script += lesson['summary']
        
        # Add outro
        script += outros.get(language, outros["en"])
        
        return script
    
    async def generate_lesson_audio(
        self, 
        lesson_id: str, 
        language: str = "en",
        voice: str = "nova",
        model: str = "tts-1-hd"
    ) -> Dict:
        """Generate audio narration for a lesson"""
        
        if not self.tts:
            return {
                "success": False,
                "error": "TTS not available. Check OPENAI_API_KEY configuration."
            }
        
        # Get lesson content
        lesson = get_localized_lesson(lesson_id, language)
        if not lesson:
            return {
                "success": False,
                "error": f"Lesson {lesson_id} not found"
            }
        
        try:
            # Create speech script
            script = self._create_speech_script(lesson, language)
            
            # Split into chunks if needed
            chunks = self._split_text_into_chunks(script)
            
            # Generate audio for each chunk
            audio_parts = []
            for i, chunk in enumerate(chunks):
                print(f"Generating audio chunk {i+1}/{len(chunks)} for {lesson_id}...")
                response = await self.tts.audio.speech.create(
                    input=chunk,
                    model=model,
                    voice=voice,
                    response_format="mp3"
                )
                audio_parts.append(response.read())
            
            # Combine audio parts
            combined_audio = b''.join(audio_parts)
            
            # Save to file
            filename = f"{lesson_id}_{language}_{voice}.mp3"
            filepath = os.path.join(AUDIO_DIR, filename)
            with open(filepath, "wb") as f:
                f.write(combined_audio)
            
            # Store metadata
            metadata = {
                "lesson_id": lesson_id,
                "language": language,
                "voice": voice,
                "model": model,
                "filename": filename,
                "filepath": filepath,
                "url": f"/api/media/audio/{filename}",
                "duration_estimate": len(script) // 15,  # Rough estimate: 15 chars/second
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "script_length": len(script),
                "chunks_count": len(chunks)
            }
            
            MEDIA_METADATA[f"{lesson_id}_{language}_audio"] = metadata
            
            return {
                "success": True,
                "metadata": metadata
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_all_lesson_audio(
        self,
        language: str = "en",
        voice: str = "nova"
    ) -> Dict:
        """Generate audio for all lessons in a language"""
        results = {
            "success": [],
            "failed": [],
            "total": len(ALL_PREMIUM_LESSONS)
        }
        
        for lesson_id in ALL_PREMIUM_LESSONS.keys():
            result = await self.generate_lesson_audio(lesson_id, language, voice)
            if result["success"]:
                results["success"].append(lesson_id)
            else:
                results["failed"].append({
                    "lesson_id": lesson_id,
                    "error": result.get("error")
                })
            
            # Small delay between requests
            await asyncio.sleep(1)
        
        return results
    
    async def generate_lesson_video(
        self,
        lesson_id: str,
        language: str = "en"
    ) -> Dict:
        """Generate video presentation for a lesson with subtle Ken Burns effect"""
        
        if not MOVIEPY_AVAILABLE:
            return {
                "success": False,
                "error": "MoviePy not available. Install with: pip install moviepy"
            }
        
        # Get lesson content
        lesson = get_localized_lesson(lesson_id, language)
        if not lesson:
            return {
                "success": False,
                "error": f"Lesson {lesson_id} not found"
            }
        
        # Get hero image
        images = get_lesson_images(lesson_id)
        hero_image_url = images.get("hero_image")
        if not hero_image_url:
            return {
                "success": False,
                "error": f"No hero image found for lesson {lesson_id}"
            }
        
        # Check if audio exists
        audio_filename = None
        for voice in ["nova", "alloy", "shimmer", "onyx"]:
            audio_file = f"{lesson_id}_{language}_{voice}.mp3"
            audio_path = os.path.join(AUDIO_DIR, audio_file)
            if os.path.exists(audio_path):
                audio_filename = audio_file
                break
        
        if not audio_filename:
            return {
                "success": False,
                "error": f"No audio found for lesson {lesson_id}. Generate audio first."
            }
        
        audio_path = os.path.join(AUDIO_DIR, audio_filename)
        
        try:
            # Download hero image to temp file
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.get(hero_image_url)
                if response.status_code != 200:
                    return {
                        "success": False,
                        "error": f"Failed to download hero image: {response.status_code}"
                    }
                image_bytes = response.content
            
            # Save image temporarily
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp_img:
                tmp_img.write(image_bytes)
                tmp_image_path = tmp_img.name
            
            try:
                from PIL import Image
                import numpy as np
                
                # Load audio
                audio_clip = AudioFileClip(audio_path)
                duration = audio_clip.duration
                
                # Video dimensions
                VIDEO_WIDTH = 1280
                VIDEO_HEIGHT = 720
                FPS = 24
                
                # Load and prepare image
                img = Image.open(tmp_image_path).convert('RGB')
                
                # Scale image to be 40% larger for more pronounced Ken Burns effect
                scale = max(VIDEO_WIDTH / img.width, VIDEO_HEIGHT / img.height) * 1.4
                new_w = int(img.width * scale)
                new_h = int(img.height * scale)
                img_large = img.resize((new_w, new_h), Image.LANCZOS)
                
                # Calculate total frames needed
                total_frames = int(duration * FPS)
                
                def make_frame(t):
                    progress = t / duration
                    
                    # Ken Burns: zoom from 1.0 to 1.2 (more zoom), pan from left to right
                    zoom = 1.0 + (0.2 * progress)
                    crop_w = int(VIDEO_WIDTH / zoom)
                    crop_h = int(VIDEO_HEIGHT / zoom)
                    
                    # Pan from 20% to 80% of available space
                    max_x = new_w - crop_w
                    max_y = new_h - crop_h
                    x = int(max_x * (0.1 + 0.8 * progress))
                    y = int(max_y * (0.4 + 0.2 * progress))  # Slight vertical movement too
                    
                    x = max(0, min(x, max_x))
                    y = max(0, min(y, max_y))
                    
                    # Crop and resize
                    crop = img_large.crop((x, y, x + crop_w, y + crop_h))
                    frame = crop.resize((VIDEO_WIDTH, VIDEO_HEIGHT), Image.LANCZOS)
                    frame_array = np.array(frame)
                    
                    # Add progress bar at bottom (4 pixels high)
                    bar_progress = int(VIDEO_WIDTH * progress)
                    frame_array[-4:, :, :] = [30, 30, 30]  # Dark background
                    if bar_progress > 0:
                        # Blue gradient progress bar
                        frame_array[-4:, :bar_progress, 0] = 99   # R
                        frame_array[-4:, :bar_progress, 1] = 102  # G  
                        frame_array[-4:, :bar_progress, 2] = 241  # B
                    
                    return frame_array
                
                # Create video
                from moviepy import VideoClip
                video_clip = VideoClip(make_frame, duration=duration)
                video_clip = video_clip.with_fps(24)
                video_clip = video_clip.with_audio(audio_clip)
                
                # Output
                video_filename = f"{lesson_id}_{language}.mp4"
                video_path = os.path.join(VIDEO_DIR, video_filename)
                
                print(f"Generating video for {lesson_id}_{language}...")
                video_clip.write_videofile(
                    video_path,
                    fps=24,
                    codec="libx264",
                    audio_codec="aac",
                    bitrate="1500k",
                    preset="fast",
                    temp_audiofile=f"/tmp/{lesson_id}_{language}_temp.m4a",
                    remove_temp=True,
                    logger=None
                )
                
                audio_clip.close()
                video_clip.close()
                
                metadata = {
                    "lesson_id": lesson_id,
                    "language": language,
                    "filename": video_filename,
                    "filepath": video_path,
                    "url": f"/api/media/video/{video_filename}",
                    "duration": duration,
                    "effects": ["ken_burns", "progress_bar"],
                    "generated_at": datetime.now(timezone.utc).isoformat()
                }
                
                MEDIA_METADATA[f"{lesson_id}_{language}_video"] = metadata
                
                return {"success": True, "metadata": metadata}
                
            finally:
                if os.path.exists(tmp_image_path):
                    os.unlink(tmp_image_path)
                    
        except Exception as e:
            import traceback
            print(f"Video generation error: {traceback.format_exc()}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_all_lesson_videos(
        self,
        language: str = "en"
    ) -> Dict:
        """Generate video for all lessons in a language"""
        results = {
            "success": [],
            "failed": [],
            "total": len(ALL_PREMIUM_LESSONS)
        }
        
        for lesson_id in ALL_PREMIUM_LESSONS.keys():
            result = await self.generate_lesson_video(lesson_id, language)
            if result["success"]:
                results["success"].append(lesson_id)
            else:
                results["failed"].append({
                    "lesson_id": lesson_id,
                    "error": result.get("error")
                })
            
            # Small delay between generations
            await asyncio.sleep(1)
        
        return results
    
    def get_lesson_media(self, lesson_id: str, language: str = "en") -> Dict:
        """Get media URLs for a lesson"""
        audio_key = f"{lesson_id}_{language}_audio"
        video_key = f"{lesson_id}_{language}_video"
        
        result = {
            "lesson_id": lesson_id,
            "language": language,
            "audio": None,
            "video": None
        }
        
        if audio_key in MEDIA_METADATA:
            result["audio"] = MEDIA_METADATA[audio_key]
        
        if video_key in MEDIA_METADATA:
            result["video"] = MEDIA_METADATA[video_key]
        
        # Check if audio file exists on disk
        for voice in ["nova", "alloy", "shimmer", "onyx"]:
            filename = f"{lesson_id}_{language}_{voice}.mp3"
            filepath = os.path.join(AUDIO_DIR, filename)
            if os.path.exists(filepath):
                result["audio"] = {
                    "url": f"/api/media/audio/{filename}",
                    "voice": voice,
                    "language": language
                }
                break
        
        # Check if video file exists on disk
        video_filename = f"{lesson_id}_{language}.mp4"
        video_filepath = os.path.join(VIDEO_DIR, video_filename)
        if os.path.exists(video_filepath):
            result["video"] = {
                "url": f"/api/media/video/{video_filename}",
                "language": language
            }
        
        return result
    
    def get_all_media_status(self) -> Dict:
        """Get status of all generated media"""
        status = {
            "total_lessons": len(ALL_PREMIUM_LESSONS),
            "audio_generated": {},
            "video_generated": {},
            "pending_audio": [],
            "pending_video": []
        }
        
        for lesson_id in ALL_PREMIUM_LESSONS.keys():
            for lang in ["en", "fr", "ar"]:
                media = self.get_lesson_media(lesson_id, lang)
                
                if media["audio"]:
                    if lang not in status["audio_generated"]:
                        status["audio_generated"][lang] = []
                    status["audio_generated"][lang].append(lesson_id)
                else:
                    status["pending_audio"].append(f"{lesson_id}_{lang}")
                
                if media["video"]:
                    if lang not in status["video_generated"]:
                        status["video_generated"][lang] = []
                    status["video_generated"][lang].append(lesson_id)
                else:
                    status["pending_video"].append(f"{lesson_id}_{lang}")
        
        return status


# Global instance
media_generator = LessonMediaGenerator()
