-- Noema v0.1 initial schema
-- All tables use RLS with per-user row isolation

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  display_name text,
  timezone    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- tasks
-- ============================================================
create table public.tasks (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users on delete cascade,
  title         text not null,
  notes         text,
  type          text not null default 'deep'
                check (type in ('deep', 'shallow', 'admin')),
  status        text not null default 'inbox'
                check (status in ('inbox', 'planned', 'active', 'done', 'archived')),
  priority      text not null default 'medium'
                check (priority in ('low', 'medium', 'high')),
  scheduled_for timestamptz,
  due_at        timestamptz,
  source        text not null default 'manual'
                check (source in ('manual', 'capture', 'ai')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update
  using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

create index idx_tasks_user_id on public.tasks (user_id);
create index idx_tasks_status on public.tasks (user_id, status);
create index idx_tasks_scheduled on public.tasks (user_id, scheduled_for)
  where scheduled_for is not null;

-- ============================================================
-- captures
-- ============================================================
create table public.captures (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users on delete cascade,
  content    text not null,
  kind       text not null default 'unknown'
             check (kind in ('task', 'idea', 'reminder', 'note', 'unknown')),
  processed  boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.captures enable row level security;

create policy "Users can view own captures"
  on public.captures for select
  using (auth.uid() = user_id);

create policy "Users can insert own captures"
  on public.captures for insert
  with check (auth.uid() = user_id);

create policy "Users can update own captures"
  on public.captures for update
  using (auth.uid() = user_id);

create policy "Users can delete own captures"
  on public.captures for delete
  using (auth.uid() = user_id);

create index idx_captures_user_id on public.captures (user_id);
create index idx_captures_unprocessed on public.captures (user_id, processed)
  where processed = false;

-- ============================================================
-- focus_sessions
-- ============================================================
create table public.focus_sessions (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users on delete cascade,
  task_id            uuid references public.tasks on delete set null,
  goal               text,
  started_at         timestamptz not null default now(),
  ended_at           timestamptz,
  planned_minutes    int not null default 25,
  actual_minutes     int,
  status             text not null default 'active'
                     check (status in ('active', 'completed', 'abandoned')),
  reflection         text,
  interruptions_count int not null default 0,
  created_at         timestamptz not null default now()
);

alter table public.focus_sessions enable row level security;

create policy "Users can view own sessions"
  on public.focus_sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.focus_sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sessions"
  on public.focus_sessions for update
  using (auth.uid() = user_id);

create index idx_focus_sessions_user_id on public.focus_sessions (user_id);

-- ============================================================
-- daily_briefs
-- ============================================================
create table public.daily_briefs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users on delete cascade,
  brief_date        date not null,
  primary_task_id   uuid references public.tasks on delete set null,
  secondary_task_id uuid references public.tasks on delete set null,
  admin_notes       text,
  next_focus_at     timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (user_id, brief_date)
);

alter table public.daily_briefs enable row level security;

create policy "Users can view own briefs"
  on public.daily_briefs for select
  using (auth.uid() = user_id);

create policy "Users can insert own briefs"
  on public.daily_briefs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own briefs"
  on public.daily_briefs for update
  using (auth.uid() = user_id);

create index idx_daily_briefs_user_date on public.daily_briefs (user_id, brief_date);

-- ============================================================
-- shutdown_reviews
-- ============================================================
create table public.shutdown_reviews (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users on delete cascade,
  review_date          date not null,
  completed_summary    text,
  open_loops           text,
  first_task_tomorrow  text,
  reflection           text,
  created_at           timestamptz not null default now(),
  unique (user_id, review_date)
);

alter table public.shutdown_reviews enable row level security;

create policy "Users can view own reviews"
  on public.shutdown_reviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own reviews"
  on public.shutdown_reviews for insert
  with check (auth.uid() = user_id);

create policy "Users can update own reviews"
  on public.shutdown_reviews for update
  using (auth.uid() = user_id);

create index idx_shutdown_reviews_user_date on public.shutdown_reviews (user_id, review_date);
