#!/usr/bin/env python3
"""
Generate all premium media (audio + video) for all 23 lessons in EN and FR
Optimized for speed - runs in sequence to avoid overloading
"""
import asyncio
import httpx
import sys
import time

API_BASE = "http://localhost:8001/api"

# All 23 lessons
LESSONS = [
    "course-foundations-lesson-1",
    "course-foundations-lesson-2",
    "course-foundations-lesson-3",
    "course-foundations-lesson-4",
    "course-foundations-lesson-5",
    "course-foundations-lesson-6",
    "course-foundations-lesson-7",
    "course-foundations-lesson-8",
    "course-investor-lesson-1",
    "course-investor-lesson-2",
    "course-investor-lesson-3",
    "course-investor-lesson-4",
    "course-investor-lesson-5",
    "course-investor-lesson-6",
    "course-investor-lesson-7",
    "course-investor-lesson-8",
    "course-strategist-lesson-1",
    "course-strategist-lesson-2",
    "course-strategist-lesson-3",
    "course-strategist-lesson-4",
    "course-strategist-lesson-5",
    "course-strategist-lesson-6",
    "course-strategist-lesson-7",
]

LANGUAGES = ["en", "fr"]

async def generate_audio(client, lesson_id, language):
    """Generate audio for a lesson"""
    try:
        response = await client.post(
            f"{API_BASE}/media/generate-audio",
            json={
                "lesson_id": lesson_id,
                "language": language,
                "voice": "nova",
                "model": "tts-1-hd"
            },
            timeout=180.0
        )
        data = response.json()
        return data.get("success", False), data.get("error", "")
    except Exception as e:
        return False, str(e)

async def generate_video(client, lesson_id, language):
    """Generate video for a lesson"""
    try:
        response = await client.post(
            f"{API_BASE}/media/generate-video",
            json={
                "lesson_id": lesson_id,
                "language": language
            },
            timeout=300.0
        )
        data = response.json()
        return data.get("success", False), data.get("error", "")
    except Exception as e:
        return False, str(e)

async def check_media(client, lesson_id, language):
    """Check if media exists"""
    try:
        response = await client.get(
            f"{API_BASE}/media/lesson/{lesson_id}",
            params={"lang": language},
            timeout=10.0
        )
        data = response.json()
        return data.get("audio") is not None, data.get("video") is not None
    except:
        return False, False

async def main():
    start_time = time.time()
    print("=" * 60)
    print("GENERATING ALL MEDIA - 23 LESSONS x 2 LANGUAGES")
    print("=" * 60)
    
    async with httpx.AsyncClient() as client:
        # Phase 1: Generate all missing audios
        print("\n[PHASE 1] GENERATING AUDIOS...")
        for lang in LANGUAGES:
            for lesson in LESSONS:
                has_audio, _ = await check_media(client, lesson, lang)
                if not has_audio:
                    print(f"  Audio {lesson} ({lang})...", end=" ", flush=True)
                    ok, err = await generate_audio(client, lesson, lang)
                    print("OK" if ok else f"FAIL: {err}")
        
        # Phase 2: Generate all videos
        print("\n[PHASE 2] GENERATING VIDEOS...")
        for lang in LANGUAGES:
            for lesson in LESSONS:
                _, has_video = await check_media(client, lesson, lang)
                if not has_video:
                    print(f"  Video {lesson} ({lang})...", end=" ", flush=True)
                    ok, err = await generate_video(client, lesson, lang)
                    print("OK" if ok else f"FAIL: {err}")
    
    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"DONE in {elapsed/60:.1f} minutes")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(main())
