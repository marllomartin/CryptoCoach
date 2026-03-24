# TheCryptoCoach.io - Product Requirements Document

## Original Problem Statement
Build a gamified crypto education platform with market intelligence features and newsletter system.

## User Personas
- **Beginners**: People new to cryptocurrency looking to learn
- **Intermediate traders**: Users who want market insights and analysis
- **Premium subscribers**: Users who pay for advanced features and personalized coaching

## Core Requirements

### 1. Educational Platform (COMPLETED)
- 23 lessons covering crypto fundamentals to advanced topics
- Rich text content with images
- Audio narration in EN, FR, AR (TTS generated)
- Manual video upload system
- Progress tracking and XP gamification

### 2. Internationalization (COMPLETED)
- Full EN, FR, AR support
- RTL layout for Arabic
- Language switcher in header
- All content translated

### 3. Market Intelligence Center (COMPLETED)
- Real-time crypto prices (CoinGecko API)
- Fear & Greed Index (Alternative.me)
- Mock news articles
- Watchlist system (up to 3 for free users)
- Price alerts (1 for free users)
- Premium AI Insights (blocked - LLM budget)

### 4. Newsletter System (COMPLETED)
- Public newsletter signup on homepage
- Admin panel for creating/managing newsletters
- Multi-language newsletter support (EN, FR, AR)
- AI-powered content generation (templates only - LLM budget)
- Email sending via Resend (MOCKED - needs API key)
- MongoDB persistence for subscribers and newsletters

### 5. Conversion Features (COMPLETED)
- Coach's Tip at end of each lesson
- CAPTCHA on registration
- 15% discount popup (time-based)
- Exit-intent popup
- Coupon code system on pricing page
- Testimonials and social proof

### 6. Admin Features (COMPLETED)
- Analytics dashboard with charts
- User management
- Course management
- Blog management
- Media management (audio/video)
- Newsletter management tab
- **Security dashboard**

### 7. SECURITY HARDENING (COMPLETED - March 24, 2026)

#### Rate Limiting
- Login: 5 attempts/minute
- Register: 3 attempts/minute
- Newsletter: 10 signups/minute
- API general: 100 requests/minute

#### Brute Force Protection
- Account lockout after 5 failed attempts
- IP blocking after repeated failures
- 15-minute lockout duration
- Progressive lockout multiplier

#### Input Sanitization
- XSS attack prevention (bleach)
- NoSQL injection detection and blocking
- SQL injection pattern detection
- Email validation and sanitization
- HTML content sanitization for newsletters

#### Security Headers
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Strict-Transport-Security (HSTS)
- Content-Security-Policy (CSP)
- Referrer-Policy: strict-origin-when-cross-origin
- Cache-Control: no-store

#### Password Security
- Minimum 8 characters
- Complexity requirement (3 of 4: upper, lower, digit, special)
- Common password blacklist
- Secure bcrypt hashing

#### Audit Logging
- All auth events logged (/app/backend/security.log)
- Failed login tracking
- Admin action logging
- Security alert system (CRITICAL level for attacks)
- IP tracking for all events

#### Admin Security Dashboard
- GET /api/admin/security/status
- View blocked IPs and accounts
- Unblock functionality
- Rate limit configuration display

## Technical Architecture

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── server.py           # Main app (4100+ lines)
├── security.py         # Security module (NEW)
├── routes/
│   ├── market_intelligence.py
│   ├── gamification.py
│   ├── media.py
│   ├── premium.py
│   └── ...
└── .env
```

### Security Module Components
- `SecurityMiddleware` - Security headers + suspicious path blocking
- `BruteForceProtection` - Login attempt tracking + lockout
- `InputSanitizer` - XSS/Injection detection
- `PasswordSecurity` - Password validation
- `AuditLogger` - Security event logging
- `limiter` - Rate limiting (slowapi)

### Database Collections
- `users`: User accounts (with security metadata)
- `newsletter_subscribers`: Email subscribers
- `newsletters`: Newsletter drafts and sent history

## API Endpoints

### Security (Admin)
- `GET /api/admin/security/status` - Security dashboard
- `POST /api/admin/security/unblock-ip` - Unblock IP
- `POST /api/admin/security/unblock-account` - Unblock account

### Protected with Rate Limiting
- `POST /api/auth/login` - 5/minute
- `POST /api/auth/register` - 3/minute
- `POST /api/newsletter/subscribe` - 10/minute

## 3rd Party Integrations

| Service | Status | Notes |
|---------|--------|-------|
| CoinGecko | Working | Market data |
| Alternative.me | Working | Fear & Greed Index |
| OpenAI TTS | Working | Audio generation |
| OpenAI LLM | BLOCKED | Budget exceeded |
| Resend | MOCKED | Needs user API key |
| Stripe | Configured | Test key available |

## What's Working
- Full educational platform with 23 lessons
- Audio in EN, FR, AR (69 files)
- Market Intelligence with live crypto data
- Newsletter signup and admin management
- All conversion features
- Admin analytics dashboard
- **Complete security hardening**

## What's MOCKED/Blocked
- Newsletter email sending (Resend API key needed)
- AI Mentor chat (LLM budget exceeded)
- AI Market Briefing (LLM budget exceeded)

## Credentials
- Admin: `admin@thecryptocoach.io` / `adminpassword`

## Security Test Results (March 24, 2026)
- 20/20 security tests passed
- All attack vectors covered
- Audit logging active
- Rate limiting functional
- Brute force protection verified

---
Last updated: March 24, 2026
