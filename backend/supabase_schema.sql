create table if not exists public.pipeline_runs (
    id bigint generated always as identity primary key,
    user_id uuid references auth.users(id) on delete
    set null,
        ticker text,
        overall_sentiment text,
        payload jsonb not null,
        status text not null default 'completed',
        error_message text,
        created_at timestamptz not null default now()
);
alter table public.pipeline_runs
add column if not exists user_id uuid references auth.users(id) on delete
set null;
alter table public.pipeline_runs
add column if not exists status text not null default 'completed';
alter table public.pipeline_runs
add column if not exists error_message text;
alter table public.pipeline_runs drop constraint if exists pipeline_runs_status_check;
alter table public.pipeline_runs
add constraint pipeline_runs_status_check check (
        status in ('queued', 'running', 'completed', 'failed')
    );
create table if not exists public.pipeline_articles (
    id bigint generated always as identity primary key,
    run_id bigint not null references public.pipeline_runs(id) on delete cascade,
    user_id uuid references auth.users(id) on delete
    set null,
        ticker text,
        headline text,
        source text,
        summary text,
        url text,
        real_url text,
        full_text text,
        sentiment text,
        confidence double precision,
        score integer,
        created_at timestamptz not null default now()
);
alter table public.pipeline_articles
add column if not exists user_id uuid references auth.users(id) on delete
set null;
create index if not exists idx_pipeline_runs_created_at on public.pipeline_runs (created_at desc);
create index if not exists idx_pipeline_runs_ticker on public.pipeline_runs (ticker);
create index if not exists idx_pipeline_runs_user_id on public.pipeline_runs (user_id);
create index if not exists idx_pipeline_runs_status on public.pipeline_runs (status);
create index if not exists idx_pipeline_articles_run_id on public.pipeline_articles (run_id);
create index if not exists idx_pipeline_articles_ticker on public.pipeline_articles (ticker);
create index if not exists idx_pipeline_articles_user_id on public.pipeline_articles (user_id);
alter table public.pipeline_runs enable row level security;
alter table public.pipeline_articles enable row level security;
-- Ownership read policies (authenticated users can only see their own data)
drop policy if exists "pipeline_runs_read" on public.pipeline_runs;
drop policy if exists "pipeline_runs_read_own" on public.pipeline_runs;
create policy "pipeline_runs_read_own" on public.pipeline_runs for
select to authenticated using (auth.uid() = user_id);
drop policy if exists "pipeline_articles_read" on public.pipeline_articles;
drop policy if exists "pipeline_articles_read_own" on public.pipeline_articles;
create policy "pipeline_articles_read_own" on public.pipeline_articles for
select to authenticated using (auth.uid() = user_id);
-- Optional ownership policies if authenticated clients insert/update directly.
drop policy if exists "pipeline_runs_insert_own" on public.pipeline_runs;
create policy "pipeline_runs_insert_own" on public.pipeline_runs for
insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "pipeline_runs_update_own" on public.pipeline_runs;
create policy "pipeline_runs_update_own" on public.pipeline_runs for
update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "pipeline_articles_insert_own" on public.pipeline_articles;
create policy "pipeline_articles_insert_own" on public.pipeline_articles for
insert to authenticated with check (auth.uid() = user_id);