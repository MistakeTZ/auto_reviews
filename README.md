# Wildberries reAnswer (Автоматические ответы на отзывы и вопросы WB)

An automated, AI-powered system designed for Wildberries marketplace sellers to manage, analyze, and reply to customer reviews and questions. Leveraging **OpenAI GPT-4** and customizable rule engines, **reAnswer** automates customer support, maintains high ratings, and saves hours of manual work. It also provides messenger bot notifications (Telegram/MAX) and Yookassa payment integration.

---

## 🌟 Key Features

*   **AI-Powered Answers**: Generates polite, brand-aligned, and context-aware responses to reviews and questions using OpenAI's GPT models.
*   **Custom Reply Rules**: Setup granular rules based on product rating, keywords, specific products, and auto-reply templates.
*   **Real-time Notifications**: Telegram and MAX bot integrations send instant updates and support interactive callback quick-actions.
*   **Admin Dashboard**: Manage database entities, audit logs, and users easily through an integrated SQLAdmin interface.
*   **Monetization**: Built-in Yookassa payment gateway support for user subscriptions and packages.
*   **Bilingual Interface**: Seamless translation switcher supporting both Russian and English locales.

---

## 🛠 Tech Stack

### Frontend
*   **Framework**: Next.js 16 (App Router) & React 19
*   **Styling**: Tailwind CSS v4, Framer Motion (for smooth micro-animations)
*   **State Management**: Zustand
*   **Icons & FX**: Lucide React, Canvas Confetti

### Backend & Core Services
*   **API Framework**: FastAPI (Python 3.11)
*   **Database & ORM**: PostgreSQL 15, SQLAlchemy 2.0
*   **Database Admin**: SQLAdmin 0.26 (WTForms-based admin panel)
*   **AI Engine**: OpenAI Python Client (GPT-4 / GPT-5 reasoning models support)
*   **HTTP Clients**: httpx, urllib3
*   **Authentication**: JWT (JSON Web Tokens), bcrypt hashing

### Reverse Proxy & Deployment
*   **Web Server**: Nginx (handling reverse proxy routing to frontend and backend)
*   **Containerization**: Docker & Docker Compose

---

## 📁 Directory Structure

```text
├── src/                      # Next.js frontend source code
│   ├── app/                  # Frontend pages & layouts (landing, dashboard, settings, etc.)
│   ├── components/           # Reusable UI components
│   ├── hooks/                # Custom React hooks
│   ├── lib/                  # Utility libraries & API client helpers
│   ├── locales/              # Translation dictionaries (ru.ts, en.ts)
│   └── store/                # Zustand global state stores
├── backend/                  # FastAPI backend source code
│   ├── processor/            # Core business logic processors (controller, GPT integration)
│   │   ├── controller.py     # Main loops to fetch and process reviews & questions
│   │   └── gpt.py            # Async wrapper for OpenAI chat completions
│   ├── routers/              # API router endpoints (auth, rules, reviews, settings, etc.)
│   ├── services/             # Core service integrations (Yookassa, notifications, products)
│   ├── database.py           # DB connection setup
│   ├── models.py             # SQLAlchemy DB schemas
│   ├── controller_runner.py  # Script to launch the background processing task
│   └── bot.py                # Telegram & MAX bot runner and webhooks handler
├── nginx/                    # Reverse proxy configurations
│   └── default.conf          # Nginx routing rules mapping /api and /admin to backend
├── Dockerfile                # Frontend Docker build
├── docker-compose.yml        # Multi-container service orchestrator
└── backend/Dockerfile        # Backend Docker build
```

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file in the root directory. Example configuration:

```env
# Domain & API URL
DOMAIN=reanswer.ru
NEXT_PUBLIC_API_URL=https://reanswer.ru/api

# OpenAI API Key
OPENAI_API_KEY=your-openai-api-key

# Database Settings
DB_USER=user
DB_PASSWORD=your-secure-password
DB_NAME=autoreviews
DB_URL=postgresql://user:your-secure-password@db:5432/autoreviews

# Telegram & Messenger Bots
TG_BOT_TOKEN=your-telegram-bot-token
TG_BOT_NAME=your_telegram_bot_username
MAX_BOT_TOKEN=your-max-bot-token
MAX_BOT_NAME=your_max_bot_username
BOT_WEBHOOK_BASE_URL=https://reanswer.ru
BOT_WEBHOOK_SECRET=your-webhook-secret-token

# Admin panel
SQLADMIN_USERNAME=admin
SQLADMIN_PASSWORD=secure-admin-password
SQLADMIN_SECRET_KEY=some-random-secret-key

# YooKassa (Payments)
YOOKASSA_SHOP_ID=your-shop-id
YOOKASSA_SECRET_KEY=your-yookassa-secret-key
```

---

## 🚀 Getting Started

### Method 1: Running with Docker Compose (Recommended)

To launch the entire application stack (Frontend, Backend, Database, Controller, Bots, and Nginx proxy) in production or local simulation mode:

1. Clone the repository and navigate into it.
2. Fill in the `.env` file.
3. Run the docker containers:
   ```bash
   docker compose up --build
   ```
4. Access the application in your browser:
   *   **Web App**: `http://localhost:8082` (or the configured `DOMAIN`)
   *   **Admin Panel**: `http://localhost:8082/admin` (using `SQLADMIN_USERNAME` and `SQLADMIN_PASSWORD`)

---

### Method 2: Local Development Setup

If you prefer to run services individually for debugging:

#### 1. Database Setup
Ensure PostgreSQL is running and create a database matching your `.env` configuration.

#### 2. Backend & Processes
Create a virtual environment, install requirements, and run the FastAPI server:
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start API server
uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

In separate terminals, run the controller and the messenger bot client:
```bash
# Start background worker/controller (fetches and replies to reviews)
python -m backend.controller_runner

# Start Telegram & MAX bot runner
python backend/bot.py
```

#### 3. Frontend Setup
Install npm dependencies and launch the Next.js development server:
```bash
# From the root directory
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access the frontend development build.

---

## 🤖 Bot Setup & Webhooks

When the FastAPI server starts, it registers webhooks automatically with Telegram/MAX platforms if `BOT_WEBHOOK_BASE_URL` and `BOT_WEBHOOK_SECRET` are configured.

1. Ensure your server is accessible via public HTTPS (e.g. through Nginx with SSL, Cloudflare, or Ngrok during local development).
2. Bot callback queries are forwarded to the `/api/bot/webhook/{bot_type}/{secret}` endpoint.
3. Interaction events will trigger immediate system replies or notify target admins.

---

## 📝 License
This project is proprietary. All rights reserved.
