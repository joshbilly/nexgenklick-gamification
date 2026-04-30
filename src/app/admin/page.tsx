import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AdminForms } from './AdminForms'
import { AdminDashboard } from './AdminDashboard'

export default async function AdminPage() {
  const supabase = await createClient()

  // Fetch all students
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .order('total_points', { ascending: false })

  // Achievement counts per student
  const { data: achievementRows } = await supabase
    .from('achievements')
    .select('student_id')

  // Badge counts per student
  const { data: badgeRows } = await supabase
    .from('student_badges')
    .select('student_id')

  // Weekly achievements — last 7 days (DEMO-08)
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const { data: weeklyRows } = await supabase
    .from('achievements')
    .select('created_at')
    .gte('created_at', weekAgo)

  // Badge distribution by category (join badges via student_badges)
  const { data: badgeCategoryRows } = await supabase
    .from('achievements')
    .select('category')

  const achievementMap: Record<string, number> = {}
  for (const row of achievementRows || []) {
    achievementMap[row.student_id] = (achievementMap[row.student_id] || 0) + 1
  }

  const badgeMap: Record<string, number> = {}
  for (const row of badgeRows || []) {
    badgeMap[row.student_id] = (badgeMap[row.student_id] || 0) + 1
  }

  const allStudents = (students || []).map((s) => ({
    ...s,
    achievementCount: achievementMap[s.id] || 0,
    badgeCount: badgeMap[s.id] || 0,
  }))

  // Build weekly bar chart data — one bar per day (Mon–Sun labels)
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const dayCounts: Record<string, number> = {}
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000)
    const key = dayLabels[d.getDay()] + ` ${d.getDate()}`
    dayCounts[key] = 0
  }
  for (const row of weeklyRows || []) {
    const d = new Date(row.created_at)
    const key = dayLabels[d.getDay()] + ` ${d.getDate()}`
    if (key in dayCounts) dayCounts[key]++
  }
  const weeklyData = Object.entries(dayCounts).map(([day, count]) => ({ day, count }))

  // Badge (achievement) distribution by category
  const catMap: Record<string, number> = {}
  for (const row of badgeCategoryRows || []) {
    const cat = row.category || 'General'
    catMap[cat] = (catMap[cat] || 0) + 1
  }
  const categoryData = Object.entries(catMap)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

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
          Admin
        </span>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
            Admin Dashboard
          </h1>
          <p className="mt-2" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
            Manage students, track achievements, and view analytics
          </p>
        </div>

        {/* Interactive dashboard (sortable table + Recharts + slide-out) */}
        <AdminDashboard
          students={allStudents}
          weeklyData={weeklyData}
          categoryData={categoryData}
        />

        {/* Forms (add student, achievement, challenge, goal, delete) */}
        <div className="mt-8">
          <AdminForms students={students || []} />
        </div>
      </div>
    </div>
  )
}
