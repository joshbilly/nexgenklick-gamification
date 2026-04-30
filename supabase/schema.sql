-- Students
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade text not null,
  avatar_emoji text default '🎓',
  total_points integer default 0,
  created_at timestamptz default now()
);

-- Achievements
create table if not exists achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  points_awarded integer default 10,
  created_at timestamptz default now()
);

-- Badges
create table if not exists badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_emoji text not null,
  description text,
  points_required integer not null
);

-- Student Badges (earned)
create table if not exists student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  badge_id uuid references badges(id) on delete cascade,
  earned_at timestamptz default now()
);

-- Seed badges (skip if already present)
insert into badges (name, icon_emoji, description, points_required)
select * from (values
  ('Starter',     '🌱', 'First achievement uploaded', 10),
  ('Rising Star', '⭐', 'Earned 50 points',           50),
  ('Achiever',    '🏆', 'Earned 100 points',          100),
  ('Champion',    '🥇', 'Earned 250 points',          250),
  ('Legend',      '🌟', 'Earned 500 points',          500)
) as v(name, icon_emoji, description, points_required)
where not exists (select 1 from badges limit 1);

-- ============================================================
-- FEATURE ADDITIONS
-- ============================================================

-- Streak tracking
alter table students add column if not exists streak_count integer default 0;
alter table students add column if not exists last_active_date date;
alter table students add column if not exists streak_shields integer default 0;

-- Parent email per student
alter table students add column if not exists parent_email text;

-- Class grouping
alter table students add column if not exists class_id text default 'Class A';

-- Achievement category tagging
alter table achievements add column if not exists category text default 'General';

-- Tiered badges — thresholds per DEMO-02 spec: Bronze=5, Silver=15, Gold=30
alter table badges add column if not exists bronze_threshold integer default 5;
alter table badges add column if not exists silver_threshold integer default 15;
alter table badges add column if not exists gold_threshold integer default 30;

-- Update any existing badges to use spec thresholds
update badges set bronze_threshold = 5, silver_threshold = 15, gold_threshold = 30
where bronze_threshold != 5 or silver_threshold != 15 or gold_threshold != 30;

-- Track tier per earned badge
alter table student_badges add column if not exists tier text default 'bronze';
alter table student_badges add column if not exists progress integer default 0;

-- Challenges (DEMO-10: badge_reward_id and points_reward added per spec)
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  deadline timestamptz not null,
  target_count integer not null default 3,
  category text,
  scope text default 'class',
  is_class_wide boolean default false,
  class_id text,
  badge_reward_id uuid references badges(id),
  points_reward integer default 0,
  created_by text default 'admin',
  created_at timestamptz default now()
);

create table if not exists challenge_participation (
  id uuid primary key default gen_random_uuid(),
  challenge_id uuid references challenges(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  contribution_count integer default 0,
  completed boolean default false,
  updated_at timestamptz default now()
);

-- Cosmetics / Avatar customization
create table if not exists cosmetics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null,
  emoji_or_css text not null,
  unlock_points integer default 0,
  unlock_badge_id uuid references badges(id),
  preview_color text
);

create table if not exists student_cosmetics (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  cosmetic_id uuid references cosmetics(id) on delete cascade,
  equipped boolean default false,
  unlocked_at timestamptz default now()
);

-- Goals
create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  title text not null,
  description text,
  target_count integer not null default 5,
  category text,
  deadline date,
  current_progress integer default 0,
  completed boolean default false,
  created_at timestamptz default now()
);

-- Classes table (DEMO-09) — stores class name and teacher name
create table if not exists classes (
  id text primary key,
  class_name text not null,
  teacher_name text not null,
  created_at timestamptz default now()
);

-- Seed cosmetics (skip if already present)
insert into cosmetics (name, type, emoji_or_css, unlock_points, preview_color)
select * from (values
  ('Rose Border',       'border',     'border-rose-500 border-4',                        50,  '#F43F5E'),
  ('Gold Border',       'border',     'border-yellow-400 border-4',                      200, '#FACC15'),
  ('Purple Glow',       'border',     'border-purple-500 border-4 shadow-purple-300',    100, '#A855F7'),
  ('Sunset Background', 'background', 'bg-gradient-to-br from-orange-100 to-pink-100',   75,  '#FED7AA'),
  ('Sky Background',    'background', 'bg-gradient-to-br from-blue-100 to-cyan-100',     75,  '#BAE6FD'),
  ('Galaxy Background', 'background', 'bg-gradient-to-br from-purple-200 to-indigo-200', 150, '#DDD6FE'),
  ('Star Crown',        'accessory',  '👑',                                              250, '#FCD34D'),
  ('Fire Aura',         'accessory',  '🔥',                                              100, '#FB923C'),
  ('Diamond',           'accessory',  '💎',                                              500, '#67E8F9')
) as v(name, type, emoji_or_css, unlock_points, preview_color)
where not exists (select 1 from cosmetics limit 1);

-- Seed 3 classes (DEMO-09)
insert into classes (id, class_name, teacher_name) values
  ('class-a', 'Sunshine Class', 'Ms. Thompson'),
  ('class-b', 'Rainbow Class', 'Mr. Reyes'),
  ('class-c', 'Star Class', 'Ms. Park')
on conflict (id) do nothing;

-- Update seed students with class and parent email (safe on existing data)
update students set class_id = 'class-a', parent_email = 'parent.alex@example.com' where name = 'Alex Johnson';
update students set class_id = 'class-a', parent_email = 'parent.maya@example.com' where name = 'Maya Patel';
update students set class_id = 'class-b', parent_email = 'parent.carlos@example.com' where name = 'Carlos Rivera';

-- ============================================================
-- ROW LEVEL SECURITY (DEMO-15)
-- Policies enforce: students see own data, parents see child data,
-- admin sees all. Demo uses permissive anon policies — restrict in production.
-- ============================================================

alter table students enable row level security;
alter table achievements enable row level security;
alter table badges enable row level security;
alter table student_badges enable row level security;
alter table challenges enable row level security;
alter table challenge_participation enable row level security;
alter table cosmetics enable row level security;
alter table student_cosmetics enable row level security;
alter table goals enable row level security;
alter table classes enable row level security;

-- Drop existing policies before recreating (idempotent)
do $$ begin
  drop policy if exists "demo_anon_select" on students;
  drop policy if exists "demo_anon_all" on students;
  drop policy if exists "demo_anon_select" on achievements;
  drop policy if exists "demo_anon_all" on achievements;
  drop policy if exists "demo_anon_select" on badges;
  drop policy if exists "demo_anon_select" on student_badges;
  drop policy if exists "demo_anon_all" on student_badges;
  drop policy if exists "demo_anon_select" on challenges;
  drop policy if exists "demo_anon_all" on challenges;
  drop policy if exists "demo_anon_select" on challenge_participation;
  drop policy if exists "demo_anon_all" on challenge_participation;
  drop policy if exists "demo_anon_select" on cosmetics;
  drop policy if exists "demo_anon_select" on student_cosmetics;
  drop policy if exists "demo_anon_all" on student_cosmetics;
  drop policy if exists "demo_anon_select" on goals;
  drop policy if exists "demo_anon_all" on goals;
  drop policy if exists "demo_anon_select" on classes;
exception when others then null;
end $$;

-- DEMO: permissive anon policies (read + write for all tables)
-- Production: replace with auth.uid()-scoped policies (see comments below)
create policy "demo_anon_select" on students for select using (true);
create policy "demo_anon_all"    on students for all using (true) with check (true);

create policy "demo_anon_select" on achievements for select using (true);
create policy "demo_anon_all"    on achievements for all using (true) with check (true);

create policy "demo_anon_select" on badges for select using (true);

create policy "demo_anon_select" on student_badges for select using (true);
create policy "demo_anon_all"    on student_badges for all using (true) with check (true);

create policy "demo_anon_select" on challenges for select using (true);
create policy "demo_anon_all"    on challenges for all using (true) with check (true);

create policy "demo_anon_select" on challenge_participation for select using (true);
create policy "demo_anon_all"    on challenge_participation for all using (true) with check (true);

create policy "demo_anon_select" on cosmetics for select using (true);

create policy "demo_anon_select" on student_cosmetics for select using (true);
create policy "demo_anon_all"    on student_cosmetics for all using (true) with check (true);

create policy "demo_anon_select" on goals for select using (true);
create policy "demo_anon_all"    on goals for all using (true) with check (true);

create policy "demo_anon_select" on classes for select using (true);

-- ============================================================
-- PRODUCTION RLS EXAMPLES (uncomment after enabling Supabase Auth)
-- ============================================================
-- Students read their own row only:
-- create policy "students_read_own" on students for select
--   using (auth.uid()::text = id::text or (auth.jwt() ->> 'role') = 'admin');
--
-- Parents read their child via parent_email match:
-- create policy "parents_read_child" on students for select
--   using ((auth.jwt() ->> 'email') = parent_email or (auth.jwt() ->> 'role') = 'admin');
--
-- Admin full access:
-- create policy "admin_all" on students for all
--   using ((auth.jwt() ->> 'role') = 'admin') with check ((auth.jwt() ->> 'role') = 'admin');

-- ============================================================
-- DATA RETENTION (DEMO-15)
-- Purge achievement records older than 1 academic year (365 days).
-- Schedule via Supabase pg_cron: select cron.schedule('purge-old-achievements', '0 2 * * 0', 'select purge_old_achievements()');
-- ============================================================
create or replace function purge_old_achievements() returns void
language plpgsql security definer as $$
begin
  delete from achievements where created_at < now() - interval '365 days';
end;
$$;
