# Admin routes for TheCryptoCoach.io
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import os

admin_router = APIRouter(prefix="/admin", tags=["admin"])

# ==================== MODELS ====================

class AdminUser(BaseModel):
    email: str
    role: str  # "admin" or "moderator"
    permissions: List[str]

class CourseCreate(BaseModel):
    title: str
    description: str
    level: int = Field(ge=1, le=3)
    thumbnail: Optional[str] = None
    topics: List[str] = []

class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    level: Optional[int] = None
    thumbnail: Optional[str] = None
    topics: Optional[List[str]] = None
    is_published: Optional[bool] = None

class LessonCreate(BaseModel):
    course_id: str
    title: str
    objectives: List[str] = []
    content: str
    examples: List[str] = []
    summary: str = ""
    readings: List[str] = []
    order: int = 0

class LessonUpdate(BaseModel):
    title: Optional[str] = None
    objectives: Optional[List[str]] = None
    content: Optional[str] = None
    examples: Optional[List[str]] = None
    summary: Optional[str] = None
    readings: Optional[List[str]] = None
    hero_image: Optional[str] = None
    audio_url: Optional[str] = None
    order: Optional[int] = None
    checkpoints: Optional[List[Dict]] = None

class QuizCreate(BaseModel):
    lesson_id: str
    questions: List[Dict[str, Any]]

class BlogPostCreate(BaseModel):
    title: str
    slug: str
    excerpt: str
    content: str
    category: str
    tags: List[str] = []
    featured_image: Optional[str] = None

class BlogPostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    excerpt: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    featured_image: Optional[str] = None
    is_published: Optional[bool] = None

class UserUpdate(BaseModel):
    role: Optional[str] = None
    subscription_tier: Optional[str] = None
    subscription_expires: Optional[str] = None
    is_banned: Optional[bool] = None

class GenerateContentRequest(BaseModel):
    prompt: str
    content_type: str  # "lesson", "quiz", "blog"
    additional_context: Optional[str] = None

class StatsResponse(BaseModel):
    total_users: int
    active_subscriptions: Dict[str, int]
    total_revenue: float
    courses_count: int
    lessons_count: int
    blog_posts_count: int
    recent_signups: int
    popular_courses: List[Dict]

# Admin configuration - emails with admin access
ADMIN_EMAILS = [
    "admin@thecryptocoach.io",
    "mehdi@thecryptocoach.io"
]

MODERATOR_EMAILS = []

def get_admin_config():
    return {
        "admin_emails": ADMIN_EMAILS,
        "moderator_emails": MODERATOR_EMAILS
    }
