-- TaskFlow initial schema
-- Apply via Supabase Dashboard SQL Editor or: supabase db push

-- Extensions
create extension if not exists "uuid-ossp";

-- Profiles (1:1 with auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  username text unique,
  avatar_url text,
  member_since date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User settings (notification + privacy)
create table public.user_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  notification_settings jsonb not null default '{
    "enabled": true,
    "taskReminders": true,
    "overdueTasks": true,
    "habitReminders": true,
    "streakMilestones": true,
    "weeklyDebrief": true,
    "defaultReminderTime": "08:00"
  }'::jsonb,
  privacy_settings jsonb not null default '{
    "appLock": false,
    "analytics": true
  }'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Task lists
create table public.lists (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tags
create table public.tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

-- Tasks
create table public.tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  priority text not null default 'medium' check (priority in ('urgent', 'high', 'medium', 'low', 'none')),
  difficulty text not null default 'regular' check (difficulty in ('easy', 'regular', 'hard')),
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'completed')),
  category text not null default 'work',
  due_date date,
  due_time time,
  completed boolean not null default false,
  reminder_enabled boolean not null default false,
  reminder_time time,
  repeat_rule text not null default 'none',
  list_id uuid references public.lists(id) on delete set null,
  focus_minutes integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Subtasks
create table public.subtasks (
  id uuid primary key default uuid_generate_v4(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Task tags junction
create table public.task_tags (
  task_id uuid not null references public.tasks(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (task_id, tag_id)
);

-- Habits
create table public.habits (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  icon text not null default '✨',
  description text not null default '',
  target_days text[] not null default array['S','M','T','W','T','F','S'],
  color text not null default '#6C63D1',
  category text not null default 'General',
  difficulty text not null default 'regular' check (difficulty in ('easy', 'regular', 'hard')),
  goal_enabled boolean not null default false,
  goal_start_date date,
  goal_target_count integer,
  goal_unit text,
  reminder_enabled boolean not null default false,
  reminder_time time,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Habit daily completions
create table public.habit_completions (
  id uuid primary key default uuid_generate_v4(),
  habit_id uuid not null references public.habits(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  completed boolean not null default true,
  logged_value numeric,
  created_at timestamptz not null default now(),
  unique (habit_id, date)
);

-- Notes
create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default '',
  content text not null default '',
  tags text[] not null default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Goals
create table public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  progress integer not null default 0 check (progress >= 0 and progress <= 100),
  target_date date,
  category text not null default 'work',
  status text not null default 'active' check (status in ('active', 'completed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Focus sessions
create table public.focus_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete set null,
  duration_seconds integer not null default 0,
  session_type text not null default 'work' check (session_type in ('work', 'break')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

-- Nutrition daily summary
create table public.nutrition_daily (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  calories_current integer not null default 0,
  calories_target integer not null default 1800,
  protein_current numeric not null default 0,
  protein_target numeric not null default 150,
  carbs_current numeric not null default 0,
  carbs_target numeric not null default 200,
  fat_current numeric not null default 0,
  fat_target numeric not null default 67,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date)
);

-- Meal items
create table public.meal_items (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  meal_type text not null check (meal_type in ('Breakfast', 'Lunch', 'Dinner', 'Snacks')),
  name text not null,
  calories integer not null default 0,
  protein numeric not null default 0,
  carbs numeric not null default 0,
  fat numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Template additions tracking
create table public.user_template_additions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  template_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, template_id)
);

-- Bug reports
create table public.bug_reports (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  subject text not null,
  description text not null default '',
  device_info text,
  created_at timestamptz not null default now()
);

-- Updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();
create trigger user_settings_updated_at before update on public.user_settings
  for each row execute function public.handle_updated_at();
create trigger lists_updated_at before update on public.lists
  for each row execute function public.handle_updated_at();
create trigger tasks_updated_at before update on public.tasks
  for each row execute function public.handle_updated_at();
create trigger habits_updated_at before update on public.habits
  for each row execute function public.handle_updated_at();
create trigger notes_updated_at before update on public.notes
  for each row execute function public.handle_updated_at();
create trigger goals_updated_at before update on public.goals
  for each row execute function public.handle_updated_at();
create trigger nutrition_daily_updated_at before update on public.nutrition_daily
  for each row execute function public.handle_updated_at();

-- Auto-create profile + settings on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'username', null)
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;
alter table public.lists enable row level security;
alter table public.tags enable row level security;
alter table public.tasks enable row level security;
alter table public.subtasks enable row level security;
alter table public.task_tags enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;
alter table public.notes enable row level security;
alter table public.goals enable row level security;
alter table public.focus_sessions enable row level security;
alter table public.nutrition_daily enable row level security;
alter table public.meal_items enable row level security;
alter table public.user_template_additions enable row level security;
alter table public.bug_reports enable row level security;

-- Profiles policies
create policy "Users read own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

-- User settings policies
create policy "Users manage own settings" on public.user_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Lists policies
create policy "Users manage own lists" on public.lists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tags policies
create policy "Users manage own tags" on public.tags for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Tasks policies
create policy "Users manage own tasks" on public.tasks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Subtasks policies
create policy "Users manage own subtasks" on public.subtasks for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Task tags policies (via task ownership)
create policy "Users manage own task_tags" on public.task_tags for all
  using (exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid()))
  with check (exists (select 1 from public.tasks t where t.id = task_id and t.user_id = auth.uid()));

-- Habits policies
create policy "Users manage own habits" on public.habits for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Habit completions policies
create policy "Users manage own habit_completions" on public.habit_completions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Notes policies
create policy "Users manage own notes" on public.notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Goals policies
create policy "Users manage own goals" on public.goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Focus sessions policies
create policy "Users manage own focus_sessions" on public.focus_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Nutrition policies
create policy "Users manage own nutrition_daily" on public.nutrition_daily for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users manage own meal_items" on public.meal_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Template additions policies
create policy "Users manage own template_additions" on public.user_template_additions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Bug reports: users can insert own, read own
create policy "Users insert bug reports" on public.bug_reports for insert
  with check (auth.uid() = user_id or user_id is null);
create policy "Users read own bug reports" on public.bug_reports for select
  using (auth.uid() = user_id);

-- Storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "Avatar images are publicly accessible"
  on storage.objects for select using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

-- Indexes for common queries
create index idx_tasks_user_due on public.tasks(user_id, due_date);
create index idx_habit_completions_habit_date on public.habit_completions(habit_id, date);
create index idx_notes_user on public.notes(user_id);
create index idx_meal_items_user_date on public.meal_items(user_id, date);
