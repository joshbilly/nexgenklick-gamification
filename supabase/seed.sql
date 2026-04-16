-- Seed students
insert into students (id, name, grade, avatar_emoji, total_points) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Alex Johnson', 'Grade 5', '🦁', 85),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Maya Patel', 'Grade 3', '🦋', 55),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Carlos Rivera', 'Grade 4', '🚀', 40);

-- Seed achievements for Alex Johnson (Grade 5) - total 85 points
insert into achievements (student_id, title, description, points_awarded) values
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Perfect Math Test', 'Scored 100% on the chapter 7 multiplication test', 20),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Science Fair Winner', 'First place in the 5th grade science fair with volcano project', 30),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Reading Champion', 'Finished 5 books this month in the reading challenge', 15),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Helping Hand', 'Helped classmates during group project', 10),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'Spelling Bee Finalist', 'Reached the final round of the school spelling bee', 10);

-- Seed achievements for Maya Patel (Grade 3) - total 55 points
insert into achievements (student_id, title, description, points_awarded) values
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Art Show Star', 'Painting selected for the school art show display', 20),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Math Whiz', 'Completed all extra credit math problems', 15),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Kind Friend Award', 'Nominated by teacher for showing kindness to new student', 10),
  ('a1b2c3d4-0002-0002-0002-000000000002', 'Book Report Excellence', 'Outstanding book report on Charlotte''s Web', 10);

-- Seed achievements for Carlos Rivera (Grade 4) - total 40 points
insert into achievements (student_id, title, description, points_awarded) values
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Soccer MVP', 'Most Valuable Player at the school soccer tournament', 15),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'History Project', 'Created an excellent diorama of ancient Egypt', 15),
  ('a1b2c3d4-0003-0003-0003-000000000003', 'Perfect Attendance', 'Full month of perfect attendance in October', 10);

-- Seed earned badges based on points
-- Alex has 85 points: Starter (10), Rising Star (50) earned
insert into student_badges (student_id, badge_id)
select 'a1b2c3d4-0001-0001-0001-000000000001', id from badges where points_required <= 85;

-- Maya has 55 points: Starter (10), Rising Star (50) earned
insert into student_badges (student_id, badge_id)
select 'a1b2c3d4-0002-0002-0002-000000000002', id from badges where points_required <= 55;

-- Carlos has 40 points: Starter (10) earned
insert into student_badges (student_id, badge_id)
select 'a1b2c3d4-0003-0003-0003-000000000003', id from badges where points_required <= 40;
