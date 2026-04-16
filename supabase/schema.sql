-- Students
create table students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  grade text not null,
  avatar_emoji text default '🎓',
  total_points integer default 0,
  created_at timestamptz default now()
);

-- Achievements
create table achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  points_awarded integer default 10,
  created_at timestamptz default now()
);

-- Badges
create table badges (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon_emoji text not null,
  description text,
  points_required integer not null
);

-- Student Badges (earned)
create table student_badges (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade,
  badge_id uuid references badges(id) on delete cascade,
  earned_at timestamptz default now()
);

-- Seed badges
insert into badges (name, icon_emoji, description, points_required) values
  ('Starter', '🌱', 'First achievement uploaded', 10),
  ('Rising Star', '⭐', 'Earned 50 points', 50),
  ('Achiever', '🏆', 'Earned 100 points', 100),
  ('Champion', '🥇', 'Earned 250 points', 250),
  ('Legend', '🌟', 'Earned 500 points', 500);

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

-- Tiered badges
alter table badges add column if not exists bronze_threshold integer default 1;
alter table badges add column if not exists silver_threshold integer default 5;
alter table badges add column if not exists gold_threshold integer default 15;

-- Track tier per earned badge
alter table student_badges add column if not exists tier text default 'bronze';
alter table student_badges add column if not exists progress integer default 0;

-- Challenges
create table if not exists challenges (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  deadline timestamptz not null,
  target_count integer not null default 3,
  category text,
  is_class_wide boolean default false,
  class_id text,
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

-- Seed cosmetics
insert into cosmetics (name, type, emoji_or_css, unlock_points, preview_color) values
  ('Rose Border', 'border', 'border-rose-500 border-4', 50, '#F43F5E'),
  ('Gold Border', 'border', 'border-yellow-400 border-4', 200, '#FACC15'),
  ('Purple Glow', 'border', 'border-purple-500 border-4 shadow-purple-300', 100, '#A855F7'),
  ('Sunset Background', 'background', 'bg-gradient-to-br from-orange-100 to-pink-100', 75, '#FED7AA'),
  ('Sky Background', 'background', 'bg-gradient-to-br from-blue-100 to-cyan-100', 75, '#BAE6FD'),
  ('Galaxy Background', 'background', 'bg-gradient-to-br from-purple-200 to-indigo-200', 150, '#DDD6FE'),
  ('Star Crown', 'accessory', '👑', 250, '#FCD34D'),
  ('Fire Aura', 'accessory', '🔥', 100, '#FB923C'),
  ('Diamond', 'accessory', '💎', 500, '#67E8F9');

-- Seed a sample challenge
insert into challenges (title, description, deadline, target_count, category, is_class_wide, class_id)
values ('Science Week Sprint', 'Submit 3 science achievements before the deadline!', now() + interval '7 days', 3, 'Science', true, 'Class A');

-- Seed goals for students
insert into goals (student_id, title, description, target_count, category, deadline)
select id, 'Reading Challenge', 'Complete 3 reading achievements this month', 3, 'Reading', (current_date + interval '30 days')::date
from students where name = 'Alex Johnson';

-- Update seed students with class and parent email
update students set class_id = 'Class A', parent_email = 'parent.alex@example.com' where name = 'Alex Johnson';
update students set class_id = 'Class A', parent_email = 'parent.maya@example.com' where name = 'Maya Patel';
update students set class_id = 'Class B', parent_email = 'parent.carlos@example.com' where name = 'Carlos Rivera';
