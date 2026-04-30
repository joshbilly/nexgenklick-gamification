import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LeaderboardClient } from './LeaderboardClient'

export default async function LeaderboardPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('id, name, grade, avatar_emoji, total_points, streak_count, class_id')
    .order('total_points', { ascending: false })
    .limit(50)

  // Fetch classes table for teacher names (DEMO-09)
  const { data: classes } = await supabase
    .from('classes')
    .select('id, class_name, teacher_name')

  const classLookup = new Map((classes || []).map((c) => [c.id, c]))

  const allStudents = students || []

  // Weekly points — sum achievements.points_awarded grouped by class for the current ISO week (DEMO-09)
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()) // Sunday
  weekStart.setHours(0, 0, 0, 0)

  const { data: weeklyAchievements } = await supabase
    .from('achievements')
    .select('student_id, points_awarded')
    .gte('created_at', weekStart.toISOString())

  // Map student → class_id
  const studentClassMap = new Map(allStudents.map((s) => [s.id, s.class_id]))

  // Aggregate weekly points per class
  const weeklyClassPoints = new Map<string, number>()
  for (const row of weeklyAchievements || []) {
    const classId = studentClassMap.get(row.student_id)
    if (!classId) continue
    weeklyClassPoints.set(classId, (weeklyClassPoints.get(classId) || 0) + row.points_awarded)
  }

  // Build class rankings with teacher names and weekly points
  const classMap = new Map<string, {
    totalPoints: number
    weeklyPoints: number
    studentCount: number
    topEmoji: string
    teacherName: string
    className: string
  }>()

  for (const s of allStudents) {
    const cls = s.class_id || 'Unclassified'
    const classInfo = classLookup.get(cls)
    const existing = classMap.get(cls)
    if (existing) {
      existing.totalPoints += s.total_points
      existing.studentCount += 1
    } else {
      classMap.set(cls, {
        totalPoints: s.total_points,
        weeklyPoints: weeklyClassPoints.get(cls) || 0,
        studentCount: 1,
        topEmoji: s.avatar_emoji || '🎓',
        teacherName: classInfo?.teacher_name ?? 'Unknown Teacher',
        className: classInfo?.class_name ?? cls,
      })
    }
  }

  // Update weekly points after building the map
  for (const [classId, data] of classMap) {
    data.weeklyPoints = weeklyClassPoints.get(classId) || 0
  }

  const classRankings = Array.from(classMap.entries())
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#FFF1F2' }}>
      <div className="absolute top-[-80px] right-[-60px] w-80 h-80 bg-rose-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 left-[-40px] w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

      <nav
        className="relative z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: 'white', borderBottom: '1px solid #FECDD3', boxShadow: '0 2px 12px rgba(225,29,72,0.08)' }}
      >
        <Link
          href="/"
          className="font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-full px-3 py-1 transition-colors hover:bg-rose-50"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
        >
          ← Home
        </Link>
        <span className="text-sm font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#FB7185' }}>
          🏆 Leaderboard
        </span>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
            🏆 Leaderboard
          </h1>
          <p className="mt-2" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
            Who&apos;s leading the charge? Let&apos;s find out!
          </p>
        </div>

        <LeaderboardClient students={allStudents} classRankings={classRankings} />
      </div>
    </div>
  )
}
