# Media generation service for TheCryptoCoach.io
# Handles TTS audio and image generation for course content

import os
import uuid
import asyncio
import hashlib
from typing import Optional, List, Dict
from datetime import datetime, timezone
import logging

logger = logging.getLogger(__name__)

# TTS Configuration
TTS_VOICE = "onyx"  # Deep, authoritative - perfect for education
TTS_MODEL = "tts-1-hd"  # High quality for courses
TTS_SPEED = 1.0

# Storage paths
AUDIO_STORAGE_PATH = "/app/backend/static/audio"
IMAGE_STORAGE_PATH = "/app/backend/static/images"

# Ensure directories exist
os.makedirs(AUDIO_STORAGE_PATH, exist_ok=True)
os.makedirs(IMAGE_STORAGE_PATH, exist_ok=True)


class MediaGenerationService:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self._tts = None
        self._image_gen = None
    
    @property
    def tts(self):
        if self._tts is None:
            from openai import AsyncOpenAI
            self._tts = AsyncOpenAI(api_key=self.api_key)
        return self._tts

    @property
    def image_gen(self):
        if self._image_gen is None:
            from openai import AsyncOpenAI
            self._image_gen = AsyncOpenAI(api_key=self.api_key)
        return self._image_gen
    
    def _get_cache_key(self, text: str, voice: str) -> str:
        """Generate a cache key for audio content"""
        content = f"{text}:{voice}:{TTS_MODEL}"
        return hashlib.md5(content.encode()).hexdigest()
    
    def _chunk_text(self, text: str, max_chars: int = 4000) -> List[str]:
        """Split text into chunks for TTS (max 4096 chars per request)"""
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
                
                # If paragraph itself is too long, split by sentences
                if len(para) > max_chars:
                    sentences = para.replace('. ', '.|').split('|')
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
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def _clean_text_for_tts(self, text: str) -> str:
        """Clean markdown and code from text for better TTS output"""
        import re
        
        # Remove markdown headers
        text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
        
        # Remove markdown formatting
        text = re.sub(r'\*\*([^*]+)\*\*', r'\1', text)  # Bold
        text = re.sub(r'\*([^*]+)\*', r'\1', text)  # Italic
        text = re.sub(r'`([^`]+)`', r'\1', text)  # Inline code
        
        # Remove code blocks
        text = re.sub(r'```[\s\S]*?```', '', text)
        
        # Remove links but keep text
        text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
        
        # Remove tables
        text = re.sub(r'\|[^\n]+\|', '', text)
        text = re.sub(r'^[-|:\s]+$', '', text, flags=re.MULTILINE)
        
        # Clean up multiple newlines
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Remove bullet points formatting
        text = re.sub(r'^[-*]\s+', '', text, flags=re.MULTILINE)
        text = re.sub(r'^\d+\.\s+', '', text, flags=re.MULTILINE)
        
        return text.strip()
    
    async def generate_lesson_audio(
        self, 
        lesson_id: str,
        title: str,
        content: str,
        summary: str,
        voice: str = TTS_VOICE
    ) -> Dict:
        """Generate audio for a lesson - intro, full content, and summary"""
        
        results = {
            "lesson_id": lesson_id,
            "audio_files": {},
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        
        try:
            # Clean content for TTS
            clean_content = self._clean_text_for_tts(content)
            clean_summary = self._clean_text_for_tts(summary)
            
            # Generate intro audio (title + first paragraph)
            intro_text = f"Bienvenue dans cette leçon : {title}. "
            first_para = clean_content.split('\n\n')[0] if '\n\n' in clean_content else clean_content[:500]
            intro_text += first_para
            
            intro_response = await self.tts.audio.speech.create(
                input=intro_text[:4000],
                model=TTS_MODEL,
                voice=voice,
                speed=TTS_SPEED
            )
            intro_audio = intro_response.read()
            
            intro_filename = f"{lesson_id}_intro.mp3"
            intro_path = os.path.join(AUDIO_STORAGE_PATH, intro_filename)
            with open(intro_path, "wb") as f:
                f.write(intro_audio)
            results["audio_files"]["intro"] = f"/static/audio/{intro_filename}"
            
            # Generate full content audio (chunked)
            chunks = self._chunk_text(clean_content)
            full_audio_parts = []
            
            for i, chunk in enumerate(chunks):
                chunk_response = await self.tts.audio.speech.create(
                    input=chunk,
                    model=TTS_MODEL,
                    voice=voice,
                    speed=TTS_SPEED
                )
                full_audio_parts.append(chunk_response.read())
                await asyncio.sleep(0.5)  # Rate limiting
            
            # Combine audio parts
            full_audio = b''.join(full_audio_parts)
            full_filename = f"{lesson_id}_full.mp3"
            full_path = os.path.join(AUDIO_STORAGE_PATH, full_filename)
            with open(full_path, "wb") as f:
                f.write(full_audio)
            results["audio_files"]["full"] = f"/static/audio/{full_filename}"
            
            # Generate summary audio
            if clean_summary:
                summary_intro = "Voici le résumé de cette leçon. "
                summary_response = await self.tts.audio.speech.create(
                    input=summary_intro + clean_summary[:3500],
                    model=TTS_MODEL,
                    voice=voice,
                    speed=TTS_SPEED
                )
                summary_audio = summary_response.read()
                
                summary_filename = f"{lesson_id}_summary.mp3"
                summary_path = os.path.join(AUDIO_STORAGE_PATH, summary_filename)
                with open(summary_path, "wb") as f:
                    f.write(summary_audio)
                results["audio_files"]["summary"] = f"/static/audio/{summary_filename}"
            
            results["status"] = "success"
            logger.info(f"Generated audio for lesson {lesson_id}")
            
        except Exception as e:
            logger.error(f"Error generating audio for lesson {lesson_id}: {e}")
            results["status"] = "error"
            results["error"] = str(e)
        
        return results
    
    async def generate_lesson_image(
        self,
        lesson_id: str,
        title: str,
        topic: str,
        style: str = "modern fintech"
    ) -> Dict:
        """Generate hero image for a lesson"""
        
        try:
            prompt = f"""Professional cryptocurrency education illustration for a lesson about "{title}". 
            Topic: {topic}. 
            Style: {style}, dark theme with blue and purple accents, minimalist, abstract geometric shapes, 
            blockchain-inspired elements, no text, suitable as a hero banner image.
            High quality, professional educational content."""
            
            # Use OpenAI image generation
            import base64
            response = await self.image_gen.images.generate(
                prompt=prompt,
                model="dall-e-3",
                n=1,
                size="1024x1024",
                response_format="b64_json"
            )

            if response.data and len(response.data) > 0:
                image_filename = f"{lesson_id}_hero.png"
                image_path = os.path.join(IMAGE_STORAGE_PATH, image_filename)
                image_bytes = base64.b64decode(response.data[0].b64_json)

                with open(image_path, "wb") as f:
                    f.write(image_bytes)
                
                return {
                    "lesson_id": lesson_id,
                    "image_url": f"/static/images/{image_filename}",
                    "status": "success",
                    "generated_at": datetime.now(timezone.utc).isoformat()
                }
            else:
                return {
                    "lesson_id": lesson_id,
                    "status": "error",
                    "error": "No image generated"
                }
                
        except Exception as e:
            logger.error(f"Error generating image for lesson {lesson_id}: {e}")
            return {
                "lesson_id": lesson_id,
                "status": "error",
                "error": str(e)
            }
    
    async def generate_infographic_prompts(self, lesson_content: str, title: str) -> List[Dict]:
        """Generate prompts for infographics based on lesson content"""
        
        # Key concepts that deserve infographics
        infographic_topics = []
        
        # Detect key concepts from content
        keywords = [
            "blockchain", "wallet", "transaction", "mining", "staking",
            "defi", "nft", "token", "exchange", "security", "keys",
            "consensus", "smart contract", "layer", "protocol"
        ]
        
        content_lower = lesson_content.lower()
        
        for keyword in keywords:
            if keyword in content_lower:
                infographic_topics.append({
                    "topic": keyword,
                    "prompt": f"Create a clean infographic explaining {keyword} in cryptocurrency. Dark theme, blue accents, icons and flowcharts, no text labels, educational style."
                })
        
        return infographic_topics[:3]  # Max 3 infographics per lesson


# Singleton instance
_media_service = None

def get_media_service() -> Optional[MediaGenerationService]:
    global _media_service
    if _media_service is None:
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.warning("OPENAI_API_KEY not found — media generation disabled")
            return None
        _media_service = MediaGenerationService(api_key)
    return _media_service
