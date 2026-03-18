-- Daily planner redesign schema

alter table public.tasks
  add column if not exists description text,
  add column if not exists definition_of_done text,
  add column if not exists expected_minutes int,
  add column if not exists actual_minutes_total int not null default 0,
  add column if not exists result_summary text,
  add column if not exists planning_date date,
  add column if not exists decision_rank int not null default 0,
  add column if not exists started_at timestamptz,
  add column if not exists completed_at timestamptz;

create index if not exists idx_tasks_planning_date
  on public.tasks (user_id, planning_date)
  where planning_date is not null;

create table if not exists public.daily_capacity (
  id                     uuid primary key default gen_random_uuid(),
  user_id                uuid not null references auth.users on delete cascade,
  capacity_date          date not null,
  deep_minutes_budget    int not null default 240,
  shallow_minutes_budget int not null default 120,
  admin_minutes_budget   int not null default 60,
  deep_minutes_planned   int not null default 0,
  shallow_minutes_planned int not null default 0,
  admin_minutes_planned  int not null default 0,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  unique (user_id, capacity_date)
);

alter table public.daily_capacity enable row level security;

create policy "Users can view own daily capacity"
  on public.daily_capacity for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily capacity"
  on public.daily_capacity for insert
  with check (auth.uid() = user_id);

create policy "Users can update own daily capacity"
  on public.daily_capacity for update
  using (auth.uid() = user_id);

create policy "Users can delete own daily capacity"
  on public.daily_capacity for delete
  using (auth.uid() = user_id);

create index if not exists idx_daily_capacity_user_date
  on public.daily_capacity (user_id, capacity_date);

create table if not exists public.task_blocks (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users on delete cascade,
  task_id              uuid not null references public.tasks on delete cascade,
  title_snapshot       text not null,
  type_snapshot        text not null check (type_snapshot in ('deep', 'shallow', 'admin')),
  starts_at            timestamptz not null,
  ends_at              timestamptz not null,
  planned_minutes      int not null,
  actual_minutes       int,
  status               text not null default 'planned'
                       check (status in ('planned', 'active', 'completed', 'skipped', 'interrupted', 'overrun')),
  calendar_event_id    text,
  calendar_sync_status text not null default 'pending'
                       check (calendar_sync_status in ('pending', 'synced', 'failed')),
  sync_error           text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

alter table public.task_blocks enable row level security;

create policy "Users can view own task blocks"
  on public.task_blocks for select
  using (auth.uid() = user_id);

create policy "Users can insert own task blocks"
  on public.task_blocks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own task blocks"
  on public.task_blocks for update
  using (auth.uid() = user_id);

create policy "Users can delete own task blocks"
  on public.task_blocks for delete
  using (auth.uid() = user_id);

create index if not exists idx_task_blocks_user_start
  on public.task_blocks (user_id, starts_at);

create index if not exists idx_task_blocks_user_task
  on public.task_blocks (user_id, task_id);

alter table public.focus_sessions
  add column if not exists task_block_id uuid references public.task_blocks on delete set null,
  add column if not exists overrun_minutes int not null default 0;
