import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminForms } from './AdminForms'

export default async function AdminPage() {
  const supabase = await createClient()

  // Fetch all students
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('total_points', { ascending: false })

  // Fetch achievement counts per student
  const { data: achievementCounts } = await supabase
    .from('achievements')
    .select('student_id')

  // Fetch badge counts per student
  const { data: badgeCounts } = await supabase
    .from('student_badges')
    .select('student_id')

  const achievementMap: Record<string, number> = {}
  for (const row of achievementCounts || []) {
    achievementMap[row.student_id] = (achievementMap[row.student_id] || 0) + 1
  }

  const badgeMap: Record<string, number> = {}
  for (const row of badgeCounts || []) {
    badgeMap[row.student_id] = (badgeMap[row.student_id] || 0) + 1
  }

  const allStudents = students || []
  const maxAchievements = Math.max(
    ...allStudents.map((s) => achievementMap[s.id] || 0),
    1
  )

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#FFF1F2' }}>
      {/* Floating blobs */}
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
          Admin
        </span>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1
            className="text-4xl font-bold flex items-center gap-3"
            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
          >
            Admin Dashboard
          </h1>
          <p className="mt-2" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
            Manage students and track achievements
          </p>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Students Table */}
          <div className="clay-card p-6">
            <h2
              className="text-lg font-bold mb-5"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
            >
              Students ({allStudents.length})
            </h2>
            {allStudents.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-5xl mb-3 select-none">👩‍🎓</div>
                <p className="font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}>
                  No students yet.
                </p>
                <p className="text-sm mt-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}>
                  Add one using the form on the right.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '2px solid #FECDD3' }}>
                      <th
                        className="pb-3 text-left font-bold"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}
                      >
                        Student
                      </th>
                      <th
                        className="pb-3 text-left font-bold"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}
                      >
                        Grade
                      </th>
                      <th
                        className="pb-3 text-right font-bold"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}
                      >
                        Points
                      </th>
                      <th
                        className="pb-3 text-right font-bold"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}
                      >
                        Badges
                      </th>
                      <th
                        className="pb-3 text-right font-bold"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}
                      >
                        Achvmts
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {allStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="transition-colors"
                        style={{ borderBottom: '1px solid #FECDD3' }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLElement).style.background = '#FFF8F9'
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLElement).style.background = 'transparent'
                        }}
                      >
                        <td className="py-3">
                          <Link
                            href={`/student/${student.id}`}
                            className="flex items-center gap-2 font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-lg px-1 transition-colors hover:underline"
                            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
                          >
                            <span>{student.avatar_emoji}</span>
                            <span>{student.name}</span>
                          </Link>
                        </td>
                        <td
                          className="py-3"
                          style={{ fontFamily: '"Comic Neue", cursive', color: '#881337' }}
                        >
                          {student.grade}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className="font-bold px-2 py-0.5 rounded-full text-xs"
                            style={{
                              fontFamily: '"Baloo 2", sans-serif',
                              color: 'white',
                              background: 'linear-gradient(135deg, #FB7185, #E11D48)',
                            }}
                          >
                            {student.total_points}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className="font-bold"
                            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#2563EB' }}
                          >
                            {badgeMap[student.id] || 0}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className="font-bold"
                            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}
                          >
                            {achievementMap[student.id] || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Bar Chart */}
            {allStudents.length > 0 && (
              <div className="mt-8">
                <h3
                  className="text-sm font-bold mb-4"
                  style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}
                >
                  Achievements per Student
                </h3>
                <svg
                  viewBox={`0 0 400 ${allStudents.length * 40 + 20}`}
                  className="w-full"
                  aria-label="Achievements bar chart"
                >
                  {allStudents.map((student, i) => {
                    const count = achievementMap[student.id] || 0
                    const barWidth = (count / maxAchievements) * 290
                    const y = i * 40 + 10
                    return (
                      <g key={student.id}>
                        <text
                          x={0}
                          y={y + 15}
                          fontSize={11}
                          fill="#881337"
                          fontFamily='"Comic Neue", cursive'
                        >
                          {student.avatar_emoji} {student.name.split(' ')[0]}
                        </text>
                        <rect
                          x={90}
                          y={y}
                          width={Math.max(barWidth, 4)}
                          height={22}
                          rx={11}
                          fill="url(#roseBarGradient)"
                        />
                        <text
                          x={95 + Math.max(barWidth, 4)}
                          y={y + 16}
                          fontSize={11}
                          fill="#E11D48"
                          fontWeight="bold"
                          fontFamily='"Baloo 2", sans-serif'
                        >
                          {count}
                        </text>
                      </g>
                    )
                  })}
                  <defs>
                    <linearGradient id="roseBarGradient" x1="0" x2="1" y1="0" y2="0">
                      <stop offset="0%" stopColor="#FB7185" />
                      <stop offset="100%" stopColor="#E11D48" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
          </div>

          {/* Right: Forms */}
          <AdminForms students={allStudents} />
        </div>
      </div>
    </div>
  )
}
