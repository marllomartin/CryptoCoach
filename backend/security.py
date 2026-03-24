# Security Module for TheCryptoCoach.io
# Comprehensive security measures against hackers and data theft

import os
import re
import time
import hashlib
import secrets
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from functools import wraps
from collections import defaultdict

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import bleach
import validators

# Configure security logger
security_logger = logging.getLogger("security")
security_logger.setLevel(logging.INFO)
handler = logging.FileHandler("/app/backend/security.log")
handler.setFormatter(logging.Formatter('%(asctime)s - SECURITY - %(levelname)s - %(message)s'))
security_logger.addHandler(handler)

# ==================== RATE LIMITING ====================

def get_client_ip(request: Request) -> str:
    """Get real client IP, handling proxies"""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"

# Rate limiter with Redis fallback to memory
limiter = Limiter(key_func=get_client_ip)

# Rate limit configurations
RATE_LIMITS = {
    "login": "5/minute",           # 5 login attempts per minute
    "register": "3/minute",        # 3 registrations per minute
    "api_general": "100/minute",   # 100 API calls per minute
    "newsletter": "10/minute",     # 10 newsletter signups per minute
    "password_reset": "3/hour",    # 3 password resets per hour
    "sensitive": "20/minute",      # 20 sensitive operations per minute
}

# ==================== BRUTE FORCE PROTECTION ====================

class BruteForceProtection:
    """Track and block brute force attempts"""
    
    def __init__(self):
        self.failed_attempts: Dict[str, List[float]] = defaultdict(list)
        self.blocked_ips: Dict[str, float] = {}
        self.blocked_accounts: Dict[str, float] = {}
        
        # Configuration
        self.MAX_FAILED_ATTEMPTS = 5
        self.LOCKOUT_TIME = 900  # 15 minutes
        self.ATTEMPT_WINDOW = 300  # 5 minutes
        self.PERMANENT_BLOCK_THRESHOLD = 20  # Block permanently after 20 failed attempts
    
    def _clean_old_attempts(self, key: str):
        """Remove attempts older than the window"""
        current_time = time.time()
        self.failed_attempts[key] = [
            t for t in self.failed_attempts[key] 
            if current_time - t < self.ATTEMPT_WINDOW
        ]
    
    def is_blocked(self, ip: str, email: str = None) -> tuple[bool, str]:
        """Check if IP or account is blocked"""
        current_time = time.time()
        
        # Check IP block
        if ip in self.blocked_ips:
            if current_time < self.blocked_ips[ip]:
                remaining = int(self.blocked_ips[ip] - current_time)
                return True, f"IP blocked. Try again in {remaining} seconds."
            else:
                del self.blocked_ips[ip]
        
        # Check account block
        if email and email in self.blocked_accounts:
            if current_time < self.blocked_accounts[email]:
                remaining = int(self.blocked_accounts[email] - current_time)
                return True, f"Account locked. Try again in {remaining} seconds."
            else:
                del self.blocked_accounts[email]
        
        return False, ""
    
    def record_failed_attempt(self, ip: str, email: str = None):
        """Record a failed login attempt"""
        current_time = time.time()
        
        # Record by IP
        self.failed_attempts[f"ip:{ip}"].append(current_time)
        self._clean_old_attempts(f"ip:{ip}")
        
        # Record by email if provided
        if email:
            self.failed_attempts[f"email:{email}"].append(current_time)
            self._clean_old_attempts(f"email:{email}")
        
        # Check if should block
        ip_attempts = len(self.failed_attempts[f"ip:{ip}"])
        email_attempts = len(self.failed_attempts.get(f"email:{email}", [])) if email else 0
        
        # Log suspicious activity
        if ip_attempts >= 3 or email_attempts >= 3:
            security_logger.warning(
                f"SUSPICIOUS: Multiple failed logins - IP: {ip}, Email: {email}, "
                f"IP attempts: {ip_attempts}, Email attempts: {email_attempts}"
            )
        
        # Block IP if too many attempts
        if ip_attempts >= self.MAX_FAILED_ATTEMPTS:
            lockout_multiplier = min(ip_attempts // self.MAX_FAILED_ATTEMPTS, 4)
            block_duration = self.LOCKOUT_TIME * lockout_multiplier
            self.blocked_ips[ip] = current_time + block_duration
            security_logger.warning(f"BLOCKED IP: {ip} for {block_duration}s after {ip_attempts} failed attempts")
        
        # Block account if too many attempts
        if email and email_attempts >= self.MAX_FAILED_ATTEMPTS:
            self.blocked_accounts[email] = current_time + self.LOCKOUT_TIME
            security_logger.warning(f"LOCKED ACCOUNT: {email} for {self.LOCKOUT_TIME}s after {email_attempts} failed attempts")
    
    def record_successful_login(self, ip: str, email: str):
        """Clear failed attempts after successful login"""
        self.failed_attempts.pop(f"ip:{ip}", None)
        self.failed_attempts.pop(f"email:{email}", None)
        security_logger.info(f"SUCCESSFUL LOGIN: {email} from {ip}")

# Global instance
brute_force_protection = BruteForceProtection()

# ==================== INPUT SANITIZATION ====================

class InputSanitizer:
    """Sanitize and validate all user inputs"""
    
    # Allowed HTML tags for rich content (very restrictive)
    ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'h1', 'h2', 'h3']
    ALLOWED_ATTRIBUTES = {'a': ['href', 'title']}
    
    # Patterns for detecting injection attempts
    NOSQL_INJECTION_PATTERNS = [
        r'\$where', r'\$gt', r'\$lt', r'\$ne', r'\$in', r'\$nin',
        r'\$or', r'\$and', r'\$not', r'\$nor', r'\$exists',
        r'\$regex', r'\$expr', r'\$jsonSchema', r'\$text',
        r'{\s*\$', r'\[\s*\$'
    ]
    
    XSS_PATTERNS = [
        r'<script', r'javascript:', r'onerror=', r'onload=',
        r'onclick=', r'onmouseover=', r'onfocus=', r'onblur=',
        r'eval\s*\(', r'expression\s*\(', r'url\s*\(',
        r'data:', r'vbscript:'
    ]
    
    SQL_PATTERNS = [
        r"'\s*or\s*'", r"'\s*and\s*'", r'--', r'/\*', r'\*/',
        r'union\s+select', r'drop\s+table', r'delete\s+from',
        r'insert\s+into', r'update\s+.*\s+set'
    ]
    
    @classmethod
    def sanitize_string(cls, value: str, max_length: int = 10000) -> str:
        """Sanitize a string input"""
        if not isinstance(value, str):
            return str(value)[:max_length]
        
        # Truncate
        value = value[:max_length]
        
        # Remove null bytes
        value = value.replace('\x00', '')
        
        # Strip HTML
        value = bleach.clean(value, tags=[], strip=True)
        
        return value.strip()
    
    @classmethod
    def sanitize_html(cls, value: str, max_length: int = 50000) -> str:
        """Sanitize HTML content (for newsletters, etc.)"""
        if not isinstance(value, str):
            return ""
        
        value = value[:max_length]
        return bleach.clean(
            value, 
            tags=cls.ALLOWED_TAGS, 
            attributes=cls.ALLOWED_ATTRIBUTES,
            strip=True
        )
    
    @classmethod
    def sanitize_email(cls, email: str) -> Optional[str]:
        """Validate and sanitize email"""
        if not email or not isinstance(email, str):
            return None
        
        email = email.lower().strip()[:254]
        
        # Basic validation
        if not validators.email(email):
            return None
        
        # Check for suspicious patterns
        if any(p in email for p in ['<', '>', '"', "'", ';', '/', '\\']):
            return None
        
        return email
    
    @classmethod
    def detect_injection(cls, value: str) -> tuple[bool, str]:
        """Detect potential injection attempts"""
        if not isinstance(value, str):
            return False, ""
        
        value_lower = value.lower()
        
        # Check NoSQL injection
        for pattern in cls.NOSQL_INJECTION_PATTERNS:
            if re.search(pattern, value_lower):
                return True, f"NoSQL injection pattern detected: {pattern}"
        
        # Check XSS
        for pattern in cls.XSS_PATTERNS:
            if re.search(pattern, value_lower):
                return True, f"XSS pattern detected: {pattern}"
        
        # Check SQL injection
        for pattern in cls.SQL_PATTERNS:
            if re.search(pattern, value_lower):
                return True, f"SQL injection pattern detected: {pattern}"
        
        return False, ""
    
    @classmethod
    def sanitize_dict(cls, data: dict, max_depth: int = 5) -> dict:
        """Recursively sanitize a dictionary"""
        if max_depth <= 0:
            return {}
        
        sanitized = {}
        for key, value in data.items():
            # Sanitize key
            if not isinstance(key, str):
                continue
            key = cls.sanitize_string(key, max_length=100)
            
            # Check for injection in key
            is_injection, _ = cls.detect_injection(key)
            if is_injection:
                continue
            
            # Sanitize value based on type
            if isinstance(value, str):
                is_injection, reason = cls.detect_injection(value)
                if is_injection:
                    security_logger.warning(f"INJECTION ATTEMPT blocked in field '{key}': {reason}")
                    continue
                sanitized[key] = cls.sanitize_string(value)
            elif isinstance(value, dict):
                sanitized[key] = cls.sanitize_dict(value, max_depth - 1)
            elif isinstance(value, list):
                sanitized[key] = [
                    cls.sanitize_dict(item, max_depth - 1) if isinstance(item, dict)
                    else cls.sanitize_string(item) if isinstance(item, str)
                    else item
                    for item in value[:1000]  # Limit list size
                ]
            else:
                sanitized[key] = value
        
        return sanitized

# ==================== SECURITY MIDDLEWARE ====================

class SecurityMiddleware(BaseHTTPMiddleware):
    """Add security headers and logging to all responses"""
    
    # Suspicious user agents
    BLOCKED_USER_AGENTS = [
        'sqlmap', 'nikto', 'nmap', 'masscan', 'zgrab',
        'gobuster', 'dirbuster', 'wfuzz', 'hydra'
    ]
    
    # Suspicious paths
    SUSPICIOUS_PATHS = [
        '/wp-admin', '/wp-login', '/.env', '/.git', '/config',
        '/admin.php', '/phpmyadmin', '/mysql', '/backup',
        '/.htaccess', '/web.config', '/.aws', '/.ssh'
    ]
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        client_ip = get_client_ip(request)
        
        # Check for blocked user agents
        user_agent = request.headers.get("user-agent", "").lower()
        for blocked_ua in self.BLOCKED_USER_AGENTS:
            if blocked_ua in user_agent:
                security_logger.warning(f"BLOCKED USER AGENT: {user_agent} from {client_ip}")
                return JSONResponse(
                    status_code=403,
                    content={"detail": "Access denied"}
                )
        
        # Check for suspicious paths
        path = request.url.path.lower()
        for suspicious in self.SUSPICIOUS_PATHS:
            if suspicious in path:
                security_logger.warning(f"SUSPICIOUS PATH ACCESS: {path} from {client_ip}")
                return JSONResponse(
                    status_code=404,
                    content={"detail": "Not found"}
                )
        
        # Process request
        try:
            response = await call_next(request)
        except Exception as e:
            security_logger.error(f"REQUEST ERROR: {str(e)} from {client_ip} on {path}")
            raise
        
        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        
        # Content Security Policy
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https://fonts.gstatic.com; "
            "connect-src 'self' https://api.coingecko.com https://alternative.me; "
            "frame-ancestors 'none';"
        )
        
        # Strict Transport Security (HTTPS)
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        
        # Log slow requests
        duration = time.time() - start_time
        if duration > 5:
            security_logger.warning(f"SLOW REQUEST: {path} took {duration:.2f}s from {client_ip}")
        
        return response

# ==================== PASSWORD SECURITY ====================

class PasswordSecurity:
    """Password validation and security"""
    
    MIN_LENGTH = 8
    MAX_LENGTH = 128
    
    # Common passwords to block
    COMMON_PASSWORDS = {
        'password', '123456', '12345678', 'qwerty', 'abc123',
        'monkey', 'master', 'dragon', 'letmein', 'login',
        'admin', 'welcome', 'password1', 'bitcoin', 'crypto'
    }
    
    @classmethod
    def validate_password(cls, password: str) -> tuple[bool, str]:
        """Validate password strength"""
        if not password:
            return False, "Password is required"
        
        if len(password) < cls.MIN_LENGTH:
            return False, f"Password must be at least {cls.MIN_LENGTH} characters"
        
        if len(password) > cls.MAX_LENGTH:
            return False, f"Password must be less than {cls.MAX_LENGTH} characters"
        
        if password.lower() in cls.COMMON_PASSWORDS:
            return False, "This password is too common. Please choose a stronger one."
        
        # Check complexity
        has_upper = bool(re.search(r'[A-Z]', password))
        has_lower = bool(re.search(r'[a-z]', password))
        has_digit = bool(re.search(r'\d', password))
        has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
        
        complexity_score = sum([has_upper, has_lower, has_digit, has_special])
        
        if complexity_score < 3:
            return False, "Password must contain at least 3 of: uppercase, lowercase, number, special character"
        
        return True, "Password is strong"
    
    @classmethod
    def generate_secure_token(cls, length: int = 32) -> str:
        """Generate a cryptographically secure token"""
        return secrets.token_urlsafe(length)

# ==================== AUDIT LOGGING ====================

class AuditLogger:
    """Log security-relevant events"""
    
    @classmethod
    def log_auth_event(cls, event_type: str, email: str, ip: str, success: bool, details: str = ""):
        """Log authentication events"""
        status = "SUCCESS" if success else "FAILURE"
        security_logger.info(
            f"AUTH {status}: {event_type} - Email: {email}, IP: {ip}, Details: {details}"
        )
    
    @classmethod
    def log_data_access(cls, user_id: str, resource: str, action: str, ip: str):
        """Log data access events"""
        security_logger.info(
            f"DATA ACCESS: User: {user_id}, Resource: {resource}, Action: {action}, IP: {ip}"
        )
    
    @classmethod
    def log_admin_action(cls, admin_email: str, action: str, target: str, ip: str):
        """Log admin actions"""
        security_logger.warning(
            f"ADMIN ACTION: Admin: {admin_email}, Action: {action}, Target: {target}, IP: {ip}"
        )
    
    @classmethod
    def log_security_alert(cls, alert_type: str, details: str, ip: str, severity: str = "HIGH"):
        """Log security alerts"""
        security_logger.critical(
            f"SECURITY ALERT [{severity}]: {alert_type} - Details: {details}, IP: {ip}"
        )

# ==================== TOKEN SECURITY ====================

class TokenSecurity:
    """Enhanced JWT token security"""
    
    # Token types
    ACCESS_TOKEN_EXPIRE_MINUTES = 30  # Shorter for security
    REFRESH_TOKEN_EXPIRE_DAYS = 7
    
    @classmethod
    def generate_token_fingerprint(cls, request: Request) -> str:
        """Generate a fingerprint for token binding"""
        user_agent = request.headers.get("user-agent", "")
        ip = get_client_ip(request)
        fingerprint_data = f"{user_agent}:{ip}"
        return hashlib.sha256(fingerprint_data.encode()).hexdigest()[:16]
    
    @classmethod
    def validate_token_fingerprint(cls, stored_fingerprint: str, request: Request) -> bool:
        """Validate that token is being used from the same context"""
        current_fingerprint = cls.generate_token_fingerprint(request)
        return secrets.compare_digest(stored_fingerprint, current_fingerprint)

# ==================== HELPER FUNCTIONS ====================

def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Custom handler for rate limit exceeded"""
    client_ip = get_client_ip(request)
    security_logger.warning(f"RATE LIMIT EXCEEDED: {request.url.path} from {client_ip}")
    return JSONResponse(
        status_code=429,
        content={
            "detail": "Too many requests. Please slow down.",
            "retry_after": 60
        }
    )

def check_request_safety(request: Request, body: dict = None) -> tuple[bool, str]:
    """Check if a request is safe to process"""
    client_ip = get_client_ip(request)
    
    # Check body for injection
    if body:
        sanitized = InputSanitizer.sanitize_dict(body)
        if sanitized != body:
            security_logger.warning(f"REQUEST SANITIZED: Potential attack from {client_ip}")
    
    return True, ""
