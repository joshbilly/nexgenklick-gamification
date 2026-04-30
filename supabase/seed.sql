-- ============================================================
-- NEXGENKLICK DEMO SEED DATA (DEMO-14)
-- Idempotent: safe to re-run. Clears and re-seeds all demo rows.
-- Run via: npm run seed  (or paste into Supabase SQL Editor)
-- ============================================================

-- Remove existing seed data (identified by fixed ID prefix 'seed-')
delete from challenge_participation
  where challenge_id in (select id from challenges where created_by = 'seed');
delete from student_cosmetics
  where student_id in (select id from students where id::text like 'a1b2c3d4-%');
delete from student_badges
  where student_id in (select id from students where id::text like 'a1b2c3d4-%');
delete from goals
  where student_id in (select id from students where id::text like 'a1b2c3d4-%');
delete from achievements
  where student_id in (select id from students where id::text like 'a1b2c3d4-%');
delete from students
  where id::text like 'a1b2c3d4-%';
delete from challenges
  where created_by = 'seed';
delete from classes
  where id in ('class-a', 'class-b', 'class-c');

-- ── CLASSES (3 classes with teacher names) ──────────────────
insert into classes (id, class_name, teacher_name) values
  ('class-a', 'Sunshine Class', 'Ms. Thompson'),
  ('class-b', 'Rainbow Class',  'Mr. Reyes'),
  ('class-c', 'Star Class',     'Ms. Park');

-- ── STUDENTS (10 students, varied points / streaks / badges) ─
-- Fixed UUIDs so links like /student/a1b2c3d4-... always work
insert into students (id, name, grade, avatar_emoji, total_points, streak_count, last_active_date, streak_shields, parent_email, class_id) values
  -- Alex Johnson: Grade 5, Class A, 5-day streak (last active yesterday → increments on next login)
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Alex Johnson',    'Grade 5', '🦁', 150, 5,  current_date - 1, 1, 'parent.alex@example.com',    'class-a'),
  -- Maya Patel: Grade 3, Class A, 3-day streak
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Maya Patel',      'Grade 3', '🦋', 90,  3,  current_date - 1, 0, 'parent.maya@example.com',    'class-a'),
  -- Carlos Rivera: Grade 4, Class B, no streak
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Carlos Rivera',   'Grade 4', '🚀', 70,  0,  null,             0, 'parent.carlos@example.com',  'class-b'),
  -- Emma Chen: Grade 6, Class A, 500 pts, Gold badge — 30 achievements seeded below
  ('a1b2c3d4-0004-0004-0004-000000000004', 'Emma Chen',       'Grade 6', '🌟', 500, 0,  null,             2, 'parent.emma@example.com',    'class-a'),
  -- Jordan Williams: Grade 4, Class B, 2-day streak
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Jordan Williams', 'Grade 4', '⚡', 180, 2,  current_date - 1, 0, 'parent.jordan@example.com',  'class-b'),
  -- Sofia Garcia: Grade 5, Class C, 7-day "On Fire" streak
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Sofia Garcia',    'Grade 5', '🌺', 120, 7,  current_date,     0, 'parent.sofia@example.com',   'class-c'),
  -- Liam Brown: Grade 3, Class C, 1-day streak
  ('a1b2c3d4-0007-0007-0007-000000000007', 'Liam Brown',      'Grade 3', '🐻', 85,  1,  current_date,     0, 'parent.liam@example.com',    'class-c'),
  -- Zoe Kim: Grade 4, Class B, 4-day streak
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Zoe Kim',         'Grade 4', '🦊', 220, 4,  current_date - 1, 1, 'parent.zoe@example.com',     'class-b'),
  -- Noah Davis: Grade 5, Class A, no streak
  ('a1b2c3d4-0009-0009-0009-000000000009', 'Noah Davis',      'Grade 5', '🐺', 95,  0,  null,             0, 'parent.noah@example.com',    'class-a'),
  -- Aiden Martinez: Grade 3, Class C, no streak
  ('a1b2c3d4-0010-0010-0010-000000000010', 'Aiden Martinez',  'Grade 3', '🦅', 60,  0,  null,             0, 'parent.aiden@example.com',   'class-c');

-- ── ACHIEVEMENTS ─────────────────────────────────────────────
-- Alex Johnson (5 achievements, ~150 pts)
insert into achievements (student_id, title, description, points_awarded, category, created_at) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Perfect Math Test',      'Scored 100% on chapter 7 multiplication test',      30, 'Math',    now() - interval '6 days'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Science Fair Winner',    'First place in 5th grade science fair',             40, 'Science', now() - interval '5 days'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Reading Champion',       'Finished 5 books in the reading challenge',         30, 'Reading', now() - interval '3 days'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Helping Hand',           'Assisted classmates during group project',          20, 'General', now() - interval '2 days'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Spelling Bee Finalist',  'Reached the final round of the school spelling bee', 30, 'Reading', now() - interval '1 day');

-- Maya Patel (4 achievements, ~90 pts)
insert into achievements (student_id, title, description, points_awarded, category, created_at) values
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Art Show Star',          'Painting selected for the school art display',      25, 'Art',     now() - interval '4 days'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Math Whiz',              'Completed all extra credit math problems',          20, 'Math',    now() - interval '3 days'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Kind Friend Award',      'Nominated for showing kindness to new student',     20, 'General', now() - interval '2 days'),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Book Report Excellence', 'Outstanding book report on Charlotte''s Web',       25, 'Reading', now() - interval '1 day');

-- Carlos Rivera (3 achievements, ~70 pts)
insert into achievements (student_id, title, description, points_awarded, category, created_at) values
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Soccer MVP',             'Most Valuable Player at school soccer tournament',  25, 'Sports',  now() - interval '5 days'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'History Project',        'Excellent diorama of ancient Egypt',                25, 'General', now() - interval '3 days'),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Perfect Attendance',     'Full month of perfect attendance',                  20, 'General', now() - interval '1 day');

-- Emma Chen (30 achievements across categories — earns Gold badge tier)
insert into achievements (student_id, title, description, points_awarded, category, created_at)
select
  'a1b2c3d4-0004-0004-0004-000000000004'::uuid,
  case ((i - 1) % 6)
    when 0 then 'Science Achievement #' || i
    when 1 then 'Math Mastery #' || i
    when 2 then 'Reading Record #' || i
    when 3 then 'Art Creation #' || i
    when 4 then 'Sports Win #' || i
    else        'Music Performance #' || i
  end,
  'Seeded achievement ' || i || ' for demo purposes',
  case ((i - 1) % 3) when 0 then 20 when 1 then 15 else 10 end,
  case ((i - 1) % 6)
    when 0 then 'Science'
    when 1 then 'Math'
    when 2 then 'Reading'
    when 3 then 'Art'
    when 4 then 'Sports'
    else        'Music'
  end,
  now() - (31 - i) * interval '1 day'
from generate_series(1, 30) as i;

-- Jordan Williams (8 achievements, ~180 pts)
insert into achievements (student_id, title, description, points_awarded, category, created_at) values
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Debate Champion',        'Won the 4th grade class debate',                    25, 'General', now() - interval '7 days'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Math Olympiad',          'Top 3 in regional math olympiad',                   30, 'Math',    now() - interval '6 days'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Science Experiment',     'Best hypothesis in science class',                  20, 'Science', now() - interval '5 days'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Book Club Leader',       'Led the monthly book club discussion',              25, 'Reading', now() - interval '4 days'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Choir Solo',             'Performed a solo in the spring choir concert',      20, 'Music',   now() - interval '3 days'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Art Portfolio',          'Selected portfolio for district art show',          20, 'Art',     now() - interval '2 days'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Fitness Challenge',      'Completed 30-day fitness challenge',                20, 'Sports',  now() - interval '2 days'),
  ('a1b2c3d4-0005-0005-0005-000000000005', 'Peer Tutor',             'Helped struggling classmates with math',            20, 'Math',    now() - interval '1 day');

-- Sofia Garcia (6 achievements, ~120 pts)
insert into achievements (student_id, title, description, points_awarded, category, created_at) values
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Drama Club Star',        'Lead role in school play',                          25, 'Art',     now() - interval '6 days'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Poetry Contest',         '1st place in school poetry competition',            25, 'Reading', now() - interval '5 days'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Science Project',        'Volcano model won class competition',               20, 'Science', now() - interval '4 days'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Gymnastics Award',       'Gold medal in school gymnastics meet',              20, 'Sports',  now() - interval '3 days'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Music Recital',          'Performed Beethoven at spring recital',             15, 'Music',   now() - interval '2 days'),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Math Quiz Bowl',         'Perfect score in Math Quiz Bowl',                   15, 'Math',    now() - interval '1 day');

-- Liam Brown (5 achievements, ~85 pts)
insert into achievements (student_id, title, description, points_awarded, category, created_at) values
  ('a1b2c3d4-0007-0007-0007-000000000007', 'Reading Rainbow',        'Read 10 books in a month',                          20, 'Reading', now() - interval '5 days'),
  ('a1b2c3d4-0007-0007-0007-000000000007', 'Math Flash Cards',       'Perfect on all 100 multiplication flash cards',     20, 'Math',    now() - interval '4 days'),
  ('a1b2c3d4-0007-0007-0007-000000000007', 'Science Quiz Ace',       'Highest score in science chapter quiz',             15, 'Science', now() - interval '3 days'),
  ('a1b2c3d4-0007-0007-0007-000000000007', 'Kindness Award',         'Recognized for exceptional kindness',               15, 'General', now() - interval '2 days'),
  ('a1b2c3d4-0007-0007-0007-000000000007', 'Swim Team Victory',      'Team won the inter-school swim meet',               15, 'Sports',  now() - interval '1 day');

-- Zoe Kim (10 achievements, ~220 pts)
insert into achievements (student_id, title, description, points_awarded, category, created_at) values
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Robotics Club',          'Built a working robot in robotics club',            25, 'Science', now() - interval '9 days'),
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Coding Project',         'Created a simple game in Scratch',                  25, 'Science', now() - interval '8 days'),
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Math Competition',       '2nd place in city math competition',                25, 'Math',    now() - interval '7 days'),
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Novel Study',            'Best analysis essay on Charlotte''s Web',           20, 'Reading', now() - interval '6 days'),
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Painting Award',         'Painting exhibited in city art gallery',            20, 'Art',     now() - interval '5 days'),
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Track and Field',        'School record in 100m dash',                        25, 'Sports',  now() - interval '4 days'),
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Piano Recital',          'Flawless performance at spring piano recital',      20, 'Music',   now() - interval '3 days'),
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Creative Writing',       'Short story published in school literary magazine', 20, 'Reading', now() - interval '2 days'),
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Biology Lab',            'Most accurate biology lab report',                  20, 'Science', now() - interval '2 days'),
  ('a1b2c3d4-0008-0008-0008-000000000008', 'Student Council',        'Elected student council representative',            20, 'General', now() - interval '1 day');

-- Noah Davis (5 achievements, ~95 pts)
insert into achievements (student_id, title, description, points_awarded, category, created_at) values
  ('a1b2c3d4-0009-0009-0009-000000000009', 'Geography Bee',          'Regional geography bee champion',                   25, 'General', now() - interval '5 days'),
  ('a1b2c3d4-0009-0009-0009-000000000009', 'History Essay',          'Best essay on the American Revolution',             20, 'General', now() - interval '4 days'),
  ('a1b2c3d4-0009-0009-0009-000000000009', 'Science Olympiad',       'Bronze medal at science olympiad',                  20, 'Science', now() - interval '3 days'),
  ('a1b2c3d4-0009-0009-0009-000000000009', 'Reading Marathon',       'Read for 100 consecutive hours',                    15, 'Reading', now() - interval '2 days'),
  ('a1b2c3d4-0009-0009-0009-000000000009', 'Basketball Star',        'MVP of the school basketball team',                 15, 'Sports',  now() - interval '1 day');

-- Aiden Martinez (3 achievements, ~60 pts)
insert into achievements (student_id, title, description, points_awarded, category, created_at) values
  ('a1b2c3d4-0010-0010-0010-000000000010', 'Drawing Contest',        'Won 2nd place in school drawing contest',           25, 'Art',     now() - interval '3 days'),
  ('a1b2c3d4-0010-0010-0010-000000000010', 'Multiplication Mastery', 'Memorised all times tables up to 12',              20, 'Math',    now() - interval '2 days'),
  ('a1b2c3d4-0010-0010-0010-000000000010', 'Soccer Goal Record',     'Scored 5 goals in one game',                        15, 'Sports',  now() - interval '1 day');

-- ── BADGES ───────────────────────────────────────────────────
-- Award earned badges based on points thresholds
-- Alex (150 pts): Starter(10), Rising Star(50), Achiever(100)
insert into student_badges (student_id, badge_id, tier, progress)
select 'a1b2c3d4-0001-0001-0001-000000000001', id, 'silver', 5
from badges where points_required <= 150;

-- Maya (90 pts): Starter, Rising Star
insert into student_badges (student_id, badge_id, tier, progress)
select 'a1b2c3d4-0002-0002-0002-000000000002', id, 'bronze', 4
from badges where points_required <= 90;

-- Carlos (70 pts): Starter, Rising Star
insert into student_badges (student_id, badge_id, tier, progress)
select 'a1b2c3d4-0003-0003-0003-000000000003', id, 'bronze', 3
from badges where points_required <= 70;

-- Emma (500 pts, 30 achievements): All badges including Legend, Gold tier
insert into student_badges (student_id, badge_id, tier, progress)
select 'a1b2c3d4-0004-0004-0004-000000000004', id, 'gold', 30
from badges where points_required <= 500;

-- Jordan (180 pts): Starter, Rising Star, Achiever
insert into student_badges (student_id, badge_id, tier, progress)
select 'a1b2c3d4-0005-0005-0005-000000000005', id, 'silver', 8
from badges where points_required <= 180;

-- Sofia (120 pts): Starter, Rising Star, Achiever
insert into student_badges (student_id, badge_id, tier, progress)
select 'a1b2c3d4-0006-0006-0006-000000000006', id, 'silver', 6
from badges where points_required <= 120;

-- Liam (85 pts): Starter, Rising Star
insert into student_badges (student_id, badge_id, tier, progress)
select 'a1b2c3d4-0007-0007-0007-000000000007', id, 'bronze', 5
from badges where points_required <= 85;

-- Zoe (220 pts): Starter, Rising Star, Achiever
insert into student_badges (student_id, badge_id, tier, progress)
select 'a1b2c3d4-0008-0008-0008-000000000008', id, 'silver', 10
from badges where points_required <= 220;

-- Noah (95 pts): Starter, Rising Star
insert into student_badges (student_id, badge_id, tier, progress)
select 'a1b2c3d4-0009-0009-0009-000000000009', id, 'bronze', 5
from badges where points_required <= 95;

-- Aiden (60 pts): Starter, Rising Star
insert into student_badges (student_id, badge_id, tier, progress)
select 'a1b2c3d4-0010-0010-0010-000000000010', id, 'bronze', 3
from badges where points_required <= 60;

-- ── ACTIVE CHALLENGES (2) ────────────────────────────────────
insert into challenges (title, description, deadline, target_count, category, is_class_wide, class_id, created_by) values
  ('Science Week Sprint',   'Submit 3 science achievements before the deadline!', now() + interval '7 days',  3, 'Science', true, 'class-a', 'seed'),
  ('Math Mastery Marathon', 'Complete 5 math achievements this month.',           now() + interval '21 days', 5, 'Math',    true, 'class-b', 'seed');

-- Seed challenge participation (Alex is in progress on Science challenge)
insert into challenge_participation (challenge_id, student_id, contribution_count, completed)
select c.id, 'a1b2c3d4-0001-0001-0001-000000000001', 2, false
from challenges c where c.title = 'Science Week Sprint' and c.created_by = 'seed';

insert into challenge_participation (challenge_id, student_id, contribution_count, completed)
select c.id, 'a1b2c3d4-0005-0005-0005-000000000005', 3, false
from challenges c where c.title = 'Math Mastery Marathon' and c.created_by = 'seed';

-- ── GOALS (3) ────────────────────────────────────────────────
insert into goals (student_id, title, description, target_count, category, deadline, current_progress) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Reading Challenge',  'Complete 5 reading achievements this month',  5, 'Reading', (current_date + interval '30 days')::date, 2),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Art Explorer',       'Complete 3 art achievements this term',       3, 'Art',     (current_date + interval '45 days')::date, 1),
  ('a1b2c3d4-0006-0006-0006-000000000006', 'Science Star',       'Complete 4 science achievements by month end', 4, 'Science', (current_date + interval '15 days')::date, 1);

-- ── COSMETICS (unlock some for Emma who has 500 pts) ─────────
insert into student_cosmetics (student_id, cosmetic_id, equipped, unlocked_at)
select
  'a1b2c3d4-0004-0004-0004-000000000004',
  c.id,
  c.name = 'Diamond',
  now()
from cosmetics c
where c.unlock_points <= 500;

-- ── SUMMARY ──────────────────────────────────────────────────
do $$
declare
  student_count int;
  achievement_count int;
  badge_count int;
  challenge_count int;
  goal_count int;
begin
  select count(*) into student_count     from students     where id::text like 'a1b2c3d4-%';
  select count(*) into achievement_count from achievements where student_id::text like 'a1b2c3d4-%';
  select count(*) into badge_count       from student_badges where student_id::text like 'a1b2c3d4-%';
  select count(*) into challenge_count   from challenges   where created_by = 'seed';
  select count(*) into goal_count        from goals        where student_id::text like 'a1b2c3d4-%';
  raise notice 'Seeded % students, % achievements, % badge awards, % challenges, % goals',
    student_count, achievement_count, badge_count, challenge_count, goal_count;
end $$;
