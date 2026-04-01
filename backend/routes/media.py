# Media Generation Routes for Admin
# API endpoints for generating and serving lesson audio/video

from fastapi import APIRouter, HTTPException, BackgroundTasks, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List
import os
import shutil

from services.media_generator import media_generator, AUDIO_DIR, VIDEO_DIR
from services.content_aggregator import ALL_LESSONS

media_router = APIRouter(prefix="/api/media", tags=["Media"])

class AudioGenerationRequest(BaseModel):
    lesson_id: str
    language: str = "en"
    voice: str = "nova"  # nova, alloy, shimmer, onyx, echo, fable, sage, coral, ash
    model: str = "tts-1-hd"  # tts-1 or tts-1-hd

class VideoGenerationRequest(BaseModel):
    lesson_id: str
    language: str = "en"

class BatchAudioRequest(BaseModel):
    language: str = "en"
    voice: str = "nova"
    lesson_ids: Optional[List[str]] = None  # None = all lessons

class BatchVideoRequest(BaseModel):
    language: str = "en"
    lesson_ids: Optional[List[str]] = None  # None = all lessons

# Background task status
generation_status = {
    "audio": {
        "in_progress": False,
        "current_lesson": None,
        "completed": [],
        "failed": [],
        "total": 0
    },
    "video": {
        "in_progress": False,
        "current_lesson": None,
        "completed": [],
        "failed": [],
        "total": 0
    }
}

@media_router.get("/status")
async def get_media_status():
    """Get status of all generated media"""
    return media_generator.get_all_media_status()

@media_router.get("/generation-status")
async def get_generation_status():
    """Get status of current batch generation (audio and video)"""
    return generation_status

@media_router.get("/lesson/{lesson_id}")
async def get_lesson_media(lesson_id: str, lang: str = "en"):
    """Get media URLs for a specific lesson"""
    media = media_generator.get_lesson_media(lesson_id, lang)
    return media

@media_router.get("/audio/{filename}")
async def serve_audio(filename: str):
    """Serve audio file"""
    filepath = os.path.join(AUDIO_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Audio file not found")
    return FileResponse(filepath, media_type="audio/mpeg")

@media_router.get("/video/{filename}")
async def serve_video(filename: str):
    """Serve video file"""
    filepath = os.path.join(VIDEO_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Video file not found")
    return FileResponse(filepath, media_type="video/mp4")

@media_router.post("/generate-audio")
async def generate_lesson_audio(request: AudioGenerationRequest):
    """Generate audio for a single lesson"""
    result = await media_generator.generate_lesson_audio(
        lesson_id=request.lesson_id,
        language=request.language,
        voice=request.voice,
        model=request.model
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Generation failed"))
    
    return result

async def batch_generate_audio_task(language: str, voice: str, lesson_ids: List[str]):
    """Background task for batch audio generation"""
    global generation_status
    
    generation_status["audio"]["in_progress"] = True
    generation_status["audio"]["completed"] = []
    generation_status["audio"]["failed"] = []
    generation_status["audio"]["total"] = len(lesson_ids)
    
    for lesson_id in lesson_ids:
        generation_status["audio"]["current_lesson"] = lesson_id
        
        result = await media_generator.generate_lesson_audio(
            lesson_id=lesson_id,
            language=language,
            voice=voice,
            model="tts-1-hd"
        )
        
        if result["success"]:
            generation_status["audio"]["completed"].append(lesson_id)
        else:
            generation_status["audio"]["failed"].append({
                "lesson_id": lesson_id,
                "error": result.get("error")
            })
    
    generation_status["audio"]["in_progress"] = False
    generation_status["audio"]["current_lesson"] = None

async def batch_generate_video_task(language: str, lesson_ids: List[str]):
    """Background task for batch video generation"""
    global generation_status
    
    generation_status["video"]["in_progress"] = True
    generation_status["video"]["completed"] = []
    generation_status["video"]["failed"] = []
    generation_status["video"]["total"] = len(lesson_ids)
    
    for lesson_id in lesson_ids:
        generation_status["video"]["current_lesson"] = lesson_id
        
        result = await media_generator.generate_lesson_video(
            lesson_id=lesson_id,
            language=language
        )
        
        if result["success"]:
            generation_status["video"]["completed"].append(lesson_id)
        else:
            generation_status["video"]["failed"].append({
                "lesson_id": lesson_id,
                "error": result.get("error")
            })
    
    generation_status["video"]["in_progress"] = False
    generation_status["video"]["current_lesson"] = None

@media_router.post("/generate-batch")
async def generate_batch_audio(request: BatchAudioRequest, background_tasks: BackgroundTasks):
    """Start batch audio generation for multiple lessons"""
    global generation_status
    
    if generation_status["audio"]["in_progress"]:
        raise HTTPException(status_code=409, detail="Audio generation already in progress")
    
    lesson_ids = request.lesson_ids or list(ALL_LESSONS.keys())
    
    background_tasks.add_task(
        batch_generate_audio_task,
        request.language,
        request.voice,
        lesson_ids
    )
    
    return {
        "message": "Batch audio generation started",
        "total_lessons": len(lesson_ids),
        "language": request.language,
        "voice": request.voice
    }

@media_router.post("/generate-video")
async def generate_lesson_video(request: VideoGenerationRequest):
    """Generate video for a single lesson"""
    result = await media_generator.generate_lesson_video(
        lesson_id=request.lesson_id,
        language=request.language
    )
    
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result.get("error", "Video generation failed"))
    
    return result

@media_router.post("/generate-batch-video")
async def generate_batch_video(request: BatchVideoRequest, background_tasks: BackgroundTasks):
    """Start batch video generation for multiple lessons"""
    global generation_status
    
    if generation_status["video"]["in_progress"]:
        raise HTTPException(status_code=409, detail="Video generation already in progress")
    
    lesson_ids = request.lesson_ids or list(ALL_LESSONS.keys())
    
    background_tasks.add_task(
        batch_generate_video_task,
        request.language,
        lesson_ids
    )
    
    return {
        "message": "Batch video generation started",
        "total_lessons": len(lesson_ids),
        "language": request.language
    }

@media_router.get("/voices")
async def get_available_voices():
    """Get list of available TTS voices"""
    return {
        "voices": [
            {"id": "alloy", "name": "Alloy", "description": "Neutral, balanced"},
            {"id": "ash", "name": "Ash", "description": "Clear, articulate"},
            {"id": "coral", "name": "Coral", "description": "Warm, friendly"},
            {"id": "echo", "name": "Echo", "description": "Smooth, calm"},
            {"id": "fable", "name": "Fable", "description": "Expressive, storytelling"},
            {"id": "nova", "name": "Nova", "description": "Energetic, upbeat (recommended)"},
            {"id": "onyx", "name": "Onyx", "description": "Deep, authoritative"},
            {"id": "sage", "name": "Sage", "description": "Wise, measured"},
            {"id": "shimmer", "name": "Shimmer", "description": "Bright, cheerful"}
        ],
        "recommended": "nova",
        "models": [
            {"id": "tts-1", "name": "Standard", "description": "Fast, good quality"},
            {"id": "tts-1-hd", "name": "HD Quality", "description": "Best quality, slower"}
        ]
    }

@media_router.get("/lessons-list")
async def get_lessons_for_generation():
    """Get list of all lessons with their media status"""
    lessons = []
    for lesson_id, lesson_data in ALL_LESSONS.items():
        lesson_info = {
            "id": lesson_id,
            "title": lesson_data.get("title", {}).get("en", lesson_id),
            "course_id": lesson_data.get("course_id"),
            "duration_minutes": lesson_data.get("duration_minutes", 0),
            "media": {}
        }
        
        for lang in ["en", "fr", "ar"]:
            media = media_generator.get_lesson_media(lesson_id, lang)
            lesson_info["media"][lang] = {
                "has_audio": media["audio"] is not None,
                "audio_url": media["audio"]["url"] if media["audio"] else None,
                "has_video": media["video"] is not None,
                "video_url": media["video"]["url"] if media["video"] else None
            }
        
        lessons.append(lesson_info)
    
    return {"lessons": lessons}


# Maximum file size for video upload (500MB)
MAX_VIDEO_SIZE = 500 * 1024 * 1024

@media_router.post("/upload-video")
async def upload_lesson_video(
    video: UploadFile = File(...),
    lesson_id: str = Form(...),
    language: str = Form("en")
):
    """Upload a video file for a specific lesson"""
    
    # Validate lesson exists
    if lesson_id not in ALL_LESSONS:
        raise HTTPException(status_code=404, detail=f"Lesson '{lesson_id}' not found")
    
    # Validate language
    if language not in ["en", "fr", "ar"]:
        raise HTTPException(status_code=400, detail="Invalid language. Use 'en', 'fr', or 'ar'")
    
    # Validate file type
    allowed_types = ["video/mp4", "video/webm", "video/quicktime"]
    if video.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Create video directory if not exists
    os.makedirs(VIDEO_DIR, exist_ok=True)
    
    # Generate filename
    extension = ".mp4"
    if video.content_type == "video/webm":
        extension = ".webm"
    elif video.content_type == "video/quicktime":
        extension = ".mov"
    
    filename = f"{lesson_id}_{language}{extension}"
    filepath = os.path.join(VIDEO_DIR, filename)
    
    try:
        # Save file
        with open(filepath, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        # Get file size
        file_size = os.path.getsize(filepath)
        
        # Check file size after upload
        if file_size > MAX_VIDEO_SIZE:
            os.remove(filepath)
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum size is {MAX_VIDEO_SIZE // (1024*1024)}MB"
            )
        
        return {
            "success": True,
            "message": f"Video uploaded successfully for lesson '{lesson_id}' ({language})",
            "filename": filename,
            "url": f"/api/media/video/{filename}",
            "size_mb": round(file_size / (1024 * 1024), 2)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        # Clean up on error
        if os.path.exists(filepath):
            os.remove(filepath)
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
