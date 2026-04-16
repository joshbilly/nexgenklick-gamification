import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://qgnwpndjjyyaewwlqfac.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnbndwbmRqanl5YWV3d2xxZmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyNDkxMjQsImV4cCI6MjA5MDgyNTEyNH0.0DIUzKl2UD5iT3hZBGTqjtKVSStTxkGiyIgk-NNcohA'

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function seed() {
  console.log('🌱 Seeding NexGenKlick demo data...\n')

  // ── CLEAR EXISTING DATA (keep badges/cosmetics) ──
  console.log('🧹 Clearing existing student data...')
  await supabase.from('challenge_participation').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('student_cosmetics').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('student_badges').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('goals').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('achievements').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('students').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('challenges').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  // ── BADGES ──
  console.log('🏅 Seeding badges...')
  await supabase.from('badges').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  const { data: badges, error: badgeError } = await supabase.from('badges').insert([
    { name: 'Starter',      icon_emoji: '🌱', description: 'Upload your first achievement',       points_required: 10,  bronze_threshold: 1,  silver_threshold: 5,  gold_threshold: 15 },
    { name: 'Rising Star',  icon_emoji: '⭐', description: 'Earned 50 points',                   points_required: 50,  bronze_threshold: 1,  silver_threshold: 5,  gold_threshold: 15 },
    { name: 'Achiever',     icon_emoji: '🏆', description: 'Earned 100 points',                  points_required: 100, bronze_threshold: 1,  silver_threshold: 5,  gold_threshold: 15 },
    { name: 'Champion',     icon_emoji: '🥇', description: 'Earned 250 points',                  points_required: 250, bronze_threshold: 1,  silver_threshold: 5,  gold_threshold: 15 },
    { name: 'Legend',       icon_emoji: '🌟', description: 'Earned 500 points',                  points_required: 500, bronze_threshold: 1,  silver_threshold: 5,  gold_threshold: 15 },
    { name: 'Math Whiz',    icon_emoji: '📐', description: 'Crush it in Math achievements',      points_required: 30,  bronze_threshold: 1,  silver_threshold: 3,  gold_threshold: 8  },
    { name: 'Bookworm',     icon_emoji: '📚', description: 'Reading achievements mastery',        points_required: 30,  bronze_threshold: 1,  silver_threshold: 3,  gold_threshold: 8  },
    { name: 'Science Geek', icon_emoji: '🔬', description: 'Science achievements mastery',       points_required: 30,  bronze_threshold: 1,  silver_threshold: 3,  gold_threshold: 8  },
    { name: 'Artist',       icon_emoji: '🎨', description: 'Art achievements mastery',           points_required: 30,  bronze_threshold: 1,  silver_threshold: 3,  gold_threshold: 8  },
    { name: 'Team Player',  icon_emoji: '🤝', description: 'Recognized for helping others',      points_required: 20,  bronze_threshold: 1,  silver_threshold: 3,  gold_threshold: 8  },
  ]).select()
  if (badgeError) { console.error('Badge error:', badgeError); process.exit(1) }
  console.log(`  ✓ ${badges.length} badges created`)

  const badgeMap = Object.fromEntries(badges.map(b => [b.name, b.id]))

  // ── COSMETICS ──
  console.log('🎨 Seeding cosmetics...')
  await supabase.from('cosmetics').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('cosmetics').insert([
    { name: 'Rose Border',       type: 'border',     emoji_or_css: 'border-rose-500 border-4',                              unlock_points: 50,  preview_color: '#F43F5E' },
    { name: 'Gold Border',       type: 'border',     emoji_or_css: 'border-yellow-400 border-4',                            unlock_points: 200, preview_color: '#FACC15' },
    { name: 'Purple Glow',       type: 'border',     emoji_or_css: 'border-purple-500 border-4 shadow-lg shadow-purple-300',unlock_points: 100, preview_color: '#A855F7' },
    { name: 'Sunset Bg',         type: 'background', emoji_or_css: 'bg-gradient-to-br from-orange-100 to-pink-100',         unlock_points: 75,  preview_color: '#FED7AA' },
    { name: 'Sky Bg',            type: 'background', emoji_or_css: 'bg-gradient-to-br from-blue-100 to-cyan-100',           unlock_points: 75,  preview_color: '#BAE6FD' },
    { name: 'Galaxy Bg',         type: 'background', emoji_or_css: 'bg-gradient-to-br from-purple-200 to-indigo-200',       unlock_points: 150, preview_color: '#DDD6FE' },
    { name: 'Star Crown',        type: 'accessory',  emoji_or_css: '👑',                                                    unlock_points: 250, preview_color: '#FCD34D' },
    { name: 'Fire Aura',         type: 'accessory',  emoji_or_css: '🔥',                                                    unlock_points: 100, preview_color: '#FB923C' },
    { name: 'Diamond',           type: 'accessory',  emoji_or_css: '💎',                                                    unlock_points: 500, preview_color: '#67E8F9' },
  ])
  console.log('  ✓ cosmetics created')

  // ── STUDENTS ──
  console.log('👨‍🎓 Seeding students...')
  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  const { data: students, error: studentError } = await supabase.from('students').insert([
    { name: 'Alex Johnson',   grade: 'Grade 5', avatar_emoji: '🦁', total_points: 320, streak_count: 14, last_active_date: today,      streak_shields: 2, parent_email: 'parent.alex@example.com',    class_id: 'Class A' },
    { name: 'Maya Patel',     grade: 'Grade 5', avatar_emoji: '🦋', total_points: 185, streak_count: 7,  last_active_date: today,      streak_shields: 1, parent_email: 'parent.maya@example.com',    class_id: 'Class A' },
    { name: 'Carlos Rivera',  grade: 'Grade 4', avatar_emoji: '🚀', total_points: 95,  streak_count: 3,  last_active_date: today,      streak_shields: 0, parent_email: 'parent.carlos@example.com',  class_id: 'Class A' },
    { name: 'Sofia Kim',      grade: 'Grade 4', avatar_emoji: '🌸', total_points: 260, streak_count: 10, last_active_date: yesterday,  streak_shields: 1, parent_email: 'parent.sofia@example.com',   class_id: 'Class B' },
    { name: 'Jaylen Brooks',  grade: 'Grade 3', avatar_emoji: '⚡', total_points: 55,  streak_count: 0,  last_active_date: null,       streak_shields: 0, parent_email: 'parent.jaylen@example.com',  class_id: 'Class B' },
    { name: 'Emma Chen',      grade: 'Grade 3', avatar_emoji: '🎵', total_points: 130, streak_count: 5,  last_active_date: today,      streak_shields: 0, parent_email: 'parent.emma@example.com',    class_id: 'Class B' },
  ]).select()
  if (studentError) { console.error('Student error:', studentError); process.exit(1) }
  console.log(`  ✓ ${students.length} students created`)

  const s = Object.fromEntries(students.map(st => [st.name, st.id]))

  // ── ACHIEVEMENTS ──
  console.log('🏆 Seeding achievements...')
  const twoWeeksAgo = new Date(Date.now() - 14 * 86400000).toISOString()
  const oneWeekAgo  = new Date(Date.now() - 7 * 86400000).toISOString()
  const threeDaysAgo= new Date(Date.now() - 3 * 86400000).toISOString()

  await supabase.from('achievements').insert([
    // Alex (320 pts) - star student
    { student_id: s['Alex Johnson'], title: 'Science Fair 1st Place',   description: 'Won first place with a solar system model',           points_awarded: 40, category: 'Science', created_at: twoWeeksAgo },
    { student_id: s['Alex Johnson'], title: 'Perfect Math Test',        description: 'Scored 100% on chapter 9 fractions test',             points_awarded: 30, category: 'Math',    created_at: twoWeeksAgo },
    { student_id: s['Alex Johnson'], title: 'Reading Champion',         description: 'Finished 8 books in the monthly reading challenge',    points_awarded: 25, category: 'Reading', created_at: oneWeekAgo  },
    { student_id: s['Alex Johnson'], title: 'Spelling Bee Finalist',    description: 'Top 3 in the school-wide spelling bee',               points_awarded: 20, category: 'General', created_at: oneWeekAgo  },
    { student_id: s['Alex Johnson'], title: 'Team Leader Award',        description: 'Led the class project with outstanding organization',  points_awarded: 20, category: 'General', created_at: threeDaysAgo},
    { student_id: s['Alex Johnson'], title: 'Art Portfolio Showcase',   description: 'Selected for district art showcase',                  points_awarded: 25, category: 'Art',     created_at: threeDaysAgo},
    { student_id: s['Alex Johnson'], title: 'Math Olympiad Bronze',     description: 'Earned bronze at the district math olympiad',         points_awarded: 30, category: 'Math',    created_at: today       },
    { student_id: s['Alex Johnson'], title: 'Community Helper',         description: 'Organized classroom book drive',                      points_awarded: 15, category: 'General', created_at: today       },
    { student_id: s['Alex Johnson'], title: 'Science Lab Excellence',   description: 'Best lab report in the class this semester',         points_awarded: 25, category: 'Science', created_at: today       },
    { student_id: s['Alex Johnson'], title: 'Extra Credit Master',      description: 'Completed every extra credit assignment this month',  points_awarded: 30, category: 'Math',    created_at: today       },

    // Maya (185 pts)
    { student_id: s['Maya Patel'], title: 'Art Show Star',          description: 'Painting chosen for school hallway display',           points_awarded: 30, category: 'Art',     created_at: twoWeeksAgo },
    { student_id: s['Maya Patel'], title: 'Book Report Excellence', description: 'Outstanding report on Wonder by R.J. Palacio',        points_awarded: 20, category: 'Reading', created_at: twoWeeksAgo },
    { student_id: s['Maya Patel'], title: 'Kind Friend Award',      description: 'Nominated by teacher for welcoming a new student',    points_awarded: 15, category: 'General', created_at: oneWeekAgo  },
    { student_id: s['Maya Patel'], title: 'Science Experiment Win', description: 'Best hypothesis write-up in class',                   points_awarded: 25, category: 'Science', created_at: oneWeekAgo  },
    { student_id: s['Maya Patel'], title: 'Math Streak',            description: '10 days in a row of math practice',                  points_awarded: 20, category: 'Math',    created_at: threeDaysAgo},
    { student_id: s['Maya Patel'], title: 'Creative Writing Award', description: 'Story selected for school newspaper',                 points_awarded: 25, category: 'Reading', created_at: today       },
    { student_id: s['Maya Patel'], title: 'Music Performance',      description: 'Solo performance at the spring concert',              points_awarded: 30, category: 'General', created_at: today       },

    // Carlos (95 pts)
    { student_id: s['Carlos Rivera'], title: 'Soccer MVP',          description: 'Most Valuable Player at school tournament',           points_awarded: 20, category: 'Sports',  created_at: twoWeeksAgo },
    { student_id: s['Carlos Rivera'], title: 'History Diorama',     description: 'Excellent diorama of ancient Egypt pyramids',        points_awarded: 25, category: 'General', created_at: oneWeekAgo  },
    { student_id: s['Carlos Rivera'], title: 'Perfect Attendance',  description: 'Full month of perfect attendance',                   points_awarded: 15, category: 'General', created_at: threeDaysAgo},
    { student_id: s['Carlos Rivera'], title: 'Math Improvement',    description: 'Improved math score by 2 letter grades',            points_awarded: 20, category: 'Math',    created_at: today       },
    { student_id: s['Carlos Rivera'], title: 'Science Partner',     description: 'Great collaboration on lab project',                 points_awarded: 15, category: 'Science', created_at: today       },

    // Sofia (260 pts)
    { student_id: s['Sofia Kim'], title: 'Coding Club President',  description: 'Elected president of the school coding club',        points_awarded: 35, category: 'Science', created_at: twoWeeksAgo },
    { student_id: s['Sofia Kim'], title: 'Math State Qualifier',   description: 'Qualified for state math competition',               points_awarded: 40, category: 'Math',    created_at: twoWeeksAgo },
    { student_id: s['Sofia Kim'], title: 'Reading Marathon',       description: 'Read 1,000 pages in one month',                     points_awarded: 30, category: 'Reading', created_at: oneWeekAgo  },
    { student_id: s['Sofia Kim'], title: 'Science Fair 2nd Place', description: 'Silver medal at school science fair',               points_awarded: 30, category: 'Science', created_at: oneWeekAgo  },
    { student_id: s['Sofia Kim'], title: 'Peer Tutor Award',       description: 'Helped 3 classmates improve their grades',          points_awarded: 20, category: 'General', created_at: threeDaysAgo},
    { student_id: s['Sofia Kim'], title: 'Art Competition Win',    description: 'First place in district poster competition',        points_awarded: 35, category: 'Art',     created_at: today       },
    { student_id: s['Sofia Kim'], title: 'Music Theory Excellence',description: 'Highest score on music theory quiz',                points_awarded: 25, category: 'General', created_at: today       },
    { student_id: s['Sofia Kim'], title: 'Volunteer of the Month', description: 'Library volunteer for 20+ hours',                   points_awarded: 25, category: 'General', created_at: today       },

    // Jaylen (55 pts - at-risk student for demo)
    { student_id: s['Jaylen Brooks'], title: 'Welcome Badge',       description: 'First day at NexGenKlick!',                         points_awarded: 10, category: 'General', created_at: twoWeeksAgo },
    { student_id: s['Jaylen Brooks'], title: 'Sports Day Champ',    description: 'Won the 100m sprint on sports day',                 points_awarded: 25, category: 'Sports',  created_at: oneWeekAgo  },
    { student_id: s['Jaylen Brooks'], title: 'Art Class Star',      description: 'Teacher recognized creative drawing skills',        points_awarded: 20, category: 'Art',     created_at: oneWeekAgo  },

    // Emma (130 pts)
    { student_id: s['Emma Chen'], title: 'Music Recital Solo',     description: 'Performed a solo piece at winter recital',           points_awarded: 30, category: 'General', created_at: twoWeeksAgo },
    { student_id: s['Emma Chen'], title: 'Reading Club Star',      description: 'Led the reading club discussion this week',          points_awarded: 20, category: 'Reading', created_at: oneWeekAgo  },
    { student_id: s['Emma Chen'], title: 'Science Quiz Top Score', description: 'Highest score on the ecosystems quiz',              points_awarded: 25, category: 'Science', created_at: threeDaysAgo},
    { student_id: s['Emma Chen'], title: 'Math Improvement Award', description: 'Most improved math student this semester',          points_awarded: 25, category: 'Math',    created_at: today       },
    { student_id: s['Emma Chen'], title: 'Creative Story Award',   description: 'Story published in school literary magazine',       points_awarded: 30, category: 'Reading', created_at: today       },
  ])
  console.log('  ✓ achievements created')

  // ── STUDENT BADGES ──
  console.log('🎖️  Seeding earned badges...')
  const allBadges = badges

  for (const student of students) {
    const earnedBadges = allBadges.filter(b => b.points_required <= student.total_points)
    for (const badge of earnedBadges) {
      const tier = student.total_points >= 300 ? 'gold' : student.total_points >= 150 ? 'silver' : 'bronze'
      await supabase.from('student_badges').insert({
        student_id: student.id,
        badge_id: badge.id,
        tier,
        progress: Math.floor(student.total_points / 10),
      })
    }
  }
  console.log('  ✓ badges awarded')

  // ── CHALLENGES ──
  console.log('🎯 Seeding challenges...')
  const in5days  = new Date(Date.now() + 5 * 86400000).toISOString()
  const in10days = new Date(Date.now() + 10 * 86400000).toISOString()
  const in3days  = new Date(Date.now() + 3 * 86400000).toISOString()

  const { data: challenges } = await supabase.from('challenges').insert([
    { title: 'Science Week Sprint',    description: 'Submit 3 science achievements before Friday! Class A is on fire 🔬',  deadline: in5days,  target_count: 3, category: 'Science', is_class_wide: true,  class_id: 'Class A', created_by: 'admin' },
    { title: 'Reading Marathon',       description: 'Finish 5 reading achievements this month — track your books!',        deadline: in10days, target_count: 5, category: 'Reading', is_class_wide: false, class_id: null,      created_by: 'admin' },
    { title: 'Math Mastery Week',      description: 'Complete 4 math achievements and earn the Math Whiz badge upgrade',   deadline: in3days,  target_count: 4, category: 'Math',    is_class_wide: true,  class_id: 'Class B', created_by: 'admin' },
    { title: 'Kindness Challenge',     description: 'Do something kind for a classmate and share it — 2 acts of kindness', deadline: in10days, target_count: 2, category: 'General', is_class_wide: true,  class_id: null,      created_by: 'admin' },
  ]).select()
  console.log(`  ✓ ${challenges.length} challenges created`)

  // ── CHALLENGE PARTICIPATION ──
  console.log('📊 Seeding challenge participation...')
  const sciChallenge = challenges.find(c => c.title === 'Science Week Sprint')
  const readChallenge = challenges.find(c => c.title === 'Reading Marathon')
  const mathChallenge = challenges.find(c => c.title === 'Math Mastery Week')

  await supabase.from('challenge_participation').insert([
    { challenge_id: sciChallenge.id,  student_id: s['Alex Johnson'],  contribution_count: 2, completed: false },
    { challenge_id: sciChallenge.id,  student_id: s['Maya Patel'],    contribution_count: 1, completed: false },
    { challenge_id: sciChallenge.id,  student_id: s['Carlos Rivera'], contribution_count: 1, completed: false },
    { challenge_id: readChallenge.id, student_id: s['Alex Johnson'],  contribution_count: 3, completed: false },
    { challenge_id: readChallenge.id, student_id: s['Maya Patel'],    contribution_count: 2, completed: false },
    { challenge_id: readChallenge.id, student_id: s['Emma Chen'],     contribution_count: 2, completed: false },
    { challenge_id: mathChallenge.id, student_id: s['Sofia Kim'],     contribution_count: 4, completed: true  },
    { challenge_id: mathChallenge.id, student_id: s['Emma Chen'],     contribution_count: 2, completed: false },
  ])
  console.log('  ✓ challenge participation seeded')

  // ── GOALS ──
  console.log('🎯 Seeding student goals...')
  const in30days = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  const in14days = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]

  await supabase.from('goals').insert([
    { student_id: s['Alex Johnson'],  title: 'Reach Champion Badge',    description: 'Hit 250 points to unlock the Champion badge!', target_count: 10, category: 'General', deadline: in30days, current_progress: 10, completed: false },
    { student_id: s['Alex Johnson'],  title: 'Science Mastery',         description: 'Complete 5 science achievements this month',   target_count: 5,  category: 'Science', deadline: in14days, current_progress: 3,  completed: false },
    { student_id: s['Maya Patel'],    title: 'Reading Goal',            description: 'Read 5 books and log them as achievements',    target_count: 5,  category: 'Reading', deadline: in30days, current_progress: 2,  completed: false },
    { student_id: s['Maya Patel'],    title: 'Art Portfolio',           description: 'Submit 3 art pieces this semester',            target_count: 3,  category: 'Art',     deadline: in30days, current_progress: 1,  completed: false },
    { student_id: s['Carlos Rivera'], title: 'Math Catch-Up',           description: 'Submit 4 math achievements this month',        target_count: 4,  category: 'Math',    deadline: in14days, current_progress: 1,  completed: false },
    { student_id: s['Sofia Kim'],     title: 'Reach Legend Badge',      description: 'Earn 500 points and become a Legend!',         target_count: 15, category: 'General', deadline: in30days, current_progress: 8,  completed: false },
    { student_id: s['Emma Chen'],     title: 'Music Achievement Pack',  description: 'Log 3 music-related achievements',             target_count: 3,  category: 'General', deadline: in14days, current_progress: 1,  completed: false },
  ])
  console.log('  ✓ goals seeded')

  console.log('\n✅ Demo seed complete! Your site is ready to show off.\n')
  console.log('Students seeded:')
  students.forEach(s => console.log(`  ${s.avatar_emoji} ${s.name} — ${s.total_points} pts (${s.grade}, ${s.class_id})`))
}

seed().catch(console.error)
