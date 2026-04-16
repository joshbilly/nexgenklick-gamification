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

  const allStudents = students || []

  // Build class leaderboard
  const classMap = new Map<string, { totalPoints: number; studentCount: number; topEmoji: string }>()
  for (const s of allStudents) {
    const cls = s.class_id || 'Unclassified'
    const existing = classMap.get(cls)
    if (existing) {
      existing.totalPoints += s.total_points
      existing.studentCount += 1
    } else {
      classMap.set(cls, {
        totalPoints: s.total_points,
        studentCount: 1,
        topEmoji: s.avatar_emoji || '🎓',
      })
    }
  }

  const classRankings = Array.from(classMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.totalPoints - a.totalPoints)

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#FFF1F2' }}>
      {/* Blobs */}
      <div className="absolute top-[-80px] right-[-60px] w-80 h-80 bg-rose-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 left-[-40px] w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

      {/* Nav */}
      <nav
        className="relative z-10 px-6 py-4 flex items-center justify-between"
        style={{
          background: 'white',
          borderBottom: '1px solid #FECDD3',
          boxShadow: '0 2px 12px rgba(225,29,72,0.08)',
        }}
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
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
          >
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
