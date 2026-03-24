# TheCryptoCoach.io

A gamified crypto education platform with market intelligence, newsletter system, and enterprise-grade security.

## Quick Start (Developer Guide)

### Prerequisites
- Node.js >= 18.x
- Yarn (not npm)
- Python >= 3.10
- MongoDB >= 6.0

### 1. Clone & Setup

```bash
git clone <repository-url>
cd app
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# .\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
```

**Edit `backend/.env`:**
```env
# Required
MONGO_URL="mongodb://localhost:27017"
DB_NAME="thecryptocoach"
JWT_SECRET="generate_a_secure_random_string_here"
CORS_ORIGINS="http://localhost:3000,https://yourdomain.com"

# Optional - AI Features
EMERGENT_LLM_KEY=sk-emergent-xxxxx

# Optional - Payments
STRIPE_API_KEY=sk_test_xxxxx

# Optional - Newsletter emails
RESEND_API_KEY=re_xxxxx
SENDER_EMAIL=news@yourdomain.com
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies (MUST use yarn)
yarn install

# Configure environment
cp .env.example .env
```

**Edit `frontend/.env`:**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 4. Run Development

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
yarn start
```

**Access:**
- Frontend: http://localhost:3000
- API Docs: http://localhost:8001/docs
- Admin: `admin@thecryptocoach.io` / `adminpassword`

---

## Production Deployment

### Option 1: Docker (Recommended)

```bash
# Create docker-compose.yml (see below)
docker-compose up -d
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    restart: always
    volumes:
      - mongodb_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: thecryptocoach

  backend:
    build: ./backend
    restart: always
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=thecryptocoach
      - JWT_SECRET=${JWT_SECRET}
      - CORS_ORIGINS=${CORS_ORIGINS}
      - EMERGENT_LLM_KEY=${EMERGENT_LLM_KEY}
      - RESEND_API_KEY=${RESEND_API_KEY}
      - STRIPE_API_KEY=${STRIPE_API_KEY}
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=${BACKEND_URL}
    depends_on:
      - backend

volumes:
  mongodb_data:
```

**backend/Dockerfile:**
```dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001", "--workers", "4"]
```

**frontend/Dockerfile:**
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
```

### Option 2: VPS (Ubuntu)

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y python3.10 python3.10-venv nodejs npm nginx certbot
npm install -g yarn

# 2. Clone repository
git clone <repo> /var/www/thecryptocoach
cd /var/www/thecryptocoach

# 3. Setup backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env && nano .env

# 4. Setup frontend
cd ../frontend
yarn install
yarn build

# 5. Configure nginx
sudo nano /etc/nginx/sites-available/thecryptocoach
sudo ln -s /etc/nginx/sites-available/thecryptocoach /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. Setup systemd service
sudo nano /etc/systemd/system/thecryptocoach.service
sudo systemctl enable thecryptocoach
sudo systemctl start thecryptocoach

# 7. SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com
```

**Nginx config (`/etc/nginx/sites-available/thecryptocoach`):**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /var/www/thecryptocoach/frontend/build;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files (audio, images)
    location /static {
        proxy_pass http://127.0.0.1:8001/static;
    }
}
```

**Systemd service (`/etc/systemd/system/thecryptocoach.service`):**
```ini
[Unit]
Description=TheCryptoCoach Backend
After=network.target mongodb.service

[Service]
User=www-data
WorkingDirectory=/var/www/thecryptocoach/backend
Environment="PATH=/var/www/thecryptocoach/backend/venv/bin"
EnvironmentFile=/var/www/thecryptocoach/backend/.env
ExecStart=/var/www/thecryptocoach/backend/venv/bin/uvicorn server:app --host 127.0.0.1 --port 8001 --workers 4
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

### Option 3: Cloud Platforms

**Vercel (Frontend) + Railway (Backend):**

1. **Frontend on Vercel:**
   - Import repo → Set root to `frontend`
   - Add env: `REACT_APP_BACKEND_URL=https://your-railway-url.up.railway.app`

2. **Backend on Railway:**
   - Import repo → Set root to `backend`
   - Add all env variables from `.env`
   - Railway auto-detects FastAPI

---

## Environment Variables Reference

### Backend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URL` | Yes | MongoDB connection string |
| `DB_NAME` | Yes | Database name |
| `JWT_SECRET` | Yes | Secret for JWT tokens (generate secure random) |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `EMERGENT_LLM_KEY` | No | For AI features (TTS, AI Mentor) |
| `STRIPE_API_KEY` | No | Stripe secret key for payments |
| `RESEND_API_KEY` | No | Resend API key for newsletter emails |
| `SENDER_EMAIL` | No | Newsletter sender email |

### Frontend (.env)

| Variable | Required | Description |
|----------|----------|-------------|
| `REACT_APP_BACKEND_URL` | Yes | Backend API URL |

---

## API Endpoints

### Authentication
| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| POST | `/api/auth/register` | 3/min | User registration |
| POST | `/api/auth/login` | 5/min | User login |
| GET | `/api/auth/me` | - | Get current user |

### Market Intelligence
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/market/cryptos` | Top cryptocurrencies (CoinGecko) |
| GET | `/api/market/global` | Market cap, Fear & Greed Index |
| GET | `/api/market/news` | Crypto news |
| GET | `/api/market/trending` | Trending cryptos |

### Newsletter
| Method | Endpoint | Rate Limit | Description |
|--------|----------|------------|-------------|
| POST | `/api/newsletter/subscribe` | 10/min | Subscribe to newsletter |
| POST | `/api/newsletter/unsubscribe` | - | Unsubscribe |
| GET | `/api/newsletter/subscribers` | - | List subscribers (admin) |
| POST | `/api/newsletter/create` | - | Create newsletter (admin) |
| GET | `/api/newsletter/list` | - | List newsletters (admin) |
| POST | `/api/newsletter/send/{id}` | - | Send newsletter (admin) |

### Admin Security
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/security/status` | Security dashboard |
| POST | `/api/admin/security/unblock-ip` | Unblock IP address |
| POST | `/api/admin/security/unblock-account` | Unblock account |

### Courses & Learning
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | Get all courses |
| GET | `/api/courses/{id}` | Get course details |
| GET | `/api/lessons/{id}` | Get lesson content |
| POST | `/api/lessons/{id}/complete` | Mark lesson complete |

---

## Security Features

The platform includes enterprise-grade security:

### Rate Limiting
- Login: 5 attempts/minute
- Register: 3 attempts/minute  
- Newsletter: 10 signups/minute
- General API: 100 requests/minute

### Brute Force Protection
- Auto-lockout after 5 failed login attempts
- Progressive lockout (15min → 1hr)
- IP and account-based tracking

### Security Headers
- HSTS, CSP, X-Frame-Options: DENY
- XSS Protection, nosniff
- Strict Referrer-Policy

### Input Sanitization
- XSS attack prevention
- NoSQL injection detection
- Email validation
- HTML sanitization

### Audit Logging
- All auth events logged to `/backend/security.log`
- Admin actions tracked
- Attack attempts logged with CRITICAL level

---

## Project Structure

```
/app
├── backend/
│   ├── server.py              # Main FastAPI app
│   ├── security.py            # Security module
│   ├── routes/
│   │   ├── market_intelligence.py
│   │   ├── gamification.py
│   │   ├── media.py
│   │   └── premium.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── pages/             # React pages
│   │   ├── components/        # React components
│   │   │   └── ui/            # shadcn/ui
│   │   └── i18n.js            # Translations (EN/FR/AR)
│   ├── package.json
│   └── .env
│
└── README.md
```

---

## Database Collections

| Collection | Description |
|------------|-------------|
| `users` | User accounts + security metadata |
| `courses` | Course content |
| `lessons` | Lesson content |
| `newsletter_subscribers` | Newsletter subscribers |
| `newsletters` | Newsletter drafts and history |
| `portfolios` | Trading simulator portfolios |
| `trades` | Trade history |

---

## Troubleshooting

### MongoDB Connection Failed
```bash
# Check MongoDB is running
sudo systemctl status mongod

# Check connection string in .env
```

### Rate Limit Exceeded (429)
```
Wait 1-15 minutes depending on block type.
Admin can unblock via /api/admin/security/unblock-ip
```

### Account Locked
```
After 5 failed attempts, account locks for 15 minutes.
Admin can unblock via /api/admin/security/unblock-account
```

### CORS Error
```
Add your frontend URL to CORS_ORIGINS in backend/.env
Restart backend
```

### Logs Location
```bash
# Backend logs
tail -f /var/log/supervisor/backend.err.log

# Security logs
tail -f /app/backend/security.log
```

---

## Test Credentials

```
Admin:  admin@thecryptocoach.io / adminpassword
```

---

## Tech Stack

- **Backend:** FastAPI, Python 3.10+, MongoDB, JWT, bcrypt, slowapi, bleach
- **Frontend:** React 19, Tailwind CSS, shadcn/ui, Framer Motion, i18next
- **APIs:** CoinGecko (market data), Alternative.me (Fear & Greed), Resend (email)

---

## License

Proprietary - TheCryptoCoach.io

---

*Last Updated: March 2026*
