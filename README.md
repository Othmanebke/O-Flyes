# ✈️ AIVANA 

> AI-powered scalable SaaS platform built with Next.js and Supabase.

## Architecture:

```text
AIVANA/
├── frontend/                  # Next.js 14 + TypeScript + Tailwind
│   ├── src/app/               # App Router pages
│   ├── src/components/        # UI Components
│   ├── src/app/api/           # Serverless Route Handlers (Backend)
│   └── supabase/              # Supabase migrations & seed data
```

## Tech Stack

| Layer           | Technology                           |
|-----------------|--------------------------------------|
| Frontend        | Next.js 14, React, Tailwind CSS      |
| Backend & API   | Next.js Route Handlers               |
| Auth & DB       | Supabase (PostgreSQL + RLS + OAuth)  |
| AI Engine       | Groq API                             |
| Deployment      | Vercel / Render                      |

## Local Development Setup

### 1. Environment Variables
Create `.env.local` in `frontend/`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role
GROQ_API_KEY=your_groq_api_key
```

### 2. Install Dependencies & Run
```bash
cd frontend
npm install
npm run dev
```

### 3. Database (Supabase)
Ensure your Supabase project is set up and run the migrations found in `frontend/supabase/migrations`.

---
*Refactored to Option B: Removed legacy Express microservices in favor of Next.js Route Handlers + Supabase.*
