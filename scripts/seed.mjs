#!/usr/bin/env node
/**
 * npm run seed       — populate Supabase with demo data
 * npm run seed:reset — clear seed data then re-seed
 *
 * Requires in .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ...   (Settings → API → service_role key)
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const root = join(__dir, '..')

// Load .env.local manually (no dotenv dependency needed)
const envFile = join(root, '.env.local')
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '')
    if (!process.env[key]) process.env[key] = val
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !key) {
  console.error('\x1b[31mError:\x1b[0m Missing environment variables.')
  console.error('Add these to .env.local:')
  console.error('  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJ...')
  console.error('\nAlternatively paste supabase/seed.sql into the Supabase SQL Editor.')
  process.exit(1)
}

const supabase = createClient(url, key, {
  auth: { persistSession: false },
})

const isReset = process.argv.includes('--reset')

async function run() {
  console.log('\x1b[36mNexGenKlick seed script\x1b[0m')

  if (isReset) {
    console.log('Clearing existing seed data…')
    await clearSeedData()
  }

  // Classes
  const classes = [
    { id: 'class-a', class_name: 'Sunshine Class', teacher_name: 'Ms. Thompson' },
    { id: 'class-b', class_name: 'Rainbow Class',  teacher_name: 'Mr. Reyes' },
    { id: 'class-c', class_name: 'Star Class',     teacher_name: 'Ms. Park' },
  ]
  await upsert('classes', classes, 'id')

  // Students
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const students = [
    { id: 'a1b2c3d4-0001-0001-0001-000000000001', name: 'Alex Johnson',    grade: 'Grade 5', avatar_emoji: '🦁', total_points: 150, streak_count: 5,  last_active_date: yesterday, streak_shields: 1, parent_email: 'parent.alex@example.com',    class_id: 'class-a' },
    { id: 'a1b2c3d4-0002-0002-0002-000000000002', name: 'Maya Patel',      grade: 'Grade 3', avatar_emoji: '🦋', total_points: 90,  streak_count: 3,  last_active_date: yesterday, streak_shields: 0, parent_email: 'parent.maya@example.com',    class_id: 'class-a' },
    { id: 'a1b2c3d4-0003-0003-0003-000000000003', name: 'Carlos Rivera',   grade: 'Grade 4', avatar_emoji: '🚀', total_points: 70,  streak_count: 0,  last_active_date: null,      streak_shields: 0, parent_email: 'parent.carlos@example.com',  class_id: 'class-b' },
    { id: 'a1b2c3d4-0004-0004-0004-000000000004', name: 'Emma Chen',       grade: 'Grade 6', avatar_emoji: '🌟', total_points: 500, streak_count: 0,  last_active_date: null,      streak_shields: 2, parent_email: 'parent.emma@example.com',    class_id: 'class-a' },
    { id: 'a1b2c3d4-0005-0005-0005-000000000005', name: 'Jordan Williams', grade: 'Grade 4', avatar_emoji: '⚡', total_points: 180, streak_count: 2,  last_active_date: yesterday, streak_shields: 0, parent_email: 'parent.jordan@example.com',  class_id: 'class-b' },
    { id: 'a1b2c3d4-0006-0006-0006-000000000006', name: 'Sofia Garcia',    grade: 'Grade 5', avatar_emoji: '🌺', total_points: 120, streak_count: 7,  last_active_date: today,     streak_shields: 0, parent_email: 'parent.sofia@example.com',   class_id: 'class-c' },
    { id: 'a1b2c3d4-0007-0007-0007-000000000007', name: 'Liam Brown',      grade: 'Grade 3', avatar_emoji: '🐻', total_points: 85,  streak_count: 1,  last_active_date: today,     streak_shields: 0, parent_email: 'parent.liam@example.com',    class_id: 'class-c' },
    { id: 'a1b2c3d4-0008-0008-0008-000000000008', name: 'Zoe Kim',         grade: 'Grade 4', avatar_emoji: '🦊', total_points: 220, streak_count: 4,  last_active_date: yesterday, streak_shields: 1, parent_email: 'parent.zoe@example.com',     class_id: 'class-b' },
    { id: 'a1b2c3d4-0009-0009-0009-000000000009', name: 'Noah Davis',      grade: 'Grade 5', avatar_emoji: '🐺', total_points: 95,  streak_count: 0,  last_active_date: null,      streak_shields: 0, parent_email: 'parent.noah@example.com',    class_id: 'class-a' },
    { id: 'a1b2c3d4-0010-0010-0010-000000000010', name: 'Aiden Martinez',  grade: 'Grade 3', avatar_emoji: '🦅', total_points: 60,  streak_count: 0,  last_active_date: null,      streak_shields: 0, parent_email: 'parent.aiden@example.com',   class_id: 'class-c' },
  ]
  await upsert('students', students, 'id')

  // Fetch badge IDs
  const { data: badges } = await supabase.from('badges').select('id, points_required')
  if (!badges?.length) {
    console.error('No badges found. Run schema.sql first.')
    process.exit(1)
  }

  // Achievements (abbreviated — full list is in seed.sql)
  const achievements = buildAchievements()
  await upsert('achievements', achievements, null) // no conflict key — just insert

  // Badge awards
  const studentBadges = buildStudentBadges(badges, students)
  await upsert('student_badges', studentBadges, null)

  // Challenges
  const deadline7  = new Date(Date.now() + 7  * 86400000).toISOString()
  const deadline21 = new Date(Date.now() + 21 * 86400000).toISOString()
  const challenges = [
    { title: 'Science Week Sprint',   description: 'Submit 3 science achievements!', deadline: deadline7,  target_count: 3, category: 'Science', is_class_wide: true, class_id: 'class-a', points_reward: 25, created_by: 'seed' },
    { title: 'Math Mastery Marathon', description: 'Complete 5 math achievements.',  deadline: deadline21, target_count: 5, category: 'Math',    is_class_wide: true, class_id: 'class-b', points_reward: 50, created_by: 'seed' },
  ]
  const { data: insertedChallenges } = await supabase.from('challenges').insert(challenges).select('id, title')

  // Challenge participation
  if (insertedChallenges) {
    const scienceChallenge = insertedChallenges.find(c => c.title === 'Science Week Sprint')
    const mathChallenge    = insertedChallenges.find(c => c.title === 'Math Mastery Marathon')
    const participations = []
    if (scienceChallenge) participations.push({ challenge_id: scienceChallenge.id, student_id: 'a1b2c3d4-0001-0001-0001-000000000001', contribution_count: 2, completed: false })
    if (mathChallenge)    participations.push({ challenge_id: mathChallenge.id,    student_id: 'a1b2c3d4-0005-0005-0005-000000000005', contribution_count: 3, completed: false })
    if (participations.length) await supabase.from('challenge_participation').insert(participations)
  }

  // Goals
  const deadline30 = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  const deadline45 = new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0]
  const deadline15 = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  await supabase.from('goals').insert([
    { student_id: 'a1b2c3d4-0001-0001-0001-000000000001', title: 'Reading Challenge', description: 'Complete 5 reading achievements', target_count: 5, category: 'Reading', deadline: deadline30, current_progress: 2 },
    { student_id: 'a1b2c3d4-0002-0002-0002-000000000002', title: 'Art Explorer',      description: 'Complete 3 art achievements',     target_count: 3, category: 'Art',     deadline: deadline45, current_progress: 1 },
    { student_id: 'a1b2c3d4-0006-0006-0006-000000000006', title: 'Science Star',      description: 'Complete 4 science achievements', target_count: 4, category: 'Science', deadline: deadline15, current_progress: 1 },
  ])

  // Cosmetics for Emma (500 pts — unlock all)
  const { data: allCosmetics } = await supabase.from('cosmetics').select('id, unlock_points, name')
  if (allCosmetics) {
    const emmaCosmetics = allCosmetics
      .filter(c => c.unlock_points <= 500)
      .map(c => ({ student_id: 'a1b2c3d4-0004-0004-0004-000000000004', cosmetic_id: c.id, equipped: c.name === 'Diamond', unlocked_at: new Date().toISOString() }))
    if (emmaCosmetics.length) await supabase.from('student_cosmetics').insert(emmaCosmetics)
  }

  // Print summary
  const { count: sc } = await supabase.from('students').select('*', { count: 'exact', head: true }).like('id', 'a1b2c3d4-%')
  const { count: ac } = await supabase.from('achievements').select('*', { count: 'exact', head: true }).like('student_id', 'a1b2c3d4-%')
  const { count: bc } = await supabase.from('student_badges').select('*', { count: 'exact', head: true }).like('student_id', 'a1b2c3d4-%')

  console.log(`\x1b[32m✓ Seeded ${sc} students, ${ac} achievements, ${bc} badges\x1b[0m`)
  console.log('Student IDs for demo routes:')
  for (const s of students) {
    console.log(`  /student/${s.id}  — ${s.name}`)
  }
}

async function clearSeedData() {
  await supabase.from('challenge_participation').delete().eq('created_by', 'seed').then(() => null).catch(() => null)
  const { data: seedChallenges } = await supabase.from('challenges').select('id').eq('created_by', 'seed')
  if (seedChallenges?.length) {
    await supabase.from('challenge_participation').delete().in('challenge_id', seedChallenges.map(c => c.id))
  }
  // Delete by student ID prefix
  const seedIds = Array.from({ length: 10 }, (_, i) => {
    const n = String(i + 1).padStart(1, '0')
    return `a1b2c3d4-000${n}-000${n}-000${n}-00000000000${n}`
  })
  await supabase.from('student_cosmetics').delete().in('student_id', seedIds)
  await supabase.from('student_badges').delete().in('student_id', seedIds)
  await supabase.from('goals').delete().in('student_id', seedIds)
  await supabase.from('achievements').delete().in('student_id', seedIds)
  await supabase.from('students').delete().in('id', seedIds)
  await supabase.from('challenges').delete().eq('created_by', 'seed')
  await supabase.from('classes').delete().in('id', ['class-a', 'class-b', 'class-c'])
  console.log('Cleared seed data.')
}

async function upsert(table, rows, conflictKey) {
  if (!rows.length) return
  const { error } = conflictKey
    ? await supabase.from(table).upsert(rows, { onConflict: conflictKey })
    : await supabase.from(table).insert(rows)
  if (error && !error.message.includes('duplicate')) {
    console.warn(`  Warning on ${table}:`, error.message)
  }
}

function buildAchievements() {
  const rows = []
  const push = (studentId, title, desc, pts, cat, daysAgo) => {
    rows.push({ student_id: studentId, title, description: desc, points_awarded: pts, category: cat, created_at: new Date(Date.now() - daysAgo * 86400000).toISOString() })
  }
  // Alex
  push('a1b2c3d4-0001-0001-0001-000000000001', 'Perfect Math Test',       'Scored 100% on chapter 7 test',              30, 'Math',    6)
  push('a1b2c3d4-0001-0001-0001-000000000001', 'Science Fair Winner',     '1st place in 5th grade science fair',         40, 'Science', 5)
  push('a1b2c3d4-0001-0001-0001-000000000001', 'Reading Champion',        'Finished 5 books in reading challenge',       30, 'Reading', 3)
  push('a1b2c3d4-0001-0001-0001-000000000001', 'Helping Hand',            'Assisted classmates during group project',    20, 'General', 2)
  push('a1b2c3d4-0001-0001-0001-000000000001', 'Spelling Bee Finalist',   'Reached the final round',                     30, 'Reading', 1)
  // Maya
  push('a1b2c3d4-0002-0002-0002-000000000002', 'Art Show Star',           'Painting selected for school art display',    25, 'Art',     4)
  push('a1b2c3d4-0002-0002-0002-000000000002', 'Math Whiz',               'Completed all extra credit math problems',    20, 'Math',    3)
  push('a1b2c3d4-0002-0002-0002-000000000002', 'Kind Friend Award',       "Nominated for kindness to new student",       20, 'General', 2)
  push('a1b2c3d4-0002-0002-0002-000000000002', "Book Report Excellence",  "Outstanding report on Charlotte's Web",       25, 'Reading', 1)
  // Carlos
  push('a1b2c3d4-0003-0003-0003-000000000003', 'Soccer MVP',              'Most Valuable Player at tournament',          25, 'Sports',  5)
  push('a1b2c3d4-0003-0003-0003-000000000003', 'History Project',         'Excellent diorama of ancient Egypt',          25, 'General', 3)
  push('a1b2c3d4-0003-0003-0003-000000000003', 'Perfect Attendance',      'Full month of perfect attendance',            20, 'General', 1)
  // Emma (30 — generated)
  const cats = ['Science','Math','Reading','Art','Sports','Music']
  for (let i = 1; i <= 30; i++) {
    const cat = cats[(i-1) % 6]
    const pts = (i-1) % 3 === 0 ? 20 : (i-1) % 3 === 1 ? 15 : 10
    push('a1b2c3d4-0004-0004-0004-000000000004', `${cat} Achievement #${i}`, `Seeded achievement ${i}`, pts, cat, 31 - i)
  }
  // Jordan
  push('a1b2c3d4-0005-0005-0005-000000000005', 'Debate Champion',         'Won the 4th grade class debate',              25, 'General', 7)
  push('a1b2c3d4-0005-0005-0005-000000000005', 'Math Olympiad',           'Top 3 in regional math olympiad',             30, 'Math',    6)
  push('a1b2c3d4-0005-0005-0005-000000000005', 'Science Experiment',      'Best hypothesis in science class',            20, 'Science', 5)
  push('a1b2c3d4-0005-0005-0005-000000000005', 'Book Club Leader',        'Led the monthly book club discussion',        25, 'Reading', 4)
  push('a1b2c3d4-0005-0005-0005-000000000005', 'Choir Solo',              'Performed a solo in spring choir concert',    20, 'Music',   3)
  push('a1b2c3d4-0005-0005-0005-000000000005', 'Art Portfolio',           'Selected for district art show',              20, 'Art',     2)
  push('a1b2c3d4-0005-0005-0005-000000000005', 'Fitness Challenge',       'Completed 30-day fitness challenge',          20, 'Sports',  2)
  push('a1b2c3d4-0005-0005-0005-000000000005', 'Peer Tutor',              'Helped classmates with math',                 20, 'Math',    1)
  // Sofia
  push('a1b2c3d4-0006-0006-0006-000000000006', 'Drama Club Star',         'Lead role in school play',                    25, 'Art',     6)
  push('a1b2c3d4-0006-0006-0006-000000000006', 'Poetry Contest',          '1st place in school poetry competition',      25, 'Reading', 5)
  push('a1b2c3d4-0006-0006-0006-000000000006', 'Science Project',         'Volcano model won class competition',         20, 'Science', 4)
  push('a1b2c3d4-0006-0006-0006-000000000006', 'Gymnastics Award',        'Gold medal in school gymnastics meet',        20, 'Sports',  3)
  push('a1b2c3d4-0006-0006-0006-000000000006', 'Music Recital',           'Performed Beethoven at spring recital',       15, 'Music',   2)
  push('a1b2c3d4-0006-0006-0006-000000000006', 'Math Quiz Bowl',          'Perfect score in Math Quiz Bowl',             15, 'Math',    1)
  // Liam
  push('a1b2c3d4-0007-0007-0007-000000000007', 'Reading Rainbow',         'Read 10 books in a month',                    20, 'Reading', 5)
  push('a1b2c3d4-0007-0007-0007-000000000007', 'Math Flash Cards',        'Perfect on all 100 multiplication cards',     20, 'Math',    4)
  push('a1b2c3d4-0007-0007-0007-000000000007', 'Science Quiz Ace',        'Highest score in science chapter quiz',       15, 'Science', 3)
  push('a1b2c3d4-0007-0007-0007-000000000007', 'Kindness Award',          'Recognized for exceptional kindness',         15, 'General', 2)
  push('a1b2c3d4-0007-0007-0007-000000000007', 'Swim Team Victory',       'Team won the inter-school swim meet',         15, 'Sports',  1)
  // Zoe
  push('a1b2c3d4-0008-0008-0008-000000000008', 'Robotics Club',           'Built a working robot in robotics club',      25, 'Science', 9)
  push('a1b2c3d4-0008-0008-0008-000000000008', 'Coding Project',          'Created a simple game in Scratch',            25, 'Science', 8)
  push('a1b2c3d4-0008-0008-0008-000000000008', 'Math Competition',        '2nd place in city math competition',          25, 'Math',    7)
  push('a1b2c3d4-0008-0008-0008-000000000008', 'Novel Study',             "Best analysis essay on Charlotte's Web",      20, 'Reading', 6)
  push('a1b2c3d4-0008-0008-0008-000000000008', 'Painting Award',          'Painting exhibited in city art gallery',      20, 'Art',     5)
  push('a1b2c3d4-0008-0008-0008-000000000008', 'Track and Field',         'School record in 100m dash',                  25, 'Sports',  4)
  push('a1b2c3d4-0008-0008-0008-000000000008', 'Piano Recital',           'Flawless performance at spring recital',      20, 'Music',   3)
  push('a1b2c3d4-0008-0008-0008-000000000008', 'Creative Writing',        'Story in school literary magazine',           20, 'Reading', 2)
  push('a1b2c3d4-0008-0008-0008-000000000008', 'Biology Lab',             'Most accurate biology lab report',            20, 'Science', 2)
  push('a1b2c3d4-0008-0008-0008-000000000008', 'Student Council',         'Elected student council representative',      20, 'General', 1)
  // Noah
  push('a1b2c3d4-0009-0009-0009-000000000009', 'Geography Bee',           'Regional geography bee champion',             25, 'General', 5)
  push('a1b2c3d4-0009-0009-0009-000000000009', 'History Essay',           'Best essay on the American Revolution',       20, 'General', 4)
  push('a1b2c3d4-0009-0009-0009-000000000009', 'Science Olympiad',        'Bronze medal at science olympiad',            20, 'Science', 3)
  push('a1b2c3d4-0009-0009-0009-000000000009', 'Reading Marathon',        'Read for 100 consecutive hours',              15, 'Reading', 2)
  push('a1b2c3d4-0009-0009-0009-000000000009', 'Basketball Star',         'MVP of the school basketball team',           15, 'Sports',  1)
  // Aiden
  push('a1b2c3d4-0010-0010-0010-000000000010', 'Drawing Contest',         'Won 2nd place in school drawing contest',     25, 'Art',     3)
  push('a1b2c3d4-0010-0010-0010-000000000010', 'Multiplication Mastery',  'Memorised all times tables up to 12',         20, 'Math',    2)
  push('a1b2c3d4-0010-0010-0010-000000000010', 'Soccer Goal Record',      'Scored 5 goals in one game',                  15, 'Sports',  1)
  return rows
}

function buildStudentBadges(badges, students) {
  const rows = []
  const tiers = [
    ['a1b2c3d4-0001-0001-0001-000000000001', 150, 'silver', 5],
    ['a1b2c3d4-0002-0002-0002-000000000002', 90,  'bronze', 4],
    ['a1b2c3d4-0003-0003-0003-000000000003', 70,  'bronze', 3],
    ['a1b2c3d4-0004-0004-0004-000000000004', 500, 'gold',   30],
    ['a1b2c3d4-0005-0005-0005-000000000005', 180, 'silver', 8],
    ['a1b2c3d4-0006-0006-0006-000000000006', 120, 'silver', 6],
    ['a1b2c3d4-0007-0007-0007-000000000007', 85,  'bronze', 5],
    ['a1b2c3d4-0008-0008-0008-000000000008', 220, 'silver', 10],
    ['a1b2c3d4-0009-0009-0009-000000000009', 95,  'bronze', 5],
    ['a1b2c3d4-0010-0010-0010-000000000010', 60,  'bronze', 3],
  ]
  for (const [studentId, pts, tier, progress] of tiers) {
    for (const badge of badges.filter(b => b.points_required <= pts)) {
      rows.push({ student_id: studentId, badge_id: badge.id, tier, progress })
    }
  }
  return rows
}

run().catch(err => {
  console.error('\x1b[31mSeed failed:\x1b[0m', err.message)
  process.exit(1)
})
