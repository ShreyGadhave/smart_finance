# Smart Finance Frontend

Next.js + shadcn dashboard for viewing pipeline outputs written to Supabase.

## Environment

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase anon/publishable key)
- `NEXT_PUBLIC_SUPABASE_TABLE` (default: `pipeline_runs`)

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Data Source

The dashboard reads recent rows from Supabase with this shape:

- `ticker` (text)
- `overall_sentiment` (text)
- `payload` (jsonb)
- `created_at` (timestamptz)

Create this table/policies with:

- `backend/supabase_schema.sql`

## Notes

- Backend inserts are optional and do not break local JSON output.
- Frontend shows an inline warning if Supabase env vars are missing.
