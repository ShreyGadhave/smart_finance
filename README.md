# Smart Finance

Centralized platform for financial intelligence: news ingestion, sentiment analysis, research synthesis, and a web dashboard.

## Repository Structure

- `backend/` Python ingestion and Supabase write pipeline
- `frontend/` Next.js + shadcn web app

## Supabase Environment Keys (Important)

Use these exact keys from Supabase Dashboard -> Settings -> API.

### Backend (`backend/.env`)

- `SUPABASE_URL`: Project URL (example: `https://xyzcompany.supabase.co`)
- `SUPABASE_KEY`: `service_role` key (secret, backend only)
- `SUPABASE_TABLE`: `pipeline_runs` (default)
- `SUPABASE_ARTICLES_TABLE`: `pipeline_articles` (default)

Never expose `SUPABASE_KEY` (`service_role`) in frontend.

### Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_SUPABASE_URL`: Same project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `anon` / publishable key
- `NEXT_PUBLIC_SUPABASE_TABLE`: `pipeline_runs` (default)

Use only anon key in frontend.

## Quick Start

### 1) Configure database

Run SQL from:

- `backend/supabase_schema.sql`

### 2) Run backend

```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 3) Run frontend

```bash
cd frontend
npm install
npm run dev
```
