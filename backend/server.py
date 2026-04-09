from fastapi import FastAPI, APIRouter, HTTPException, Depends, status, Request, BackgroundTasks, UploadFile, File
from fastapi.responses import Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
import jwt
import bcrypt
import random
import io
import base64
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
import qrcode
from PIL import Image
import stripe as stripe_lib
import httpx

# Import security module
from security import (
    SecurityMiddleware, 
    limiter, 
    brute_force_protection,
    InputSanitizer,
    PasswordSecurity,
    AuditLogger,
    TokenSecurity,
    get_client_ip,
    rate_limit_exceeded_handler,
    RATE_LIMITS
)

# Import v2 routers for the new ecosystem
from routes.gamification import router as gamification_router
from routes.trading_arena import router as trading_router
from routes.media import media_router
from routes.premium import premium_router
from routes.market_intelligence import market_router, newsletter_router, set_database as set_newsletter_db, set_async_database as set_market_async_db

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Sync MongoDB client for newsletter module (uses sync operations)
from pymongo import MongoClient
sync_client = MongoClient(mongo_url)
sync_db = sync_client[os.environ['DB_NAME']]
set_newsletter_db(sync_db)
set_market_async_db(db)  # async Motor db for news_views collection

JWT_SECRET = os.environ.get('JWT_SECRET', 'default_secret_key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')

app = FastAPI(title="TheCryptoCoach.io API")

# Add rate limiter to app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, rate_limit_exceeded_handler)

# Add security middleware
app.add_middleware(SecurityMiddleware)

api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Mount static files for audio/images
static_path = ROOT_DIR / "static"
static_path.mkdir(exist_ok=True)
(static_path / "audio").mkdir(exist_ok=True)
(static_path / "images").mkdir(exist_ok=True)
app.mount("/static", StaticFiles(directory=str(static_path)), name="static")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Admin emails configuration
ADMIN_EMAILS = [e.strip() for e in os.environ.get('ADMIN_EMAILS', '').split(',') if e.strip()]
MODERATOR_EMAILS = [e.strip() for e in os.environ.get('MODERATOR_EMAILS', '').split(',') if e.strip()]

# ==================== SUBSCRIPTION TIERS ====================

SUBSCRIPTION_TIERS = {
    "free": {
        "name": "Free",
        "price": 0.0,
        "features": [
            "Level 1: Crypto Foundations (8 lessons)",
            "Crypto Glossary access",
            "Blog & Insights",
            "Basic leaderboard"
        ],
        "access": {
            "courses": [1],
            "quizzes": True,
            "exams": False,
            "certificates": False,
            "simulator": False,
            "ai_mentor": False
        }
    },
    "starter": {
        "name": "Starter",
        "price": 9.99,
        "features": [
            "Everything in Free +",
            "Level 2: Crypto Investor (8 lessons)",
            "Interactive quizzes",
            "Trading Simulator",
            "Progress tracking"
        ],
        "access": {
            "courses": [1, 2],
            "quizzes": True,
            "exams": False,
            "certificates": False,
            "simulator": True,
            "ai_mentor": False
        }
    },
    "pro": {
        "name": "Pro",
        "price": 19.99,
        "features": [
            "Everything in Starter +",
            "Level 3: Advanced Strategist (7 lessons)",
            "Certification exams",
            "PDF certificates with QR verification",
            "Full leaderboard access"
        ],
        "access": {
            "courses": [1, 2, 3],
            "quizzes": True,
            "exams": True,
            "certificates": True,
            "simulator": True,
            "ai_mentor": False
        }
    },
    "elite": {
        "name": "Elite",
        "price": 25.0,
        "features": [
            "Everything in Pro +",
            "AI Crypto Mentor (CryptoCoach AI)",
            "Exclusive advanced strategies",
            "Priority support",
            "Early access to new content"
        ],
        "access": {
            "courses": [1, 2, 3],
            "quizzes": True,
            "exams": True,
            "certificates": True,
            "simulator": True,
            "ai_mentor": True
        }
    }
}

# ==================== MODELS ====================

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    certificate_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    full_name: str
    created_at: str
    xp_points: int = 0
    completed_lessons: List[str] = []
    completed_quizzes: List[str] = []
    completed_exams: List[str] = []
    certificates: List[str] = []
    streak_days: int = 0
    last_activity: Optional[str] = None
    subscription_tier: str = "free"
    subscription_expires: Optional[str] = None
    role: str = "none"  # none, editor, moderator, admin
    achievements: List[str] = []
    certificate_name: Optional[str] = None
    avatar_url: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    description: str
    level: int
    thumbnail: str
    lessons_count: int
    duration_hours: int
    topics: List[str]

class Lesson(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    course_id: str
    title: str
    order: int
    learning_objectives: List[str]
    content: str
    examples: List[str]
    summary: str
    recommended_readings: List[str]
    duration_minutes: int
    # Enhanced fields for rich media
    hero_image: Optional[str] = None
    audio_intro: Optional[str] = None
    audio_full: Optional[str] = None
    audio_summary: Optional[str] = None
    infographics: List[str] = []
    checkpoints: List[Dict] = []  # In-lesson quiz checkpoints
    interactive_elements: List[Dict] = []  # Simulations, exercises

class QuizQuestion(BaseModel):
    id: str
    question: str
    question_type: str
    options: List[str]
    correct_answer: str
    explanation: str

class Quiz(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    lesson_id: str
    title: str
    questions: List[QuizQuestion]

# ==================== MULTI-LANGUAGE MODELS ====================

SUPPORTED_LANGUAGES = ["en", "fr", "ar", "pt"]

class CourseTranslation(BaseModel):
    title: str
    description: str = ""
    topics: List[str] = []

class CourseCreateRequest(BaseModel):
    level: int
    thumbnail: str = "https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=800"
    duration_hours: int = 0
    color_from: Optional[str] = None
    color_to: Optional[str] = None
    translations: Dict[str, CourseTranslation]

class CourseUpdateRequest(BaseModel):
    level: Optional[int] = None
    thumbnail: Optional[str] = None
    duration_hours: Optional[int] = None
    is_published: Optional[bool] = None
    color_from: Optional[str] = None
    color_to: Optional[str] = None
    translations: Optional[Dict[str, CourseTranslation]] = None

class LessonTranslation(BaseModel):
    title: str
    subtitle: str = ""
    content: str = ""
    learning_objectives: List[str] = []
    examples: List[str] = []
    summary: str = ""
    recommended_readings: List[str] = []
    coach_tip: Optional[str] = None

class LessonCreateRequest(BaseModel):
    course_id: str
    order: int = 0
    duration_minutes: Optional[int] = None
    translations: Dict[str, LessonTranslation]
    checkpoints: List[Dict] = []

class LessonUpdateRequest(BaseModel):
    order: Optional[int] = None
    duration_minutes: Optional[int] = None
    hero_image: Optional[str] = None
    checkpoints: Optional[List[Dict]] = None
    translations: Optional[Dict[str, LessonTranslation]] = None

# ==================== LOCALIZATION HELPERS ====================

def _pick_translation(translations: dict, lang: str) -> Optional[dict]:
    """Return the best available translation, preferring lang → en → any other."""
    for try_lang in [lang, "en"] + [l for l in SUPPORTED_LANGUAGES if l not in (lang, "en")]:
        trans = translations.get(try_lang)
        if trans and trans.get("title", "").strip():
            return trans
    return None

def localize_course(course: dict, lang: str) -> Optional[dict]:
    """Flatten course translations for a given language.
    Falls back to English, then any available language, when the requested
    language has no usable content. Returns as-is for unmigrated records."""
    translations = course.get("translations")
    if not translations:
        return course  # Unmigrated record — return as-is

    trans = _pick_translation(translations, lang)
    if not trans:
        return None

    result = {k: v for k, v in course.items() if k != "translations"}
    result["title"] = trans.get("title", "")
    result["description"] = trans.get("description", "")
    result["topics"] = trans.get("topics", [])
    return result

def localize_lesson(lesson: dict, lang: str) -> Optional[dict]:
    """Flatten lesson translations for a given language.
    Falls back to English, then any available language, when the requested
    language has no usable content. Returns as-is for unmigrated records."""
    translations = lesson.get("translations")
    if not translations:
        return lesson  # Unmigrated record — return as-is

    trans = _pick_translation(translations, lang)
    if not trans:
        return None

    result = {k: v for k, v in lesson.items() if k != "translations"}
    result["title"] = trans.get("title", "")
    result["subtitle"] = trans.get("subtitle", "")
    result["content"] = trans.get("content", "")
    result["learning_objectives"] = trans.get("learning_objectives", [])
    result["examples"] = trans.get("examples", [])
    result["summary"] = trans.get("summary", "")
    result["recommended_readings"] = trans.get("recommended_readings", [])
    result["coach_tip"] = trans.get("coach_tip") or ""

    # Localize checkpoints — their question/options/explanation may be multilingual dicts
    raw_checkpoints = result.get("checkpoints") or []
    localized_checkpoints = []
    for cp in raw_checkpoints:
        lcp = cp.copy()
        for field in ("question", "explanation"):
            val = lcp.get(field)
            if isinstance(val, dict):
                lcp[field] = val.get(lang, val.get("en", ""))
        options = lcp.get("options")
        if isinstance(options, dict):
            lcp["options"] = options.get(lang, options.get("en", []))
        localized_checkpoints.append(lcp)
    result["checkpoints"] = localized_checkpoints

    return result

def validate_translations(translations: dict, entity: str = "course"):
    """Raise HTTPException if translations dict has invalid entries."""
    if not translations:
        raise HTTPException(status_code=400, detail=f"At least one language translation is required for {entity}")
    for lang, trans in translations.items():
        if lang not in SUPPORTED_LANGUAGES:
            raise HTTPException(status_code=400, detail=f"Unsupported language '{lang}'. Supported: {SUPPORTED_LANGUAGES}")
        title = trans.get("title", "") if isinstance(trans, dict) else getattr(trans, "title", "")
        if not str(title).strip():
            raise HTTPException(status_code=400, detail=f"Title is required for language '{lang}'")

def localize_quiz(quiz: dict, lang: str = "en") -> dict:
    """Flatten multilingual quiz questions to a single language.
    Falls back to English for questions that lack a given language."""
    localized = []
    for q in quiz.get("questions", []):
        if "translations" in q:
            t = q["translations"].get(lang) or q["translations"].get("en", {})
            idx = q.get("correct_answer_index", 0)
            options = t.get("options", [])
            localized.append({
                "id": q["id"],
                "question": t.get("question", ""),
                "question_type": q.get("question_type", "multiple_choice"),
                "options": options,
                "correct_answer": options[idx] if idx < len(options) else "",
                "explanation": t.get("explanation", "")
            })
        else:
            localized.append(q)
    return {**quiz, "questions": localized}

class QuizSubmission(BaseModel):
    quiz_id: str
    answers: Dict[str, str]
    lang: str = "en"

class ExamSubmission(BaseModel):
    exam_id: str
    answers: Dict[str, str]

class GlossaryTerm(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    term: str
    definition: str
    category: str
    language: str = "en"

class BlogPost(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    slug: str
    excerpt: str
    content: str
    category: str
    tags: List[str]
    author: str
    published_at: str
    read_time: int = 5
    thumbnail: str = "https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=800"

class ChatMessage(BaseModel):
    message: str
    session_id: Optional[str] = None

class Trade(BaseModel):
    symbol: str
    action: str
    amount: float
    price: float

class ContactForm(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class SubscriptionCheckoutRequest(BaseModel):
    tier: str
    origin_url: str
    coupon_code: Optional[str] = None

class CreatePromotionRequest(BaseModel):
    name: str
    discount_pct: int  # 1–99
    ends_at: str       # ISO datetime string (UTC)

class CreateCouponRequest(BaseModel):
    code: str          # Admin-defined code, e.g. "SUMMER25"
    discount_pct: int  # 1–99
    expires_at: str    # ISO datetime string (UTC)

class ValidateCouponRequest(BaseModel):
    code: str

class SubscriptionResponse(BaseModel):
    tier: str
    name: str
    price: float
    features: List[str]
    access: Dict[str, Any]
    expires: Optional[str] = None
    started: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    full_name: str
    certificate_name: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

# ==================== AUTH HELPERS ====================

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS),
        "iat": datetime.now(timezone.utc)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTH ROUTES ====================

@api_router.get("/health")
async def health_check():
    return {"status": "ok"}

@api_router.post("/auth/register", response_model=TokenResponse)
@limiter.limit(RATE_LIMITS["register"])
async def register(request: Request, user_data: UserCreate):
    client_ip = get_client_ip(request)
    
    # Sanitize and validate email
    clean_email = InputSanitizer.sanitize_email(user_data.email)
    if not clean_email:
        AuditLogger.log_auth_event("REGISTER", user_data.email, client_ip, False, "Invalid email format")
        raise HTTPException(status_code=400, detail="Invalid email format")
    
    # Validate password strength
    is_valid, msg = PasswordSecurity.validate_password(user_data.password)
    if not is_valid:
        AuditLogger.log_auth_event("REGISTER", clean_email, client_ip, False, f"Weak password: {msg}")
        raise HTTPException(status_code=400, detail=msg)
    
    # Sanitize name
    clean_name = InputSanitizer.sanitize_string(user_data.full_name, max_length=100)
    
    # Check for injection attempts
    is_injection, reason = InputSanitizer.detect_injection(user_data.full_name)
    if is_injection:
        AuditLogger.log_security_alert("INJECTION_ATTEMPT", f"Registration name field: {reason}", client_ip)
        raise HTTPException(status_code=400, detail="Invalid characters in name")
    
    existing = await db.users.find_one({"email": clean_email}, {"_id": 0})
    if existing:
        AuditLogger.log_auth_event("REGISTER", clean_email, client_ip, False, "Email already exists")
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    clean_cert_name = InputSanitizer.sanitize_string(user_data.certificate_name or "", max_length=150) or None

    user_doc = {
        "id": user_id,
        "email": clean_email,
        "password_hash": hash_password(user_data.password),
        "full_name": clean_name,
        "certificate_name": clean_cert_name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "xp_points": 0,
        "completed_lessons": [],
        "completed_quizzes": [],
        "completed_exams": [],
        "certificates": [],
        "streak_days": 0,
        "last_activity": None,
        "virtual_balance": 10000.0,
        "portfolio": {},
        "subscription_tier": "free",
        "subscription_expires": None,
        "role": "none",
        "security": {
            "failed_logins": 0,
            "last_login_ip": client_ip,
            "created_ip": client_ip
        }
    }
    await db.users.insert_one(user_doc)
    
    AuditLogger.log_auth_event("REGISTER", clean_email, client_ip, True, "Account created")
    
    token = create_token(user_id)
    user_response = UserResponse(
        id=user_id,
        email=clean_email,
        full_name=clean_name,
        created_at=user_doc["created_at"],
        xp_points=0,
        completed_lessons=[],
        completed_quizzes=[],
        completed_exams=[],
        certificates=[],
        streak_days=0,
        last_activity=None,
        subscription_tier="free",
        subscription_expires=None
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.post("/auth/login", response_model=TokenResponse)
@limiter.limit(RATE_LIMITS["login"])
async def login(request: Request, credentials: UserLogin):
    client_ip = get_client_ip(request)
    
    # Sanitize email
    clean_email = InputSanitizer.sanitize_email(credentials.email)
    if not clean_email:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if IP or account is blocked
    is_blocked, block_msg = brute_force_protection.is_blocked(client_ip, clean_email)
    if is_blocked:
        AuditLogger.log_auth_event("LOGIN", clean_email, client_ip, False, f"Blocked: {block_msg}")
        raise HTTPException(status_code=429, detail=block_msg)
    
    user = await db.users.find_one({"email": clean_email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password_hash"]):
        # Record failed attempt
        brute_force_protection.record_failed_attempt(client_ip, clean_email)
        AuditLogger.log_auth_event("LOGIN", clean_email, client_ip, False, "Invalid credentials")
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Successful login - clear failed attempts
    brute_force_protection.record_successful_login(client_ip, clean_email)
    
    # Update user's last login info
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {
            "security.last_login_ip": client_ip,
            "security.last_login_at": datetime.now(timezone.utc).isoformat(),
            "security.failed_logins": 0
        }}
    )
    
    # Determine user role — read from DB, fall back to email lists for legacy bootstrap
    email = user.get("email", "")
    role = user.get("role", "none")
    if role in ("none", "user"):
        if email in ADMIN_EMAILS:
            role = "admin"
            await db.users.update_one({"id": user["id"]}, {"$set": {"role": "admin"}})
        elif email in MODERATOR_EMAILS:
            role = "moderator"
            await db.users.update_one({"id": user["id"]}, {"$set": {"role": "moderator"}})
        else:
            role = "none"

    AuditLogger.log_auth_event("LOGIN", clean_email, client_ip, True, f"Role: {role}")
    
    token = create_token(user["id"])
    user_response = UserResponse(
        id=user["id"],
        email=user["email"],
        full_name=user["full_name"],
        created_at=user["created_at"],
        xp_points=user.get("xp_points", 0),
        completed_lessons=user.get("completed_lessons", []),
        completed_quizzes=user.get("completed_quizzes", []),
        completed_exams=user.get("completed_exams", []),
        certificates=user.get("certificates", []),
        streak_days=user.get("streak_days", 0),
        last_activity=user.get("last_activity"),
        subscription_tier=user.get("subscription_tier", "free"),
        subscription_expires=user.get("subscription_expires"),
        role=role,
        achievements=user.get("achievements", []),
        avatar_url=user.get("avatar_url")
    )
    return TokenResponse(access_token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    # Passively reset streak if user missed a day (without awarding XP)
    last_activity = current_user.get("last_activity")
    if last_activity and current_user.get("streak_days", 0) > 0:
        try:
            last_date = datetime.fromisoformat(last_activity.replace("Z", "+00:00")).date()
            today = datetime.now(timezone.utc).date()
            days_diff = (today - last_date).days
            streak_freezes = current_user.get("streak_freezes", 0)
            # Reset if missed more than 1 day (or exactly 2 days with no freeze)
            if days_diff > 1 and not (days_diff == 2 and streak_freezes > 0):
                await db.users.update_one(
                    {"id": current_user["id"]},
                    {"$set": {"streak_days": 0}}
                )
                current_user["streak_days"] = 0
        except Exception:
            pass

    # Re-fetch to get any writes made during this request (streak reset, role update, etc.)
    fresh_user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})

    # Read role from DB, fall back to email lists for legacy bootstrap
    email = fresh_user.get("email", "")
    role = fresh_user.get("role", "none")
    if role in ("none", "user"):
        if email in ADMIN_EMAILS:
            role = "admin"
            await db.users.update_one({"id": fresh_user["id"]}, {"$set": {"role": "admin"}})
        elif email in MODERATOR_EMAILS:
            role = "moderator"
            await db.users.update_one({"id": fresh_user["id"]}, {"$set": {"role": "moderator"}})
        else:
            role = "none"

    return UserResponse(
        id=fresh_user["id"],
        email=fresh_user["email"],
        full_name=fresh_user["full_name"],
        created_at=fresh_user["created_at"],
        xp_points=fresh_user.get("xp_points", 0),
        completed_lessons=fresh_user.get("completed_lessons", []),
        completed_quizzes=fresh_user.get("completed_quizzes", []),
        completed_exams=fresh_user.get("completed_exams", []),
        certificates=fresh_user.get("certificates", []),
        streak_days=fresh_user.get("streak_days", 0),
        last_activity=fresh_user.get("last_activity"),
        subscription_tier=fresh_user.get("subscription_tier", "free"),
        subscription_expires=fresh_user.get("subscription_expires"),
        role=role,
        achievements=fresh_user.get("achievements", []),
        certificate_name=fresh_user.get("certificate_name"),
        avatar_url=fresh_user.get("avatar_url")
    )

@api_router.put("/auth/profile")
async def update_profile(data: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    """Update the authenticated user's display name and optional certificate name."""
    clean_name = InputSanitizer.sanitize_string(data.full_name, max_length=100)
    if not clean_name:
        raise HTTPException(status_code=400, detail="Name cannot be empty")
    update_fields: dict = {"full_name": clean_name}
    if data.certificate_name is not None:
        clean_cert = InputSanitizer.sanitize_string(data.certificate_name, max_length=150)
        update_fields["certificate_name"] = clean_cert
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": update_fields}
    )
    return {"message": "Profile updated"}

@api_router.put("/auth/password")
async def change_password(data: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """Change the authenticated user's password."""
    if not verify_password(data.current_password, current_user["password_hash"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    is_valid, msg = PasswordSecurity.validate_password(data.new_password)
    if not is_valid:
        raise HTTPException(status_code=400, detail=msg)
    new_hash = hash_password(data.new_password)
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"password_hash": new_hash}}
    )
    return {"message": "Password updated"}

class AvatarConfirmRequest(BaseModel):
    image_id: str

@api_router.get("/auth/avatar/upload-url")
async def get_avatar_upload_url(current_user: dict = Depends(get_current_user)):
    """Request a Cloudflare Images direct upload URL for the authenticated user."""
    import httpx
    account_id = os.environ.get("CLOUDFLARE_ACCOUNT_ID")
    api_token = os.environ.get("CLOUDFLARE_API_TOKEN")
    if not account_id or not api_token:
        raise HTTPException(status_code=503, detail="Image upload not configured")
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.cloudflare.com/client/v4/accounts/{account_id}/images/v2/direct_upload",
            headers={"Authorization": f"Bearer {api_token}"},
        )
    if resp.status_code != 200:
        print(f"[avatar] Cloudflare error {resp.status_code}: {resp.text}")
        raise HTTPException(status_code=502, detail="Failed to create upload URL")
    data = resp.json()
    result = data.get("result", {})
    return {"upload_url": result.get("uploadURL"), "image_id": result.get("id")}

@api_router.post("/auth/avatar")
async def confirm_avatar(request: AvatarConfirmRequest, current_user: dict = Depends(get_current_user)):
    """Save the uploaded Cloudflare image ID as the user's avatar URL."""
    account_hash = os.environ.get("CLOUDFLARE_IMAGES_HASH")
    if not account_hash:
        raise HTTPException(status_code=503, detail="Image delivery not configured")
    image_id = InputSanitizer.sanitize_string(request.image_id, max_length=200)
    if not image_id:
        raise HTTPException(status_code=400, detail="Invalid image ID")
    avatar_url = f"https://imagedelivery.net/{account_hash}/{image_id}/public"
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"avatar_url": avatar_url}}
    )
    return {"avatar_url": avatar_url}

@api_router.post("/subscription/cancel")
async def cancel_subscription(current_user: dict = Depends(get_current_user)):
    """Cancel the current user's subscription (keeps access until expiry, then downgrades to free)."""
    tier = current_user.get("subscription_tier", "free")
    if tier == "free":
        raise HTTPException(status_code=400, detail="No active paid subscription to cancel")
    expires = current_user.get("subscription_expires")
    # Mark as cancelled — access remains until expiry date; a cron/webhook handles the actual downgrade
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"subscription_cancelled": True}}
    )
    return {"message": "Subscription cancelled", "access_until": expires}

# ==================== COURSES ROUTES ====================

@api_router.get("/courses")
async def get_courses(lang: str = "en"):
    courses = await db.courses.find({"is_published": True}, {"_id": 0}).to_list(100)
    if not courses:
        await seed_courses()
        courses = await db.courses.find({"is_published": True}, {"_id": 0}).to_list(100)
    result = []
    for course in courses:
        localized = localize_course(course, lang)
        if localized and localized.get("title"):
            # Include lesson IDs so the frontend can compute progress correctly
            lesson_ids = await db.lessons.distinct("id", {"course_id": course["id"]})
            localized["lesson_ids"] = lesson_ids
            result.append(localized)
    return result

@api_router.get("/courses/{course_id}")
async def get_course(course_id: str, lang: str = "en"):
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    localized = localize_course(course, lang)
    if not localized:
        raise HTTPException(status_code=404, detail="Course has no available translations")
    return localized

from services.lesson_images import get_lesson_images, LESSON_IMAGES
from services.streak_service import StreakService
from services.gamification_service import GamificationService
from services.content_aggregator import get_localized_lesson, get_all_lessons_for_course, ALL_LESSONS, get_content_stats

@api_router.get("/courses/{course_id}/lessons", response_model=List[Lesson])
async def get_course_lessons(course_id: str, lang: str = "en"):
    # If an admin has ever edited this course's lessons, trust the DB exclusively
    course_doc = await db.courses.find_one({"id": course_id}, {"_id": 0, "content_managed": 1})
    if not (course_doc and course_doc.get("content_managed")):
        # No admin edits yet — serve static built-in content
        static_lessons = get_all_lessons_for_course(course_id, lang)
        if static_lessons:
            for lesson in static_lessons:
                lesson.setdefault("xp_reward", 50)
                lesson.setdefault("quiz_questions", [])
                lesson.setdefault("recommended_readings", [])
                lesson.setdefault("examples", [])
                lesson.setdefault("learning_objectives", [])
                lesson.setdefault("audio_intro", None)
                lesson.setdefault("audio_full", None)
                lesson.setdefault("subtitle", "")
                lesson.setdefault("summary", "")
                lesson.setdefault("checkpoints", [])
                lesson.setdefault("infographics", [])
                lesson.setdefault("hero_image", None)
            return static_lessons

    # DB is authoritative — use it (and seed if somehow empty for non-trial courses)
    lessons = await db.lessons.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(100)
    if not lessons and not (course_doc and course_doc.get("content_managed")):
        await seed_lessons(course_id)
        lessons = await db.lessons.find({"course_id": course_id}, {"_id": 0}).sort("order", 1).to_list(100)

    result = []
    for lesson in lessons:
        localized = localize_lesson(lesson, lang)
        if not localized:
            continue
        images = get_lesson_images(localized.get("id", ""))
        localized["hero_image"] = images.get("hero_image")
        localized["infographics"] = images.get("infographics", [])
        result.append(localized)

    return result

@api_router.get("/lessons/{lesson_id}", response_model=Lesson)
async def get_lesson(lesson_id: str, lang: str = "en"):
    # Check if the parent course is DB-managed (admin has edited its content)
    static_raw = ALL_LESSONS.get(lesson_id)
    course_managed = False
    if static_raw:
        course_doc = await db.courses.find_one(
            {"id": static_raw["course_id"]}, {"_id": 0, "content_managed": 1}
        )
        course_managed = bool(course_doc and course_doc.get("content_managed"))

    if not course_managed and static_raw:
        # Serve static content — no admin edits yet
        static_lesson = get_localized_lesson(lesson_id, lang)
        static_lesson.setdefault("xp_reward", 50)
        static_lesson.setdefault("quiz_questions", [])
        static_lesson.setdefault("recommended_readings", [])
        static_lesson.setdefault("examples", [])
        static_lesson.setdefault("learning_objectives", [])
        static_lesson.setdefault("audio_intro", None)
        static_lesson.setdefault("audio_full", None)
        static_lesson.setdefault("subtitle", "")
        static_lesson.setdefault("summary", "")
        static_lesson.setdefault("checkpoints", [])
        static_lesson.setdefault("infographics", [])
        static_lesson.setdefault("hero_image", None)
        return static_lesson

    # DB is authoritative
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    localized = localize_lesson(lesson, lang)
    if not localized:
        raise HTTPException(status_code=404, detail=f"Lesson not available in language '{lang}'")

    images = get_lesson_images(lesson_id)
    localized["hero_image"] = images.get("hero_image")
    localized["infographics"] = images.get("infographics", [])

    return localized

@api_router.get("/premium/stats")
async def content_stats():
    """Get content statistics"""
    return get_content_stats()

@api_router.post("/lessons/{lesson_id}/complete")
async def complete_lesson(lesson_id: str, current_user: dict = Depends(get_current_user)):
    xp_earned = 0
    level_up = False
    new_achievements = []
    
    if lesson_id not in current_user.get("completed_lessons", []):
        # Calculate XP before
        old_xp = current_user.get("xp_points", 0)
        old_level = calculate_level(old_xp)
        
        # Award XP
        xp_earned = 100
        new_xp = old_xp + xp_earned
        new_level = calculate_level(new_xp)
        level_up = new_level > old_level
        
        update_data = {
            "$addToSet": {"completed_lessons": lesson_id},
            "$inc": {"xp_points": xp_earned},
        }
        
        await db.users.update_one({"id": current_user["id"]}, update_data)

        # Track Night Owl hidden achievement (lessons completed between midnight and 5am UTC)
        hour = datetime.now(timezone.utc).hour
        if 0 <= hour < 5:
            updated_user = await db.users.find_one_and_update(
                {"id": current_user["id"]},
                {"$inc": {"night_lessons_count": 1}},
                return_document=True
            )
            if updated_user and updated_user.get("night_lessons_count", 0) >= 5:
                night_svc = GamificationService(db)
                awarded_hidden = await night_svc.grant_achievement(current_user["id"], "night_owl")
                if awarded_hidden:
                    new_achievements.append({"id": awarded_hidden["id"], "name": awarded_hidden["name"], "description": awarded_hidden.get("description", ""), "xp": awarded_hidden["xp_reward"], "icon": awarded_hidden.get("icon", "trophy"), "level": awarded_hidden.get("level", 1)})
                    xp_earned += awarded_hidden["xp_reward"]

        # Update quest progress for lesson completion
        await db.user_quests.update_many(
            {
                "user_id": current_user["id"],
                "type": "lesson_complete",
                "completed": False
            },
            {"$inc": {"progress": 1}}
        )
        
        # Check for achievements
        gamification_service = GamificationService(db)
        awarded = await gamification_service.check_and_award_achievements(current_user["id"], trigger="lesson")
        for a in awarded:
            new_achievements.append({"id": a["id"], "name": a["name"], "description": a.get("description", ""), "xp": a["xp_reward"], "icon": a.get("icon", "trophy"), "level": a.get("level", 1)})
            xp_earned += a["xp_reward"]

    # Update streak (always, even if lesson was already completed — counts as daily activity)
    streak_service = StreakService(db)
    streak_result = await streak_service.check_and_update_streak(current_user["id"])

    # Re-check achievements after streak update (catches streak_beginner, streak_warrior, etc.)
    gamification_service_streak = GamificationService(db)
    streak_achievements = await gamification_service_streak.check_and_award_achievements(current_user["id"], trigger="lesson")
    for a in streak_achievements:
        if not any(x["id"] == a["id"] for x in new_achievements):
            new_achievements.append({"id": a["id"], "name": a["name"], "description": a.get("description", ""), "xp": a["xp_reward"], "icon": a.get("icon", "trophy"), "level": a.get("level", 1)})

    return {
        "status": "completed",
        "xp_earned": xp_earned,
        "level_up": level_up,
        "new_achievements": new_achievements,
        "streak": streak_result
    }

def calculate_level(xp: int) -> int:
    """Calculate level from XP"""
    thresholds = [
        0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200,
        6600, 8200, 10000, 12000, 14200, 16600, 19200, 22000, 25000, 28200,
        31600, 35200, 39000, 43000, 47200, 51600, 56200, 61000, 66000, 71200,
        76600, 82200, 88000, 94000, 100200
    ]
    for level, threshold in enumerate(thresholds):
        if xp < threshold:
            return level
    return len(thresholds)

# ==================== QUIZ ROUTES ====================

@api_router.get("/lessons/{lesson_id}/quiz", response_model=Quiz)
async def get_lesson_quiz(lesson_id: str, lang: str = "en"):
    quiz = await db.quizzes.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if not quiz:
        quiz = await create_quiz_for_lesson(lesson_id)
    return localize_quiz(quiz, lang)

@api_router.post("/quizzes/submit")
async def submit_quiz(submission: QuizSubmission, current_user: dict = Depends(get_current_user)):
    quiz = await db.quizzes.find_one({"id": submission.quiz_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    correct_count = 0
    total = len(quiz["questions"])
    results = []

    for q in quiz["questions"]:
        user_answer = submission.answers.get(q["id"], "")
        if "translations" in q:
            t = q["translations"].get(submission.lang) or q["translations"].get("en", {})
            options = t.get("options", [])
            idx = q.get("correct_answer_index", 0)
            correct = options[idx] if idx < len(options) else ""
            exp = t.get("explanation", "")
        else:
            correct = q["correct_answer"]
            exp = q["explanation"]
        is_correct = user_answer == correct
        if is_correct:
            correct_count += 1
        results.append({
            "question_id": q["id"],
            "correct": is_correct,
            "correct_answer": correct,
            "explanation": exp
        })
    
    score = round((correct_count / total) * 100, 1)

    # Determine which questions the user got right for the first time
    already_correct = set(
        current_user.get("quiz_correct_questions", {}).get(submission.quiz_id, [])
    )
    newly_correct = [
        r["question_id"] for r in results
        if r["correct"] and r["question_id"] not in already_correct
    ]
    xp_earned = len(newly_correct) * 10

    new_achievements = []
    first_attempt = submission.quiz_id not in current_user.get("completed_quizzes", [])
    is_perfect = score == 100.0

    if newly_correct or first_attempt:
        update: dict = {}
        if xp_earned > 0:
            update["$inc"] = {"xp_points": xp_earned}
        if first_attempt:
            update.setdefault("$addToSet", {})["completed_quizzes"] = submission.quiz_id
        if newly_correct:
            update.setdefault("$addToSet", {})[f"quiz_correct_questions.{submission.quiz_id}"] = {"$each": newly_correct}
        await db.users.update_one({"id": current_user["id"]}, update)

    # Determine if this is the first time the user gets 100% on this quiz
    previously_perfected = submission.quiz_id in current_user.get("perfect_quiz_ids", [])
    newly_perfected = is_perfect and not previously_perfected

    if newly_perfected:
        # Record this quiz as perfected and increment the counter (used by Quiz Master)
        await db.users.update_one(
            {"id": current_user["id"]},
            {
                "$inc": {"perfect_quizzes_count": 1},
                "$addToSet": {"perfect_quiz_ids": submission.quiz_id}
            }
        )
        # Check Quiz Master (and any other quiz-trigger achievements)
        quiz_svc = GamificationService(db)
        awarded = await quiz_svc.check_and_award_achievements(current_user["id"], trigger="quiz")
        for a in awarded:
            new_achievements.append({"id": a["id"], "name": a["name"], "description": a.get("description", ""), "xp": a["xp_reward"], "icon": a.get("icon", "trophy"), "level": a.get("level", 1)})

    # Sharp Mind: first attempt + perfected for the first time
    if first_attempt and newly_perfected:
        sharp_svc = GamificationService(db)
        awarded_sharp = await sharp_svc.grant_achievement(current_user["id"], "sharp_mind")
        if awarded_sharp:
            new_achievements.append({"id": awarded_sharp["id"], "name": awarded_sharp["name"], "description": awarded_sharp.get("description", ""), "xp": awarded_sharp["xp_reward"], "icon": awarded_sharp.get("icon", "trophy"), "level": awarded_sharp.get("level", 1)})

    # Perfectionist: retake + perfect score (even if already perfected before)
    if not first_attempt and is_perfect:
        perf_svc = GamificationService(db)
        awarded_perf = await perf_svc.grant_achievement(current_user["id"], "perfectionist")
        if awarded_perf:
            new_achievements.append({"id": awarded_perf["id"], "name": awarded_perf["name"], "description": awarded_perf.get("description", ""), "xp": awarded_perf["xp_reward"], "icon": awarded_perf.get("icon", "trophy"), "level": awarded_perf.get("level", 1)})

    return {"score": score, "correct": correct_count, "total": total, "results": results, "xp_earned": xp_earned, "new_achievements": new_achievements}

# ==================== EXAM ROUTES ====================

def _localize_exam(exam: dict, lang: str) -> dict:
    """Convert a stored exam to a flat (localized) format for the frontend.
    Supports both the new translations-based format and the legacy flat format."""
    if not exam:
        return exam
    localized_questions = []
    for q in exam.get("questions", []):
        if "translations" in q:
            # New format: pick the requested language, fall back to EN
            trans = q["translations"].get(lang) or q["translations"].get("en") or next(iter(q["translations"].values()), {})
            options = trans.get("options", [])
            idx = q.get("correct_answer_index", 0)
            correct_answer = options[idx] if options and 0 <= idx < len(options) else (options[0] if options else "")
            localized_questions.append({
                "id": q["id"],
                "question": trans.get("question", ""),
                "question_type": q.get("question_type", "multiple_choice"),
                "options": options,
                "correct_answer": correct_answer,
                "explanation": trans.get("explanation", ""),
            })
        else:
            # Legacy flat format — return as-is
            localized_questions.append(q)
    return {**exam, "questions": localized_questions}

@api_router.get("/exams/{course_id}")
async def get_exam(course_id: str, lang: str = "en"):
    # Look up by course_id first, then fall back to legacy level-based id
    exam = await db.exams.find_one({"course_id": course_id}, {"_id": 0})
    if not exam:
        exam = await db.exams.find_one({"id": f"exam-{course_id}"}, {"_id": 0})
    if not exam:
        exam = await create_exam_for_course(course_id)
    return _localize_exam(exam, lang)

@api_router.post("/exams/submit")
async def submit_exam(submission: ExamSubmission, current_user: dict = Depends(get_current_user)):
    exam = await db.exams.find_one({"id": submission.exam_id}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    correct_count = 0
    total = len(exam["questions"])
    
    for q in exam["questions"]:
        user_answer = submission.answers.get(q["id"], "")
        if user_answer == q["correct_answer"]:
            correct_count += 1
    
    score = round((correct_count / total) * 100, 1)
    passed = score >= 80
    
    result = {
        "exam_id": submission.exam_id,
        "score": score,
        "passed": passed,
        "correct": correct_count,
        "total": total,
        "completed_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Track failed exams for Resilient achievement
    if not passed:
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$addToSet": {"failed_exams": submission.exam_id}}
        )

    # Grant Resilient if passing an exam they previously failed
    if passed and submission.exam_id in current_user.get("failed_exams", []):
        resilient_svc = GamificationService(db)
        awarded_resilient = await resilient_svc.grant_achievement(current_user["id"], "resilient")
        if awarded_resilient:
            result.setdefault("new_achievements", []).append(
                {"id": awarded_resilient["id"], "name": awarded_resilient["name"], "xp": awarded_resilient["xp_reward"], "icon": awarded_resilient.get("icon", "trophy"), "level": awarded_resilient.get("level", 1)}
            )

    if passed and submission.exam_id not in current_user.get("completed_exams", []):
        cert_id = str(uuid.uuid4())
        # Resolve cert name from course, falling back to level-based names
        course_id = exam.get("course_id")
        cert_name = exam.get("title", "Crypto Certificate")
        if course_id:
            course_doc = await db.courses.find_one({"id": course_id}, {"_id": 0, "title": 1, "translations": 1})
            if course_doc:
                cert_name = course_doc.get("title") or cert_name

        await db.users.update_one(
            {"id": current_user["id"]},
            {
                "$addToSet": {"completed_exams": submission.exam_id, "certificates": cert_id},
                "$inc": {"xp_points": 500}
            }
        )

        await db.certificates.insert_one({
            "id": cert_id,
            "user_id": current_user["id"],
            "user_name": current_user["full_name"],
            "cert_name": cert_name,
            "course_id": course_id,
            "level": exam.get("level"),
            "score": score,
            "issued_at": datetime.now(timezone.utc).isoformat()
        })
        
        result["certificate_id"] = cert_id
        result["certificate_name"] = cert_name
        gamification_service = GamificationService(db)
        awarded = await gamification_service.check_and_award_achievements(current_user["id"], trigger="exam")
        result["new_achievements"] = [
            {"id": a["id"], "name": a["name"], "description": a.get("description", ""), "xp": a["xp_reward"], "icon": a.get("icon", "trophy"), "level": a.get("level", 1)}
            for a in awarded
        ]
    else:
        result["new_achievements"] = []

    return result

# ==================== CERTIFICATE ROUTES ====================

@api_router.get("/certificates")
async def get_user_certificates(current_user: dict = Depends(get_current_user)):
    certs = await db.certificates.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(10)
    return certs

@api_router.get("/certificates/{cert_id}/pdf")
async def get_certificate_pdf(cert_id: str):
    cert = await db.certificates.find_one({"id": cert_id}, {"_id": 0})
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=landscape(letter))
    width, height = landscape(letter)
    
    c.setFillColor(HexColor("#030712"))
    c.rect(0, 0, width, height, fill=True)
    
    c.setFillColor(HexColor("#2563EB"))
    c.rect(0, height - 80, width, 80, fill=True)
    
    c.setFillColor(HexColor("#FFFFFF"))
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(width/2, height - 55, "TheCryptoCoach.io")
    
    c.setFillColor(HexColor("#F8FAFC"))
    c.setFont("Helvetica", 24)
    c.drawCentredString(width/2, height - 130, "CERTIFICATE OF COMPLETION")
    
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(width/2, height - 200, cert["cert_name"])
    
    c.setFont("Helvetica", 18)
    c.drawCentredString(width/2, height - 260, "This certifies that")
    
    c.setFillColor(HexColor("#2563EB"))
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(width/2, height - 300, cert["user_name"])
    
    c.setFillColor(HexColor("#94A3B8"))
    c.setFont("Helvetica", 14)
    c.drawCentredString(width/2, height - 350, f"has successfully completed the certification exam with a score of {cert['score']}%")
    c.drawCentredString(width/2, height - 380, f"Issued on: {cert['issued_at'][:10]}")
    c.drawCentredString(width/2, height - 410, f"Certificate ID: {cert['id'][:8].upper()}")
    
    qr = qrcode.QRCode(version=1, box_size=3, border=1)
    qr.add_data(f"https://thecryptocoach.io/verify/{cert['id']}")
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="white", back_color="#030712")
    
    qr_buffer = io.BytesIO()
    qr_img.save(qr_buffer, format='PNG')
    qr_buffer.seek(0)
    
    c.drawCentredString(width/2, 80, "Scan to verify")
    
    c.save()
    buffer.seek(0)
    
    pdf_base64 = base64.b64encode(buffer.getvalue()).decode()
    return {"pdf_data": pdf_base64, "filename": f"certificate_{cert_id[:8]}.pdf"}

@api_router.get("/certificates/verify/{cert_id}")
async def verify_certificate(cert_id: str):
    cert = await db.certificates.find_one({"id": cert_id}, {"_id": 0})
    if not cert:
        return {"valid": False, "message": "Certificate not found"}
    return {"valid": True, "certificate": cert}

# ==================== GLOSSARY ROUTES ====================

@api_router.get("/glossary", response_model=List[GlossaryTerm])
async def get_glossary(lang: str = "en"):
    # If no multilingual data exists yet, drop old data and re-seed all languages
    has_language_field = await db.glossary.find_one({"language": {"$exists": True}})
    if not has_language_field:
        await db.glossary.drop()
        await seed_glossary()
    terms = await db.glossary.find({"language": lang}, {"_id": 0}).sort("term", 1).to_list(500)
    if not terms:
        # Fallback to English if requested language has no terms
        terms = await db.glossary.find({"language": "en"}, {"_id": 0}).sort("term", 1).to_list(500)
    return terms

# ==================== BLOG ROUTES ====================

@api_router.get("/blog", response_model=List[BlogPost])
async def get_blog_posts():
    posts = await db.blog.find({}, {"_id": 0}).sort("published_at", -1).to_list(100)
    if not posts:
        await seed_blog()
        posts = await db.blog.find({}, {"_id": 0}).sort("published_at", -1).to_list(100)
    return posts

@api_router.get("/blog/{slug}", response_model=BlogPost)
async def get_blog_post(slug: str):
    post = await db.blog.find_one({"slug": slug}, {"_id": 0})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

# ==================== AI MENTOR ROUTES ====================

@api_router.post("/ai/chat")
async def ai_chat(message: ChatMessage, current_user: dict = Depends(get_current_user)):
    try:
        from openai import AsyncOpenAI

        api_key = os.environ.get('OPENAI_API_KEY')
        if not api_key:
            raise HTTPException(status_code=500, detail="AI service not configured")

        session_id = message.session_id or f"crypto_coach_{current_user['id']}"

        client = AsyncOpenAI(api_key=api_key)
        completion = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "system",
                    "content": """You are CryptoCoach AI, an expert cryptocurrency educator at TheCryptoCoach.io.
            You help students learn about blockchain, cryptocurrencies, DeFi, NFTs, and trading strategies.
            Be educational, clear, and professional. Avoid financial advice - focus on education.
            Keep responses concise but thorough. Use examples when helpful."""
                },
                {"role": "user", "content": message.message}
            ]
        )

        return {"response": completion.choices[0].message.content, "session_id": session_id}
    except Exception as e:
        logger.error(f"AI chat error: {e}")
        raise HTTPException(status_code=500, detail="AI service temporarily unavailable")

# ==================== TRADING SIMULATOR ROUTES ====================

@api_router.get("/simulator/prices")
async def get_crypto_prices():
    prices = {
        "BTC": round(random.uniform(95000, 105000), 2),
        "ETH": round(random.uniform(3200, 3800), 2),
        "SOL": round(random.uniform(180, 220), 2),
        "XRP": round(random.uniform(2.1, 2.8), 2),
        "ADA": round(random.uniform(0.8, 1.2), 2),
        "DOGE": round(random.uniform(0.35, 0.45), 2),
        "DOT": round(random.uniform(7, 9), 2),
        "LINK": round(random.uniform(22, 28), 2)
    }
    return {"prices": prices, "timestamp": datetime.now(timezone.utc).isoformat()}

@api_router.get("/simulator/portfolio")
async def get_portfolio(current_user: dict = Depends(get_current_user)):
    return {
        "balance": current_user.get("virtual_balance", 10000.0),
        "portfolio": current_user.get("portfolio", {}),
        "user_id": current_user["id"]
    }

@api_router.post("/simulator/trade")
async def execute_trade(trade: Trade, current_user: dict = Depends(get_current_user)):
    balance = current_user.get("virtual_balance", 10000.0)
    portfolio = current_user.get("portfolio", {})
    
    total_cost = trade.amount * trade.price
    
    if trade.action == "buy":
        if total_cost > balance:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        new_balance = balance - total_cost
        current_amount = portfolio.get(trade.symbol, 0)
        portfolio[trade.symbol] = current_amount + trade.amount
    elif trade.action == "sell":
        current_amount = portfolio.get(trade.symbol, 0)
        if trade.amount > current_amount:
            raise HTTPException(status_code=400, detail="Insufficient holdings")
        new_balance = balance + total_cost
        portfolio[trade.symbol] = current_amount - trade.amount
        if portfolio[trade.symbol] <= 0:
            del portfolio[trade.symbol]
    else:
        raise HTTPException(status_code=400, detail="Invalid action")
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {"virtual_balance": new_balance, "portfolio": portfolio},
            "$inc": {"trades_count": 1}
        }
    )

    await db.trades.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "symbol": trade.symbol,
        "action": trade.action,
        "amount": trade.amount,
        "price": trade.price,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    gamification_service = GamificationService(db)
    trade_achievements = await gamification_service.check_and_award_achievements(current_user["id"], trigger="trade")

    return {"balance": new_balance, "portfolio": portfolio, "trade": trade.model_dump(), "new_achievements": [
        {"id": a["id"], "name": a["name"], "description": a.get("description", ""), "xp": a["xp_reward"], "icon": a.get("icon", "trophy"), "level": a.get("level", 1)}
        for a in trade_achievements
    ]}

# ==================== GEO / PRICING ROUTE ====================

@api_router.get("/geo/pricing")
async def get_pricing_region(request: Request):
    """Detect the user's country from their IP and return the appropriate pricing region.
    Uses the real client IP — not influenced by language/locale settings."""
    # Resolve real IP behind Railway / Cloudflare / nginx proxies
    forwarded_for = request.headers.get("x-forwarded-for", "")
    real_ip = forwarded_for.split(",")[0].strip() if forwarded_for else request.client.host

    # Skip geo for local/private IPs — default to global pricing
    private_prefixes = ("127.", "::1", "10.", "192.168.", "172.")
    if any(real_ip.startswith(p) for p in private_prefixes) or real_ip in ("", "testclient"):
        return {"country_code": "XX", "region": "global"}

    try:
        async with httpx.AsyncClient(timeout=4.0) as client:
            res = await client.get(f"https://ipapi.co/{real_ip}/country/")
            country_code = res.text.strip().upper() if res.status_code == 200 else "XX"
    except Exception:
        country_code = "XX"

    region = "brazil" if country_code == "BR" else "global"
    return {"country_code": country_code, "region": region}

# ==================== CONTACT ROUTE ====================

@api_router.post("/contact")
async def submit_contact(form: ContactForm):
    contact_doc = {
        "id": str(uuid.uuid4()),
        "name": form.name,
        "email": form.email,
        "subject": form.subject,
        "message": form.message,
        "submitted_at": datetime.now(timezone.utc).isoformat()
    }
    await db.contacts.insert_one(contact_doc)
    return {"status": "success", "message": "Thank you for your message. We'll get back to you soon."}

# ==================== SEEDING FUNCTIONS ====================

async def seed_courses():
    courses = [
        {
            "id": "course-foundations",
            "level": 1,
            "thumbnail": "https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=800",
            "lessons_count": 8,
            "duration_hours": 6,
            "is_published": True,
            "is_trial": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "translations": {
                "en": {
                    "title": "Crypto Foundations",
                    "description": "Master the fundamentals of blockchain technology and cryptocurrency. Learn what Bitcoin is, how wallets work, and the basics of secure crypto storage.",
                    "topics": ["Blockchain Basics", "Bitcoin", "Cryptocurrency", "Wallets", "Security", "Exchanges", "Stablecoins", "Buying Crypto"]
                },
                "fr": {
                    "title": "Fondamentaux Crypto",
                    "description": "Maîtrisez les bases de la technologie blockchain et des cryptomonnaies. Apprenez ce qu'est Bitcoin, comment fonctionnent les portefeuilles et les bases du stockage sécurisé.",
                    "topics": ["Bases Blockchain", "Bitcoin", "Cryptomonnaie", "Portefeuilles", "Sécurité", "Exchanges", "Stablecoins", "Acheter des Cryptos"]
                },
                "ar": {
                    "title": "أساسيات العملات المشفرة",
                    "description": "أتقن أساسيات تقنية البلوكشين والعملات المشفرة. تعلم ما هو البيتكوين وكيف تعمل المحافظ وأساسيات التخزين الآمن.",
                    "topics": ["أساسيات البلوكشين", "البيتكوين", "العملات المشفرة", "المحافظ", "الأمان", "المنصات", "العملات المستقرة", "شراء العملات"]
                },
                "pt": {
                    "title": "Fundamentos Cripto",
                    "description": "Domine os fundamentos da tecnologia blockchain e criptomoedas. Aprenda o que é Bitcoin, como funcionam as carteiras e os básicos de armazenamento seguro.",
                    "topics": ["Básicos de Blockchain", "Bitcoin", "Criptomoeda", "Carteiras", "Segurança", "Exchanges", "Stablecoins", "Comprar Cripto"]
                }
            }
        },
        {
            "id": "course-investor",
            "level": 2,
            "thumbnail": "https://images.unsplash.com/photo-1642790551116-18e150f248e5?w=800",
            "lessons_count": 8,
            "duration_hours": 10,
            "is_published": True,
            "is_trial": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "translations": {
                "en": {
                    "title": "Crypto Investor",
                    "description": "Advance your knowledge with altcoins, DeFi, NFTs, and market analysis. Learn to evaluate projects and manage portfolio risk.",
                    "topics": ["Altcoins", "Tokenomics", "DeFi", "NFTs", "Layer-2", "On-Chain Analysis", "Market Cycles", "Risk Management"]
                },
                "fr": {
                    "title": "Investisseur Crypto",
                    "description": "Approfondissez vos connaissances avec les altcoins, la DeFi, les NFTs et l'analyse de marché. Apprenez à évaluer les projets et à gérer le risque.",
                    "topics": ["Altcoins", "Tokenomics", "DeFi", "NFTs", "Layer-2", "Analyse On-Chain", "Cycles de Marché", "Gestion des Risques"]
                },
                "ar": {
                    "title": "مستثمر العملات المشفرة",
                    "description": "طور معرفتك بالعملات البديلة والتمويل اللامركزي والنفتات وتحليل السوق. تعلم تقييم المشاريع وإدارة مخاطر المحفظة.",
                    "topics": ["العملات البديلة", "الرمزيات", "التمويل اللامركزي", "النفتات", "الطبقة الثانية", "تحليل السلسلة", "دورات السوق", "إدارة المخاطر"]
                },
                "pt": {
                    "title": "Investidor Cripto",
                    "description": "Avance seu conhecimento com altcoins, DeFi, NFTs e análise de mercado. Aprenda a avaliar projetos e gerenciar riscos de portfólio.",
                    "topics": ["Altcoins", "Tokenomics", "DeFi", "NFTs", "Layer-2", "Análise On-Chain", "Ciclos de Mercado", "Gestão de Risco"]
                }
            }
        },
        {
            "id": "course-strategist",
            "level": 3,
            "thumbnail": "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800",
            "lessons_count": 7,
            "duration_hours": 12,
            "is_published": True,
            "is_trial": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "translations": {
                "en": {
                    "title": "Advanced Crypto Strategist",
                    "description": "Master advanced trading strategies, portfolio management, and crypto macro analysis. Become an expert in evaluating opportunities.",
                    "topics": ["Trading Strategies", "Market Psychology", "Portfolio Management", "Macro Trends", "On-Chain Analytics", "Project Evaluation", "Long-Term Investing"]
                },
                "fr": {
                    "title": "Stratège Crypto Avancé",
                    "description": "Maîtrisez les stratégies de trading avancées, la gestion de portefeuille et l'analyse macro crypto. Devenez expert en évaluation d'opportunités.",
                    "topics": ["Stratégies de Trading", "Psychologie de Marché", "Gestion de Portefeuille", "Tendances Macro", "Analytique On-Chain", "Évaluation de Projets", "Investissement Long Terme"]
                },
                "ar": {
                    "title": "استراتيجي العملات المشفرة المتقدم",
                    "description": "أتقن استراتيجيات التداول المتقدمة وإدارة المحفظة والتحليل الكلي للعملات المشفرة. كن خبيراً في تقييم الفرص.",
                    "topics": ["استراتيجيات التداول", "علم نفس السوق", "إدارة المحفظة", "الاتجاهات الكلية", "تحليل السلسلة", "تقييم المشاريع", "الاستثمار طويل الأمد"]
                },
                "pt": {
                    "title": "Estrategista Cripto Avançado",
                    "description": "Domine estratégias avançadas de trading, gestão de portfólio e análise macro cripto. Torne-se especialista em avaliar oportunidades.",
                    "topics": ["Estratégias de Trading", "Psicologia de Mercado", "Gestão de Portfólio", "Tendências Macro", "Análise On-Chain", "Avaliação de Projetos", "Investimento Longo Prazo"]
                }
            }
        }
    ]
    await db.courses.insert_many(courses)

async def seed_lessons(course_id: str):
    lessons_data = {
        "course-foundations": [
            {"title": "What is Blockchain?", "objectives": ["Understand distributed ledger technology", "Learn how blocks are chained together", "Grasp the concept of decentralization"], "content": """
# Understanding Blockchain Technology

Blockchain is a revolutionary technology that serves as the foundation for cryptocurrencies and countless other applications. At its core, a blockchain is a distributed, immutable ledger that records transactions across many computers.

## How It Works

Imagine a spreadsheet that is duplicated thousands of times across a network of computers. This network is designed to regularly update this spreadsheet simultaneously. That's a basic understanding of blockchain.

### Key Components

1. **Blocks**: Data structures that store transaction information
2. **Chain**: Cryptographic links connecting blocks in sequence
3. **Nodes**: Computers that maintain copies of the blockchain
4. **Consensus**: Agreement mechanisms ensuring all copies match

## Why It Matters

Blockchain eliminates the need for trusted intermediaries. Instead of relying on a bank to verify transactions, the network itself validates and records all activity through mathematical consensus.

### Real-World Example

When you send Bitcoin, the transaction is broadcast to thousands of nodes. These nodes verify you own the Bitcoin and haven't already spent it. Once verified, the transaction is added to a block with other transactions, and that block is added to the chain permanently.
""", "examples": ["Bitcoin transactions being verified by miners", "Supply chain tracking with blockchain", "Voting systems using distributed ledgers"], "summary": "Blockchain is a distributed ledger technology that enables secure, transparent record-keeping without central authorities.", "readings": ["Bitcoin Whitepaper by Satoshi Nakamoto", "Mastering Bitcoin by Andreas Antonopoulos"]},
            {"title": "What is Bitcoin?", "objectives": ["Learn Bitcoin's history and creation", "Understand Bitcoin's monetary properties", "Know the difference between Bitcoin and traditional money"], "content": """
# Bitcoin: Digital Gold

Bitcoin is the world's first successful cryptocurrency, created in 2009 by an anonymous person or group using the pseudonym Satoshi Nakamoto.

## The Birth of Bitcoin

In the aftermath of the 2008 financial crisis, Satoshi Nakamoto published the Bitcoin whitepaper, proposing "a peer-to-peer electronic cash system." The goal was to create money that couldn't be controlled by governments or banks.

## Key Properties

### Fixed Supply
Unlike traditional currencies that can be printed infinitely, Bitcoin has a maximum supply of 21 million coins. This scarcity is programmed into the protocol.

### Decentralization
No single entity controls Bitcoin. It runs on a network of thousands of computers worldwide, making it censorship-resistant.

### Transparency
Every Bitcoin transaction is recorded on the public blockchain. Anyone can verify the entire history of transactions.

## Bitcoin as Store of Value

Many view Bitcoin as "digital gold" because of its:
- Scarcity (limited supply)
- Durability (exists as long as the network exists)
- Portability (can be sent anywhere in the world)
- Divisibility (can be divided into 100 million units called satoshis)
""", "examples": ["El Salvador adopting Bitcoin as legal tender", "Companies holding Bitcoin on their balance sheets", "Cross-border remittances using Bitcoin"], "summary": "Bitcoin is a decentralized digital currency with a fixed supply, designed to be a censorship-resistant store of value and medium of exchange.", "readings": ["The Bitcoin Standard by Saifedean Ammous", "Digital Gold by Nathaniel Popper"]},
            {"title": "How Cryptocurrency Works", "objectives": ["Understand transaction verification", "Learn about mining and consensus", "Grasp public-key cryptography basics"], "content": """
# The Mechanics of Cryptocurrency

Cryptocurrency combines cryptography, distributed systems, and game theory to create trustless digital money.

## Public-Key Cryptography

Every cryptocurrency user has two keys:
- **Public Key**: Your address, like an email address. Share it to receive funds.
- **Private Key**: Your password. Never share it. It controls your funds.

## Transaction Flow

1. You create a transaction signing it with your private key
2. The transaction is broadcast to the network
3. Nodes verify the signature and check your balance
4. Valid transactions are grouped into a block
5. Miners/validators compete to add the block to the chain
6. Once added, the transaction is confirmed

## Consensus Mechanisms

### Proof of Work (Bitcoin)
Miners compete to solve complex mathematical puzzles. The winner adds the next block and receives rewards. This requires significant computing power.

### Proof of Stake (Ethereum)
Validators stake their coins as collateral. They're randomly selected to propose blocks based on their stake. This is more energy-efficient.

## Confirmations

A transaction becomes more secure as more blocks are added after it. Most services consider 6 confirmations (about 1 hour for Bitcoin) as final.
""", "examples": ["Mining farms securing the Bitcoin network", "Ethereum's transition from PoW to PoS", "Transaction signing with hardware wallets"], "summary": "Cryptocurrencies use cryptographic signatures and consensus mechanisms to enable secure, trustless transactions without intermediaries.", "readings": ["Mastering Ethereum by Andreas Antonopoulos", "Cryptography Engineering by Ferguson"]},
            {"title": "Crypto Wallets Explained", "objectives": ["Distinguish between wallet types", "Understand hot vs cold storage", "Learn wallet security best practices"], "content": """
# Cryptocurrency Wallets

A crypto wallet doesn't actually store your coins—it stores the private keys that control your coins on the blockchain.

## Types of Wallets

### Hot Wallets (Connected to Internet)
- **Mobile Wallets**: Apps on your phone (Trust Wallet, Coinbase Wallet)
- **Desktop Wallets**: Software on your computer (Electrum, Exodus)
- **Web Wallets**: Browser-based (MetaMask)

**Pros**: Convenient, quick access
**Cons**: Vulnerable to hacks, malware

### Cold Wallets (Offline)
- **Hardware Wallets**: Physical devices (Ledger, Trezor)
- **Paper Wallets**: Private keys printed on paper

**Pros**: Maximum security, immune to online attacks
**Cons**: Less convenient, can be lost/damaged

## Seed Phrases

When you create a wallet, you receive a 12-24 word seed phrase. This is the master backup of your wallet.

**CRITICAL**: 
- Write it on paper, not digitally
- Store in multiple secure locations
- Never share it with anyone
- Anyone with your seed phrase controls your funds

## Best Practices

1. Use hardware wallets for large amounts
2. Keep only small amounts in hot wallets for daily use
3. Never store seed phrases digitally
4. Use strong, unique passwords
5. Enable 2FA where possible
""", "examples": ["Setting up a Ledger hardware wallet", "Recovering a wallet from seed phrase", "Using MetaMask for DeFi"], "summary": "Crypto wallets store private keys that control your funds. Choose between hot wallets for convenience and cold wallets for security.", "readings": ["Hardware wallet official documentation", "Bitcoin.org wallet guide"]},
            {"title": "Private Keys and Security", "objectives": ["Master private key management", "Recognize common scams", "Implement security best practices"], "content": """
# Securing Your Cryptocurrency

In crypto, you are your own bank. This means security is entirely your responsibility.

## Private Key Fundamentals

Your private key is a 256-bit number that looks like this:
`5HueCGU8rMjxEXxiPuD5BDku4MkFqeZyd4dZ1jvhTVqvbTLvyTJ`

**Golden Rule**: Not your keys, not your coins.

If someone else has your private key (like an exchange), they technically control your funds.

## Common Threats

### Phishing Attacks
Fake websites and emails that look legitimate but steal your credentials. Always verify URLs carefully.

### Malware
Keyloggers and clipboard hijackers that capture your keys. Use dedicated devices for crypto.

### Social Engineering
Scammers impersonating support staff asking for your seed phrase. Legitimate support NEVER asks for this.

### SIM Swapping
Attackers convince your phone carrier to transfer your number. Use authenticator apps, not SMS.

## Security Layers

1. **Hardware Wallet**: For long-term holdings
2. **Strong Passwords**: Use a password manager
3. **2FA with Authenticator Apps**: Not SMS
4. **Dedicated Device**: Consider a crypto-only laptop
5. **Regular Updates**: Keep software current
6. **Verify Everything**: Double-check addresses before sending
""", "examples": ["Recognizing a phishing attempt", "Setting up hardware wallet security", "Using a password manager"], "summary": "Private key security is paramount. Use hardware wallets, strong authentication, and stay vigilant against social engineering.", "readings": ["Security best practices from Ledger", "Kraken Security Guide"]},
            {"title": "Centralized vs Decentralized Exchanges", "objectives": ["Compare CEX and DEX characteristics", "Understand trade-offs", "Know when to use each type"], "content": """
# Exchange Types: CEX vs DEX

Where and how you trade crypto significantly impacts your security, privacy, and capabilities.

## Centralized Exchanges (CEX)

Examples: Coinbase, Binance, Kraken

### How They Work
- Company holds custody of your funds
- Operates like a traditional brokerage
- Matches buy and sell orders in their system

### Advantages
- User-friendly interfaces
- High liquidity
- Fiat on/off ramps
- Customer support
- Insurance on some funds

### Disadvantages
- Requires KYC (identity verification)
- You don't control your keys
- Can be hacked
- Can freeze your account
- Regulatory risk

## Decentralized Exchanges (DEX)

Examples: Uniswap, SushiSwap, dYdX

### How They Work
- Smart contracts facilitate trades
- You connect your wallet directly
- Trades occur on-chain

### Advantages
- Self-custody (your keys)
- No KYC required
- Can't freeze your account
- Access to more tokens
- Transparent operations

### Disadvantages
- Steeper learning curve
- Gas fees on each trade
- Lower liquidity for some pairs
- No customer support
- Smart contract risks

## When to Use Each

**CEX**: Fiat conversions, beginners, large liquid trades
**DEX**: Privacy, new tokens, DeFi integration, self-custody
""", "examples": ["Buying first Bitcoin on Coinbase", "Swapping tokens on Uniswap", "Using DEX aggregators for best prices"], "summary": "CEXs offer convenience and liquidity but require trust; DEXs provide self-custody and privacy but require more knowledge.", "readings": ["Binance Academy exchange guide", "Uniswap documentation"]},
            {"title": "Understanding Stablecoins", "objectives": ["Learn stablecoin types and mechanisms", "Understand risks and use cases", "Know major stablecoins"], "content": """
# Stablecoins: Crypto's Bridge to Traditional Finance

Stablecoins are cryptocurrencies designed to maintain a stable value, typically pegged to the US dollar.

## Why Stablecoins Matter

- Avoid volatility while staying in crypto
- Fast, cheap transfers
- Access to DeFi without volatility risk
- Trading pairs and liquidity

## Types of Stablecoins

### Fiat-Collateralized
**Examples**: USDT (Tether), USDC (Circle)
- Backed 1:1 by dollars in bank accounts
- Most liquid and widely used
- Requires trust in the issuer

### Crypto-Collateralized
**Examples**: DAI (MakerDAO)
- Backed by crypto assets (overcollateralized)
- More decentralized
- Subject to liquidation if collateral drops

### Algorithmic
**Examples**: FRAX, historical UST
- Use algorithms to maintain peg
- No direct collateral
- Higher risk of depegging (UST collapse)

## Major Stablecoins

| Stablecoin | Type | Market Cap | Notes |
|------------|------|------------|-------|
| USDT | Fiat | $90B+ | Most liquid, some controversy |
| USDC | Fiat | $30B+ | Most transparent, US-regulated |
| DAI | Crypto | $5B+ | Decentralized, battle-tested |

## Risks to Consider

- Regulatory actions (frozen accounts)
- Depegging events
- Counterparty risk
- Smart contract vulnerabilities
""", "examples": ["Using USDC to earn yield in DeFi", "DAI generation through MakerDAO", "The UST/LUNA collapse lessons"], "summary": "Stablecoins provide price stability in crypto, with different types offering various trade-offs between decentralization and reliability.", "readings": ["Circle USDC documentation", "MakerDAO whitepaper"]},
            {"title": "How to Buy Cryptocurrency Safely", "objectives": ["Execute safe first purchase", "Avoid common beginner mistakes", "Set up proper security"], "content": """
# Your First Crypto Purchase: A Safe Approach

Buying your first cryptocurrency should be methodical and secure. Here's how to do it right.

## Step-by-Step Guide

### 1. Choose a Reputable Exchange
Start with established, regulated exchanges:
- Coinbase (US, beginner-friendly)
- Kraken (global, security-focused)
- Gemini (US, insured)

### 2. Complete Verification
- Provide ID documents
- Wait for approval (minutes to days)
- Enable all security features immediately

### 3. Secure Your Account
Before depositing any money:
- Use a strong, unique password
- Enable 2FA with authenticator app
- Verify your email
- Set up withdrawal address whitelisting

### 4. Fund Your Account
Options typically include:
- Bank transfer (cheapest, slower)
- Debit card (instant, higher fees)
- Wire transfer (large amounts)

### 5. Make Your First Purchase
- Start small to learn the process
- Use market orders for simplicity
- Or limit orders for better prices

### 6. Withdraw to Self-Custody
Once comfortable, move to your own wallet:
- Small amounts: Hot wallet is fine
- Larger amounts: Hardware wallet recommended

## Common Mistakes to Avoid

1. **Investing more than you can lose**
2. **Not enabling 2FA**
3. **Leaving all crypto on exchanges**
4. **Sharing your seed phrase**
5. **FOMO buying at all-time highs**
6. **Not doing your own research**

## Tax Considerations

Cryptocurrency purchases and sales may be taxable events. Keep records of:
- Purchase dates and amounts
- Sale dates and amounts
- Fees paid
""", "examples": ["Setting up Coinbase with 2FA", "Making first Bitcoin purchase", "Withdrawing to hardware wallet"], "summary": "Buy crypto safely by using reputable exchanges, implementing strong security, starting small, and eventually moving to self-custody.", "readings": ["IRS cryptocurrency guidance", "Exchange security best practices"]}
        ],
        "course-investor": [
            {"title": "Altcoins and Ecosystems", "objectives": ["Understand the altcoin landscape", "Identify major blockchain ecosystems", "Evaluate altcoin fundamentals"], "content": """
# Beyond Bitcoin: The Altcoin Universe

While Bitcoin is the original cryptocurrency, thousands of alternative coins (altcoins) have emerged, each with unique purposes and technologies.

## Major Ecosystem Categories

### Smart Contract Platforms
- **Ethereum (ETH)**: The original, largest DeFi ecosystem
- **Solana (SOL)**: High speed, low fees, growing ecosystem
- **Avalanche (AVAX)**: Subnets for customization
- **Cardano (ADA)**: Academic, peer-reviewed approach

### Layer 1 Competitors
Each aims to improve on Bitcoin/Ethereum limitations:
- Throughput (transactions per second)
- Fees
- Decentralization
- Smart contract capabilities

## Evaluating Altcoins

### Key Metrics
1. **Market Cap**: Total value of all coins
2. **Volume**: Trading activity
3. **TVL (Total Value Locked)**: For DeFi platforms
4. **Active Developers**: GitHub activity
5. **User Growth**: Active addresses

### Red Flags
- Anonymous team
- No clear use case
- Unrealistic promises
- Heavy insider allocation
- No working product

## The Altcoin Cycle

Altcoins typically follow Bitcoin's lead but with amplified movements:
- Bull markets: Altcoins often outperform BTC
- Bear markets: Altcoins usually drop harder
- "Alt season": Period when altcoins surge vs BTC
""", "examples": ["Ethereum's DeFi dominance", "Solana's NFT ecosystem growth", "Layer 1 comparison analysis"], "summary": "Altcoins offer diverse opportunities beyond Bitcoin, but require careful evaluation of fundamentals, team, and ecosystem.", "readings": ["Messari research reports", "Electric Capital Developer Report"]},
            {"title": "Tokenomics Deep Dive", "objectives": ["Analyze token supply mechanics", "Understand value accrual", "Identify sustainable tokenomics"], "content": """
# Tokenomics: The Economics of Tokens

Tokenomics refers to the economic design of a cryptocurrency—how tokens are created, distributed, and incentivized.

## Supply Mechanics

### Total Supply
- **Fixed Supply**: Bitcoin (21M), creates scarcity
- **Inflationary**: Some tokens have unlimited supply with set inflation
- **Deflationary**: Tokens that burn supply over time

### Circulating Supply
What's actually tradable now. Key for market cap calculations.

### Emission Schedule
How new tokens enter circulation:
- Mining rewards
- Staking rewards
- Team unlocks
- Ecosystem grants

## Token Distribution

### Initial Allocation
Watch for:
- Team allocation (typically 15-20%)
- Investor allocation
- Community/ecosystem allocation
- Treasury

### Vesting Schedules
Tokens often vest over 2-4 years to prevent dumps.

## Value Accrual Mechanisms

### Fee Burns
Ethereum burns a portion of gas fees (EIP-1559)

### Revenue Sharing
Protocol fees distributed to token holders

### Governance Rights
Voting power in protocol decisions

### Utility Requirements
Must hold/stake tokens to use the protocol

## Red Flags in Tokenomics

1. Heavy team/investor allocation (>40%)
2. Short vesting periods
3. Unclear utility
4. Infinite inflation with no burns
5. Frequent token unlocks creating sell pressure
""", "examples": ["Bitcoin's halving mechanism", "Ethereum's fee burn analysis", "Comparing governance tokens"], "summary": "Good tokenomics align incentives between users, investors, and the protocol through careful supply management and value accrual.", "readings": ["Token Unlocks data", "Messari tokenomics reports"]},
            {"title": "DeFi Fundamentals", "objectives": ["Understand DeFi building blocks", "Learn about yields and risks", "Navigate the DeFi ecosystem"], "content": """
# Decentralized Finance (DeFi)

DeFi recreates traditional financial services using smart contracts, eliminating intermediaries.

## Core DeFi Primitives

### Lending/Borrowing
**Protocols**: Aave, Compound
- Deposit crypto to earn interest
- Borrow against your crypto as collateral
- No credit checks—collateral determines borrowing power

### Decentralized Exchanges (DEXs)
**Protocols**: Uniswap, Curve
- Trade directly from your wallet
- Automated Market Makers (AMMs) provide liquidity
- Liquidity providers earn fees

### Liquid Staking
**Protocols**: Lido, Rocket Pool
- Stake ETH, receive liquid staking token (stETH)
- Use staked tokens in other DeFi protocols
- Earn staking rewards while maintaining liquidity

### Yield Aggregators
**Protocols**: Yearn, Convex
- Automatically optimize yield strategies
- Compound rewards
- Save gas through pooled operations

## Understanding Yields

### Where Do Yields Come From?
1. **Lending Interest**: Borrowers pay to borrow
2. **Trading Fees**: DEX fees to liquidity providers
3. **Token Emissions**: Protocol rewards to bootstrap liquidity
4. **Staking Rewards**: Blockchain inflation to validators

### Risk vs Reward
Higher yields = Higher risks
- Smart contract risk
- Impermanent loss (for LPs)
- Liquidation risk (for borrowers)
- Protocol token devaluation

## Getting Started Safely

1. Start with established protocols
2. Use small amounts initially
3. Understand what you're depositing
4. Monitor positions regularly
5. Check contract audits
""", "examples": ["Depositing into Aave for yield", "Providing liquidity on Uniswap", "Liquid staking with Lido"], "summary": "DeFi enables permissionless financial services through smart contracts, offering opportunities but requiring careful risk management.", "readings": ["DeFi Llama analytics", "Aave documentation"]},
            {"title": "NFT Ecosystems", "objectives": ["Understand NFT technology", "Evaluate NFT projects", "Navigate NFT marketplaces"], "content": """
# Non-Fungible Tokens (NFTs)

NFTs are unique digital assets verified on blockchain, representing ownership of digital or physical items.

## How NFTs Work

### Non-Fungibility
Unlike Bitcoin where each unit is identical, each NFT is unique with its own identifier and metadata.

### Token Standards
- **ERC-721**: Original NFT standard (unique tokens)
- **ERC-1155**: Multi-token standard (batch operations)

### Metadata
NFTs point to metadata containing:
- Name and description
- Image/media URL (often IPFS)
- Attributes/traits

## NFT Use Cases

### Digital Art
Artists sell work directly to collectors with automatic royalties on resales.

### Gaming
In-game items as NFTs—true ownership, cross-game portability.

### Collectibles
Profile pictures (PFPs), trading cards, sports memorabilia.

### Utility NFTs
- Membership passes
- Event tickets
- Domain names

## Evaluating NFT Projects

### Key Factors
1. **Team**: Track record, doxxed?
2. **Art Quality**: Original, distinctive?
3. **Community**: Active, organic growth?
4. **Utility**: Beyond just art?
5. **Liquidity**: Trading volume?

### Red Flags
- Anonymous team with no history
- Fake engagement/volume
- Copy-paste art
- Unrealistic roadmap promises

## Marketplaces

- **OpenSea**: Largest, most diverse
- **Blur**: Pro trader features
- **Magic Eden**: Solana focus
- **Foundation**: Curated art
""", "examples": ["Analyzing a PFP project", "Checking NFT royalty structures", "Using blur for trading"], "summary": "NFTs enable verifiable digital ownership with diverse applications, but require careful evaluation due to high speculation.", "readings": ["OpenSea help documentation", "NFT market analysis reports"]},
            {"title": "Layer-2 Scaling Solutions", "objectives": ["Understand scaling challenges", "Compare Layer-2 approaches", "Use L2s effectively"], "content": """
# Layer-2 Scaling: Making Blockchain Faster

Layer-2 solutions process transactions off the main chain while inheriting its security.

## The Scaling Problem

Ethereum processes ~15 transactions per second. This causes:
- High gas fees during congestion
- Slow confirmation times
- Poor user experience

## Layer-2 Approaches

### Optimistic Rollups
**Examples**: Arbitrum, Optimism, Base

How they work:
- Batch transactions off-chain
- Submit compressed data to L1
- Assume transactions are valid
- Challenge period for fraud proofs

**Pros**: EVM compatible, lower fees
**Cons**: 7-day withdrawal period

### ZK Rollups
**Examples**: zkSync, StarkNet, Polygon zkEVM

How they work:
- Batch transactions off-chain
- Generate cryptographic proof of validity
- Verify proof on L1

**Pros**: Instant finality, highest security
**Cons**: More complex, some EVM limitations

### Comparison

| Feature | Optimistic | ZK Rollups |
|---------|------------|------------|
| Withdrawal Time | 7 days | Minutes |
| EVM Compatibility | High | Improving |
| Fees | Low | Very Low |
| Security | Fraud proofs | Validity proofs |

## Using Layer-2s

### Bridging Assets
1. Connect wallet to bridge
2. Select L1 to L2 transfer
3. Confirm and wait for deposit

### Key L2 Ecosystems
- **Arbitrum**: Largest TVL, most dApps
- **Base**: Coinbase-backed, growing fast
- **zkSync**: ZK technology leader
""", "examples": ["Bridging ETH to Arbitrum", "Trading on L2 DEXs", "Comparing gas costs"], "summary": "Layer-2 solutions make Ethereum scalable through rollups, each with trade-offs between withdrawal time, fees, and compatibility.", "readings": ["L2Beat analytics", "Arbitrum documentation"]},
            {"title": "On-Chain Analysis Basics", "objectives": ["Read blockchain data", "Identify key metrics", "Use analysis tools"], "content": """
# On-Chain Analysis: Reading the Blockchain

On-chain analysis examines blockchain data to understand network health, user behavior, and market trends.

## Key Metrics

### Network Activity
- **Active Addresses**: Daily unique users
- **Transaction Count**: Network usage
- **Gas Usage**: Demand for block space

### Holder Behavior
- **Exchange Flows**: Deposits = selling pressure, withdrawals = accumulation
- **Whale Movements**: Large holder activity
- **HODLer Metrics**: Long-term holder behavior

### Supply Metrics
- **Circulating Supply**: Available tokens
- **Supply on Exchanges**: Potential sell pressure
- **Staked Supply**: Locked tokens

## Important Indicators

### MVRV Ratio (Market Value to Realized Value)
- Above 3.7: Historically overbought
- Below 1: Historically oversold

### Exchange Reserve
Decreasing = Bullish (accumulation)
Increasing = Bearish (distribution)

### Funding Rates
- High positive: Market overleveraged long
- High negative: Market overleveraged short

## Analysis Tools

### Free Tools
- **Glassnode Studio**: Limited free metrics
- **CryptoQuant**: Exchange data
- **Santiment**: Social + on-chain

### Block Explorers
- Etherscan (Ethereum)
- Blockchain.com (Bitcoin)
- Solscan (Solana)

## Practical Application

1. Check exchange flows before major price moves
2. Monitor whale wallets
3. Track stablecoin flows to/from exchanges
4. Combine with technical analysis
""", "examples": ["Tracking Bitcoin whale accumulation", "Analyzing exchange reserves", "Using Glassnode for insights"], "summary": "On-chain analysis provides unique insights into blockchain networks by examining actual user behavior and network metrics.", "readings": ["Glassnode Academy", "CryptoQuant guides"]},
            {"title": "Crypto Market Cycles", "objectives": ["Recognize market phases", "Understand cycle drivers", "Apply historical patterns"], "content": """
# Understanding Crypto Market Cycles

Cryptocurrency markets move in cycles driven by technology adoption, speculation, and human psychology.

## The Four-Year Cycle Theory

Bitcoin's halving (every ~4 years) has historically preceded bull markets:
- **2012 Halving** → 2013 Bull Market
- **2016 Halving** → 2017 Bull Market
- **2020 Halving** → 2021 Bull Market
- **2024 Halving** → ?

### Halving Impact
Supply reduction + steady demand = price pressure

## Market Phases

### 1. Accumulation
- Low prices, low interest
- Smart money accumulates
- Negative sentiment prevails

### 2. Early Bull
- Price breaks previous resistance
- Gradually increasing interest
- Still significant doubt

### 3. Euphoria
- Mainstream media coverage
- Retail FOMO
- Unsustainable gains
- "This time is different" mentality

### 4. Distribution/Bear
- Smart money sells
- Prices decline
- Denial → Panic → Capitulation

## Altcoin Cycle

Altcoins tend to lag Bitcoin:
1. BTC leads initial rally
2. ETH and large caps follow
3. Mid-caps rally
4. Small caps and new projects surge
5. Reversal happens in reverse order

## Indicators to Watch

- **Fear & Greed Index**: Sentiment measure
- **Bitcoin Dominance**: BTC vs altcoins
- **Google Trends**: Retail interest
- **Social Volume**: Discussion intensity

## Key Lessons

1. Markets can stay irrational longer than expected
2. Most gains happen in short bursts
3. Most losses come from buying euphoria
4. Time in market beats timing market
""", "examples": ["2017 vs 2021 cycle comparison", "Identifying cycle tops and bottoms", "Using dominance charts"], "summary": "Crypto markets follow cyclical patterns driven by halvings, adoption waves, and human psychology—understanding these helps make better decisions.", "readings": ["PlanB's Stock-to-Flow model", "Historical cycle analysis reports"]},
            {"title": "Risk Management in Crypto", "objectives": ["Implement position sizing", "Set stop-losses effectively", "Build a risk-managed portfolio"], "content": """
# Risk Management: Protecting Your Capital

In crypto's volatile environment, risk management separates long-term survivors from casualties.

## Core Principles

### Never Invest More Than You Can Lose
Crypto can drop 80%+ in bear markets. Only invest money you truly don't need.

### Position Sizing
No single position should risk your portfolio:
- Conservative: 1-2% of portfolio per trade
- Moderate: 3-5% of portfolio per trade
- Never: 100% in one asset

## Risk Management Tools

### Stop-Losses
Set exit points before entering:
- **Hard Stop**: Automatic sell order
- **Mental Stop**: Manual execution
- **Trailing Stop**: Moves with price

### Take-Profit Levels
Plan exits, don't hold hoping forever:
- Scale out at predetermined levels
- Example: Sell 25% at 2x, 25% at 3x, etc.

### Portfolio Allocation

Sample conservative allocation:
- 50-60% BTC/ETH (large cap)
- 20-30% Major altcoins
- 10-20% Small caps/speculative
- Always keep some stablecoins

## Risk Metrics

### Sharpe Ratio
Returns relative to risk taken. Higher = better risk-adjusted returns.

### Max Drawdown
Largest peak-to-trough decline. Know your pain tolerance.

### Correlation
Assets that move together don't provide diversification.

## Emotional Management

### Common Mistakes
- FOMO buying at tops
- Panic selling at bottoms
- Revenge trading after losses
- Overtrading

### Solutions
- Have a written plan
- Stick to predetermined rules
- Take breaks during volatility
- Journal your trades
""", "examples": ["Setting up a trailing stop-loss", "Building a diversified portfolio", "Calculating position sizes"], "summary": "Risk management through position sizing, stop-losses, and diversification is essential for long-term crypto success.", "readings": ["Van Tharp's Position Sizing", "Market Wizards risk management principles"]}
        ],
        "course-strategist": [
            {"title": "Advanced Trading Strategies", "objectives": ["Master technical analysis patterns", "Implement algorithmic approaches", "Optimize entry and exit timing"], "content": """
# Advanced Crypto Trading Strategies

Moving beyond basics requires deeper technical analysis, systematic approaches, and disciplined execution.

## Technical Analysis Deep Dive

### Chart Patterns

**Continuation Patterns**:
- Flags and Pennants
- Triangles (ascending, descending, symmetrical)
- Rectangles

**Reversal Patterns**:
- Head and Shoulders
- Double/Triple Tops and Bottoms
- Rounding patterns

### Advanced Indicators

**Volume Profile**
Shows price levels with most trading activity. Key areas:
- Point of Control (POC): Highest volume node
- Value Area: 70% of volume range

**Ichimoku Cloud**
Multi-component indicator showing:
- Trend direction
- Support/resistance
- Momentum
- Future S/R zones

**Fibonacci Extensions**
Project price targets beyond retracement levels:
- 1.618, 2.618, 4.236 extensions

## Strategy Types

### Trend Following
- Buy breakouts, sell breakdowns
- Use moving averages for confirmation
- Accept lower win rate for larger wins

### Mean Reversion
- Fade extreme moves
- Buy oversold, sell overbought
- Requires strict risk management

### Range Trading
- Identify consolidation zones
- Buy support, sell resistance
- Stop outside the range

## Backtesting and Optimization

Before trading real money:
1. Define clear entry/exit rules
2. Test on historical data
3. Account for fees and slippage
4. Validate on out-of-sample data
5. Paper trade before going live
""", "examples": ["Trading the Bitcoin bull flag", "Volume profile analysis", "Backtesting a breakout strategy"], "summary": "Advanced trading combines technical analysis patterns, systematic strategies, and rigorous backtesting for consistent results.", "readings": ["Technical Analysis of Financial Markets by Murphy", "Trading in the Zone by Douglas"]},
            {"title": "Market Psychology", "objectives": ["Understand crowd behavior", "Recognize emotional cycles", "Develop psychological edge"], "content": """
# Trading Psychology: Mastering Your Mind

The biggest edge in trading isn't technical—it's psychological.

## Market Participant Psychology

### The Psychology Cycle
1. **Disbelief**: "This rally won't last"
2. **Hope**: "Maybe things are turning"
3. **Optimism**: "This is the real deal"
4. **Thrill**: "I'm a genius!"
5. **Euphoria**: "We're going to the moon!"
6. **Anxiety**: "Is this a correction?"
7. **Denial**: "It'll bounce back"
8. **Fear**: "Should I sell?"
9. **Desperation**: "I need to get out"
10. **Panic**: "Sell everything!"
11. **Capitulation**: "I'm done with crypto"
12. **Depression**: "I lost so much"

### Contrarian Indicators
When everyone is bullish = time to be cautious
When everyone gives up = opportunity approaches

## Cognitive Biases in Trading

### Confirmation Bias
Seeking information that confirms existing beliefs. Fight this by actively seeking opposing views.

### Recency Bias
Overweighting recent events. Remember: past performance doesn't guarantee future results.

### Loss Aversion
Losses hurt 2x more than equivalent gains feel good. This causes:
- Holding losers too long
- Cutting winners too early

### Anchoring
Fixating on purchase price. The market doesn't care what you paid.

## Building Psychological Edge

### Pre-Trade Checklist
- Am I following my plan?
- Is this FOMO or analysis?
- Have I sized properly?
- Where's my exit?

### During Trade
- Accept uncertainty
- Trust your process
- Don't move stops emotionally
- Journal your thoughts

### Post-Trade
- Review win or loss objectively
- What could improve?
- Celebrate good process, not just profits
""", "examples": ["Recognizing euphoria in market sentiment", "Overcoming loss aversion", "Building a trading journal"], "summary": "Psychological mastery—understanding biases and managing emotions—separates profitable traders from the majority.", "readings": ["Thinking, Fast and Slow by Kahneman", "The Disciplined Trader by Douglas"]},
            {"title": "Crypto Portfolio Management", "objectives": ["Construct optimal portfolios", "Implement rebalancing strategies", "Measure portfolio performance"], "content": """
# Portfolio Management for Crypto

Building and managing a crypto portfolio requires balancing opportunity, risk, and your investment goals.

## Portfolio Construction

### Core-Satellite Approach

**Core (60-70%)**:
- Bitcoin: Digital gold, store of value
- Ethereum: Smart contract platform
- Purpose: Stability, market exposure

**Satellite (30-40%)**:
- High-conviction altcoins
- Emerging sectors
- Purpose: Alpha generation

### Sector Diversification

Allocate across crypto sectors:
- Store of Value (BTC)
- Smart Contract Platforms (ETH, SOL)
- DeFi (AAVE, UNI)
- Layer 2s (ARB, OP)
- Infrastructure (LINK, GRT)

## Rebalancing Strategies

### Time-Based
Rebalance monthly/quarterly regardless of drift.

### Threshold-Based
Rebalance when allocations drift >5-10% from target.

### Tactical
Adjust based on market conditions and conviction.

## Performance Measurement

### Benchmarking
Compare to:
- BTC-only portfolio
- 60/40 BTC/ETH
- Total market cap index

### Key Metrics
- **Total Return**: Overall gains
- **Risk-Adjusted Return**: Sharpe ratio
- **Max Drawdown**: Worst peak-to-trough
- **Win Rate**: Percentage of winning positions

## Tax Efficiency

### Strategies
- Tax-loss harvesting: Sell losers to offset gains
- Hold >1 year for long-term rates
- Track cost basis accurately

### Documentation
- Export trade history from exchanges
- Use crypto tax software
- Keep records of all transactions
""", "examples": ["Building a core-satellite portfolio", "Threshold rebalancing example", "Calculating risk-adjusted returns"], "summary": "Effective portfolio management combines strategic allocation, systematic rebalancing, and rigorous performance measurement.", "readings": ["Modern Portfolio Theory basics", "Crypto portfolio management guides"]},
            {"title": "Crypto Macro Trends", "objectives": ["Analyze macro factors affecting crypto", "Understand regulatory landscape", "Position for long-term trends"], "content": """
# Macro Trends Shaping Crypto

Understanding broader economic and regulatory forces helps position for long-term success.

## Economic Factors

### Interest Rates
- Low rates: Risk assets (including crypto) benefit
- High rates: Money flows to safer yields
- Fed policy significantly impacts crypto

### Inflation
- Bitcoin as inflation hedge narrative
- Real yields (rates - inflation) matter
- Currency devaluation drives adoption

### Dollar Strength
- Strong dollar typically pressures crypto
- Weakening dollar supports crypto rallies
- Watch DXY (Dollar Index)

### Liquidity Cycles
- Global M2 money supply correlates with BTC
- Quantitative easing = bullish
- Quantitative tightening = bearish

## Regulatory Landscape

### United States
- SEC vs CFTC jurisdiction battles
- Bitcoin ETF approvals (major catalyst)
- Stablecoin regulation incoming
- State-by-state variation

### Global Trends
- MiCA regulation in Europe
- China's continued ban
- Emerging market adoption
- CBDC competition

## Adoption Metrics

### Institutional Adoption
- Public company holdings
- ETF flows
- Custodian growth
- Payment integration

### Retail Adoption
- Active addresses growth
- Exchange user numbers
- Geographic expansion
- Use case development

## Long-Term Positioning

### Thesis Development
1. What problem does crypto solve?
2. What adoption curve are we on?
3. What could accelerate/impede growth?
4. What's the ultimate addressable market?

### Scenario Planning
- Bull case: Mass adoption, $XXX BTC
- Base case: Steady growth, $XX BTC
- Bear case: Regulatory crackdown, range-bound
""", "examples": ["Correlating BTC with M2 supply", "Analyzing ETF flow impacts", "Regulatory scenario analysis"], "summary": "Macro awareness—understanding rates, liquidity, regulation, and adoption—enables better long-term positioning.", "readings": ["Bitcoin macro analysis reports", "Regulatory update newsletters"]},
            {"title": "Advanced On-Chain Analytics", "objectives": ["Master advanced on-chain metrics", "Build analysis frameworks", "Identify smart money flows"], "content": """
# Advanced On-Chain Analytics

Going deeper into blockchain data reveals patterns invisible to surface-level analysis.

## Advanced Metrics

### Realized Cap & MVRV

**Realized Cap**: Sum of all coins at their last moved price
- More stable than market cap
- Represents aggregate cost basis

**MVRV Ratio**: Market Cap / Realized Cap
- Above 3.7: Historically overheated
- Below 1: Historically undervalued
- Useful for cycle positioning

### SOPR (Spent Output Profit Ratio)
Ratio of sold vs bought price for moved coins:
- Above 1: Sellers in profit
- Below 1: Sellers at loss
- Reset to 1 often acts as support/resistance

### Coin Days Destroyed
Measures movement of old coins:
- High CDD: Long-term holders moving
- Often signals distribution at tops
- Low CDD: Accumulation

## Cohort Analysis

### Holder Segments
- **Short-term holders**: <155 days
- **Long-term holders**: >155 days
- STH vs LTH behavior diverges at turning points

### Whale Tracking
- 1K-10K BTC wallets
- Track accumulation/distribution
- Watch for exchange movements

### Entity-Adjusted Metrics
Remove exchange, custodian, internal transfers for cleaner data.

## Smart Money Tracking

### What to Watch
1. Known institutional wallets
2. Historically profitable addresses
3. VC/fund movements
4. Early investor behavior

### Tools and Approaches
- Nansen: Wallet labeling and smart money
- Arkham: Entity tracking
- Dune: Custom queries
- Glassnode: Professional metrics

## Building an Analysis Framework

1. **Define your timeframe**: Short, medium, long?
2. **Select key metrics**: Don't use everything
3. **Create dashboards**: Monitor consistently
4. **Combine data sources**: On-chain + price + social
5. **Document and iterate**: Track what works
""", "examples": ["Building a MVRV dashboard", "Tracking whale accumulation", "Using SOPR for entries"], "summary": "Advanced on-chain analytics provide edge through understanding actual blockchain behavior beyond price charts.", "readings": ["Glassnode Academy advanced courses", "Willy Woo analysis methods"]},
            {"title": "Evaluating Crypto Projects", "objectives": ["Develop due diligence frameworks", "Identify red flags", "Assess long-term viability"], "content": """
# Due Diligence: Evaluating Crypto Projects

A systematic approach to project evaluation separates informed investors from speculators.

## The DYOR Framework

### Team Analysis
- **Experience**: Relevant background?
- **Track Record**: Previous projects?
- **Transparency**: Doxxed and accessible?
- **Commitment**: Full-time? Vesting schedules?

### Technology Assessment
- **Innovation**: Novel solution or fork?
- **Security**: Audits, bug bounties?
- **Scalability**: Can it handle growth?
- **Interoperability**: Ecosystem connections?

### Tokenomics Review
- **Supply**: Fixed, inflationary, deflationary?
- **Distribution**: Fair or insider-heavy?
- **Utility**: Why hold the token?
- **Value Accrual**: How does value flow to token?

### Market Opportunity
- **TAM**: Total addressable market size?
- **Competition**: Differentiation?
- **Timing**: Too early or too late?
- **Adoption Path**: How does it grow?

## Red Flags Checklist

### Immediate Disqualifiers
- Anonymous team with no verifiable history
- No working product after years
- Plagiarized whitepaper
- Fake partnerships
- Coordinated shilling campaigns

### Warning Signs
- Unrealistic roadmap promises
- Heavy marketing, light development
- Token unlock dumps
- No real user growth
- Community driven by price, not product

## Research Sources

### Primary Sources
- Official documentation
- GitHub activity
- Team interviews
- Community channels

### Secondary Sources
- Independent audits
- Research reports (Messari, Delphi)
- Podcast appearances
- Historical news

## Evaluation Scorecard

Rate projects 1-10 on:
1. Team strength
2. Technology innovation
3. Tokenomics health
4. Market opportunity
5. Community quality
6. Competitive position
7. Execution track record

Total score guides conviction level.
""", "examples": ["Evaluating a new L1 protocol", "Analyzing token distribution", "Using GitHub for due diligence"], "summary": "Systematic due diligence through team, technology, tokenomics, and market analysis helps identify quality projects.", "readings": ["Crypto research methodology guides", "VC investment frameworks"]},
            {"title": "Long-Term Crypto Investment", "objectives": ["Develop long-term conviction", "Build wealth systematically", "Navigate multi-year cycles"], "content": """
# Long-Term Crypto Investment Strategy

Building generational wealth in crypto requires patience, conviction, and systematic approach.

## The Long-Term Thesis

### Why Hold Long-Term?
- Crypto is early in adoption curve
- Short-term noise vs long-term signal
- Compound growth over decades
- Tax efficiency of holding

### Conviction Building
You need conviction to hold through:
- 80%+ drawdowns
- Years of sideways action
- Negative media coverage
- Personal doubt

## Accumulation Strategies

### Dollar-Cost Averaging (DCA)
- Fixed amount at fixed intervals
- Removes timing decisions
- Reduces emotional impact
- Works best in accumulation phases

### Value Averaging
- Buy more when prices are low
- Buy less when prices are high
- More active than DCA
- Potentially better returns

### Lump Sum vs DCA
Historical data suggests lump sum often wins, but DCA is psychologically easier.

## Storage and Security

### Long-Term Custody Options
1. **Hardware Wallets**: Best security/usability balance
2. **Multi-Sig**: Distribute key control
3. **Custodians**: For large amounts, institutions

### Inheritance Planning
- Document wallet locations
- Seed phrase storage solutions
- Consider multi-sig with family
- Legal documentation

## Surviving Bear Markets

### Mental Preparation
- Bear markets are normal (50-80% drops)
- They're opportunities, not disasters
- Most holders don't survive them

### Practical Steps
1. Don't look at prices daily
2. Stay educated and engaged
3. Continue accumulating if possible
4. Have a plan and stick to it

## Exit Strategy Considerations

### When to Consider Selling
- Life-changing wealth achieved
- Thesis fundamentally broken
- Better opportunities emerge
- Rebalancing needs

### Scaling Out
Rather than all-at-once:
- Sell 10-20% at predetermined levels
- Keep core position indefinitely
- Take some profits, let rest ride
""", "examples": ["Building a 10-year DCA plan", "Multi-sig security setup", "Bear market accumulation strategy"], "summary": "Long-term crypto investment success requires strong conviction, systematic accumulation, robust security, and emotional resilience.", "readings": ["Bitcoin investment thesis papers", "Long-term portfolio construction guides"]}
        ]
    }
    
    course_lessons = lessons_data.get(course_id, [])
    for i, lesson_data in enumerate(course_lessons):
        lesson = {
            "id": f"{course_id}-lesson-{i+1}",
            "course_id": course_id,
            "title": lesson_data["title"],
            "order": i + 1,
            "learning_objectives": lesson_data["objectives"],
            "content": lesson_data["content"],
            "examples": lesson_data["examples"],
            "summary": lesson_data["summary"],
            "recommended_readings": lesson_data["readings"],
            "duration_minutes": 20 + (i * 5)
        }
        await db.lessons.insert_one(lesson)

async def create_quiz_for_lesson(lesson_id: str) -> dict:
    # Multilingual templates for trial lessons (lessons 1–3).
    # Each question uses correct_answer_index (0-based) and a translations dict.
    multilingual_templates = {
        "course-foundations-lesson-1": [
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "What is the primary purpose of blockchain technology?", "options": ["To replace all banks", "To create a distributed, immutable ledger", "To make computers faster", "To store images"], "explanation": "Blockchain's core innovation is providing a distributed ledger that's immutable and doesn't require trusted intermediaries."},
                    "fr": {"question": "Quel est l'objectif principal de la technologie blockchain ?", "options": ["Remplacer toutes les banques", "Créer un registre distribué et immuable", "Accélérer les ordinateurs", "Stocker des images"], "explanation": "L'innovation centrale de la blockchain est de fournir un registre distribué immuable qui ne nécessite pas d'intermédiaires de confiance."},
                    "pt": {"question": "Qual é o principal objetivo da tecnologia blockchain?", "options": ["Substituir todos os bancos", "Criar um registro distribuído e imutável", "Tornar os computadores mais rápidos", "Armazenar imagens"], "explanation": "A principal inovação do blockchain é fornecer um registro distribuído imutável que não requer intermediários confiáveis."},
                    "ar": {"question": "ما الهدف الأساسي من تقنية البلوكتشين؟", "options": ["استبدال جميع البنوك", "إنشاء دفتر أستاذ موزع وغير قابل للتغيير", "تسريع أجهزة الكمبيوتر", "تخزين الصور"], "explanation": "الابتكار الجوهري للبلوكتشين هو توفير دفتر أستاذ موزع غير قابل للتغيير لا يحتاج إلى وسطاء موثوقين."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "Blocks in a blockchain are connected using:", "options": ["Physical cables", "Cryptographic hashes", "Email links", "USB connections"], "explanation": "Each block contains the cryptographic hash of the previous block, creating an unbreakable chain."},
                    "fr": {"question": "Les blocs d'une blockchain sont reliés par :", "options": ["Des câbles physiques", "Des hachages cryptographiques", "Des liens e-mail", "Des connexions USB"], "explanation": "Chaque bloc contient le hachage cryptographique du bloc précédent, créant une chaîne inviolable."},
                    "pt": {"question": "Os blocos em um blockchain são conectados usando:", "options": ["Cabos físicos", "Hashes criptográficos", "Links de e-mail", "Conexões USB"], "explanation": "Cada bloco contém o hash criptográfico do bloco anterior, criando uma corrente inquebrável."},
                    "ar": {"question": "يتم ربط الكتل في البلوكتشين باستخدام:", "options": ["كابلات مادية", "هاشات تشفيرية", "روابط بريد إلكتروني", "اتصالات USB"], "explanation": "يحتوي كل كتلة على الهاش التشفيري للكتلة السابقة، مما يخلق سلسلة غير قابلة للكسر."},
                },
            },
            {
                "type": "true_false", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "A blockchain requires a central authority to function.", "options": ["True", "False"], "explanation": "Blockchain is decentralized by design, operating through consensus among many nodes without central authority."},
                    "fr": {"question": "Un blockchain nécessite une autorité centrale pour fonctionner.", "options": ["Vrai", "Faux"], "explanation": "La blockchain est décentralisée par conception, fonctionnant par consensus entre de nombreux nœuds sans autorité centrale."},
                    "pt": {"question": "Um blockchain requer uma autoridade central para funcionar.", "options": ["Verdadeiro", "Falso"], "explanation": "O blockchain é descentralizado por design, operando por consenso entre muitos nós sem autoridade central."},
                    "ar": {"question": "يحتاج البلوكتشين إلى سلطة مركزية للعمل.", "options": ["صحيح", "خطأ"], "explanation": "البلوكتشين لامركزي بطبيعته، يعمل من خلال التوافق بين العقد دون أي سلطة مركزية."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "What is a node in blockchain terminology?", "options": ["A type of cryptocurrency", "A computer that maintains a copy of the blockchain", "A transaction fee", "A wallet address"], "explanation": "Nodes are computers that validate transactions and maintain copies of the blockchain."},
                    "fr": {"question": "Qu'est-ce qu'un nœud dans la terminologie blockchain ?", "options": ["Un type de cryptomonnaie", "Un ordinateur qui maintient une copie de la blockchain", "Des frais de transaction", "Une adresse de portefeuille"], "explanation": "Les nœuds sont des ordinateurs qui valident les transactions et maintiennent des copies de la blockchain."},
                    "pt": {"question": "O que é um nó na terminologia blockchain?", "options": ["Um tipo de criptomoeda", "Um computador que mantém uma cópia do blockchain", "Uma taxa de transação", "Um endereço de carteira"], "explanation": "Os nós são computadores que validam transações e mantêm cópias do blockchain."},
                    "ar": {"question": "ما المقصود بالعقدة في مصطلحات البلوكتشين؟", "options": ["نوع من العملات المشفرة", "جهاز كمبيوتر يحتفظ بنسخة من البلوكتشين", "رسوم معاملة", "عنوان محفظة"], "explanation": "العقد هي أجهزة كمبيوتر تتحقق من المعاملات وتحتفظ بنسخ من البلوكتشين."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "What makes blockchain transactions immutable?", "options": ["Government regulations", "Cryptographic linking of blocks", "Password protection", "Cloud storage"], "explanation": "Once data is added to the blockchain, the cryptographic links make it virtually impossible to alter without detection."},
                    "fr": {"question": "Qu'est-ce qui rend les transactions blockchain immuables ?", "options": ["Les réglementations gouvernementales", "La liaison cryptographique des blocs", "La protection par mot de passe", "Le stockage en nuage"], "explanation": "Une fois les données ajoutées à la blockchain, les liens cryptographiques rendent pratiquement impossible toute modification sans détection."},
                    "pt": {"question": "O que torna as transações blockchain imutáveis?", "options": ["Regulamentações governamentais", "Vinculação criptográfica dos blocos", "Proteção por senha", "Armazenamento em nuvem"], "explanation": "Uma vez que os dados são adicionados ao blockchain, os vínculos criptográficos tornam praticamente impossível alterá-los sem detecção."},
                    "ar": {"question": "ما الذي يجعل معاملات البلوكتشين غير قابلة للتغيير؟", "options": ["اللوائح الحكومية", "الربط التشفيري للكتل", "حماية كلمة المرور", "التخزين السحابي"], "explanation": "بمجرد إضافة البيانات إلى البلوكتشين، يجعل الربط التشفيري تعديلها دون اكتشاف أمراً شبه مستحيل."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "Which best describes consensus in blockchain?", "options": ["A voting app", "Agreement mechanism ensuring all copies match", "A type of coin", "Network speed"], "explanation": "Consensus mechanisms ensure all nodes agree on the state of the blockchain."},
                    "fr": {"question": "Qu'est-ce qui décrit le mieux le consensus dans la blockchain ?", "options": ["Une application de vote", "Un mécanisme d'accord garantissant que toutes les copies correspondent", "Un type de monnaie", "La vitesse du réseau"], "explanation": "Les mécanismes de consensus garantissent que tous les nœuds s'accordent sur l'état de la blockchain."},
                    "pt": {"question": "O que melhor descreve o consenso no blockchain?", "options": ["Um aplicativo de votação", "Mecanismo de acordo garantindo que todas as cópias correspondam", "Um tipo de moeda", "Velocidade da rede"], "explanation": "Os mecanismos de consenso garantem que todos os nós concordem com o estado do blockchain."},
                    "ar": {"question": "أي من الخيارات يصف التوافق في البلوكتشين بشكل أفضل؟", "options": ["تطبيق تصويت", "آلية اتفاق تضمن تطابق جميع النسخ", "نوع من العملات", "سرعة الشبكة"], "explanation": "تضمن آليات التوافق أن جميع العقد تتفق على حالة البلوكتشين."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "Blockchain data is stored:", "options": ["In a single database", "Across thousands of computers", "Only in the cloud", "On USB drives"], "explanation": "Blockchain is distributed across many nodes worldwide for redundancy and security."},
                    "fr": {"question": "Les données blockchain sont stockées :", "options": ["Dans une seule base de données", "Sur des milliers d'ordinateurs", "Uniquement dans le nuage", "Sur des clés USB"], "explanation": "La blockchain est distribuée sur de nombreux nœuds dans le monde pour la redondance et la sécurité."},
                    "pt": {"question": "Os dados do blockchain são armazenados:", "options": ["Em um único banco de dados", "Em milhares de computadores", "Apenas na nuvem", "Em pendrives"], "explanation": "O blockchain é distribuído por muitos nós em todo o mundo para redundância e segurança."},
                    "ar": {"question": "يتم تخزين بيانات البلوكتشين:", "options": ["في قاعدة بيانات واحدة", "عبر آلاف أجهزة الكمبيوتر", "في السحابة فقط", "على محركات USB"], "explanation": "يتم توزيع البلوكتشين عبر العديد من العقد حول العالم للتكرار والأمان."},
                },
            },
        ],
        "course-foundations-lesson-2": [
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "Who created Bitcoin?", "options": ["Vitalik Buterin", "Satoshi Nakamoto", "Elon Musk", "Mark Zuckerberg"], "explanation": "Bitcoin was created by an anonymous person or group using the pseudonym Satoshi Nakamoto."},
                    "fr": {"question": "Qui a créé Bitcoin ?", "options": ["Vitalik Buterin", "Satoshi Nakamoto", "Elon Musk", "Mark Zuckerberg"], "explanation": "Bitcoin a été créé par une personne ou un groupe anonyme utilisant le pseudonyme Satoshi Nakamoto."},
                    "pt": {"question": "Quem criou o Bitcoin?", "options": ["Vitalik Buterin", "Satoshi Nakamoto", "Elon Musk", "Mark Zuckerberg"], "explanation": "O Bitcoin foi criado por uma pessoa ou grupo anônimo usando o pseudônimo Satoshi Nakamoto."},
                    "ar": {"question": "من أنشأ البيتكوين؟", "options": ["فيتاليك بوتيرين", "ساتوشي ناكاموتو", "إيلون ماسك", "مارك زوكربرغ"], "explanation": "أُنشئ البيتكوين من قبل شخص أو مجموعة مجهولة الهوية تستخدم اسماً مستعاراً هو ساتوشي ناكاموتو."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "What is the maximum supply of Bitcoin?", "options": ["Unlimited", "21 million", "100 million", "1 billion"], "explanation": "Bitcoin has a fixed maximum supply of 21 million coins, programmed into the protocol."},
                    "fr": {"question": "Quelle est l'offre maximale de Bitcoin ?", "options": ["Illimitée", "21 millions", "100 millions", "1 milliard"], "explanation": "Bitcoin a une offre maximale fixe de 21 millions de pièces, programmée dans le protocole."},
                    "pt": {"question": "Qual é a oferta máxima de Bitcoin?", "options": ["Ilimitada", "21 milhões", "100 milhões", "1 bilhão"], "explanation": "O Bitcoin tem uma oferta máxima fixa de 21 milhões de moedas, programada no protocolo."},
                    "ar": {"question": "ما هو الحد الأقصى لعرض البيتكوين؟", "options": ["غير محدود", "21 مليون", "100 مليون", "مليار"], "explanation": "يمتلك البيتكوين حداً أقصى ثابتاً للعرض يبلغ 21 مليون عملة، مبرمجاً في البروتوكول."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "Bitcoin was created in response to:", "options": ["Social media needs", "The 2008 financial crisis", "Gaming requirements", "Email limitations"], "explanation": "Bitcoin was created in 2009 as a response to the 2008 financial crisis and centralized banking failures."},
                    "fr": {"question": "Bitcoin a été créé en réponse à :", "options": ["Les besoins des réseaux sociaux", "La crise financière de 2008", "Les exigences du jeu vidéo", "Les limitations de l'e-mail"], "explanation": "Bitcoin a été créé en 2009 en réponse à la crise financière de 2008 et aux défaillances bancaires centralisées."},
                    "pt": {"question": "O Bitcoin foi criado em resposta a:", "options": ["Necessidades de redes sociais", "A crise financeira de 2008", "Requisitos de jogos", "Limitações do e-mail"], "explanation": "O Bitcoin foi criado em 2009 em resposta à crise financeira de 2008 e às falhas bancárias centralizadas."},
                    "ar": {"question": "أُنشئ البيتكوين استجابةً لـ:", "options": ["احتياجات وسائل التواصل الاجتماعي", "الأزمة المالية عام 2008", "متطلبات الألعاب", "قيود البريد الإلكتروني"], "explanation": "أُنشئ البيتكوين عام 2009 استجابةً للأزمة المالية لعام 2008 وإخفاقات البنوك المركزية."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 0,
                "translations": {
                    "en": {"question": "The smallest unit of Bitcoin is called:", "options": ["Satoshi", "Wei", "Gwei", "Bit"], "explanation": "A satoshi is the smallest unit of Bitcoin, equal to 0.00000001 BTC."},
                    "fr": {"question": "La plus petite unité de Bitcoin s'appelle :", "options": ["Satoshi", "Wei", "Gwei", "Bit"], "explanation": "Un satoshi est la plus petite unité de Bitcoin, égale à 0,00000001 BTC."},
                    "pt": {"question": "A menor unidade do Bitcoin é chamada de:", "options": ["Satoshi", "Wei", "Gwei", "Bit"], "explanation": "Um satoshi é a menor unidade do Bitcoin, igual a 0,00000001 BTC."},
                    "ar": {"question": "أصغر وحدة للبيتكوين تسمى:", "options": ["ساتوشي", "ويي", "غواي", "بت"], "explanation": "الساتوشي هو أصغر وحدة للبيتكوين، يساوي 0.00000001 بيتكوين."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "Bitcoin is often called 'digital gold' because:", "options": ["It's yellow colored", "It's scarce, durable, and portable", "It was invented by gold miners", "It can be converted to physical gold"], "explanation": "Like gold, Bitcoin is scarce (limited supply), durable (exists as long as the network), and portable (can be sent anywhere)."},
                    "fr": {"question": "Bitcoin est souvent appelé 'l'or numérique' parce que :", "options": ["Il est de couleur jaune", "Il est rare, durable et portable", "Il a été inventé par des mineurs d'or", "Il peut être converti en or physique"], "explanation": "Comme l'or, Bitcoin est rare (offre limitée), durable (existe tant que le réseau fonctionne) et portable (peut être envoyé partout)."},
                    "pt": {"question": "O Bitcoin é frequentemente chamado de 'ouro digital' porque:", "options": ["É de cor amarela", "É escasso, durável e portátil", "Foi inventado por mineradores de ouro", "Pode ser convertido em ouro físico"], "explanation": "Como o ouro, o Bitcoin é escasso (oferta limitada), durável (existe enquanto a rede funcionar) e portátil (pode ser enviado para qualquer lugar)."},
                    "ar": {"question": "كثيراً ما يُسمى البيتكوين 'الذهب الرقمي' لأنه:", "options": ["لونه أصفر", "نادر ومتين وقابل للحمل", "اخترعه عمال مناجم الذهب", "يمكن تحويله إلى ذهب مادي"], "explanation": "مثل الذهب، البيتكوين نادر (عرض محدود) ومتين (موجود طالما الشبكة تعمل) وقابل للحمل (يمكن إرساله في أي مكان)."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "Bitcoin transactions are recorded on:", "options": ["Private servers", "A public blockchain", "Paper ledgers", "Email"], "explanation": "Every Bitcoin transaction is recorded on the public blockchain for anyone to verify."},
                    "fr": {"question": "Les transactions Bitcoin sont enregistrées sur :", "options": ["Des serveurs privés", "Une blockchain publique", "Des registres papier", "L'e-mail"], "explanation": "Chaque transaction Bitcoin est enregistrée sur la blockchain publique, vérifiable par tous."},
                    "pt": {"question": "As transações Bitcoin são registradas em:", "options": ["Servidores privados", "Um blockchain público", "Livros-razão em papel", "E-mail"], "explanation": "Cada transação de Bitcoin é registrada no blockchain público para qualquer pessoa verificar."},
                    "ar": {"question": "يتم تسجيل معاملات البيتكوين على:", "options": ["خوادم خاصة", "بلوكتشين عام", "دفاتر ورقية", "البريد الإلكتروني"], "explanation": "كل معاملة بيتكوين مسجلة على البلوكتشين العام ليتمكن الجميع من التحقق منها."},
                },
            },
            {
                "type": "true_false", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "Bitcoin can be controlled by governments.", "options": ["True", "False"], "explanation": "Bitcoin is decentralized and censorship-resistant, making it difficult for any single entity to control."},
                    "fr": {"question": "Bitcoin peut être contrôlé par les gouvernements.", "options": ["Vrai", "Faux"], "explanation": "Bitcoin est décentralisé et résistant à la censure, ce qui rend difficile pour toute entité de le contrôler."},
                    "pt": {"question": "O Bitcoin pode ser controlado por governos.", "options": ["Verdadeiro", "Falso"], "explanation": "O Bitcoin é descentralizado e resistente à censura, tornando difícil para qualquer entidade controlá-lo."},
                    "ar": {"question": "يمكن للحكومات السيطرة على البيتكوين.", "options": ["صحيح", "خطأ"], "explanation": "البيتكوين لامركزي ومقاوم للرقابة، مما يجعل من الصعب على أي جهة واحدة السيطرة عليه."},
                },
            },
        ],
        "course-foundations-lesson-3": [
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "What is a public key used for?", "options": ["Spending cryptocurrency", "Receiving cryptocurrency", "Mining", "Creating tokens"], "explanation": "A public key (or address derived from it) is shared to receive funds."},
                    "fr": {"question": "À quoi sert une clé publique ?", "options": ["Dépenser des cryptomonnaies", "Recevoir des cryptomonnaies", "Miner", "Créer des tokens"], "explanation": "Une clé publique (ou l'adresse qui en est dérivée) est partagée pour recevoir des fonds."},
                    "pt": {"question": "Para que serve uma chave pública?", "options": ["Gastar criptomoedas", "Receber criptomoedas", "Minerar", "Criar tokens"], "explanation": "Uma chave pública (ou endereço derivado dela) é compartilhada para receber fundos."},
                    "ar": {"question": "ما استخدام المفتاح العام؟", "options": ["إنفاق العملات المشفرة", "استقبال العملات المشفرة", "التعدين", "إنشاء التوكنات"], "explanation": "يُشارك المفتاح العام (أو العنوان المشتق منه) لاستقبال الأموال."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "Your private key should:", "options": ["Be shared with friends", "Never be shared with anyone", "Be posted on social media", "Be given to exchanges"], "explanation": "Your private key controls your funds—never share it with anyone."},
                    "fr": {"question": "Votre clé privée doit :", "options": ["Être partagée avec des amis", "Ne jamais être partagée avec qui que ce soit", "Être publiée sur les réseaux sociaux", "Être donnée aux exchanges"], "explanation": "Votre clé privée contrôle vos fonds — ne la partagez jamais avec personne."},
                    "pt": {"question": "Sua chave privada deve:", "options": ["Ser compartilhada com amigos", "Nunca ser compartilhada com ninguém", "Ser postada nas redes sociais", "Ser dada a exchanges"], "explanation": "Sua chave privada controla seus fundos — nunca a compartilhe com ninguém."},
                    "ar": {"question": "مفتاحك الخاص يجب أن:", "options": ["يُشارك مع الأصدقاء", "لا يُشارك مع أي أحد أبداً", "يُنشر على وسائل التواصل الاجتماعي", "يُعطى للبورصات"], "explanation": "مفتاحك الخاص يتحكم في أموالك — لا تشاركه مع أي شخص أبداً."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "What consensus mechanism does Bitcoin use?", "options": ["Proof of Stake", "Proof of Work", "Proof of Authority", "Proof of History"], "explanation": "Bitcoin uses Proof of Work where miners compete to solve mathematical puzzles."},
                    "fr": {"question": "Quel mécanisme de consensus Bitcoin utilise-t-il ?", "options": ["Preuve d'enjeu", "Preuve de travail", "Preuve d'autorité", "Preuve d'historique"], "explanation": "Bitcoin utilise la preuve de travail où les mineurs s'affrontent pour résoudre des puzzles mathématiques."},
                    "pt": {"question": "Qual mecanismo de consenso o Bitcoin usa?", "options": ["Prova de Participação", "Prova de Trabalho", "Prova de Autoridade", "Prova de Histórico"], "explanation": "O Bitcoin usa a Prova de Trabalho, onde os mineradores competem para resolver quebra-cabeças matemáticos."},
                    "ar": {"question": "ما آلية التوافق التي يستخدمها البيتكوين؟", "options": ["إثبات الحصة", "إثبات العمل", "إثبات السلطة", "إثبات التاريخ"], "explanation": "يستخدم البيتكوين إثبات العمل حيث يتنافس المعدّنون لحل ألغاز رياضية."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 1,
                "translations": {
                    "en": {"question": "What happens after 6 confirmations on Bitcoin?", "options": ["Transaction is deleted", "Transaction is considered final", "Coins are doubled", "Mining stops"], "explanation": "6 confirmations (about 1 hour) is generally considered final for Bitcoin transactions."},
                    "fr": {"question": "Que se passe-t-il après 6 confirmations sur Bitcoin ?", "options": ["La transaction est supprimée", "La transaction est considérée comme finale", "Les pièces sont doublées", "Le minage s'arrête"], "explanation": "6 confirmations (environ 1 heure) est généralement considéré comme final pour les transactions Bitcoin."},
                    "pt": {"question": "O que acontece após 6 confirmações no Bitcoin?", "options": ["A transação é deletada", "A transação é considerada final", "As moedas são dobradas", "A mineração para"], "explanation": "6 confirmações (aproximadamente 1 hora) é geralmente considerado final para transações Bitcoin."},
                    "ar": {"question": "ما الذي يحدث بعد 6 تأكيدات على البيتكوين؟", "options": ["يتم حذف المعاملة", "تُعتبر المعاملة نهائية", "تتضاعف العملات", "يتوقف التعدين"], "explanation": "6 تأكيدات (حوالي ساعة واحدة) تُعتبر عموماً نهائية لمعاملات البيتكوين."},
                },
            },
            {
                "type": "multiple_choice", "correct_answer_index": 2,
                "translations": {
                    "en": {"question": "Miners are rewarded with:", "options": ["Only transaction fees", "Only new bitcoins", "Both new bitcoins and transaction fees", "Nothing"], "explanation": "Miners receive block rewards (new bitcoins) plus transaction fees for successfully mining a block."},
                    "fr": {"question": "Les mineurs sont récompensés par :", "options": ["Uniquement des frais de transaction", "Uniquement de nouveaux bitcoins", "Les deux : nouveaux bitcoins et frais de transaction", "Rien"], "explanation": "Les mineurs reçoivent des récompenses de bloc (nouveaux bitcoins) plus des frais de transaction pour chaque bloc miné avec succès."},
                    "pt": {"question": "Os mineradores são recompensados com:", "options": ["Apenas taxas de transação", "Apenas novos bitcoins", "Ambos: novos bitcoins e taxas de transação", "Nada"], "explanation": "Os mineradores recebem recompensas de bloco (novos bitcoins) mais taxas de transação por cada bloco minerado com sucesso."},
                    "ar": {"question": "يُكافأ المعدّنون بـ:", "options": ["رسوم المعاملات فقط", "بيتكوين جديد فقط", "كلاهما: بيتكوين جديد ورسوم المعاملات", "لا شيء"], "explanation": "يحصل المعدّنون على مكافآت الكتلة (بيتكوين جديد) بالإضافة إلى رسوم المعاملات مقابل تعدين كل كتلة بنجاح."},
                },
            },
            {
                "type": "true_false", "correct_answer_index": 0,
                "translations": {
                    "en": {"question": "Proof of Stake is more energy-efficient than Proof of Work.", "options": ["True", "False"], "explanation": "PoS doesn't require massive computing power like PoW, making it much more energy efficient."},
                    "fr": {"question": "La preuve d'enjeu est plus économe en énergie que la preuve de travail.", "options": ["Vrai", "Faux"], "explanation": "Le PoS ne nécessite pas une puissance de calcul massive comme le PoW, ce qui le rend beaucoup plus économe en énergie."},
                    "pt": {"question": "A Prova de Participação é mais eficiente em energia do que a Prova de Trabalho.", "options": ["Verdadeiro", "Falso"], "explanation": "O PoS não requer poder computacional massivo como o PoW, tornando-o muito mais eficiente em energia."},
                    "ar": {"question": "إثبات الحصة أكثر كفاءة في استهلاك الطاقة من إثبات العمل.", "options": ["صحيح", "خطأ"], "explanation": "لا يتطلب PoS قوة حوسبة ضخمة مثل PoW، مما يجعله أكثر كفاءة في استهلاك الطاقة."},
                },
            },
        ],
    }

    # For trial lessons: build questions from multilingual templates
    if lesson_id in multilingual_templates:
        questions = []
        for i, tpl in enumerate(multilingual_templates[lesson_id]):
            questions.append({
                "id": f"{lesson_id}-q{i+1}",
                "question_type": tpl["type"],
                "correct_answer_index": tpl["correct_answer_index"],
                "translations": tpl["translations"],
            })
        quiz = {
            "id": f"quiz-{lesson_id}",
            "lesson_id": lesson_id,
            "title": f"Quiz: Lesson {lesson_id.split('-lesson-')[-1]}",
            "questions": questions,
        }
        await db.quizzes.insert_one(quiz)
        return quiz

    # For all other lessons: legacy English-only templates
    quiz_templates = {
        "course-foundations-lesson-4": [
            {"q": "A crypto wallet actually stores:", "type": "multiple_choice", "options": ["Cryptocurrency coins", "Private keys", "Blockchain data", "Mining equipment"], "answer": "Private keys", "exp": "Wallets store private keys that control your cryptocurrency on the blockchain."},
            {"q": "Which is considered a 'hot wallet'?", "type": "multiple_choice", "options": ["Hardware wallet", "Paper wallet", "Mobile wallet app", "Steel plate backup"], "answer": "Mobile wallet app", "exp": "Hot wallets are connected to the internet, like mobile apps, desktop software, or web wallets."},
            {"q": "A hardware wallet is best for:", "type": "multiple_choice", "options": ["Daily spending", "Long-term secure storage", "Gaming", "Social media"], "answer": "Long-term secure storage", "exp": "Hardware wallets provide maximum security for storing significant amounts long-term."},
            {"q": "A seed phrase is typically:", "type": "multiple_choice", "options": ["6 words", "12-24 words", "100 words", "A password"], "answer": "12-24 words", "exp": "Seed phrases are usually 12, 18, or 24 words that can recover your entire wallet."},
            {"q": "You should store your seed phrase:", "type": "multiple_choice", "options": ["In a cloud document", "In your email", "Written on paper in secure locations", "On social media"], "answer": "Written on paper in secure locations", "exp": "Never store seed phrases digitally—write them on paper and store in multiple secure locations."},
            {"q": "Cold wallets are connected to the internet.", "type": "true_false", "options": ["True", "False"], "answer": "False", "exp": "Cold wallets (hardware, paper) are offline, which is why they're more secure."},
            {"q": "MetaMask is an example of:", "type": "multiple_choice", "options": ["Hardware wallet", "Cold storage", "Web/browser wallet", "Paper wallet"], "answer": "Web/browser wallet", "exp": "MetaMask is a popular browser-based hot wallet for interacting with Ethereum and other blockchains."}
        ],
        "course-foundations-lesson-5": [
            {"q": "What is the 'golden rule' of crypto security?", "type": "multiple_choice", "options": ["Buy high, sell low", "Not your keys, not your coins", "Trust everyone", "Share passwords"], "answer": "Not your keys, not your coins", "exp": "If you don't control your private keys (like on an exchange), you don't truly control your funds."},
            {"q": "SIM swapping attacks target:", "type": "multiple_choice", "options": ["Your computer", "Your phone number", "Your wallet", "Your router"], "answer": "Your phone number", "exp": "SIM swapping convinces your phone carrier to transfer your number to an attacker's device."},
            {"q": "Which 2FA method is safest?", "type": "multiple_choice", "options": ["SMS codes", "Authenticator apps", "Email codes", "No 2FA"], "answer": "Authenticator apps", "exp": "Authenticator apps like Google Authenticator are safer than SMS, which can be intercepted via SIM swaps."},
            {"q": "Phishing attacks try to:", "type": "multiple_choice", "options": ["Improve your security", "Steal your credentials through fake sites", "Give you free crypto", "Speed up transactions"], "answer": "Steal your credentials through fake sites", "exp": "Phishing creates fake websites that look legitimate to steal your login information or keys."},
            {"q": "Legitimate support staff will ask for your seed phrase.", "type": "true_false", "options": ["True", "False"], "answer": "False", "exp": "Real support NEVER asks for your seed phrase—anyone who does is a scammer."},
            {"q": "Before sending crypto, you should:", "type": "multiple_choice", "options": ["Send the full amount immediately", "Double-check the address", "Trust autocomplete", "Not verify anything"], "answer": "Double-check the address", "exp": "Always verify addresses before sending—transactions cannot be reversed."}
        ],
        "course-foundations-lesson-6": [
            {"q": "CEX stands for:", "type": "multiple_choice", "options": ["Crypto Exchange eXpert", "Centralized Exchange", "Customer Experience", "Chain Exchange"], "answer": "Centralized Exchange", "exp": "CEX means Centralized Exchange, like Coinbase or Binance."},
            {"q": "DEX stands for:", "type": "multiple_choice", "options": ["Digital Exchange", "Decentralized Exchange", "Dollar Exchange", "Direct Exchange"], "answer": "Decentralized Exchange", "exp": "DEX means Decentralized Exchange, like Uniswap or SushiSwap."},
            {"q": "On a CEX, who holds custody of your funds?", "type": "multiple_choice", "options": ["You", "The exchange company", "The government", "Miners"], "answer": "The exchange company", "exp": "Centralized exchanges hold custody of your funds in their wallets."},
            {"q": "DEXs typically require:", "type": "multiple_choice", "options": ["KYC verification", "No KYC—just connect wallet", "Government ID", "Social security number"], "answer": "No KYC—just connect wallet", "exp": "DEXs are permissionless—you just connect your wallet directly."},
            {"q": "Which is better for converting fiat to crypto?", "type": "multiple_choice", "options": ["DEX", "CEX", "Paper wallet", "Mining"], "answer": "CEX", "exp": "CEXs offer fiat on-ramps (bank transfers, cards) that DEXs typically don't have."},
            {"q": "Smart contract risk is higher on:", "type": "multiple_choice", "options": ["CEX", "DEX", "Both equally", "Neither"], "answer": "DEX", "exp": "DEXs rely on smart contracts which could have vulnerabilities, unlike CEXs which use traditional systems."}
        ],
        "course-foundations-lesson-7": [
            {"q": "Stablecoins are designed to:", "type": "multiple_choice", "options": ["Increase in value rapidly", "Maintain a stable value", "Replace Bitcoin", "Be used for mining"], "answer": "Maintain a stable value", "exp": "Stablecoins aim to maintain a stable value, typically pegged to $1 USD."},
            {"q": "USDC is backed by:", "type": "multiple_choice", "options": ["Cryptocurrency", "US dollars in bank accounts", "Algorithms only", "Gold"], "answer": "US dollars in bank accounts", "exp": "USDC is a fiat-collateralized stablecoin backed 1:1 by dollars held in reserves."},
            {"q": "DAI is an example of:", "type": "multiple_choice", "options": ["Fiat-backed stablecoin", "Crypto-collateralized stablecoin", "Algorithmic stablecoin", "Central bank currency"], "answer": "Crypto-collateralized stablecoin", "exp": "DAI is backed by cryptocurrency collateral, primarily ETH, through MakerDAO."},
            {"q": "The UST/LUNA collapse showed risks of:", "type": "multiple_choice", "options": ["Fiat-backed stablecoins", "Algorithmic stablecoins", "Hardware wallets", "Bitcoin"], "answer": "Algorithmic stablecoins", "exp": "UST was an algorithmic stablecoin that collapsed in 2022, losing its peg catastrophically."},
            {"q": "Stablecoins are useful for:", "type": "multiple_choice", "options": ["Long-term appreciation", "Avoiding volatility while staying in crypto", "Mining rewards", "Governance voting only"], "answer": "Avoiding volatility while staying in crypto", "exp": "Stablecoins let you avoid crypto volatility while keeping funds on-chain for quick deployment."},
            {"q": "All stablecoins carry zero risk.", "type": "true_false", "options": ["True", "False"], "answer": "False", "exp": "Stablecoins carry various risks including depegging, regulatory action, and smart contract vulnerabilities."}
        ],
        "course-foundations-lesson-8": [
            {"q": "Before buying crypto, you should:", "type": "multiple_choice", "options": ["Skip verification", "Enable all security features first", "Share your password", "Use public WiFi"], "answer": "Enable all security features first", "exp": "Set up 2FA and other security before depositing any funds."},
            {"q": "The cheapest way to fund an exchange account is usually:", "type": "multiple_choice", "options": ["Credit card", "Wire transfer", "Bank transfer/ACH", "Gift cards"], "answer": "Bank transfer/ACH", "exp": "Bank transfers typically have the lowest fees, though they take longer."},
            {"q": "FOMO stands for:", "type": "multiple_choice", "options": ["First Order Market Option", "Fear Of Missing Out", "Fund Of Mutual Ownership", "For Online Money Only"], "answer": "Fear Of Missing Out", "exp": "FOMO is the anxiety of missing profitable opportunities, often leading to impulsive buying."},
            {"q": "When should you move crypto to self-custody?", "type": "multiple_choice", "options": ["Never", "When comfortable and for significant amounts", "Only after 10 years", "Immediately before selling"], "answer": "When comfortable and for significant amounts", "exp": "Move to self-custody once you understand how wallets work, especially for larger amounts."},
            {"q": "Cryptocurrency transactions may be:", "type": "multiple_choice", "options": ["Tax-free everywhere", "Taxable events in many countries", "Only taxed in crypto", "Never reported"], "answer": "Taxable events in many countries", "exp": "Most countries treat crypto buys/sells as taxable events—keep records."},
            {"q": "You should invest more than you can afford to lose in crypto.", "type": "true_false", "options": ["True", "False"], "answer": "False", "exp": "Never invest more than you can afford to lose—crypto is highly volatile."}
        ],
        "course-investor-lesson-1": [
            {"q": "An altcoin is:", "type": "multiple_choice", "options": ["A fake coin", "Any cryptocurrency other than Bitcoin", "Only Ethereum", "A broken coin"], "answer": "Any cryptocurrency other than Bitcoin", "exp": "Altcoin means 'alternative coin'—any cryptocurrency that isn't Bitcoin."},
            {"q": "Ethereum is primarily known as:", "type": "multiple_choice", "options": ["A payment system only", "A smart contract platform", "A stablecoin", "A mining pool"], "answer": "A smart contract platform", "exp": "Ethereum pioneered smart contracts and hosts the largest DeFi ecosystem."},
            {"q": "TVL stands for:", "type": "multiple_choice", "options": ["Total Value Listed", "Total Value Locked", "Token Value Limit", "Trading Volume Level"], "answer": "Total Value Locked", "exp": "TVL measures the total value of assets deposited in a DeFi protocol."},
            {"q": "A red flag when evaluating altcoins is:", "type": "multiple_choice", "options": ["Active GitHub development", "Transparent team", "Anonymous team with no track record", "Multiple security audits"], "answer": "Anonymous team with no track record", "exp": "Anonymous teams without history significantly increase the risk of scams or abandoned projects."},
            {"q": "During 'alt season':", "type": "multiple_choice", "options": ["Bitcoin outperforms everything", "Altcoins outperform Bitcoin", "All crypto crashes", "Nothing happens"], "answer": "Altcoins outperform Bitcoin", "exp": "Alt season refers to periods when altcoins surge relative to Bitcoin."},
            {"q": "Active developer count indicates:", "type": "multiple_choice", "options": ["Token price", "Project development health", "Exchange listings", "Marketing budget"], "answer": "Project development health", "exp": "Active GitHub development shows ongoing work and commitment to the project."}
        ],
        "course-investor-lesson-2": [
            {"q": "Tokenomics refers to:", "type": "multiple_choice", "options": ["Token art design", "Economic design of a cryptocurrency", "Token color schemes", "Mining difficulty"], "answer": "Economic design of a cryptocurrency", "exp": "Tokenomics covers supply, distribution, incentives, and value accrual mechanisms."},
            {"q": "A deflationary token:", "type": "multiple_choice", "options": ["Increases supply over time", "Burns supply over time", "Has unlimited supply", "Never changes supply"], "answer": "Burns supply over time", "exp": "Deflationary mechanisms reduce total supply through burns, creating scarcity."},
            {"q": "Vesting schedules exist to:", "type": "multiple_choice", "options": ["Speed up selling", "Prevent team/investor dumps", "Increase prices instantly", "Create more tokens"], "answer": "Prevent team/investor dumps", "exp": "Vesting releases tokens gradually to prevent large holders from dumping immediately."},
            {"q": "Heavy team allocation (>40%) is:", "type": "multiple_choice", "options": ["Always good", "A potential red flag", "Required by law", "Impossible"], "answer": "A potential red flag", "exp": "High insider allocation creates risk of dumps and misaligned incentives."},
            {"q": "EIP-1559 introduced to Ethereum:", "type": "multiple_choice", "options": ["New tokens", "Fee burning mechanism", "Proof of Work", "More validators"], "answer": "Fee burning mechanism", "exp": "EIP-1559 burns a portion of transaction fees, reducing ETH supply."},
            {"q": "Circulating supply is:", "type": "multiple_choice", "options": ["All tokens ever created", "Tokens currently tradable", "Tokens that will never exist", "Burned tokens"], "answer": "Tokens currently tradable", "exp": "Circulating supply is the amount of tokens available and trading in the market."}
        ],
        "course-investor-lesson-3": [
            {"q": "DeFi stands for:", "type": "multiple_choice", "options": ["Digital Finance", "Decentralized Finance", "Defined Finance", "Deferred Finance"], "answer": "Decentralized Finance", "exp": "DeFi means Decentralized Finance—financial services built on blockchain without intermediaries."},
            {"q": "Aave is primarily a:", "type": "multiple_choice", "options": ["DEX", "Lending/borrowing protocol", "NFT marketplace", "Mining pool"], "answer": "Lending/borrowing protocol", "exp": "Aave is a leading DeFi protocol for lending and borrowing cryptocurrency."},
            {"q": "Impermanent loss occurs when:", "type": "multiple_choice", "options": ["You forget your password", "Price ratio of pooled assets changes", "Gas fees are high", "You sell at profit"], "answer": "Price ratio of pooled assets changes", "exp": "Impermanent loss happens to liquidity providers when token prices diverge from when they deposited."},
            {"q": "Liquid staking lets you:", "type": "multiple_choice", "options": ["Only stake forever", "Stake and still use tokens in DeFi", "Avoid all risks", "Mine Bitcoin"], "answer": "Stake and still use tokens in DeFi", "exp": "Liquid staking gives you a token (like stETH) that represents your stake while earning rewards."},
            {"q": "Higher DeFi yields usually mean:", "type": "multiple_choice", "options": ["Lower risk", "Higher risk", "Guaranteed profits", "No risk"], "answer": "Higher risk", "exp": "Higher yields typically come with higher risks—smart contracts, liquidation, token depreciation."},
            {"q": "DeFi protocols require a bank account to use.", "type": "true_false", "options": ["True", "False"], "answer": "False", "exp": "DeFi is permissionless—you only need a wallet and tokens to participate."}
        ],
        "course-investor-lesson-4": [
            {"q": "NFT stands for:", "type": "multiple_choice", "options": ["New Financial Token", "Non-Fungible Token", "Network File Transfer", "Native Funding Tool"], "answer": "Non-Fungible Token", "exp": "NFT means Non-Fungible Token—each one is unique and not interchangeable."},
            {"q": "ERC-721 is a standard for:", "type": "multiple_choice", "options": ["Fungible tokens", "Non-fungible tokens", "Stablecoins", "Governance tokens"], "answer": "Non-fungible tokens", "exp": "ERC-721 is Ethereum's original NFT standard for unique tokens."},
            {"q": "NFT metadata typically includes:", "type": "multiple_choice", "options": ["Mining rewards", "Name, description, and image URL", "Exchange prices", "Bank information"], "answer": "Name, description, and image URL", "exp": "NFT metadata contains the token's name, description, image/media link, and attributes."},
            {"q": "PFP NFTs are:", "type": "multiple_choice", "options": ["Payment protocols", "Profile picture collections", "Private funding pools", "Public file protocols"], "answer": "Profile picture collections", "exp": "PFP (Profile Picture) NFTs are collections designed for use as social media avatars."},
            {"q": "A rug pull in NFTs means:", "type": "multiple_choice", "options": ["Cleaning service", "Developers abandon project after taking funds", "Trading strategy", "Minting process"], "answer": "Developers abandon project after taking funds", "exp": "A rug pull is when creators abandon an NFT project after collecting mint revenue."},
            {"q": "OpenSea is:", "type": "multiple_choice", "options": ["A blockchain", "An NFT marketplace", "A cryptocurrency", "A wallet"], "answer": "An NFT marketplace", "exp": "OpenSea is the largest NFT marketplace where users can buy, sell, and trade NFTs."}
        ],
        "course-investor-lesson-5": [
            {"q": "Layer-2 solutions help with:", "type": "multiple_choice", "options": ["Creating new blockchains", "Scaling and reducing fees", "Mining faster", "Deleting transactions"], "answer": "Scaling and reducing fees", "exp": "L2s process transactions off the main chain to increase throughput and reduce costs."},
            {"q": "Optimistic rollups assume transactions are:", "type": "multiple_choice", "options": ["Always invalid", "Valid by default", "Free", "Instant"], "answer": "Valid by default", "exp": "Optimistic rollups assume validity and use fraud proofs to challenge invalid transactions."},
            {"q": "ZK rollups use:", "type": "multiple_choice", "options": ["Fraud proofs", "Validity proofs", "No proofs", "Social proofs"], "answer": "Validity proofs", "exp": "ZK rollups generate cryptographic proofs that prove transaction validity mathematically."},
            {"q": "The withdrawal period for optimistic rollups is typically:", "type": "multiple_choice", "options": ["Instant", "7 days", "1 year", "Never"], "answer": "7 days", "exp": "Optimistic rollups have a ~7 day challenge period for withdrawals to L1."},
            {"q": "Arbitrum is an example of:", "type": "multiple_choice", "options": ["Layer-1 blockchain", "Optimistic rollup", "ZK rollup", "Sidechain"], "answer": "Optimistic rollup", "exp": "Arbitrum is a popular optimistic rollup scaling solution for Ethereum."},
            {"q": "Base is backed by:", "type": "multiple_choice", "options": ["Binance", "Coinbase", "OpenAI", "Amazon"], "answer": "Coinbase", "exp": "Base is a Layer-2 blockchain built by Coinbase using the OP Stack."}
        ],
        "course-investor-lesson-6": [
            {"q": "On-chain analysis examines:", "type": "multiple_choice", "options": ["Social media posts", "Blockchain data", "News articles", "Stock prices"], "answer": "Blockchain data", "exp": "On-chain analysis studies actual blockchain transactions and metrics."},
            {"q": "MVRV ratio compares:", "type": "multiple_choice", "options": ["Market cap to realized cap", "Volume to price", "Users to transactions", "Fees to rewards"], "answer": "Market cap to realized cap", "exp": "MVRV = Market Value / Realized Value, helps identify overbought/oversold conditions."},
            {"q": "Increasing exchange reserves typically indicate:", "type": "multiple_choice", "options": ["Accumulation (bullish)", "Potential selling pressure", "Network growth", "Mining activity"], "answer": "Potential selling pressure", "exp": "Coins moving to exchanges often signal intent to sell."},
            {"q": "Whale wallets hold:", "type": "multiple_choice", "options": ["Small amounts", "Very large amounts of cryptocurrency", "Only NFTs", "No cryptocurrency"], "answer": "Very large amounts of cryptocurrency", "exp": "Whale wallets hold significant amounts that can influence market prices."},
            {"q": "High positive funding rates suggest:", "type": "multiple_choice", "options": ["Market is overleveraged short", "Market is overleveraged long", "No leverage exists", "Funding is disabled"], "answer": "Market is overleveraged long", "exp": "High positive funding means longs pay shorts—market is overleveraged bullish."},
            {"q": "Glassnode is a tool for:", "type": "multiple_choice", "options": ["Social media", "On-chain analytics", "Video editing", "Music streaming"], "answer": "On-chain analytics", "exp": "Glassnode provides on-chain metrics and analytics for cryptocurrency analysis."}
        ],
        "course-investor-lesson-7": [
            {"q": "Bitcoin halving occurs approximately every:", "type": "multiple_choice", "options": ["1 year", "4 years", "10 years", "Every month"], "answer": "4 years", "exp": "Bitcoin halving happens roughly every 4 years (every 210,000 blocks)."},
            {"q": "During the euphoria phase:", "type": "multiple_choice", "options": ["Prices are at bottom", "Mainstream FOMO and unsustainable gains", "Smart money accumulates", "No trading occurs"], "answer": "Mainstream FOMO and unsustainable gains", "exp": "Euphoria is characterized by extreme optimism, FOMO, and often marks cycle tops."},
            {"q": "The Fear & Greed Index measures:", "type": "multiple_choice", "options": ["Transaction speed", "Market sentiment", "Block size", "Mining difficulty"], "answer": "Market sentiment", "exp": "The Fear & Greed Index gauges overall market sentiment from extreme fear to extreme greed."},
            {"q": "Bitcoin dominance shows:", "type": "multiple_choice", "options": ["Bitcoin's price", "Bitcoin's market cap percentage vs all crypto", "Mining hashrate", "Transaction count"], "answer": "Bitcoin's market cap percentage vs all crypto", "exp": "BTC dominance indicates what percentage of total crypto market cap is Bitcoin."},
            {"q": "The capitulation phase involves:", "type": "multiple_choice", "options": ["Buying at all-time highs", "Panic selling and giving up", "Steady accumulation", "Market stability"], "answer": "Panic selling and giving up", "exp": "Capitulation is when holders surrender, often marking market bottoms."},
            {"q": "Alt season typically occurs:", "type": "multiple_choice", "options": ["Before Bitcoin rallies", "After Bitcoin establishes its rally", "During bear markets only", "Never"], "answer": "After Bitcoin establishes its rally", "exp": "Altcoins usually surge after Bitcoin leads the initial rally."}
        ],
        "course-investor-lesson-8": [
            {"q": "Position sizing helps with:", "type": "multiple_choice", "options": ["Mining faster", "Managing risk exposure", "Increasing leverage", "Avoiding taxes"], "answer": "Managing risk exposure", "exp": "Position sizing limits how much capital you risk on any single trade."},
            {"q": "A stop-loss is:", "type": "multiple_choice", "options": ["A type of wallet", "An exit point to limit losses", "A mining reward", "A token type"], "answer": "An exit point to limit losses", "exp": "Stop-losses automatically exit positions at predetermined prices to limit downside."},
            {"q": "FOMO often leads to:", "type": "multiple_choice", "options": ["Careful analysis", "Impulsive buying at highs", "Better returns", "Lower risk"], "answer": "Impulsive buying at highs", "exp": "FOMO causes emotional buying often at market tops, leading to losses."},
            {"q": "A conservative crypto allocation might be:", "type": "multiple_choice", "options": ["100% in one altcoin", "50-60% BTC/ETH, rest in other assets", "0% in crypto", "All in memecoins"], "answer": "50-60% BTC/ETH, rest in other assets", "exp": "Conservative portfolios weight heavily toward established assets like BTC/ETH."},
            {"q": "Max drawdown measures:", "type": "multiple_choice", "options": ["Maximum profit", "Largest peak-to-trough decline", "Average return", "Trading volume"], "answer": "Largest peak-to-trough decline", "exp": "Max drawdown shows the worst decline from a peak, measuring potential pain."},
            {"q": "You should never invest more than you can afford to lose.", "type": "true_false", "options": ["True", "False"], "answer": "True", "exp": "Crypto can drop 80%+—only invest money you truly don't need."}
        ],
        "course-strategist-lesson-1": [
            {"q": "Volume Profile shows:", "type": "multiple_choice", "options": ["Social media volume", "Price levels with most trading activity", "Mining volume", "Token supply"], "answer": "Price levels with most trading activity", "exp": "Volume Profile displays which price levels have seen the most trading volume."},
            {"q": "The Point of Control (POC) is:", "type": "multiple_choice", "options": ["A regulatory body", "The highest volume node", "A trading fee", "A wallet type"], "answer": "The highest volume node", "exp": "POC is the price level where the most volume has traded."},
            {"q": "Head and Shoulders is a:", "type": "multiple_choice", "options": ["Shampoo brand", "Reversal pattern", "Mining algorithm", "Token standard"], "answer": "Reversal pattern", "exp": "Head and Shoulders is a bearish reversal pattern signaling potential trend change."},
            {"q": "Backtesting involves:", "type": "multiple_choice", "options": ["Trading live", "Testing strategies on historical data", "Backing up wallets", "Restoring data"], "answer": "Testing strategies on historical data", "exp": "Backtesting validates trading strategies using past market data."},
            {"q": "Trend following strategies:", "type": "multiple_choice", "options": ["Buy breakouts, sell breakdowns", "Always buy low, sell high", "Only trade sideways markets", "Never use stop losses"], "answer": "Buy breakouts, sell breakdowns", "exp": "Trend followers buy momentum breakouts and exit on breakdowns."},
            {"q": "Fibonacci extensions project:", "type": "multiple_choice", "options": ["Support levels only", "Price targets beyond retracements", "Mining difficulty", "Block sizes"], "answer": "Price targets beyond retracements", "exp": "Fibonacci extensions help identify potential price targets beyond retracement levels."}
        ],
        "course-strategist-lesson-2": [
            {"q": "Loss aversion means losses feel:", "type": "multiple_choice", "options": ["The same as gains", "2x worse than equivalent gains", "Better than gains", "Insignificant"], "answer": "2x worse than equivalent gains", "exp": "Psychologically, losses hurt about twice as much as equivalent gains feel good."},
            {"q": "Confirmation bias causes traders to:", "type": "multiple_choice", "options": ["Seek opposing views", "Only see information confirming their beliefs", "Trade randomly", "Avoid all news"], "answer": "Only see information confirming their beliefs", "exp": "Confirmation bias leads to cherry-picking information that supports existing positions."},
            {"q": "Anchoring in trading means:", "type": "multiple_choice", "options": ["Using a boat", "Fixating on purchase price", "Setting stop losses", "Following trends"], "answer": "Fixating on purchase price", "exp": "Anchoring causes traders to fixate on what they paid rather than current reality."},
            {"q": "The best time to sell is often when:", "type": "multiple_choice", "options": ["Everyone is extremely bullish", "Everyone has given up", "Prices are at ATH", "Volume is zero"], "answer": "Everyone is extremely bullish", "exp": "Extreme bullishness often marks tops—contrarian selling can be profitable."},
            {"q": "A trading journal helps with:", "type": "multiple_choice", "options": ["Finding trades", "Reviewing and improving performance", "Predicting prices", "Mining crypto"], "answer": "Reviewing and improving performance", "exp": "Trading journals help identify patterns in your behavior and improve decision-making."},
            {"q": "Revenge trading typically leads to:", "type": "multiple_choice", "options": ["Recovery of losses", "More losses", "Consistent profits", "Better analysis"], "answer": "More losses", "exp": "Revenge trading after losses usually leads to emotional decisions and more losses."}
        ],
        "course-strategist-lesson-3": [
            {"q": "The Sharpe ratio measures:", "type": "multiple_choice", "options": ["Total returns only", "Risk-adjusted returns", "Maximum loss", "Trading frequency"], "answer": "Risk-adjusted returns", "exp": "Sharpe ratio shows returns relative to the risk taken—higher is better."},
            {"q": "Core-satellite portfolio strategy uses:", "type": "multiple_choice", "options": ["Only altcoins", "Stable core + speculative satellites", "100% stablecoins", "No diversification"], "answer": "Stable core + speculative satellites", "exp": "Core-satellite holds major assets for stability with smaller speculative positions."},
            {"q": "Threshold-based rebalancing triggers when:", "type": "multiple_choice", "options": ["On a fixed schedule", "Allocations drift beyond a percentage", "Never", "Daily"], "answer": "Allocations drift beyond a percentage", "exp": "Threshold rebalancing occurs when positions drift more than 5-10% from targets."},
            {"q": "Tax-loss harvesting involves:", "type": "multiple_choice", "options": ["Avoiding all taxes", "Selling losers to offset gains", "Never selling", "Only buying"], "answer": "Selling losers to offset gains", "exp": "Tax-loss harvesting sells losing positions to offset taxable gains elsewhere."},
            {"q": "Benchmarking compares your portfolio to:", "type": "multiple_choice", "options": ["Your goals", "Reference portfolios or indexes", "Other traders", "Nothing"], "answer": "Reference portfolios or indexes", "exp": "Benchmarking measures performance against standards like BTC-only or market indexes."},
            {"q": "Win rate alone determines profitability.", "type": "true_false", "options": ["True", "False"], "answer": "False", "exp": "Profitability depends on win rate AND average win size vs loss size."}
        ],
        "course-strategist-lesson-4": [
            {"q": "When interest rates rise, crypto typically:", "type": "multiple_choice", "options": ["Benefits strongly", "Faces pressure", "Is unaffected", "Mining increases"], "answer": "Faces pressure", "exp": "Higher rates make safer yields more attractive, often pressuring risk assets like crypto."},
            {"q": "Bitcoin is sometimes viewed as:", "type": "multiple_choice", "options": ["An inflation hedge", "A stablecoin", "A mining reward", "A governance token"], "answer": "An inflation hedge", "exp": "Bitcoin's fixed supply makes it a potential hedge against currency devaluation."},
            {"q": "DXY measures:", "type": "multiple_choice", "options": ["Crypto prices", "US Dollar strength", "Mining difficulty", "Transaction speed"], "answer": "US Dollar strength", "exp": "DXY (Dollar Index) measures USD strength against a basket of currencies."},
            {"q": "Global M2 money supply correlating with BTC suggests:", "type": "multiple_choice", "options": ["No relationship", "Liquidity drives crypto prices", "Mining creates money", "BTC is a stablecoin"], "answer": "Liquidity drives crypto prices", "exp": "BTC often rises when global liquidity expands (money printing) and falls during tightening."},
            {"q": "MiCA regulation applies to:", "type": "multiple_choice", "options": ["United States", "Europe", "China only", "No country"], "answer": "Europe", "exp": "MiCA (Markets in Crypto-Assets) is the EU's comprehensive crypto regulatory framework."},
            {"q": "Bitcoin ETF approval was considered:", "type": "multiple_choice", "options": ["Irrelevant", "A major catalyst for institutional adoption", "Bad for Bitcoin", "A mining upgrade"], "answer": "A major catalyst for institutional adoption", "exp": "Bitcoin ETFs opened crypto investment to traditional finance, a major adoption milestone."}
        ],
        "course-strategist-lesson-5": [
            {"q": "Realized Cap sums all coins at their:", "type": "multiple_choice", "options": ["Current price", "Last moved price", "All-time high", "Zero value"], "answer": "Last moved price", "exp": "Realized Cap values each coin at the price when it last moved, representing aggregate cost basis."},
            {"q": "SOPR below 1 indicates:", "type": "multiple_choice", "options": ["Sellers are in profit", "Sellers are at a loss", "No trading", "High volume"], "answer": "Sellers are at a loss", "exp": "SOPR (Spent Output Profit Ratio) below 1 means coins are being sold at a loss."},
            {"q": "Coin Days Destroyed spikes when:", "type": "multiple_choice", "options": ["New coins are minted", "Old coins move", "Mining stops", "Exchanges close"], "answer": "Old coins move", "exp": "CDD increases when long-held coins move, often signaling distribution at tops."},
            {"q": "Long-term holders (LTH) have held coins for:", "type": "multiple_choice", "options": ["1 day", "1 week", "More than 155 days", "Forever"], "answer": "More than 155 days", "exp": "LTH classification typically requires holding for 155+ days."},
            {"q": "Nansen is known for:", "type": "multiple_choice", "options": ["Mining", "Wallet labeling and smart money tracking", "NFT creation", "Stablecoin issuance"], "answer": "Wallet labeling and smart money tracking", "exp": "Nansen labels wallets and tracks smart money movements on-chain."},
            {"q": "Entity-adjusted metrics remove:", "type": "multiple_choice", "options": ["All transactions", "Exchange and internal transfers", "Mining rewards", "Smart contracts"], "answer": "Exchange and internal transfers", "exp": "Entity adjustment filters out internal exchange movements for cleaner analysis."}
        ],
        "course-strategist-lesson-6": [
            {"q": "DYOR stands for:", "type": "multiple_choice", "options": ["Do Your Own Research", "Daily Yield On Returns", "Digital Yearly Output Rate", "Decentralized Year Over Records"], "answer": "Do Your Own Research", "exp": "DYOR means Do Your Own Research—essential before any crypto investment."},
            {"q": "A doxxed team means:", "type": "multiple_choice", "options": ["Anonymous team", "Team identities are publicly known", "Team is banned", "Team uses fake names"], "answer": "Team identities are publicly known", "exp": "Doxxed means team members have revealed their real identities publicly."},
            {"q": "GitHub activity indicates:", "type": "multiple_choice", "options": ["Marketing spend", "Development progress", "Token price", "Exchange listings"], "answer": "Development progress", "exp": "Active GitHub shows ongoing development work and project commitment."},
            {"q": "Fake partnerships are:", "type": "multiple_choice", "options": ["Good marketing", "A major red flag", "Required for success", "Always obvious"], "answer": "A major red flag", "exp": "Claiming fake partnerships is deceptive and indicates a likely scam project."},
            {"q": "The best due diligence sources are:", "type": "multiple_choice", "options": ["Social media influencers", "Official documentation and independent audits", "Telegram groups", "Price predictions"], "answer": "Official documentation and independent audits", "exp": "Primary sources like whitepapers, audits, and official docs are most reliable."},
            {"q": "Community driven only by price discussion is:", "type": "multiple_choice", "options": ["Healthy", "A warning sign", "Required", "Irrelevant"], "answer": "A warning sign", "exp": "Quality communities discuss technology and adoption, not just price speculation."}
        ],
        "course-strategist-lesson-7": [
            {"q": "Dollar-cost averaging works best for:", "type": "multiple_choice", "options": ["Day trading", "Long-term accumulation", "Quick profits", "Leverage trading"], "answer": "Long-term accumulation", "exp": "DCA removes timing pressure and is ideal for systematic long-term investing."},
            {"q": "To hold through 80% drawdowns, you need:", "type": "multiple_choice", "options": ["Luck", "Strong conviction in your thesis", "Leverage", "Inside information"], "answer": "Strong conviction in your thesis", "exp": "Deep conviction in Bitcoin's long-term value helps you hold through severe drawdowns."},
            {"q": "Multi-sig wallets:", "type": "multiple_choice", "options": ["Require one key", "Distribute key control across multiple parties", "Are less secure", "Only work with Bitcoin"], "answer": "Distribute key control across multiple parties", "exp": "Multi-signature wallets require multiple keys to authorize transactions, increasing security."},
            {"q": "Inheritance planning for crypto should include:", "type": "multiple_choice", "options": ["Nothing", "Documenting wallet locations and seed phrase storage", "Posting keys online", "Telling everyone your holdings"], "answer": "Documenting wallet locations and seed phrase storage", "exp": "Proper inheritance planning ensures heirs can access crypto if something happens to you."},
            {"q": "Most retail investors survive bear markets.", "type": "true_false", "options": ["True", "False"], "answer": "False", "exp": "Most retail investors sell at a loss during bear markets—few have the conviction to hold."},
            {"q": "Scaling out means:", "type": "multiple_choice", "options": ["Selling everything at once", "Selling portions at predetermined levels", "Never selling", "Only buying more"], "answer": "Selling portions at predetermined levels", "exp": "Scaling out sells portions at various price targets to lock in profits while maintaining exposure."}
        ]
    }
    
    default_questions = [
        {"q": "What is the main concept covered in this lesson?", "type": "multiple_choice", "options": ["Blockchain fundamentals", "Traditional banking", "Stock trading", "Social media"], "answer": "Blockchain fundamentals", "exp": "This lesson covers core blockchain and cryptocurrency concepts."},
        {"q": "Understanding cryptocurrency requires knowledge of cryptography.", "type": "true_false", "options": ["True", "False"], "answer": "True", "exp": "Cryptography is fundamental to how cryptocurrencies secure transactions."},
        {"q": "Which is NOT a characteristic of cryptocurrency?", "type": "multiple_choice", "options": ["Decentralization", "Cryptographic security", "Central bank control", "Digital nature"], "answer": "Central bank control", "exp": "Cryptocurrencies are specifically designed to operate without central bank control."},
        {"q": "Blockchain technology can only be used for cryptocurrency.", "type": "true_false", "options": ["True", "False"], "answer": "False", "exp": "Blockchain has many applications beyond cryptocurrency including supply chain, voting, and identity management."},
        {"q": "What should you prioritize when dealing with cryptocurrency?", "type": "multiple_choice", "options": ["Quick profits", "Security best practices", "Following social media tips", "Ignoring market trends"], "answer": "Security best practices", "exp": "Security is paramount in cryptocurrency—protecting your private keys and following best practices is essential."},
        {"q": "DYOR means:", "type": "multiple_choice", "options": ["Do Your Own Research", "Digital Yield On Returns", "Don't Yield Or Retreat", "Dollar Yield Optimization Rate"], "answer": "Do Your Own Research", "exp": "DYOR reminds investors to research thoroughly before making investment decisions."},
        {"q": "Risk management is optional in crypto trading.", "type": "true_false", "options": ["True", "False"], "answer": "False", "exp": "Risk management is essential—crypto's volatility makes it even more important than traditional markets."}
    ]
    
    questions_data = quiz_templates.get(lesson_id, default_questions)
    
    questions = []
    for i, q in enumerate(questions_data):
        questions.append(QuizQuestion(
            id=f"{lesson_id}-q{i+1}",
            question=q["q"],
            question_type=q["type"],
            options=q["options"],
            correct_answer=q["answer"],
            explanation=q["exp"]
        ))
    
    quiz = {
        "id": f"quiz-{lesson_id}",
        "lesson_id": lesson_id,
        "title": f"Quiz: {lesson_id.split('-')[-1].replace('lesson-', 'Lesson ')}",
        "questions": [q.model_dump() for q in questions]
    }
    await db.quizzes.insert_one(quiz)
    return quiz

async def create_exam_for_course(course_id: str) -> dict:
    # Resolve which question bank to use based on the course's level field
    course_doc = await db.courses.find_one({"id": course_id}, {"_id": 0, "level": 1, "title": 1})
    level = course_doc.get("level", 1) if course_doc else 1
    course_title = course_doc.get("title", "Crypto Course") if course_doc else "Crypto Course"
    return await _build_exam(course_id=course_id, level=level, title=f"{course_title} Exam")


async def create_exam_for_level(level: int) -> dict:
    """Legacy helper kept for backward-compat with old /exam/:level URLs."""
    course = await db.courses.find_one({"level": level}, {"_id": 0, "id": 1, "title": 1})
    course_id = course["id"] if course else f"level-{level}"
    course_title = course.get("title", "") if course else ""
    titles = ["Crypto Foundations Exam", "Crypto Investor Exam", "Advanced Strategist Exam"]
    title = course_title + " Exam" if course_title else titles[level - 1] if level <= 3 else "Crypto Exam"
    return await _build_exam(course_id=course_id, level=level, title=title)


async def _build_exam(course_id: str, level: int, title: str) -> dict:
    exam_questions = {
        1: [
            {"q": "What consensus mechanism does Bitcoin use?", "options": ["Proof of Stake", "Proof of Work", "Delegated Proof of Stake", "Proof of Authority"], "answer": "Proof of Work"},
            {"q": "What is the maximum supply of Bitcoin?", "options": ["100 million", "21 million", "Unlimited", "1 billion"], "answer": "21 million"},
            {"q": "A hardware wallet stores your cryptocurrency online.", "options": ["True", "False"], "answer": "False"},
            {"q": "What does 'Not your keys, not your coins' mean?", "options": ["You must physically hold coins", "If you don't control private keys, you don't control the crypto", "Keys are more valuable than coins", "Coins without keys are worthless"], "answer": "If you don't control private keys, you don't control the crypto"},
            {"q": "Which is a fiat-collateralized stablecoin?", "options": ["DAI", "USDC", "ETH", "BTC"], "answer": "USDC"},
            {"q": "What is a seed phrase used for?", "options": ["Mining cryptocurrency", "Recovering your wallet", "Making transactions faster", "Reducing fees"], "answer": "Recovering your wallet"},
            {"q": "DEX stands for:", "options": ["Digital Exchange", "Decentralized Exchange", "Dollar Exchange", "Direct Exchange"], "answer": "Decentralized Exchange"},
            {"q": "Which is safer for storing large amounts of crypto long-term?", "options": ["Exchange wallet", "Hot wallet", "Cold/hardware wallet", "Email"], "answer": "Cold/hardware wallet"},
            {"q": "What happens during a Bitcoin halving?", "options": ["Transaction fees double", "Block rewards are cut in half", "Supply doubles", "Mining becomes illegal"], "answer": "Block rewards are cut in half"},
            {"q": "KYC stands for:", "options": ["Keep Your Coins", "Know Your Customer", "Key Yield Certificate", "Kripto Yield Calculation"], "answer": "Know Your Customer"}
        ],
        2: [
            {"q": "What is TVL in DeFi?", "options": ["Total Volume Locked", "Total Value Locked", "Token Value Listed", "Trading Volume Limit"], "answer": "Total Value Locked"},
            {"q": "Impermanent loss occurs when:", "options": ["You forget your password", "Price ratio of pooled assets changes", "You sell at a loss", "Gas fees are high"], "answer": "Price ratio of pooled assets changes"},
            {"q": "Layer-2 solutions help with:", "options": ["Making new tokens", "Scaling and reducing fees", "Creating NFTs", "Mining faster"], "answer": "Scaling and reducing fees"},
            {"q": "What is a liquidity pool?", "options": ["A swimming pool for whales", "Smart contract holding token pairs for trading", "A type of mining pool", "Exchange reserve fund"], "answer": "Smart contract holding token pairs for trading"},
            {"q": "ERC-721 is a standard for:", "options": ["Fungible tokens", "Non-fungible tokens", "Stablecoins", "Governance tokens"], "answer": "Non-fungible tokens"},
            {"q": "Optimistic rollups assume transactions are:", "options": ["Always fraudulent", "Valid by default", "Instantly final", "Free"], "answer": "Valid by default"},
            {"q": "What does MVRV ratio help measure?", "options": ["Mining difficulty", "Market valuation vs realized value", "Transaction speed", "Wallet security"], "answer": "Market valuation vs realized value"},
            {"q": "During alt season:", "options": ["Bitcoin outperforms altcoins", "Altcoins outperform Bitcoin", "All crypto crashes", "Only stablecoins move"], "answer": "Altcoins outperform Bitcoin"},
            {"q": "What is a rug pull?", "options": ["A carpet cleaning service", "Developers abandoning a project after taking funds", "A trading strategy", "A type of wallet"], "answer": "Developers abandoning a project after taking funds"},
            {"q": "Position sizing helps with:", "options": ["Making faster trades", "Managing risk exposure", "Reducing taxes", "Increasing leverage"], "answer": "Managing risk exposure"}
        ],
        3: [
            {"q": "The Sharpe ratio measures:", "options": ["Total returns", "Risk-adjusted returns", "Maximum drawdown", "Trading volume"], "answer": "Risk-adjusted returns"},
            {"q": "In market psychology, capitulation occurs during:", "options": ["Euphoria phase", "Hope phase", "Panic phase", "Optimism phase"], "answer": "Panic phase"},
            {"q": "SOPR below 1 indicates:", "options": ["Sellers are in profit", "Sellers are at a loss", "Market is stable", "High trading volume"], "answer": "Sellers are at a loss"},
            {"q": "A contrarian indicator suggests:", "options": ["Following the crowd", "Doing the opposite of crowd sentiment", "Not trading at all", "Only buying Bitcoin"], "answer": "Doing the opposite of crowd sentiment"},
            {"q": "Coin Days Destroyed measures:", "options": ["Lost coins", "Movement of old coins", "New coin creation", "Exchange volume"], "answer": "Movement of old coins"},
            {"q": "In portfolio management, rebalancing means:", "options": ["Selling everything", "Adjusting allocations back to targets", "Only buying new coins", "Ignoring market movements"], "answer": "Adjusting allocations back to targets"},
            {"q": "The core-satellite approach involves:", "options": ["Only trading Bitcoin", "Stable core holdings plus speculative satellites", "Never selling", "100% in altcoins"], "answer": "Stable core holdings plus speculative satellites"},
            {"q": "When evaluating projects, which is a red flag?", "options": ["Doxxed team", "Active GitHub", "Anonymous team with unrealistic promises", "Multiple audits"], "answer": "Anonymous team with unrealistic promises"},
            {"q": "Dollar-cost averaging is best for:", "options": ["Day trading", "Long-term accumulation", "Quick profits", "Leverage trading"], "answer": "Long-term accumulation"},
            {"q": "Exchange reserve decreasing typically indicates:", "options": ["Incoming sell pressure", "Accumulation (bullish)", "Network issues", "Higher fees"], "answer": "Accumulation (bullish)"}
        ]
    }
    
    questions = []
    for i, q in enumerate(exam_questions.get(level, exam_questions[1])):
        questions.append({
            "id": f"exam-{course_id}-q{i+1}",
            "question": q["q"],
            "question_type": "multiple_choice",
            "options": q["options"],
            "correct_answer": q["answer"],
            "explanation": ""
        })

    exam = {
        "id": f"exam-{course_id}",
        "course_id": course_id,
        "level": level,
        "title": title,
        "questions": questions,
        "time_limit_minutes": 30,
        "passing_score": 80
    }
    await db.exams.insert_one(exam)
    return exam

async def seed_glossary():
    terms_by_language = {
        "en": [
            {"term": "Blockchain", "definition": "A distributed digital ledger that records transactions across multiple computers in a way that prevents retroactive alteration.", "category": "Technology"},
            {"term": "Bitcoin", "definition": "The first and most well-known cryptocurrency, created in 2009 by Satoshi Nakamoto as a peer-to-peer electronic cash system.", "category": "Cryptocurrency"},
            {"term": "Smart Contract", "definition": "Self-executing contracts with the terms directly written into code, automatically enforcing and executing when conditions are met.", "category": "Technology"},
            {"term": "Gas Fees", "definition": "Transaction fees paid to validators/miners for processing transactions on blockchain networks like Ethereum.", "category": "Transactions"},
            {"term": "Mining", "definition": "The process of using computational power to validate transactions and create new blocks, earning cryptocurrency rewards.", "category": "Technology"},
            {"term": "Staking", "definition": "Locking up cryptocurrency to support network operations (like validating transactions) in exchange for rewards.", "category": "DeFi"},
            {"term": "Liquidity Pool", "definition": "A collection of funds locked in a smart contract, used to facilitate decentralized trading and lending.", "category": "DeFi"},
            {"term": "Tokenomics", "definition": "The economic design of a cryptocurrency token, including supply, distribution, and incentive mechanisms.", "category": "Economics"},
            {"term": "DeFi", "definition": "Decentralized Finance - financial services built on blockchain technology without traditional intermediaries.", "category": "DeFi"},
            {"term": "NFT", "definition": "Non-Fungible Token - a unique digital asset on a blockchain representing ownership of specific items like art or collectibles.", "category": "Assets"},
            {"term": "Wallet", "definition": "Software or hardware that stores private keys and allows users to send, receive, and manage cryptocurrency.", "category": "Security"},
            {"term": "Private Key", "definition": "A secret cryptographic code that proves ownership and allows spending of cryptocurrency. Must be kept secure.", "category": "Security"},
            {"term": "Public Key", "definition": "A cryptographic code derived from the private key that can be shared to receive cryptocurrency.", "category": "Security"},
            {"term": "DEX", "definition": "Decentralized Exchange - a platform for trading cryptocurrency directly from user wallets without an intermediary.", "category": "Trading"},
            {"term": "CEX", "definition": "Centralized Exchange - a traditional cryptocurrency exchange operated by a company that holds user funds.", "category": "Trading"},
            {"term": "HODL", "definition": "A misspelling of 'hold' that became crypto slang for holding cryptocurrency long-term regardless of price movements.", "category": "Culture"},
            {"term": "Whale", "definition": "An individual or entity holding a large amount of cryptocurrency, capable of influencing market prices.", "category": "Trading"},
            {"term": "Altcoin", "definition": "Any cryptocurrency other than Bitcoin, including Ethereum, Solana, and thousands of others.", "category": "Cryptocurrency"},
            {"term": "Stablecoin", "definition": "A cryptocurrency designed to maintain a stable value, typically pegged to fiat currency like the US dollar.", "category": "Cryptocurrency"},
            {"term": "Layer 2", "definition": "Scaling solutions built on top of Layer 1 blockchains to increase transaction speed and reduce costs.", "category": "Technology"},
            {"term": "Proof of Work", "definition": "A consensus mechanism where miners compete to solve complex puzzles to validate transactions and create blocks.", "category": "Technology"},
            {"term": "Proof of Stake", "definition": "A consensus mechanism where validators are chosen to create blocks based on the amount of cryptocurrency they stake.", "category": "Technology"},
            {"term": "Market Cap", "definition": "The total value of a cryptocurrency, calculated by multiplying the current price by the circulating supply.", "category": "Economics"},
            {"term": "ATH", "definition": "All-Time High - the highest price a cryptocurrency has ever reached.", "category": "Trading"},
            {"term": "FOMO", "definition": "Fear Of Missing Out - the anxiety that an exciting opportunity is being missed, often leading to impulsive buying.", "category": "Culture"},
            {"term": "FUD", "definition": "Fear, Uncertainty, and Doubt - negative information spread to influence perception and price.", "category": "Culture"},
            {"term": "Airdrop", "definition": "Free distribution of cryptocurrency tokens to wallet addresses, often for marketing or rewarding users.", "category": "Distribution"},
            {"term": "Hard Fork", "definition": "A permanent divergence in a blockchain creating two separate chains, often due to protocol upgrades or disputes.", "category": "Technology"},
            {"term": "Seed Phrase", "definition": "A series of words (usually 12-24) that can be used to recover a cryptocurrency wallet.", "category": "Security"},
            {"term": "TVL", "definition": "Total Value Locked - the total amount of assets deposited in a DeFi protocol.", "category": "DeFi"},
        ],
        "fr": [
            {"term": "Blockchain", "definition": "Un registre numérique distribué qui enregistre les transactions sur plusieurs ordinateurs de manière à empêcher toute modification rétroactive.", "category": "Technologie"},
            {"term": "Bitcoin", "definition": "La première et la plus connue des cryptomonnaies, créée en 2009 par Satoshi Nakamoto comme système de paiement électronique pair-à-pair.", "category": "Cryptomonnaie"},
            {"term": "Smart Contract", "definition": "Des contrats auto-exécutables dont les conditions sont directement écrites en code, s'appliquant automatiquement lorsque les conditions sont remplies.", "category": "Technologie"},
            {"term": "Gas Fees", "definition": "Les frais de transaction payés aux validateurs/mineurs pour traiter les transactions sur des réseaux blockchain comme Ethereum.", "category": "Transactions"},
            {"term": "Mining", "definition": "Le processus d'utilisation de la puissance de calcul pour valider les transactions et créer de nouveaux blocs, en gagnant des récompenses en cryptomonnaie.", "category": "Technologie"},
            {"term": "Staking", "definition": "Bloquer des cryptomonnaies pour soutenir les opérations du réseau (comme la validation des transactions) en échange de récompenses.", "category": "DeFi"},
            {"term": "Liquidity Pool", "definition": "Une collection de fonds bloqués dans un contrat intelligent, utilisés pour faciliter les échanges et prêts décentralisés.", "category": "DeFi"},
            {"term": "Tokenomics", "definition": "La conception économique d'un token de cryptomonnaie, incluant l'offre, la distribution et les mécanismes d'incitation.", "category": "Économie"},
            {"term": "DeFi", "definition": "Finance Décentralisée - des services financiers construits sur la technologie blockchain sans intermédiaires traditionnels.", "category": "DeFi"},
            {"term": "NFT", "definition": "Token Non Fongible - un actif numérique unique sur une blockchain représentant la propriété d'éléments spécifiques comme l'art ou les objets de collection.", "category": "Actifs"},
            {"term": "Wallet", "definition": "Logiciel ou matériel qui stocke les clés privées et permet aux utilisateurs d'envoyer, recevoir et gérer des cryptomonnaies.", "category": "Sécurité"},
            {"term": "Private Key", "definition": "Un code cryptographique secret qui prouve la propriété et permet de dépenser des cryptomonnaies. Doit être gardé en sécurité.", "category": "Sécurité"},
            {"term": "Public Key", "definition": "Un code cryptographique dérivé de la clé privée qui peut être partagé pour recevoir des cryptomonnaies.", "category": "Sécurité"},
            {"term": "DEX", "definition": "Échange Décentralisé - une plateforme pour échanger des cryptomonnaies directement depuis les portefeuilles des utilisateurs sans intermédiaire.", "category": "Trading"},
            {"term": "CEX", "definition": "Échange Centralisé - un échange de cryptomonnaies traditionnel exploité par une entreprise qui détient les fonds des utilisateurs.", "category": "Trading"},
            {"term": "HODL", "definition": "Une faute d'orthographe de 'hold' devenue un argot crypto pour conserver des cryptomonnaies à long terme quelle que soit l'évolution des prix.", "category": "Culture"},
            {"term": "Whale", "definition": "Un individu ou une entité détenant une grande quantité de cryptomonnaies, capable d'influencer les prix du marché.", "category": "Trading"},
            {"term": "Altcoin", "definition": "Toute cryptomonnaie autre que le Bitcoin, incluant Ethereum, Solana et des milliers d'autres.", "category": "Cryptomonnaie"},
            {"term": "Stablecoin", "definition": "Une cryptomonnaie conçue pour maintenir une valeur stable, généralement ancrée à une monnaie fiduciaire comme le dollar américain.", "category": "Cryptomonnaie"},
            {"term": "Layer 2", "definition": "Des solutions de mise à l'échelle construites sur des blockchains de couche 1 pour augmenter la vitesse des transactions et réduire les coûts.", "category": "Technologie"},
            {"term": "Proof of Work", "definition": "Un mécanisme de consensus où les mineurs s'affrontent pour résoudre des puzzles complexes afin de valider les transactions et créer des blocs.", "category": "Technologie"},
            {"term": "Proof of Stake", "definition": "Un mécanisme de consensus où les validateurs sont choisis pour créer des blocs en fonction de la quantité de cryptomonnaies qu'ils misent.", "category": "Technologie"},
            {"term": "Market Cap", "definition": "La valeur totale d'une cryptomonnaie, calculée en multipliant le prix actuel par l'offre en circulation.", "category": "Économie"},
            {"term": "ATH", "definition": "All-Time High (Sommet Historique) - le prix le plus élevé qu'une cryptomonnaie ait jamais atteint.", "category": "Trading"},
            {"term": "FOMO", "definition": "Fear Of Missing Out (Peur de Manquer) - l'anxiété de manquer une opportunité passionnante, menant souvent à des achats impulsifs.", "category": "Culture"},
            {"term": "FUD", "definition": "Fear, Uncertainty, and Doubt (Peur, Incertitude et Doute) - des informations négatives diffusées pour influencer la perception et le prix.", "category": "Culture"},
            {"term": "Airdrop", "definition": "Distribution gratuite de tokens de cryptomonnaie vers des adresses de portefeuille, souvent pour le marketing ou pour récompenser les utilisateurs.", "category": "Distribution"},
            {"term": "Hard Fork", "definition": "Une divergence permanente dans une blockchain créant deux chaînes distinctes, souvent due à des mises à niveau de protocole ou des désaccords.", "category": "Technologie"},
            {"term": "Seed Phrase", "definition": "Une série de mots (généralement 12 à 24) qui peut être utilisée pour récupérer un portefeuille de cryptomonnaie.", "category": "Sécurité"},
            {"term": "TVL", "definition": "Total Value Locked (Valeur Totale Bloquée) - le montant total des actifs déposés dans un protocole DeFi.", "category": "DeFi"},
        ],
        "ar": [
            {"term": "Blockchain", "definition": "سجل رقمي موزع يُسجّل المعاملات عبر أجهزة كمبيوتر متعددة بطريقة تمنع أي تعديل بأثر رجعي.", "category": "تكنولوجيا"},
            {"term": "Bitcoin", "definition": "أول وأشهر عملة مشفرة، أُنشئت عام 2009 بواسطة ساتوشي ناكاموتو كنظام إلكتروني للمدفوعات من شخص لآخر.", "category": "عملة مشفرة"},
            {"term": "Smart Contract", "definition": "عقود تنفذ نفسها تلقائيًا وشروطها مكتوبة مباشرةً في الكود، تُنفَّذ تلقائيًا عند استيفاء الشروط.", "category": "تكنولوجيا"},
            {"term": "Gas Fees", "definition": "رسوم المعاملات المدفوعة للمدققين والمعدِّنين مقابل معالجة المعاملات على شبكات البلوكتشين مثل إيثيريوم.", "category": "المعاملات"},
            {"term": "Mining", "definition": "عملية استخدام القوة الحسابية للتحقق من المعاملات وإنشاء كتل جديدة مقابل مكافآت بالعملات المشفرة.", "category": "تكنولوجيا"},
            {"term": "Staking", "definition": "قفل العملات المشفرة لدعم عمليات الشبكة مثل التحقق من المعاملات مقابل مكافآت.", "category": "تمويل لامركزي"},
            {"term": "Liquidity Pool", "definition": "مجموعة أموال مقفلة في عقد ذكي، تُستخدم لتسهيل التداول والإقراض اللامركزي.", "category": "تمويل لامركزي"},
            {"term": "Tokenomics", "definition": "التصميم الاقتصادي لرمز العملة المشفرة، بما يشمل العرض والتوزيع وآليات الحوافز.", "category": "الاقتصاد"},
            {"term": "DeFi", "definition": "التمويل اللامركزي - خدمات مالية مبنية على تقنية البلوكتشين دون وسطاء تقليديين.", "category": "تمويل لامركزي"},
            {"term": "NFT", "definition": "رمز غير قابل للاستبدال - أصل رقمي فريد على البلوكتشين يمثل ملكية عناصر محددة كالفن أو المقتنيات.", "category": "الأصول"},
            {"term": "Wallet", "definition": "برنامج أو جهاز يُخزّن المفاتيح الخاصة ويُتيح للمستخدمين إرسال واستقبال وإدارة العملات المشفرة.", "category": "الأمان"},
            {"term": "Private Key", "definition": "رمز تشفير سري يُثبت الملكية ويُتيح إنفاق العملات المشفرة. يجب الحفاظ عليه آمنًا.", "category": "الأمان"},
            {"term": "Public Key", "definition": "رمز تشفير مشتق من المفتاح الخاص يمكن مشاركته لاستقبال العملات المشفرة.", "category": "الأمان"},
            {"term": "DEX", "definition": "بورصة لامركزية - منصة لتداول العملات المشفرة مباشرةً من محافظ المستخدمين دون وسيط.", "category": "التداول"},
            {"term": "CEX", "definition": "بورصة مركزية - بورصة عملات مشفرة تقليدية تُدار من قِبل شركة تحتفظ بأموال المستخدمين.", "category": "التداول"},
            {"term": "HODL", "definition": "خطأ إملائي لكلمة 'hold' أصبح مصطلحًا شائعًا للإشارة إلى الاحتفاظ بالعملات على المدى الطويل بصرف النظر عن تحركات الأسعار.", "category": "الثقافة"},
            {"term": "Whale", "definition": "فرد أو كيان يمتلك كمية كبيرة من العملات المشفرة، قادر على التأثير في أسعار السوق.", "category": "التداول"},
            {"term": "Altcoin", "definition": "أي عملة مشفرة غير البيتكوين، بما فيها إيثيريوم وسولانا وآلاف غيرها.", "category": "عملة مشفرة"},
            {"term": "Stablecoin", "definition": "عملة مشفرة مصممة للحفاظ على قيمة مستقرة، عادةً مرتبطة بعملة ورقية كالدولار الأمريكي.", "category": "عملة مشفرة"},
            {"term": "Layer 2", "definition": "حلول توسعية مبنية فوق بلوكتشينات الطبقة الأولى لزيادة سرعة المعاملات وتقليل التكاليف.", "category": "تكنولوجيا"},
            {"term": "Proof of Work", "definition": "آلية توافق يتنافس فيها المعدِّنون لحل ألغاز معقدة للتحقق من المعاملات وإنشاء الكتل.", "category": "تكنولوجيا"},
            {"term": "Proof of Stake", "definition": "آلية توافق يُختار فيها المدققون لإنشاء الكتل بناءً على كمية العملات المشفرة التي يضعونها كضمان.", "category": "تكنولوجيا"},
            {"term": "Market Cap", "definition": "القيمة الإجمالية للعملة المشفرة، تُحسب بضرب السعر الحالي في الكمية المتداولة.", "category": "الاقتصاد"},
            {"term": "ATH", "definition": "أعلى مستوى على الإطلاق - أعلى سعر وصلت إليه عملة مشفرة على مر التاريخ.", "category": "التداول"},
            {"term": "FOMO", "definition": "الخوف من تفويت الفرصة - القلق من تفويت فرصة مثيرة، يؤدي في الغالب إلى الشراء الاندفاعي.", "category": "الثقافة"},
            {"term": "FUD", "definition": "الخوف وعدم اليقين والشك - معلومات سلبية تُنشر للتأثير على التصورات والأسعار.", "category": "الثقافة"},
            {"term": "Airdrop", "definition": "توزيع مجاني لرموز العملات المشفرة على عناوين المحافظ، غالبًا للتسويق أو مكافأة المستخدمين.", "category": "التوزيع"},
            {"term": "Hard Fork", "definition": "انقسام دائم في بلوكتشين يُنشئ سلسلتين منفصلتين، غالبًا بسبب ترقيات البروتوكول أو الخلافات.", "category": "تكنولوجيا"},
            {"term": "Seed Phrase", "definition": "سلسلة كلمات (عادةً 12 إلى 24) يمكن استخدامها لاسترداد محفظة العملات المشفرة.", "category": "الأمان"},
            {"term": "TVL", "definition": "إجمالي القيمة المقفلة - المبلغ الإجمالي للأصول المودعة في بروتوكول تمويل لامركزي.", "category": "تمويل لامركزي"},
        ],
        "pt": [
            {"term": "Blockchain", "definition": "Um livro-razão digital distribuído que registra transações em vários computadores de forma que impede alterações retroativas.", "category": "Tecnologia"},
            {"term": "Bitcoin", "definition": "A primeira e mais conhecida criptomoeda, criada em 2009 por Satoshi Nakamoto como um sistema eletrônico de pagamentos ponto a ponto.", "category": "Criptomoeda"},
            {"term": "Smart Contract", "definition": "Contratos autoexecutáveis com os termos escritos diretamente em código, executados automaticamente quando as condições são atendidas.", "category": "Tecnologia"},
            {"term": "Gas Fees", "definition": "Taxas de transação pagas a validadores e mineradores pelo processamento de transações em redes blockchain como o Ethereum.", "category": "Transações"},
            {"term": "Mining", "definition": "O processo de usar poder computacional para validar transações e criar novos blocos, ganhando recompensas em criptomoedas.", "category": "Tecnologia"},
            {"term": "Staking", "definition": "Bloquear criptomoedas para apoiar as operações da rede, como validar transações, em troca de recompensas.", "category": "DeFi"},
            {"term": "Liquidity Pool", "definition": "Uma coleção de fundos bloqueados em um contrato inteligente, usados para facilitar negociações e empréstimos descentralizados.", "category": "DeFi"},
            {"term": "Tokenomics", "definition": "O design econômico de um token de criptomoeda, incluindo oferta, distribuição e mecanismos de incentivo.", "category": "Economia"},
            {"term": "DeFi", "definition": "Finanças Descentralizadas - serviços financeiros construídos sobre tecnologia blockchain sem intermediários tradicionais.", "category": "DeFi"},
            {"term": "NFT", "definition": "Token Não Fungível - um ativo digital único em uma blockchain que representa a propriedade de itens específicos como arte ou colecionáveis.", "category": "Ativos"},
            {"term": "Wallet", "definition": "Software ou hardware que armazena chaves privadas e permite que os usuários enviem, recebam e gerenciem criptomoedas.", "category": "Segurança"},
            {"term": "Private Key", "definition": "Um código criptográfico secreto que comprova a propriedade e permite gastar criptomoedas. Deve ser mantido seguro.", "category": "Segurança"},
            {"term": "Public Key", "definition": "Um código criptográfico derivado da chave privada que pode ser compartilhado para receber criptomoedas.", "category": "Segurança"},
            {"term": "DEX", "definition": "Exchange Descentralizada - uma plataforma para negociar criptomoedas diretamente das carteiras dos usuários sem intermediário.", "category": "Trading"},
            {"term": "CEX", "definition": "Exchange Centralizada - uma exchange de criptomoedas tradicional operada por uma empresa que detém os fundos dos usuários.", "category": "Trading"},
            {"term": "HODL", "definition": "Um erro de digitação de 'hold' que se tornou gíria cripto para manter criptomoedas a longo prazo independente das variações de preço.", "category": "Cultura"},
            {"term": "Whale", "definition": "Um indivíduo ou entidade que detém grande quantidade de criptomoedas, capaz de influenciar os preços do mercado.", "category": "Trading"},
            {"term": "Altcoin", "definition": "Qualquer criptomoeda que não seja o Bitcoin, incluindo Ethereum, Solana e milhares de outras.", "category": "Criptomoeda"},
            {"term": "Stablecoin", "definition": "Uma criptomoeda projetada para manter um valor estável, geralmente atrelada a uma moeda fiduciária como o dólar americano.", "category": "Criptomoeda"},
            {"term": "Layer 2", "definition": "Soluções de escalabilidade construídas sobre blockchains de Camada 1 para aumentar a velocidade de transações e reduzir custos.", "category": "Tecnologia"},
            {"term": "Proof of Work", "definition": "Um mecanismo de consenso onde mineradores competem para resolver quebra-cabeças complexos para validar transações e criar blocos.", "category": "Tecnologia"},
            {"term": "Proof of Stake", "definition": "Um mecanismo de consenso onde validadores são escolhidos para criar blocos com base na quantidade de criptomoedas que fazem stake.", "category": "Tecnologia"},
            {"term": "Market Cap", "definition": "O valor total de uma criptomoeda, calculado multiplicando o preço atual pelo fornecimento circulante.", "category": "Economia"},
            {"term": "ATH", "definition": "All-Time High (Máxima Histórica) - o preço mais alto que uma criptomoeda já atingiu.", "category": "Trading"},
            {"term": "FOMO", "definition": "Fear Of Missing Out (Medo de Perder) - a ansiedade de perder uma oportunidade empolgante, frequentemente levando a compras impulsivas.", "category": "Cultura"},
            {"term": "FUD", "definition": "Fear, Uncertainty, and Doubt (Medo, Incerteza e Dúvida) - informações negativas espalhadas para influenciar a percepção e o preço.", "category": "Cultura"},
            {"term": "Airdrop", "definition": "Distribuição gratuita de tokens de criptomoeda para endereços de carteira, geralmente para marketing ou recompensa de usuários.", "category": "Distribuição"},
            {"term": "Hard Fork", "definition": "Uma divergência permanente em uma blockchain criando duas cadeias separadas, geralmente devido a atualizações de protocolo ou disputas.", "category": "Tecnologia"},
            {"term": "Seed Phrase", "definition": "Uma série de palavras (geralmente 12 a 24) que pode ser usada para recuperar uma carteira de criptomoedas.", "category": "Segurança"},
            {"term": "TVL", "definition": "Total Value Locked (Valor Total Bloqueado) - o montante total de ativos depositados em um protocolo DeFi.", "category": "DeFi"},
        ],
    }

    for language, terms in terms_by_language.items():
        for term in terms:
            term["id"] = str(uuid.uuid4())
            term["language"] = language
            await db.glossary.insert_one(term)

async def seed_blog():
    posts = [
        {
            "id": str(uuid.uuid4()),
            "title": "Bitcoin in 2025: What Investors Need to Know",
            "slug": "bitcoin-2025-investor-guide",
            "excerpt": "An in-depth analysis of Bitcoin's position in 2025 and what it means for investors looking to enter or expand their positions.",
            "content": """# Bitcoin in 2025: A Comprehensive Analysis

The cryptocurrency landscape has evolved significantly, and Bitcoin remains at the forefront of digital asset adoption. This analysis examines the current state of Bitcoin and what investors should consider.

## Market Position

Bitcoin has solidified its position as the leading cryptocurrency, often referred to as "digital gold." Its market capitalization continues to dwarf other cryptocurrencies, and institutional adoption has grown substantially.

## Key Developments

### Institutional Adoption
Major financial institutions have integrated Bitcoin into their offerings, providing easier access for traditional investors through ETFs and other investment vehicles.

### Regulatory Clarity
Regulatory frameworks have become clearer in major markets, reducing uncertainty for investors and institutions alike.

## Investment Considerations

When considering Bitcoin investment, focus on:
- Long-term perspective
- Portfolio allocation (typically 1-10% of portfolio)
- Security best practices
- Dollar-cost averaging for entry

Bitcoin remains a volatile but potentially rewarding asset for those who understand its fundamentals and maintain appropriate position sizing.""",
            "category": "Analysis",
            "tags": ["Bitcoin", "Investment", "2025"],
            "author": "Mehdi Arbi",
            "published_at": datetime.now(timezone.utc).isoformat(),
            "read_time": 8,
            "thumbnail": "https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=800"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Understanding DeFi: A Beginner's Complete Guide",
            "slug": "understanding-defi-beginners-guide",
            "excerpt": "Learn the fundamentals of Decentralized Finance and how it's revolutionizing traditional financial services.",
            "content": """# Understanding DeFi: Your Complete Guide

Decentralized Finance, or DeFi, represents one of the most transformative applications of blockchain technology. This guide breaks down what you need to know.

## What is DeFi?

DeFi refers to financial services built on blockchain technology that operate without traditional intermediaries like banks. Instead, smart contracts automate financial operations.

## Core DeFi Services

### Lending and Borrowing
Platforms like Aave and Compound allow you to earn interest on deposits or borrow against your crypto holdings without credit checks.

### Decentralized Exchanges
DEXs like Uniswap let you trade tokens directly from your wallet, without giving up custody of your assets.

### Yield Farming
Strategies to maximize returns by providing liquidity or staking tokens across various protocols.

## Getting Started Safely

1. Start with small amounts
2. Use established protocols
3. Understand the risks
4. Keep some funds in stablecoins

DeFi offers exciting opportunities but requires careful research and risk management.""",
            "category": "Education",
            "tags": ["DeFi", "Beginners", "Guide"],
            "author": "Mehdi Arbi",
            "published_at": (datetime.now(timezone.utc) - timedelta(days=3)).isoformat(),
            "read_time": 10,
            "thumbnail": "https://images.unsplash.com/photo-1642790551116-18e150f248e5?w=800"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Crypto Security: Protecting Your Digital Assets",
            "slug": "crypto-security-protecting-assets",
            "excerpt": "Essential security practices every cryptocurrency holder should implement to protect their investments.",
            "content": """# Crypto Security: Your Complete Protection Guide

In cryptocurrency, you are your own bank. This responsibility requires robust security practices.

## The Security Mindset

### Your Keys, Your Crypto
Remember: if someone else has your private keys, they control your funds. Never share them.

## Essential Security Layers

### Hardware Wallets
For any significant holdings, hardware wallets like Ledger or Trezor provide the best security.

### Two-Factor Authentication
Always enable 2FA, preferably with authenticator apps rather than SMS.

### Seed Phrase Protection
- Write it on paper (or metal)
- Store in multiple secure locations
- Never store digitally

## Common Threats

### Phishing
Always verify URLs and never click suspicious links. Bookmark official sites.

### Social Engineering
No legitimate support will ever ask for your seed phrase or private keys.

Security in crypto is not optional—it's essential.""",
            "category": "Security",
            "tags": ["Security", "Best Practices", "Protection"],
            "author": "Mehdi Arbi",
            "published_at": (datetime.now(timezone.utc) - timedelta(days=7)).isoformat(),
            "read_time": 7,
            "thumbnail": "https://images.unsplash.com/photo-1605792657660-596af9009e82?w=800"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "What is Blockchain? A Complete Explanation",
            "slug": "what-is-blockchain-complete-explanation",
            "excerpt": "Everything you need to understand about blockchain technology, how it works, and why it matters for the future of finance.",
            "content": """# What is Blockchain? A Complete Explanation

Blockchain technology is the foundation of cryptocurrency and one of the most significant technological innovations of the 21st century.

## The Basics

A blockchain is a distributed digital ledger that records transactions across many computers simultaneously. Unlike traditional databases controlled by a single entity, blockchains are maintained by a network of participants.

## How It Works

### Blocks
Data is grouped into blocks, each containing:
- Transaction records
- A timestamp
- A cryptographic hash of the previous block
- A unique hash for itself

### The Chain
Each block's hash includes the previous block's hash, creating an unbreakable chain. Altering any block would change its hash, breaking the chain and alerting the network.

### Consensus
The network agrees on which transactions are valid through consensus mechanisms like Proof of Work (Bitcoin) or Proof of Stake (Ethereum).

## Why It Matters

### Decentralization
No single point of failure or control. The network continues operating even if some nodes go offline.

### Immutability
Once data is recorded, it cannot be altered without network consensus—creating trust without intermediaries.

### Transparency
All transactions are visible on the public ledger, enabling verification by anyone.

## Beyond Cryptocurrency

Blockchain enables:
- Supply chain tracking
- Digital identity verification
- Voting systems
- Smart contracts
- Tokenization of real-world assets

The technology is still evolving, with new applications emerging constantly.""",
            "category": "Education",
            "tags": ["Blockchain", "Technology", "Beginners"],
            "author": "Mehdi Arbi",
            "published_at": (datetime.now(timezone.utc) - timedelta(days=10)).isoformat(),
            "read_time": 9,
            "thumbnail": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Best Crypto Wallets in 2025: A Comprehensive Guide",
            "slug": "best-crypto-wallets-2025-guide",
            "excerpt": "Compare the top cryptocurrency wallets for security, ease of use, and features to find the best option for your needs.",
            "content": """# Best Crypto Wallets in 2025

Choosing the right wallet is crucial for cryptocurrency security. This guide covers the top options for different needs.

## Types of Wallets

### Hot Wallets (Online)
- Connected to the internet
- Convenient for frequent trading
- Higher security risk

### Cold Wallets (Offline)
- Not connected to internet
- Best for long-term storage
- Maximum security

## Top Hardware Wallets

### Ledger Nano X
- Bluetooth connectivity
- Supports 5,500+ coins
- Secure element chip
- Price: ~$149

### Trezor Model T
- Touchscreen interface
- Open-source firmware
- Supports 1,800+ coins
- Price: ~$219

## Top Software Wallets

### MetaMask
- Best for Ethereum/DeFi
- Browser extension + mobile
- Easy dApp connections

### Coinbase Wallet
- Beginner-friendly
- Self-custody
- Multi-chain support

### Trust Wallet
- Mobile-first design
- Built-in DEX
- Wide token support

## Choosing Your Wallet

Consider:
1. **Amount**: Large holdings → hardware wallet
2. **Activity**: Active trading → hot wallet for portion
3. **Chains**: Which blockchains do you use?
4. **Experience**: Beginners may prefer simpler options

## Security Best Practices

- Never share your seed phrase
- Use hardware wallets for significant amounts
- Enable all security features
- Keep software updated
- Verify addresses before sending""",
            "category": "Guide",
            "tags": ["Wallets", "Security", "Hardware"],
            "author": "Mehdi Arbi",
            "published_at": (datetime.now(timezone.utc) - timedelta(days=14)).isoformat(),
            "read_time": 11,
            "thumbnail": "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=800"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "How to Buy Cryptocurrency Safely: Step-by-Step Guide",
            "slug": "how-to-buy-cryptocurrency-safely",
            "excerpt": "A complete beginner's guide to purchasing your first cryptocurrency safely and securely on major exchanges.",
            "content": """# How to Buy Cryptocurrency Safely

Buying your first cryptocurrency can feel overwhelming. This guide walks you through the process step by step.

## Step 1: Choose an Exchange

Popular options for beginners:
- **Coinbase**: Most user-friendly, higher fees
- **Kraken**: Good security, moderate fees
- **Binance**: Lowest fees, more complex

## Step 2: Create Your Account

1. Visit the exchange website
2. Sign up with email
3. Complete identity verification (KYC)
4. Wait for approval (minutes to days)

## Step 3: Secure Your Account

Before depositing any money:
- Enable two-factor authentication (2FA)
- Use a strong, unique password
- Set up withdrawal whitelisting
- Verify your email

## Step 4: Deposit Funds

Options typically include:
- Bank transfer (cheapest, slower)
- Debit card (instant, higher fees)
- Wire transfer (for larger amounts)

## Step 5: Make Your First Purchase

1. Navigate to Buy/Trade section
2. Select cryptocurrency (BTC, ETH, etc.)
3. Enter amount to purchase
4. Review fees and total
5. Confirm purchase

## Step 6: Consider Self-Custody

For amounts you plan to hold long-term:
1. Set up a personal wallet
2. Transfer from exchange to your wallet
3. Securely store your seed phrase

## Common Mistakes to Avoid

- Investing more than you can afford to lose
- Skipping security setup
- FOMO buying at all-time highs
- Sharing account credentials
- Leaving large amounts on exchanges

## Tax Considerations

Keep records of:
- Purchase dates and amounts
- Sale dates and amounts
- Fees paid

Cryptocurrency may be taxable in your jurisdiction.""",
            "category": "Guide",
            "tags": ["Buying", "Beginners", "Exchanges"],
            "author": "Mehdi Arbi",
            "published_at": (datetime.now(timezone.utc) - timedelta(days=18)).isoformat(),
            "read_time": 8,
            "thumbnail": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Ethereum vs Bitcoin: Key Differences Explained",
            "slug": "ethereum-vs-bitcoin-differences",
            "excerpt": "Understanding the fundamental differences between the two largest cryptocurrencies and what makes each unique.",
            "content": """# Ethereum vs Bitcoin: Key Differences

Bitcoin and Ethereum are the two largest cryptocurrencies, but they serve different purposes. Understanding their differences helps inform investment decisions.

## Purpose

### Bitcoin
- Created as digital money / store of value
- "Digital gold" narrative
- Focus on security and decentralization
- Limited programmability

### Ethereum
- Programmable blockchain platform
- Smart contracts enable applications
- Foundation for DeFi, NFTs, and more
- More flexible but complex

## Technical Differences

### Consensus Mechanism
- **Bitcoin**: Proof of Work (mining)
- **Ethereum**: Proof of Stake (staking)

### Supply
- **Bitcoin**: Fixed at 21 million
- **Ethereum**: No fixed cap, but burns fees (potentially deflationary)

### Block Time
- **Bitcoin**: ~10 minutes
- **Ethereum**: ~12 seconds

### Transaction Speed
- **Bitcoin**: ~7 transactions/second (base layer)
- **Ethereum**: ~15-30 transactions/second (base layer)

## Use Cases

### Bitcoin Excels At
- Store of value
- Hedge against inflation
- Long-term savings
- International transfers

### Ethereum Excels At
- Decentralized applications (dApps)
- DeFi protocols
- NFTs and digital collectibles
- Programmable money

## Investment Perspective

### Bitcoin
- More established track record
- Lower volatility (relatively)
- Clearer narrative
- Institutional favorite

### Ethereum
- Higher growth potential
- More utility/use cases
- Higher risk/reward
- Dependent on ecosystem growth

## Which to Choose?

Many investors hold both:
- Bitcoin for stability and store of value
- Ethereum for growth and ecosystem exposure

Your allocation depends on risk tolerance and investment thesis.""",
            "category": "Analysis",
            "tags": ["Bitcoin", "Ethereum", "Comparison"],
            "author": "Mehdi Arbi",
            "published_at": (datetime.now(timezone.utc) - timedelta(days=21)).isoformat(),
            "read_time": 10,
            "thumbnail": "https://images.unsplash.com/photo-1621504450181-5d356f61d307?w=800"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Understanding Crypto Market Cycles: Bull and Bear Markets",
            "slug": "crypto-market-cycles-bull-bear",
            "excerpt": "Learn to recognize the phases of cryptocurrency market cycles and how to position yourself for each stage.",
            "content": """# Understanding Crypto Market Cycles

Cryptocurrency markets move in cycles. Recognizing where we are in the cycle helps inform investment decisions.

## The Four-Year Cycle

Bitcoin's halving event occurs roughly every four years, historically preceding bull markets:

- 2012 Halving → 2013 Bull Market
- 2016 Halving → 2017 Bull Market
- 2020 Halving → 2021 Bull Market
- 2024 Halving → ?

## Market Phases

### 1. Accumulation
- Prices are low and stable
- Smart money is buying
- Public interest is minimal
- Media coverage is negative

### 2. Early Bull
- Prices break previous resistance
- Volume increases
- Skepticism remains
- "Dead cat bounce" fears

### 3. Bull Market
- Strong upward momentum
- New all-time highs
- Increasing media coverage
- Growing public interest

### 4. Euphoria
- "This time is different" mentality
- Everyone talking about crypto
- Extreme FOMO
- Unrealistic price predictions
- Often marks the top

### 5. Distribution
- Smart money selling
- Prices become volatile
- Mixed signals
- Denial among bulls

### 6. Bear Market
- Sustained price declines
- Capitulation events
- Negative media coverage
- Projects fail

## Psychology at Each Phase

| Phase | Emotion | Action |
|-------|---------|--------|
| Accumulation | Despair | Buy |
| Early Bull | Hope | Hold |
| Bull Market | Optimism | Take profits |
| Euphoria | Greed | Sell |
| Distribution | Anxiety | Exit |
| Bear Market | Fear | Accumulate |

## Practical Strategies

### In Bull Markets
- Take profits at predetermined levels
- Don't get greedy
- Rebalance to stablecoins
- Prepare for the downturn

### In Bear Markets
- Accumulate quality assets
- Avoid panic selling
- Continue learning
- Build positions gradually

## Key Indicators

- Fear & Greed Index
- Bitcoin Dominance
- Google Trends
- Social Media Volume
- On-chain metrics

Remember: Markets can stay irrational longer than you can stay solvent. Never invest more than you can afford to lose.""",
            "category": "Education",
            "tags": ["Market Cycles", "Trading", "Psychology"],
            "author": "Mehdi Arbi",
            "published_at": (datetime.now(timezone.utc) - timedelta(days=25)).isoformat(),
            "read_time": 12,
            "thumbnail": "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "NFTs Explained: Beyond the Hype",
            "slug": "nfts-explained-beyond-hype",
            "excerpt": "A balanced look at Non-Fungible Tokens - what they are, how they work, and their potential beyond digital art.",
            "content": """# NFTs Explained: Beyond the Hype

Non-Fungible Tokens grabbed headlines with million-dollar sales, but the technology has applications far beyond digital art.

## What is an NFT?

An NFT (Non-Fungible Token) is a unique digital asset verified on a blockchain. Unlike Bitcoin where each unit is identical (fungible), each NFT is one-of-a-kind.

## How They Work

### Token Standards
- **ERC-721**: Original NFT standard (unique tokens)
- **ERC-1155**: Multi-token standard (batches)

### Metadata
NFTs contain metadata pointing to:
- Name and description
- Image/media URL (often IPFS)
- Attributes/properties
- Creator information

## Current Use Cases

### Digital Art
Artists can sell directly to collectors with automatic royalties on resales.

### Collectibles
Digital trading cards, profile pictures (PFPs), and limited editions.

### Gaming
In-game items as NFTs enable true ownership and cross-game portability.

### Music
Musicians release albums and exclusive content as NFTs, connecting directly with fans.

## Future Applications

### Real Estate
Property deeds and fractional ownership of real estate.

### Identity
Digital identity verification and credentials.

### Tickets
Event tickets with built-in anti-scalping measures.

### Intellectual Property
Patents, trademarks, and licensing management.

## Risks and Considerations

### Market Risks
- Extreme volatility
- Illiquidity for most NFTs
- Speculative valuations

### Technical Risks
- Smart contract vulnerabilities
- Metadata stored off-chain
- Platform dependency

### Legal Uncertainty
- Unclear intellectual property rights
- Regulatory questions
- Tax implications

## Evaluating NFT Projects

Look for:
- Established, doxxed team
- Clear utility beyond speculation
- Active community
- Technical innovation
- Sustainable economics

Avoid:
- Anonymous creators
- Fake hype/volume
- Unrealistic roadmaps
- Copy-paste art

NFTs are a technology with real potential, but most projects will fail. Approach with caution and never invest more than you can afford to lose.""",
            "category": "Education",
            "tags": ["NFTs", "Digital Art", "Blockchain"],
            "author": "Mehdi Arbi",
            "published_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
            "read_time": 11,
            "thumbnail": "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=800"
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Stablecoins Explained: USDC, USDT, and DAI",
            "slug": "stablecoins-explained-usdc-usdt-dai",
            "excerpt": "Understanding different types of stablecoins, their mechanisms, risks, and when to use each one.",
            "content": """# Stablecoins Explained

Stablecoins are cryptocurrencies designed to maintain a stable value, typically pegged to the US dollar. They're essential for crypto trading and DeFi.

## Why Stablecoins Matter

- Avoid volatility while staying in crypto
- Quick transfers between exchanges
- Access DeFi without volatility risk
- Trading pairs and liquidity

## Types of Stablecoins

### Fiat-Collateralized
Backed 1:1 by traditional currency in bank accounts.

**USDC (USD Coin)**
- Issued by Circle
- Most transparent reserves
- Monthly attestations
- Widely trusted

**USDT (Tether)**
- Largest by market cap
- Most liquid
- Historical transparency concerns
- Dominant in trading

### Crypto-Collateralized
Backed by cryptocurrency, usually over-collateralized.

**DAI**
- Issued by MakerDAO
- Decentralized governance
- Backed by ETH and other crypto
- Over-collateralized (~150%+)

### Algorithmic
Use algorithms to maintain peg without full collateral.

**FRAX**
- Partially collateralized
- Algorithmic stability
- More complex mechanism

**Note**: Pure algorithmic stablecoins have struggled—see UST/LUNA collapse.

## Comparing Major Stablecoins

| Stablecoin | Type | Transparency | Decentralization |
|------------|------|--------------|------------------|
| USDC | Fiat | High | Low |
| USDT | Fiat | Medium | Low |
| DAI | Crypto | High | High |
| FRAX | Hybrid | High | Medium |

## Risks

### Depegging
Stablecoins can lose their peg during market stress.

### Regulatory Risk
Fiat-backed stablecoins face regulatory scrutiny.

### Smart Contract Risk
Crypto-collateralized stablecoins rely on smart contracts.

### Counterparty Risk
Trust in the issuing organization.

## When to Use Each

**USDC**: When you need maximum trust and compliance

**USDT**: For trading liquidity and exchange transfers

**DAI**: For decentralization and DeFi integration

## Best Practices

1. Diversify across multiple stablecoins
2. Don't assume stablecoins are risk-free
3. Monitor peg stability
4. Understand the backing mechanism
5. Keep only what you need liquid""",
            "category": "Education",
            "tags": ["Stablecoins", "USDC", "USDT", "DAI"],
            "author": "Mehdi Arbi",
            "published_at": (datetime.now(timezone.utc) - timedelta(days=35)).isoformat(),
            "read_time": 9,
            "thumbnail": "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800"
        }
    ]
    
    await db.blog.insert_many(posts)

# ==================== SUBSCRIPTION ROUTES ====================

@api_router.get("/subscription/tiers")
async def get_subscription_tiers():
    """Get all available subscription tiers"""
    return SUBSCRIPTION_TIERS

@api_router.get("/subscription/my-subscription")
async def get_my_subscription(current_user: dict = Depends(get_current_user)):
    """Get current user's subscription status"""
    tier = current_user.get("subscription_tier", "free")
    expires = current_user.get("subscription_expires")
    
    # Check if subscription is expired
    if expires and datetime.fromisoformat(expires.replace('Z', '+00:00')) < datetime.now(timezone.utc):
        # Downgrade to free
        await db.users.update_one(
            {"id": current_user["id"]},
            {"$set": {"subscription_tier": "free", "subscription_expires": None}}
        )
        tier = "free"
        expires = None
    
    started = current_user.get("subscription_started")
    cancelled = current_user.get("subscription_cancelled", False)
    tier_info = SUBSCRIPTION_TIERS.get(tier, SUBSCRIPTION_TIERS["free"])
    return SubscriptionResponse(
        tier=tier,
        name=tier_info["name"],
        price=tier_info["price"],
        features=tier_info["features"],
        access=tier_info["access"],
        expires=expires,
        started=started
    )

@api_router.post("/subscription/create-checkout")
async def create_subscription_checkout(
    request: SubscriptionCheckoutRequest,
    http_request: Request,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe checkout session for subscription"""
    tier = request.tier.lower()
    if tier not in SUBSCRIPTION_TIERS or tier == "free":
        raise HTTPException(status_code=400, detail="Invalid subscription tier")
    
    tier_info = SUBSCRIPTION_TIERS[tier]
    amount = float(tier_info["price"])

    # Resolve discount: user-provided coupon code takes priority over active promotion
    now_iso = datetime.now(timezone.utc).isoformat()
    applied_discount = None  # {"stripe_coupon_id": ..., "discount_pct": ..., "source": "coupon"|"promo", "id": ...}

    if request.coupon_code:
        code = request.coupon_code.upper().strip()
        coupon_doc = await db.coupons.find_one(
            {"code": code, "is_active": True, "expires_at": {"$gt": now_iso}},
            {"_id": 0}
        )
        if coupon_doc:
            applied_discount = {
                "stripe_coupon_id": coupon_doc["stripe_coupon_id"],
                "discount_pct": coupon_doc["discount_pct"],
                "source": "coupon",
                "id": coupon_doc["id"],
            }

    if not applied_discount:
        active_promo = await db.promotions.find_one(
            {"is_active": True, "ends_at": {"$gt": now_iso}},
            {"_id": 0}
        )
        if active_promo:
            applied_discount = {
                "stripe_coupon_id": active_promo["stripe_coupon_id"],
                "discount_pct": active_promo["discount_pct"],
                "source": "promo",
                "id": active_promo["id"],
            }

    try:
        host_url = request.origin_url.rstrip('/')

        success_url = f"{host_url}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{host_url}/pricing"

        session_params = dict(
            api_key=STRIPE_API_KEY,
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "usd",
                    "product_data": {"name": tier_info["name"]},
                    "unit_amount": int(amount * 100),
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            metadata={
                "user_id": current_user["id"],
                "user_email": current_user["email"],
                "tier": tier,
                "tier_name": tier_info["name"],
                "discount_ref": applied_discount["id"] if applied_discount else "",
            }
        )

        if applied_discount:
            session_params["discounts"] = [{"coupon": applied_discount["stripe_coupon_id"]}]

        session = await asyncio.to_thread(
            lambda: stripe_lib.checkout.Session.create(**session_params)
        )

        discounted_amount = round(amount * (1 - applied_discount["discount_pct"] / 100), 2) if applied_discount else amount

        # Create payment transaction record
        await db.payment_transactions.insert_one({
            "id": str(uuid.uuid4()),
            "session_id": session.id,
            "user_id": current_user["id"],
            "user_email": current_user["email"],
            "tier": tier,
            "amount": discounted_amount,
            "currency": "usd",
            "payment_status": "pending",
            "discount_source": applied_discount["source"] if applied_discount else None,
            "discount_ref_id": applied_discount["id"] if applied_discount else None,
            "created_at": datetime.now(timezone.utc).isoformat()
        })

        return {"url": session.url, "session_id": session.id}
        
    except Exception as e:
        logger.error(f"Checkout error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create checkout session")

@api_router.get("/subscription/checkout-status/{session_id}")
async def get_checkout_status(session_id: str, current_user: dict = Depends(get_current_user)):
    """Check the status of a checkout session and update subscription"""
    try:
        # Check if already processed
        transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})
        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        if transaction.get("payment_status") == "paid":
            return {
                "status": "complete",
                "payment_status": "paid",
                "message": "Payment already processed"
            }
        
        status = await asyncio.to_thread(
            lambda: stripe_lib.checkout.Session.retrieve(session_id, api_key=STRIPE_API_KEY)
        )

        if status.payment_status == "paid":
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "payment_status": "paid",
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Update user subscription
            tier = transaction.get("tier", "starter")
            now_utc = datetime.now(timezone.utc)
            expires_at = (now_utc + timedelta(days=30)).isoformat()

            await db.users.update_one(
                {"id": transaction["user_id"]},
                {"$set": {
                    "subscription_tier": tier,
                    "subscription_expires": expires_at,
                    "subscription_started": now_utc.isoformat(),
                    "subscription_cancelled": False,
                }}
            )

            return {
                "status": status.status,
                "payment_status": status.payment_status,
                "tier": tier,
                "message": "Subscription activated successfully"
            }
        
        return {
            "status": status.status,
            "payment_status": status.payment_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Checkout status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check payment status")

@api_router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events"""
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature", "")
        
        stripe_webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
        event = await asyncio.to_thread(
            lambda: stripe_lib.Webhook.construct_event(body, signature, stripe_webhook_secret)
            if stripe_webhook_secret
            else stripe_lib.Event.construct_from(
                stripe_lib.util.convert_to_stripe_object({"type": "unknown", "data": {"object": {}}}),
                STRIPE_API_KEY
            )
        )

        webhook_response = event.data.object if hasattr(event, "data") else None

        if event.type == "checkout.session.completed" and webhook_response and webhook_response.get("payment_status") == "paid":
            session_id = webhook_response.get("id")
            metadata = webhook_response.get("metadata", {})
            
            # Check if already processed
            transaction = await db.payment_transactions.find_one(
                {"session_id": session_id, "payment_status": "paid"}
            )
            if transaction:
                return {"status": "already_processed"}
            
            # Update transaction
            await db.payment_transactions.update_one(
                {"session_id": session_id},
                {"$set": {
                    "payment_status": "paid",
                    "completed_at": datetime.now(timezone.utc).isoformat()
                }}
            )
            
            # Update user subscription
            user_id = metadata.get("user_id")
            tier = metadata.get("tier", "starter")
            now_utc = datetime.now(timezone.utc)
            expires_at = (now_utc + timedelta(days=30)).isoformat()

            if user_id:
                await db.users.update_one(
                    {"id": user_id},
                    {"$set": {
                        "subscription_tier": tier,
                        "subscription_expires": expires_at,
                        "subscription_started": now_utc.isoformat(),
                        "subscription_cancelled": False,
                    }}
                )
        
        return {"status": "received", "event_type": event.type}
        
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        return {"status": "error", "message": str(e)}

# ==================== ACCESS CONTROL HELPERS ====================

def check_feature_access(user: dict, feature: str) -> bool:
    """Check if user has access to a feature based on subscription"""
    tier = user.get("subscription_tier", "free")
    expires = user.get("subscription_expires")
    
    # Check expiration
    if expires:
        try:
            exp_date = datetime.fromisoformat(expires.replace('Z', '+00:00'))
            if exp_date < datetime.now(timezone.utc):
                tier = "free"
        except:
            tier = "free"
    
    tier_info = SUBSCRIPTION_TIERS.get(tier, SUBSCRIPTION_TIERS["free"])
    access = tier_info.get("access", {})
    
    return access.get(feature, False)

def check_course_access(user: dict, course_level: int) -> bool:
    """Check if user has access to a course level"""
    tier = user.get("subscription_tier", "free")
    expires = user.get("subscription_expires")
    
    if expires:
        try:
            exp_date = datetime.fromisoformat(expires.replace('Z', '+00:00'))
            if exp_date < datetime.now(timezone.utc):
                tier = "free"
        except:
            tier = "free"
    
    tier_info = SUBSCRIPTION_TIERS.get(tier, SUBSCRIPTION_TIERS["free"])
    allowed_levels = tier_info.get("access", {}).get("courses", [1])
    
    return course_level in allowed_levels

# ==================== ADMIN ROUTES ====================

# Roles that have access to the admin panel
ADMIN_PANEL_ROLES = {"admin", "moderator", "editor"}
# All valid role values
VALID_ROLES = {"none", "editor", "moderator", "admin"}

async def get_admin_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Base admin dependency — allows any admin-panel role (admin, moderator, editor)."""
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        user_id = payload.get("sub")

        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")

        email = user.get("email", "")
        role = user.get("role", "none")

        # Bootstrap: persist role from legacy email lists on first admin login
        if role not in ADMIN_PANEL_ROLES:
            if email in ADMIN_EMAILS:
                role = "admin"
                await db.users.update_one({"id": user_id}, {"$set": {"role": "admin"}})
            elif email in MODERATOR_EMAILS:
                role = "moderator"
                await db.users.update_one({"id": user_id}, {"$set": {"role": "moderator"}})
            else:
                raise HTTPException(status_code=403, detail="Admin panel access required")

        return {"email": email, "role": role, "user": user}
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def require_moderator_or_above(admin: dict = Depends(get_admin_user)):
    """Requires moderator or admin role. Editors cannot delete content or manage users."""
    if admin["role"] not in ("admin", "moderator"):
        raise HTTPException(status_code=403, detail="Moderador or admin role required")
    return admin

async def require_admin_only(admin: dict = Depends(get_admin_user)):
    """Requires admin role. Only admins can manage roles and run migrations."""
    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    return admin

@api_router.get("/admin/stats")
async def get_admin_stats(admin: dict = Depends(get_admin_user)):
    """Get dashboard statistics"""
    now = datetime.now(timezone.utc)
    thirty_days_ago = (now - timedelta(days=30)).isoformat()
    
    total_users = await db.users.count_documents({})
    recent_signups = await db.users.count_documents({"created_at": {"$gte": thirty_days_ago}})
    
    # Subscription breakdown
    subscriptions = {}
    for tier in ["free", "pro", "elite"]:
        count = await db.users.count_documents({"subscription_tier": tier})
        subscriptions[tier] = count
    
    # Revenue calculation
    paid_transactions = await db.payment_transactions.count_documents({"payment_status": "paid"})
    
    courses_count = await db.courses.count_documents({})
    lessons_count = await db.lessons.count_documents({})
    blog_posts_count = await db.blog.count_documents({})
    
    # Popular courses
    courses = await db.courses.find({}, {"_id": 0}).to_list(length=10)
    
    return {
        "total_users": total_users,
        "recent_signups": recent_signups,
        "active_subscriptions": subscriptions,
        "paid_transactions": paid_transactions,
        "courses_count": courses_count,
        "lessons_count": lessons_count,
        "blog_posts_count": blog_posts_count,
        "courses": courses
    }

@api_router.get("/admin/analytics")
async def get_admin_analytics(period: str = "7d", admin: dict = Depends(get_admin_user)):
    """Real analytics data for the admin dashboard."""
    now = datetime.now(timezone.utc)
    days = 7 if period == "7d" else (30 if period == "30d" else 90)
    range_start = now - timedelta(days=days)
    range_start_iso = range_start.isoformat()

    prev_start = (range_start - timedelta(days=days)).isoformat()

    # ── Users ──────────────────────────────────────────────────────────────
    total_users = await db.users.count_documents({})
    new_users_in_range = await db.users.count_documents({"created_at": {"$gte": range_start_iso}})
    new_users_prev = await db.users.count_documents({"created_at": {"$gte": prev_start, "$lt": range_start_iso}})

    # Active users = had last_activity within range
    active_users = await db.users.count_documents({"last_activity": {"$gte": range_start_iso}})

    # ── Subscription distribution ──────────────────────────────────────────
    subscription_distribution = {}
    for tier in ["free", "pro", "elite"]:
        subscription_distribution[tier] = await db.users.count_documents({"subscription_tier": tier})

    # ── Revenue ────────────────────────────────────────────────────────────
    # Exclude transactions from admin/moderator/editor accounts
    admin_emails = [
        u["email"] async for u in db.users.find(
            {"role": {"$in": ["admin", "moderator", "editor"]}}, {"_id": 0, "email": 1}
        )
    ]
    paid_txns = await db.payment_transactions.find(
        {"payment_status": "paid", "user_email": {"$nin": admin_emails}},
        {"_id": 0, "amount": 1, "created_at": 1}
    ).to_list(length=10000)

    total_revenue = sum(t.get("amount", 0) for t in paid_txns)
    revenue_in_range = sum(
        t.get("amount", 0) for t in paid_txns
        if t.get("created_at", "") >= range_start_iso
    )
    revenue_prev = sum(
        t.get("amount", 0) for t in paid_txns
        if prev_start <= t.get("created_at", "") < range_start_iso
    )
    paid_count_in_range = sum(1 for t in paid_txns if t.get("created_at", "") >= range_start_iso)

    # ── Lessons & certificates ─────────────────────────────────────────────
    # Count total completed lessons across all users by summing list lengths
    pipeline_lessons = [{"$project": {"count": {"$size": {"$ifNull": ["$completed_lessons", []]}}}}]
    lesson_agg = await db.users.aggregate(pipeline_lessons).to_list(length=None)
    total_lessons_completed = sum(doc["count"] for doc in lesson_agg)

    pipeline_certs = [{"$project": {"count": {"$size": {"$ifNull": ["$certificates", []]}}}}]
    cert_agg = await db.users.aggregate(pipeline_certs).to_list(length=None)
    total_certificates = sum(doc["count"] for doc in cert_agg)

    # ── Daily signups trend (last N days) ──────────────────────────────────
    daily_signups = []
    daily_labels = []
    for i in range(days - 1, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end   = (now - timedelta(days=i)).replace(hour=23, minute=59, second=59, microsecond=999999)
        count = await db.users.count_documents({
            "created_at": {"$gte": day_start.isoformat(), "$lte": day_end.isoformat()}
        })
        daily_signups.append(count)
        daily_labels.append(day_start.strftime("%-d/%m" if days <= 30 else "%-d/%m"))

    # ── Daily revenue trend ────────────────────────────────────────────────
    daily_revenue = []
    for i in range(days - 1, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0).isoformat()
        day_end   = (now - timedelta(days=i)).replace(hour=23, minute=59, second=59, microsecond=999999).isoformat()
        rev = sum(t.get("amount", 0) for t in paid_txns if day_start <= t.get("created_at", "") <= day_end)
        daily_revenue.append(round(rev, 2))

    # ── Top lessons by completion ──────────────────────────────────────────
    lesson_completion_pipeline = [
        {"$unwind": "$completed_lessons"},
        {"$group": {"_id": "$completed_lessons", "completions": {"$sum": 1}}},
        {"$sort": {"completions": -1}},
        {"$limit": 5}
    ]
    top_lesson_ids = await db.users.aggregate(lesson_completion_pipeline).to_list(length=5)

    top_lessons = []
    for entry in top_lesson_ids:
        lesson_id = entry["_id"]
        lesson_doc = await db.lessons.find_one({"id": lesson_id}, {"_id": 0, "title": 1, "translations": 1})
        title = lesson_id
        if lesson_doc:
            title = lesson_doc.get("title") or (
                (lesson_doc.get("translations") or {}).get("en", {}).get("title") or lesson_id
            )
        top_lessons.append({"id": lesson_id, "title": title, "completions": entry["completions"]})

    # ── Recent signups ─────────────────────────────────────────────────────
    recent_users = await db.users.find(
        {}, {"_id": 0, "email": 1, "created_at": 1, "subscription_tier": 1}
    ).sort("created_at", -1).limit(5).to_list(length=5)

    recent_activity = []
    for u in recent_users:
        recent_activity.append({
            "type": "signup",
            "user": u.get("email", ""),
            "time": u.get("created_at", ""),
            "tier": u.get("subscription_tier", "free")
        })

    # ── Growth percentages ─────────────────────────────────────────────────
    def growth_pct(current, previous):
        if previous == 0:
            return 100.0 if current > 0 else 0.0
        return round((current - previous) / previous * 100, 1)

    user_growth    = growth_pct(new_users_in_range, new_users_prev)
    revenue_growth = growth_pct(revenue_in_range, revenue_prev)

    avg_lessons_per_user = round(total_lessons_completed / total_users, 1) if total_users > 0 else 0

    return {
        "total_users": total_users,
        "new_users_in_range": new_users_in_range,
        "active_users": active_users,
        "user_growth": user_growth,

        "total_lessons_completed": total_lessons_completed,
        "total_certificates": total_certificates,
        "avg_lessons_per_user": avg_lessons_per_user,

        "total_revenue": round(total_revenue, 2),
        "revenue_in_range": round(revenue_in_range, 2),
        "revenue_growth": revenue_growth,
        "paid_transactions_in_range": paid_count_in_range,

        "subscription_distribution": subscription_distribution,

        "daily_signups": daily_signups,
        "daily_labels": daily_labels,
        "daily_revenue": daily_revenue,

        "top_lessons": top_lessons,
        "recent_activity": recent_activity,
    }

@api_router.get("/admin/users")
async def get_admin_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    admin: dict = Depends(require_moderator_or_above)
):
    """Get all users with pagination and search"""
    query = {}
    if search:
        query = {"$or": [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}}
        ]}
    
    users = await db.users.find(query, {"_id": 0, "password_hash": 0}).skip(skip).limit(limit).to_list(length=limit)
    total = await db.users.count_documents(query)
    
    return {"users": users, "total": total, "skip": skip, "limit": limit}

@api_router.put("/admin/users/{user_id}")
async def update_user_admin(
    user_id: str,
    role: Optional[str] = None,
    subscription_tier: Optional[str] = None,
    is_banned: Optional[bool] = None,
    admin: dict = Depends(require_moderator_or_above)
):
    """Update user properties with role-based permission checks."""
    update_data = {}

    if role is not None:
        # Only admin can assign or change roles
        if admin["role"] != "admin":
            raise HTTPException(status_code=403, detail="Only admin can modify user roles")
        if role not in VALID_ROLES:
            raise HTTPException(status_code=400, detail=f"Invalid role. Must be one of: {sorted(VALID_ROLES)}")
        update_data["role"] = role

    if subscription_tier is not None:
        # Admin and moderator can change subscriptions
        update_data["subscription_tier"] = subscription_tier
        if subscription_tier != "free":
            update_data["subscription_expires"] = (datetime.now(timezone.utc) + timedelta(days=30)).isoformat()

    if is_banned is not None:
        update_data["is_banned"] = is_banned

    if update_data:
        await db.users.update_one({"id": user_id}, {"$set": update_data})

    return {"status": "success", "updated": update_data}

@api_router.get("/admin/courses")
async def get_admin_courses(admin: dict = Depends(get_admin_user)):
    """Get all courses for admin management — returns full translations structure"""
    courses = await db.courses.find({}, {"_id": 0}).to_list(length=100)
    return {"courses": courses}

@api_router.post("/admin/courses")
async def create_course_admin(
    request: CourseCreateRequest,
    admin: dict = Depends(get_admin_user)
):
    """Create a new course with multi-language translations"""
    validate_translations({k: v.model_dump() for k, v in request.translations.items()}, "course")

    course_id = f"course-{uuid.uuid4().hex[:8]}"
    # Derive display title from first available language for legacy fallback
    first_lang = next(iter(request.translations))
    first_trans = request.translations[first_lang]
    course = {
        "id": course_id,
        "level": request.level,
        "thumbnail": request.thumbnail,
        "lessons_count": 0,
        "duration_hours": request.duration_hours,
        "is_published": False,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "translations": {k: v.model_dump() for k, v in request.translations.items()}
    }
    if request.color_from:
        course["color_from"] = request.color_from
    if request.color_to:
        course["color_to"] = request.color_to
    await db.courses.insert_one(course)
    del course["_id"]
    return course

@api_router.put("/admin/courses/{course_id}")
async def update_course_admin(
    course_id: str,
    request: CourseUpdateRequest,
    admin: dict = Depends(get_admin_user)
):
    """Update a course — supports partial translation updates (merges into existing)"""
    existing = await db.courses.find_one({"id": course_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Course not found")

    update_data = {}
    if request.level is not None:
        update_data["level"] = request.level
    if request.thumbnail is not None:
        update_data["thumbnail"] = request.thumbnail
    if request.duration_hours is not None:
        update_data["duration_hours"] = request.duration_hours
    if request.is_published is not None:
        update_data["is_published"] = request.is_published
    if request.color_from is not None:
        update_data["color_from"] = request.color_from
    if request.color_to is not None:
        update_data["color_to"] = request.color_to

    if request.translations is not None:
        validate_translations({k: v.model_dump() for k, v in request.translations.items()}, "course")
        existing_translations = existing.get("translations", {})
        existing_translations.update({k: v.model_dump() for k, v in request.translations.items()})
        update_data["translations"] = existing_translations

    if update_data:
        await db.courses.update_one({"id": course_id}, {"$set": update_data})

    return {"status": "success", "updated": list(update_data.keys())}

@api_router.delete("/admin/courses/{course_id}")
async def delete_course_admin(course_id: str, admin: dict = Depends(require_moderator_or_above)):
    """Delete a course and its lessons (moderator or admin only)."""
    await db.courses.delete_one({"id": course_id})
    await db.lessons.delete_many({"course_id": course_id})
    await db.quizzes.delete_many({"course_id": course_id})

    return {"status": "deleted"}

@api_router.get("/admin/lessons")
async def get_admin_lessons(course_id: Optional[str] = None, admin: dict = Depends(get_admin_user)):
    """Get lessons for admin management — returns full translations structure.
    Falls back to the static content service when no DB lessons exist for a course,
    so built-in lessons (trial + others) are visible in the admin panel."""
    query = {"course_id": course_id} if course_id else {}
    lessons = await db.lessons.find(query, {"_id": 0}).sort("order", 1).to_list(length=100)

    # If the DB has no lessons for this course, surface the static built-in lessons.
    if not lessons and course_id:
        static = get_all_lessons_for_course(course_id, "en")
        if static:
            lessons = sorted(static, key=lambda x: x.get("order", 0))

    return {"lessons": lessons}

@api_router.post("/admin/lessons")
async def create_lesson_admin(
    request: LessonCreateRequest,
    admin: dict = Depends(get_admin_user)
):
    """Create a new lesson with multi-language translations"""
    validate_translations({k: v.model_dump() for k, v in request.translations.items()}, "lesson")

    # Verify course exists
    course = await db.courses.find_one({"id": request.course_id})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    # Compute duration from the longest content translation
    max_content_len = max(
        (len(v.content) for v in request.translations.values() if v.content),
        default=0
    )
    duration = request.duration_minutes if request.duration_minutes is not None else max(5, max_content_len // 500)

    lesson_id = f"lesson-{uuid.uuid4().hex[:8]}"
    lesson = {
        "id": lesson_id,
        "course_id": request.course_id,
        "order": request.order,
        "duration_minutes": duration,
        "hero_image": None,
        "audio_intro": None,
        "audio_full": None,
        "audio_summary": None,
        "infographics": [],
        "checkpoints": request.checkpoints,
        "interactive_elements": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "translations": {k: v.model_dump() for k, v in request.translations.items()}
    }
    await db.lessons.insert_one(lesson)

    await db.courses.update_one(
        {"id": request.course_id},
        {"$inc": {"lessons_count": 1}}
    )

    del lesson["_id"]
    return lesson

async def _migrate_static_lesson(lesson_id: str) -> Optional[dict]:
    """Migrate a single static/built-in lesson into db.lessons if not already there.
    Returns the DB document (existing or newly inserted), or None if not found anywhere."""
    existing = await db.lessons.find_one({"id": lesson_id})
    if existing:
        return existing

    static = ALL_LESSONS.get(lesson_id)
    if not static:
        return None

    lang_fields = ["title", "subtitle", "content", "summary",
                   "learning_objectives", "examples", "recommended_readings"]
    list_fields = {"learning_objectives", "examples", "recommended_readings"}
    langs = ["en", "fr", "ar", "pt"]
    translations = {}
    for lang in langs:
        entry = {}
        for field in lang_fields:
            val = static.get(field)
            if isinstance(val, dict):
                entry[field] = val.get(lang, val.get("en", [] if field in list_fields else ""))
            elif val is not None:
                entry[field] = val
            else:
                entry[field] = [] if field in list_fields else ""
        translations[lang] = entry

    doc = {
        "id": lesson_id,
        "course_id": static.get("course_id"),
        "order": static.get("order", 0),
        "duration_minutes": static.get("duration_minutes"),
        "hero_image": static.get("hero_image"),
        "audio_full": static.get("audio_full"),
        "checkpoints": static.get("checkpoints", []),
        "translations": translations,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.lessons.insert_one(doc)
    # Mark the course as DB-managed so public endpoints stop using static content
    await db.courses.update_one(
        {"id": static["course_id"]},
        {"$set": {"content_managed": True}}
    )
    return doc


async def _ensure_course_lessons_in_db(course_id: str):
    """Migrate all static lessons for a course to DB (needed before deleting one)."""
    for lesson_id, lesson in ALL_LESSONS.items():
        if lesson.get("course_id") == course_id:
            await _migrate_static_lesson(lesson_id)


@api_router.put("/admin/lessons/{lesson_id}")
async def update_lesson_admin(
    lesson_id: str,
    request: LessonUpdateRequest,
    admin: dict = Depends(get_admin_user)
):
    """Update a lesson — supports partial translation updates (merges into existing).
    If the lesson only exists as static built-in content it is auto-migrated to the
    DB on the first edit so subsequent updates work normally."""
    existing = await _migrate_static_lesson(lesson_id)
    if not existing:
        raise HTTPException(status_code=404, detail="Lesson not found")

    update_data = {}
    if request.order is not None:
        update_data["order"] = request.order
    if request.duration_minutes is not None:
        update_data["duration_minutes"] = request.duration_minutes
    if request.hero_image is not None:
        update_data["hero_image"] = request.hero_image
    if request.checkpoints is not None:
        update_data["checkpoints"] = request.checkpoints

    if request.translations is not None:
        validate_translations({k: v.model_dump() for k, v in request.translations.items()}, "lesson")
        existing_translations = existing.get("translations", {})
        existing_translations.update({k: v.model_dump() for k, v in request.translations.items()})
        update_data["translations"] = existing_translations
        # Recalculate duration from longest content if not explicitly set
        if request.duration_minutes is None:
            max_content_len = max(
                (len(v.content) for v in request.translations.values() if v.content),
                default=0
            )
            if max_content_len:
                update_data["duration_minutes"] = max(5, max_content_len // 500)

    if update_data:
        await db.lessons.update_one({"id": lesson_id}, {"$set": update_data})

    return {"status": "success", "updated": list(update_data.keys())}

@api_router.delete("/admin/lessons/{lesson_id}")
async def delete_lesson_admin(lesson_id: str, admin: dict = Depends(require_moderator_or_above)):
    """Delete a lesson. For static/built-in lessons, migrates the whole course to DB first
    so the remaining lessons continue to appear correctly."""
    lesson = await db.lessons.find_one({"id": lesson_id})
    if not lesson:
        # May be a static lesson — migrate entire course so remaining lessons stay visible
        static = ALL_LESSONS.get(lesson_id)
        if static:
            await _ensure_course_lessons_in_db(static["course_id"])
            lesson = await db.lessons.find_one({"id": lesson_id})
    if lesson:
        await db.lessons.delete_one({"id": lesson_id})
        await db.quizzes.delete_one({"lesson_id": lesson_id})
        await db.courses.update_one(
            {"id": lesson["course_id"]},
            {"$inc": {"lessons_count": -1}}
        )
    return {"status": "deleted"}

# ==================== ADMIN QUIZ ROUTES ====================

class AdminQuizQuestionTranslation(BaseModel):
    question: str
    options: List[str]
    explanation: str = ""

class AdminQuizQuestion(BaseModel):
    question_type: str = "multiple_choice"
    correct_answer_index: int = 0
    translations: Dict[str, AdminQuizQuestionTranslation]

class AdminQuizRequest(BaseModel):
    title: Optional[str] = None
    questions: List[AdminQuizQuestion]

@api_router.get("/admin/lessons/{lesson_id}/quiz")
async def get_admin_lesson_quiz(lesson_id: str, admin: dict = Depends(get_admin_user)):
    """Get the raw multilingual quiz for a lesson"""
    quiz = await db.quizzes.find_one({"lesson_id": lesson_id}, {"_id": 0})
    if not quiz:
        raise HTTPException(status_code=404, detail="No quiz found for this lesson")
    return quiz

@api_router.put("/admin/lessons/{lesson_id}/quiz")
async def upsert_lesson_quiz(
    lesson_id: str,
    request: AdminQuizRequest,
    admin: dict = Depends(get_admin_user)
):
    """Create or replace the quiz for a lesson (including trial/built-in lessons)."""
    lesson = await _migrate_static_lesson(lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")

    questions = []
    for i, q in enumerate(request.questions):
        questions.append({
            "id": f"{lesson_id}-q{i+1}",
            "question_type": q.question_type,
            "correct_answer_index": q.correct_answer_index,
            "translations": {lang: t.model_dump() for lang, t in q.translations.items()}
        })

    title = request.title or f"Quiz: Lesson {lesson_id.split('-lesson-')[-1]}"
    quiz_doc = {
        "id": f"quiz-{lesson_id}",
        "lesson_id": lesson_id,
        "title": title,
        "questions": questions,
    }
    await db.quizzes.replace_one({"lesson_id": lesson_id}, quiz_doc, upsert=True)
    return {"status": "success", "questions": len(questions)}

@api_router.delete("/admin/lessons/{lesson_id}/quiz")
async def delete_lesson_quiz_admin(lesson_id: str, admin: dict = Depends(require_moderator_or_above)):
    """Delete the quiz for a lesson"""
    await db.quizzes.delete_one({"lesson_id": lesson_id})
    return {"status": "deleted"}

# ==================== ADMIN EXAM ROUTES ====================

class AdminExamRequest(BaseModel):
    title: Optional[str] = None
    time_limit_minutes: int = 30
    passing_score: int = 80
    questions: List[AdminQuizQuestion]  # reuse same question model as quizzes

@api_router.get("/admin/courses/{course_id}/exam")
async def get_admin_course_exam(course_id: str, admin: dict = Depends(get_admin_user)):
    """Return the raw exam document (with translations) for a course."""
    exam = await db.exams.find_one({"course_id": course_id}, {"_id": 0})
    if not exam:
        raise HTTPException(status_code=404, detail="No exam found for this course")
    return exam

@api_router.put("/admin/courses/{course_id}/exam")
async def upsert_course_exam(
    course_id: str,
    request: AdminExamRequest,
    admin: dict = Depends(get_admin_user)
):
    """Create or replace the certification exam for a course."""
    course = await db.courses.find_one({"id": course_id}, {"_id": 0, "level": 1, "translations": 1, "title": 1})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    level = course.get("level", 1)
    course_title = (
        course.get("translations", {}).get("en", {}).get("title")
        or course.get("title", course_id)
    )
    title = request.title or f"{course_title} Exam"

    questions = []
    for i, q in enumerate(request.questions):
        questions.append({
            "id": f"exam-{course_id}-q{i+1}",
            "question_type": q.question_type,
            "correct_answer_index": q.correct_answer_index,
            "translations": {lang: t.model_dump() for lang, t in q.translations.items()}
        })

    exam_doc = {
        "id": f"exam-{course_id}",
        "course_id": course_id,
        "level": level,
        "title": title,
        "questions": questions,
        "time_limit_minutes": request.time_limit_minutes,
        "passing_score": request.passing_score,
    }
    await db.exams.replace_one({"course_id": course_id}, exam_doc, upsert=True)
    return {"status": "success", "questions": len(questions)}

@api_router.delete("/admin/courses/{course_id}/exam")
async def delete_course_exam(course_id: str, admin: dict = Depends(require_moderator_or_above)):
    """Delete the certification exam for a course."""
    await db.exams.delete_one({"course_id": course_id})
    return {"status": "deleted"}

# ==================== MIGRATION ROUTES ====================

@api_router.post("/admin/migrate-translations")
async def migrate_to_translations(
    default_lang: str = "en",
    admin: dict = Depends(require_admin_only)
):
    """Migrate existing single-language courses and lessons to the translations structure.
    Idempotent: records already using translations are skipped."""

    migrated_courses = 0
    migrated_lessons = 0

    # Migrate courses
    async for course in db.courses.find({}):
        if course.get("translations"):
            continue  # Already migrated
        translation = {
            "title": course.get("title", ""),
            "description": course.get("description", ""),
            "topics": course.get("topics", [])
        }
        await db.courses.update_one(
            {"_id": course["_id"]},
            {
                "$set": {"translations": {default_lang: translation}},
                "$unset": {"title": "", "description": "", "topics": ""}
            }
        )
        migrated_courses += 1

    # Migrate lessons
    async for lesson in db.lessons.find({}):
        if lesson.get("translations"):
            continue  # Already migrated
        translation = {
            "title": lesson.get("title", ""),
            "subtitle": lesson.get("subtitle", ""),
            "content": lesson.get("content", ""),
            "learning_objectives": lesson.get("learning_objectives", []),
            "examples": lesson.get("examples", []),
            "summary": lesson.get("summary", ""),
            "recommended_readings": lesson.get("recommended_readings", [])
        }
        await db.lessons.update_one(
            {"_id": lesson["_id"]},
            {
                "$set": {"translations": {default_lang: translation}},
                "$unset": {
                    "title": "", "subtitle": "", "content": "",
                    "learning_objectives": "", "examples": "",
                    "summary": "", "recommended_readings": ""
                }
            }
        )
        migrated_lessons += 1

    # Stamp is_trial on the three built-in trial courses
    TRIAL_COURSE_IDS = ["course-foundations", "course-investor", "course-strategist"]
    await db.courses.update_many(
        {"id": {"$in": TRIAL_COURSE_IDS}},
        {"$set": {"is_trial": True}}
    )

    return {
        "status": "success",
        "migrated_courses": migrated_courses,
        "migrated_lessons": migrated_lessons,
        "default_language": default_lang
    }

@api_router.post("/admin/migrate-roles")
async def migrate_roles(admin: dict = Depends(require_admin_only)):
    """Seed DB-stored roles for users in the legacy email allow-lists.
    Safe to run multiple times — only updates users whose role is 'none' or 'user'."""
    updated_admins = 0
    updated_moderators = 0

    for email in ADMIN_EMAILS:
        result = await db.users.update_one(
            {"email": email, "role": {"$in": ["none", "user", None]}},
            {"$set": {"role": "admin"}}
        )
        updated_admins += result.modified_count

    for email in MODERATOR_EMAILS:
        result = await db.users.update_one(
            {"email": email, "role": {"$in": ["none", "user", None]}},
            {"$set": {"role": "moderator"}}
        )
        updated_moderators += result.modified_count

    return {
        "status": "success",
        "updated_admins": updated_admins,
        "updated_moderators": updated_moderators
    }

@api_router.post("/admin/migrate-trial-courses")
async def migrate_trial_courses(admin: dict = Depends(require_admin_only)):
    """Stamp is_trial: true on the three built-in trial courses. Safe to run multiple times."""
    TRIAL_COURSE_IDS = ["course-foundations", "course-investor", "course-strategist"]
    result = await db.courses.update_many(
        {"id": {"$in": TRIAL_COURSE_IDS}},
        {"$set": {"is_trial": True}}
    )
    return {"status": "success", "updated": result.modified_count}

# ==================== TRIAL CONTENT RESTORE ====================

@api_router.post("/admin/courses/{course_id}/restore-defaults")
async def restore_trial_course_defaults(course_id: str, admin: dict = Depends(require_admin_only)):
    """Repopulate a trial course's lessons from static default content."""
    static_lessons = [l for l in ALL_LESSONS.values() if l.get("course_id") == course_id]
    if not static_lessons:
        raise HTTPException(status_code=404, detail="No static content found for this course")

    lang_fields = ["title", "subtitle", "content", "summary",
                   "learning_objectives", "examples", "recommended_readings"]
    list_fields = {"learning_objectives", "examples", "recommended_readings"}
    langs = ["en", "fr", "ar", "pt"]

    await db.lessons.delete_many({"course_id": course_id})

    docs = []
    for lesson in static_lessons:
        translations = {}
        for lang in langs:
            entry = {}
            for field in lang_fields:
                val = lesson.get(field)
                if isinstance(val, dict):
                    entry[field] = val.get(lang, val.get("en", [] if field in list_fields else ""))
                elif val is not None:
                    entry[field] = val
                else:
                    entry[field] = [] if field in list_fields else ""
            translations[lang] = entry

        docs.append({
            "id": lesson["id"],
            "course_id": course_id,
            "order": lesson.get("order", 0),
            "duration_minutes": lesson.get("duration_minutes"),
            "hero_image": lesson.get("hero_image"),
            "audio_full": lesson.get("audio_full"),
            "checkpoints": lesson.get("checkpoints", []),
            "translations": translations,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

    await db.lessons.insert_many(docs)
    await db.courses.update_one(
        {"id": course_id},
        {"$set": {"lessons_count": len(docs), "content_managed": True}}
    )

    return {"status": "restored", "course_id": course_id, "lessons_restored": len(docs)}


# ==================== MEDIA GENERATION ROUTES ====================

@api_router.post("/admin/generate-audio/{lesson_id}")
async def generate_lesson_audio_route(
    lesson_id: str,
    background_tasks: BackgroundTasks,
    admin: dict = Depends(get_admin_user)
):
    """Generate audio for a lesson (TTS)"""
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    # Import media service
    try:
        from services.media_generation import get_media_service
        media_service = get_media_service()
        
        result = await media_service.generate_lesson_audio(
            lesson_id=lesson_id,
            title=lesson["title"],
            content=lesson["content"],
            summary=lesson.get("summary", "")
        )
        
        if result["status"] == "success":
            # Update lesson with audio URLs
            await db.lessons.update_one(
                {"id": lesson_id},
                {"$set": {
                    "audio_intro": result["audio_files"].get("intro"),
                    "audio_full": result["audio_files"].get("full"),
                    "audio_summary": result["audio_files"].get("summary")
                }}
            )
        
        return result
    except Exception as e:
        logger.error(f"Audio generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/generate-image/{lesson_id}")
async def generate_lesson_image_route(
    lesson_id: str,
    admin: dict = Depends(get_admin_user)
):
    """Generate hero image for a lesson"""
    lesson = await db.lessons.find_one({"id": lesson_id}, {"_id": 0})
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    
    course = await db.courses.find_one({"id": lesson["course_id"]}, {"_id": 0})
    topic = course["title"] if course else "cryptocurrency"
    
    try:
        from services.media_generation import get_media_service
        media_service = get_media_service()
        
        result = await media_service.generate_lesson_image(
            lesson_id=lesson_id,
            title=lesson["title"],
            topic=topic
        )
        
        if result["status"] == "success":
            await db.lessons.update_one(
                {"id": lesson_id},
                {"$set": {"hero_image": result["image_url"]}}
            )
        
        return result
    except Exception as e:
        logger.error(f"Image generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/admin/generate-all-media")
async def generate_all_media(
    background_tasks: BackgroundTasks,
    admin: dict = Depends(get_admin_user)
):
    """Generate media for all lessons without audio/images"""
    if admin["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin only action")
    
    lessons = await db.lessons.find(
        {"$or": [{"audio_full": None}, {"hero_image": None}]},
        {"_id": 0, "id": 1, "title": 1}
    ).to_list(length=100)
    
    return {
        "status": "queued",
        "lessons_to_process": len(lessons),
        "message": "Use individual endpoints to generate media for each lesson"
    }

# ==================== BLOG ADMIN ROUTES ====================

@api_router.post("/admin/upload-image")
async def upload_image(
    file: UploadFile = File(...),
    admin: dict = Depends(get_admin_user)
):
    """Upload an image and return its serving URL."""
    ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
    MAX_SIZE = 5 * 1024 * 1024  # 5 MB

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG, PNG, WebP and GIF images are allowed.")

    data = await file.read()
    if len(data) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Image must be under 5 MB.")

    image_id = f"img-{uuid.uuid4().hex[:12]}"
    await db.images.insert_one({
        "id": image_id,
        "content_type": file.content_type,
        "data": data,
        "filename": file.filename,
        "uploaded_at": datetime.now(timezone.utc).isoformat(),
        "uploaded_by": admin.get("email", "")
    })

    return {"url": f"/api/images/{image_id}"}

@api_router.get("/images/{image_id}")
async def serve_image(image_id: str):
    """Serve an uploaded image by ID."""
    record = await db.images.find_one({"id": image_id})
    if not record:
        raise HTTPException(status_code=404, detail="Image not found")
    return Response(
        content=record["data"],
        media_type=record["content_type"],
        headers={"Cache-Control": "public, max-age=31536000, immutable"}
    )

@api_router.get("/admin/blog")
async def get_admin_blog_posts(admin: dict = Depends(get_admin_user)):
    """Get all blog posts for admin"""
    posts = await db.blog.find({}, {"_id": 0}).sort("published_at", -1).to_list(length=100)
    return {"posts": posts}

@api_router.post("/admin/blog")
async def create_blog_post_admin(
    title: str,
    slug: str,
    excerpt: str,
    content: str,
    category: str,
    tags: List[str] = [],
    thumbnail: Optional[str] = None,
    read_time: int = 5,
    admin: dict = Depends(get_admin_user)
):
    """Create a new blog post"""
    post_id = f"post-{uuid.uuid4().hex[:8]}"
    post = {
        "id": post_id,
        "title": title,
        "slug": slug,
        "excerpt": excerpt,
        "content": content,
        "category": category,
        "tags": tags,
        "thumbnail": thumbnail or "https://images.unsplash.com/photo-1639825752750-5061ded5503b?w=800",
        "author": "Mehdi Arbi",
        "published_at": datetime.now(timezone.utc).isoformat(),
        "read_time": read_time
    }
    await db.blog.insert_one(post)
    del post["_id"]
    return post

@api_router.put("/admin/blog/{post_id}")
async def update_blog_post_admin(
    post_id: str,
    title: Optional[str] = None,
    slug: Optional[str] = None,
    excerpt: Optional[str] = None,
    content: Optional[str] = None,
    category: Optional[str] = None,
    tags: Optional[List[str]] = None,
    thumbnail: Optional[str] = None,
    read_time: Optional[int] = None,
    admin: dict = Depends(get_admin_user)
):
    """Update a blog post"""
    update_data = {}
    if title: update_data["title"] = title
    if slug: update_data["slug"] = slug
    if excerpt: update_data["excerpt"] = excerpt
    if content: update_data["content"] = content
    if category: update_data["category"] = category
    if tags: update_data["tags"] = tags
    if thumbnail: update_data["thumbnail"] = thumbnail
    if read_time is not None: update_data["read_time"] = read_time

    if update_data:
        await db.blog.update_one({"id": post_id}, {"$set": update_data})

    return {"status": "success", "updated": update_data}

@api_router.delete("/admin/blog/{post_id}")
async def delete_blog_post_admin(post_id: str, admin: dict = Depends(require_moderator_or_above)):
    """Delete a blog post"""
    await db.blog.delete_one({"id": post_id})
    return {"status": "deleted"}

# ==================== PROMOTIONS ====================

@api_router.get("/promotions/active")
async def get_active_promotion():
    """Return the currently active promotion, or null if none."""
    now = datetime.now(timezone.utc).isoformat()
    promo = await db.promotions.find_one(
        {"is_active": True, "ends_at": {"$gt": now}},
        {"_id": 0}
    )
    if not promo:
        return None
    return promo

@api_router.get("/admin/promotions")
async def list_promotions(admin: dict = Depends(require_admin_only)):
    """List all promotions (most recent first)."""
    promos = await db.promotions.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    return promos

@api_router.post("/admin/promotions")
async def create_promotion(request: CreatePromotionRequest, admin: dict = Depends(require_admin_only)):
    """Create a promotion and a matching Stripe coupon."""
    if not 1 <= request.discount_pct <= 99:
        raise HTTPException(status_code=400, detail="Discount must be between 1 and 99%")

    try:
        ends_at_dt = datetime.fromisoformat(request.ends_at.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid ends_at format. Use ISO 8601.")

    if ends_at_dt <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="End date must be in the future")

    # Deactivate any currently active promotions
    await db.promotions.update_many({"is_active": True}, {"$set": {"is_active": False}})

    try:
        coupon = await asyncio.to_thread(
            lambda: stripe_lib.Coupon.create(
                api_key=STRIPE_API_KEY,
                percent_off=request.discount_pct,
                duration="once",
                name=request.name,
            )
        )
    except Exception as e:
        logger.error(f"Failed to create Stripe coupon: {e}")
        raise HTTPException(status_code=500, detail="Failed to create Stripe coupon")

    promo = {
        "id": str(uuid.uuid4()),
        "name": request.name,
        "discount_pct": request.discount_pct,
        "ends_at": request.ends_at,
        "is_active": True,
        "stripe_coupon_id": coupon.id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.promotions.insert_one(promo)
    promo.pop("_id", None)
    return promo

@api_router.delete("/admin/promotions/{promo_id}")
async def deactivate_promotion(promo_id: str, admin: dict = Depends(require_admin_only)):
    """Deactivate a promotion (does not delete the Stripe coupon)."""
    promo = await db.promotions.find_one({"id": promo_id}, {"_id": 0})
    if not promo:
        raise HTTPException(status_code=404, detail="Promotion not found")
    await db.promotions.update_one({"id": promo_id}, {"$set": {"is_active": False}})
    return {"status": "deactivated"}

# ==================== COUPONS ====================

@api_router.post("/coupons/validate")
async def validate_coupon(request: ValidateCouponRequest):
    """Validate a coupon code. Returns coupon info if valid and not expired."""
    now_iso = datetime.now(timezone.utc).isoformat()
    coupon = await db.coupons.find_one(
        {"code": request.code.upper().strip(), "is_active": True, "expires_at": {"$gt": now_iso}},
        {"_id": 0}
    )
    if not coupon:
        raise HTTPException(status_code=404, detail="Invalid or expired coupon code")
    return {"code": coupon["code"], "discount_pct": coupon["discount_pct"]}

@api_router.get("/admin/coupons")
async def list_coupons(admin: dict = Depends(require_admin_only)):
    """List all coupons (most recent first)."""
    coupons = await db.coupons.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return coupons

@api_router.post("/admin/coupons")
async def create_coupon(request: CreateCouponRequest, admin: dict = Depends(require_admin_only)):
    """Create a coupon code with a real Stripe coupon backing it."""
    if not 1 <= request.discount_pct <= 99:
        raise HTTPException(status_code=400, detail="Discount must be between 1 and 99%")

    code = request.code.upper().strip()
    if not code:
        raise HTTPException(status_code=400, detail="Coupon code cannot be empty")

    try:
        expires_at_dt = datetime.fromisoformat(request.expires_at.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid expires_at format. Use ISO 8601.")

    if expires_at_dt <= datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Expiry date must be in the future")

    existing = await db.coupons.find_one({"code": code, "is_active": True})
    if existing:
        raise HTTPException(status_code=409, detail="A coupon with this code already exists")

    try:
        stripe_coupon = await asyncio.to_thread(
            lambda: stripe_lib.Coupon.create(
                api_key=STRIPE_API_KEY,
                percent_off=request.discount_pct,
                duration="once",
                name=code,
            )
        )
    except Exception as e:
        logger.error(f"Failed to create Stripe coupon: {e}")
        raise HTTPException(status_code=500, detail="Failed to create Stripe coupon")

    coupon = {
        "id": str(uuid.uuid4()),
        "code": code,
        "discount_pct": request.discount_pct,
        "expires_at": request.expires_at,
        "is_active": True,
        "stripe_coupon_id": stripe_coupon.id,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.coupons.insert_one(coupon)
    coupon.pop("_id", None)
    return coupon

@api_router.delete("/admin/coupons/{coupon_id}")
async def delete_coupon(coupon_id: str, admin: dict = Depends(require_admin_only)):
    """Delete a coupon and its Stripe coupon."""
    coupon = await db.coupons.find_one({"id": coupon_id}, {"_id": 0})
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found")
    # Delete the Stripe coupon so it can't be used directly
    try:
        await asyncio.to_thread(
            lambda: stripe_lib.Coupon.delete(coupon["stripe_coupon_id"], api_key=STRIPE_API_KEY)
        )
    except Exception as e:
        logger.warning(f"Could not delete Stripe coupon {coupon['stripe_coupon_id']}: {e}")
    await db.coupons.delete_one({"id": coupon_id})
    return {"status": "deleted"}

# ==================== ROOT ====================

@api_router.get("/")
async def root():
    return {"message": "TheCryptoCoach.io API", "status": "operational"}

# Serve static files via API routes
from fastapi.responses import FileResponse

@api_router.get("/static/audio/{filename}")
async def serve_audio(filename: str):
    file_path = ROOT_DIR / "static" / "audio" / filename
    if file_path.exists():
        return FileResponse(file_path, media_type="audio/mpeg")
    raise HTTPException(status_code=404, detail="Audio file not found")

@api_router.get("/static/images/{filename}")
async def serve_image(filename: str):
    file_path = ROOT_DIR / "static" / "images" / filename
    if file_path.exists():
        media_type = "image/png" if filename.endswith(".png") else "image/jpeg"
        return FileResponse(file_path, media_type=media_type)
    raise HTTPException(status_code=404, detail="Image file not found")

# ==================== SECURITY DASHBOARD (ADMIN ONLY) ====================

@api_router.get("/admin/security/status")
async def get_security_status(request: Request, current_user: dict = Depends(get_current_user)):
    """Get security status dashboard for admins"""
    if current_user.get("email") not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    client_ip = get_client_ip(request)
    AuditLogger.log_admin_action(current_user["email"], "VIEW_SECURITY_STATUS", "dashboard", client_ip)
    
    # Get blocked IPs and accounts
    blocked_ips = list(brute_force_protection.blocked_ips.keys())
    blocked_accounts = list(brute_force_protection.blocked_accounts.keys())
    
    # Get recent failed attempts count
    recent_failed = sum(len(attempts) for key, attempts in brute_force_protection.failed_attempts.items())
    
    return {
        "status": "secure",
        "blocked_ips_count": len(blocked_ips),
        "blocked_accounts_count": len(blocked_accounts),
        "recent_failed_attempts": recent_failed,
        "rate_limits": RATE_LIMITS,
        "security_features": {
            "rate_limiting": True,
            "brute_force_protection": True,
            "input_sanitization": True,
            "xss_protection": True,
            "nosql_injection_protection": True,
            "security_headers": True,
            "audit_logging": True
        }
    }

@api_router.post("/admin/security/unblock-ip")
async def unblock_ip(request: Request, ip: str, current_user: dict = Depends(get_current_user)):
    """Unblock a blocked IP address"""
    if current_user.get("email") not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    client_ip = get_client_ip(request)
    
    if ip in brute_force_protection.blocked_ips:
        del brute_force_protection.blocked_ips[ip]
        AuditLogger.log_admin_action(current_user["email"], "UNBLOCK_IP", ip, client_ip)
        return {"success": True, "message": f"IP {ip} has been unblocked"}
    
    return {"success": False, "message": "IP was not blocked"}

@api_router.post("/admin/security/unblock-account")
async def unblock_account(request: Request, email: str, current_user: dict = Depends(get_current_user)):
    """Unblock a locked account"""
    if current_user.get("email") not in ADMIN_EMAILS:
        raise HTTPException(status_code=403, detail="Admin access required")
    
    client_ip = get_client_ip(request)
    
    if email in brute_force_protection.blocked_accounts:
        del brute_force_protection.blocked_accounts[email]
        AuditLogger.log_admin_action(current_user["email"], "UNBLOCK_ACCOUNT", email, client_ip)
        return {"success": True, "message": f"Account {email} has been unlocked"}
    
    return {"success": False, "message": "Account was not locked"}

# ==================== INCLUDE ROUTERS ====================

app.include_router(api_router)

# Include v2 routers for TheCryptoCoach 2.0 ecosystem
app.include_router(gamification_router)
app.include_router(trading_router)
app.include_router(media_router)
app.include_router(premium_router)
app.include_router(market_router)
app.include_router(newsletter_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
