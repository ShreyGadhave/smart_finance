# Smart Finance Backend

Python pipeline that aggregates market news, runs sentiment analysis, generates LLM insights, and writes output to local JSON and optionally Supabase.

## Setup

1. Install dependencies:

```bash
pip install -r requirements.txt
```

2. Copy `.env.example` to `.env` and set:

- `GNEWS_API_KEY`
- `ALPHA_VANTAGE_KEY`
- `GROQ_API_KEY`
- `SUPABASE_URL` (Supabase project URL)
- `SUPABASE_KEY` (Supabase `service_role` key, backend only)
- `DEFAULT_USER_ID` (optional fallback Supabase Auth user UUID for manual script runs)
- `SUPABASE_TABLE` (optional, default: `pipeline_runs`)
- `SUPABASE_ARTICLES_TABLE` (optional, default: `pipeline_articles`)

## Run

```bash
python main.py
```

This writes:

- Local file: `data/final_news.json`
- Supabase run row (optional): table set by `SUPABASE_TABLE`
- Supabase article rows (optional): one row per output article in `SUPABASE_ARTICLES_TABLE`

Phase 1 ownership fields:

- `pipeline_runs.user_id`
- `pipeline_articles.user_id`
- run status lifecycle: `queued` / `running` / `completed` / `failed`

## Phase 2 API (backend-frontend integration)

Start API server:

```bash
uvicorn api:app --reload --port 8000
```

Endpoints:

- `GET /health`
- `POST /api/pipeline/run` (Bearer token required)
- `GET /api/pipeline/runs` (Bearer token required)
- `GET /api/pipeline/runs/{run_id}` (Bearer token required)
- `GET /api/pipeline/runs/{run_id}/articles` (Bearer token required)

## Supabase Table

Run SQL from:

- `supabase_schema.sql`

That script creates table, indexes, and baseline RLS policies for:

- frontend `select` using anon/publishable key
- backend `insert` using service role key
