import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function TeacherPage() {
  const supabase = await createClient()

  const { data: students } = await supabase
    .from('students')
    .select('id, name, grade, avatar_emoji, total_points, streak_count, last_active_date, class_id')
    .order('total_points', { ascending: false })

  const { data: badgeCounts } = await supabase
    .from('student_badges')
    .select('student_id')

  const { data: achievementCounts } = await supabase
    .from('achievements')
    .select('student_id')

  const badgeMap: Record<string, number> = {}
  for (const row of badgeCounts || []) {
    badgeMap[row.student_id] = (badgeMap[row.student_id] || 0) + 1
  }

  const achievementMap: Record<string, number> = {}
  for (const row of achievementCounts || []) {
    achievementMap[row.student_id] = (achievementMap[row.student_id] || 0) + 1
  }

  const now = Date.now()
  const allStudents = (students || []).map((s) => {
    const daysSinceActive = s.last_active_date
      ? Math.floor((now - new Date(s.last_active_date).getTime()) / (1000 * 60 * 60 * 24))
      : null
    return {
      ...s,
      badgeCount: badgeMap[s.id] || 0,
      achievementCount: achievementMap[s.id] || 0,
      daysSinceActive,
    }
  })

  const atRiskStudents = allStudents.filter(
    (s) => s.total_points < 20 && (s.streak_count || 0) === 0
  )

  const noStreakStudents = allStudents.filter((s) => (s.streak_count || 0) === 0)
  const inactiveStudents = allStudents.filter((s) => s.daysSinceActive !== null && s.daysSinceActive >= 7)

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#FFF1F2' }}>
      {/* Blobs */}
      <div className="absolute top-[-80px] right-[-60px] w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 left-[-40px] w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

      {/* Nav */}
      <nav
        className="relative z-10 px-6 py-4 flex items-center justify-between"
        style={{ background: 'white', borderBottom: '1px solid #FECDD3', boxShadow: '0 2px 12px rgba(225,29,72,0.08)' }}
      >
        <Link
          href="/"
          className="font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-full px-3 py-1 transition-colors hover:bg-rose-50"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
        >
          ← Home
        </Link>
        <span className="text-sm font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#7c3aed' }}>
          👩‍🏫 Teacher Dashboard
        </span>
        <Link
          href="/admin"
          className="btn-rose px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          + Assign Challenge
        </Link>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold flex items-center gap-3" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
            👩‍🏫 Teacher Dashboard
          </h1>
          <p className="mt-2" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
            Class overview — {allStudents.length} student{allStudents.length !== 1 ? 's' : ''} enrolled
          </p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { emoji: '👥', label: 'Total Students', value: allStudents.length },
            { emoji: '⚠️', label: 'At Risk', value: atRiskStudents.length },
            { emoji: '🔴', label: 'No Streak', value: noStreakStudents.length },
            { emoji: '😴', label: 'Inactive 7d+', value: inactiveStudents.length },
          ].map(({ emoji, label, value }) => (
            <div
              key={label}
              className="clay-card p-5 flex flex-col items-center text-center"
            >
              <div className="text-3xl mb-2 select-none">{emoji}</div>
              <div
                className="text-3xl font-bold"
                style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
              >
                {value}
              </div>
              <div className="text-xs mt-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Class Overview */}
          <div className="lg:col-span-2 clay-card p-6">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
              📋 Class Overview
            </h2>
            {allStudents.length === 0 ? (
              <div className="text-center py-10">
                <div className="text-5xl mb-3 select-none">👩‍🎓</div>
                <p className="font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}>
                  No students yet.
                </p>
                <Link href="/admin" className="mt-4 btn-rose px-6 py-2 text-sm inline-flex focus:outline-none">
                  Add Students
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {allStudents.map((student) => {
                  const noStreak = (student.streak_count || 0) === 0
                  const inactive = student.daysSinceActive !== null && student.daysSinceActive >= 7
                  const atRisk = student.total_points < 20 && noStreak

                  let alertBg = 'transparent'
                  let alertBorder = '#FECDD3'
                  if (atRisk) {
                    alertBg = '#fff1f2'
                    alertBorder = '#fda4af'
                  } else if (inactive) {
                    alertBg = '#fefce8'
                    alertBorder = '#fde047'
                  }

                  return (
                    <Link
                      key={student.id}
                      href={`/student/${student.id}`}
                      className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-rose-400"
                      style={{ background: alertBg, border: `1.5px solid ${alertBorder}` }}
                    >
                      <div className="text-2xl select-none">{student.avatar_emoji}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-sm" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
                          {student.name}
                        </p>
                        <p className="text-xs" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
                          {student.grade}{student.class_id ? ` · ${student.class_id}` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: 'linear-gradient(135deg, #fb7185, #e11d48)', color: 'white', fontFamily: '"Baloo 2", sans-serif' }}
                        >
                          {student.total_points} pts
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${noStreak ? 'text-red-600' : 'text-green-700'}`}
                          style={{ background: noStreak ? '#fee2e2' : '#dcfce7', fontFamily: '"Baloo 2", sans-serif' }}
                        >
                          🔥 {student.streak_count || 0}d
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{ background: '#f3e8ff', color: '#7c3aed', fontFamily: '"Baloo 2", sans-serif' }}
                        >
                          🏅 {student.badgeCount}
                        </span>
                        {atRisk && (
                          <span className="text-xs font-bold" style={{ color: '#dc2626' }} title="At risk">⚠️</span>
                        )}
                        {inactive && !atRisk && (
                          <span className="text-xs font-bold" style={{ color: '#ca8a04' }} title={`${student.daysSinceActive}d inactive`}>😴</span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          {/* Alert sidebar */}
          <div className="space-y-6">
            {/* At Risk */}
            <div className="clay-card p-5" style={{ borderColor: '#fda4af' }}>
              <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#dc2626' }}>
                ⚠️ At Risk
              </h3>
              {atRiskStudents.length === 0 ? (
                <p className="text-sm text-center py-3" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
                  🎉 No at-risk students!
                </p>
              ) : (
                <div className="space-y-2">
                  {atRiskStudents.map((s) => (
                    <Link
                      key={s.id}
                      href={`/student/${s.id}`}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-red-50 transition-colors focus:outline-none"
                    >
                      <span className="text-xl select-none">{s.avatar_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>{s.name}</p>
                        <p className="text-xs" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>{s.total_points} pts · no streak</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              <p className="mt-3 text-xs" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
                Students with &lt;20 pts and no active streak.
              </p>
            </div>

            {/* Inactive */}
            <div className="clay-card p-5" style={{ borderColor: '#fde047' }}>
              <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#ca8a04' }}>
                😴 Inactive 7+ Days
              </h3>
              {inactiveStudents.length === 0 ? (
                <p className="text-sm text-center py-3" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
                  🌟 Everyone is active!
                </p>
              ) : (
                <div className="space-y-2">
                  {inactiveStudents.map((s) => (
                    <Link
                      key={s.id}
                      href={`/student/${s.id}`}
                      className="flex items-center gap-2 p-2 rounded-xl hover:bg-yellow-50 transition-colors focus:outline-none"
                    >
                      <span className="text-xl select-none">{s.avatar_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>{s.name}</p>
                        <p className="text-xs" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
                          {s.daysSinceActive}d since last activity
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Quick actions */}
            <div className="clay-card p-5">
              <h3 className="text-base font-bold mb-4" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
                ⚡ Quick Actions
              </h3>
              <div className="space-y-3">
                <Link
                  href="/admin"
                  className="btn-rose w-full px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-rose-400"
                >
                  🎯 Assign Challenge
                </Link>
                <Link
                  href="/leaderboard"
                  className="block w-full px-4 py-3 rounded-2xl text-sm font-semibold text-center transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-rose-400"
                  style={{ background: 'white', border: '1.5px solid #FECDD3', color: '#E11D48', fontFamily: '"Baloo 2", sans-serif' }}
                >
                  🏆 View Leaderboard
                </Link>
                <Link
                  href="/challenges"
                  className="block w-full px-4 py-3 rounded-2xl text-sm font-semibold text-center transition-all hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-rose-400"
                  style={{ background: 'white', border: '1.5px solid #FECDD3', color: '#E11D48', fontFamily: '"Baloo 2", sans-serif' }}
                >
                  📋 Active Challenges
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
