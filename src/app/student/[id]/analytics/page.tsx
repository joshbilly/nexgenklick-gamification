import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { AnalyticsCharts } from './AnalyticsCharts'

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: student } = await supabase
    .from('students')
    .select('id, name, avatar_emoji, grade, total_points, streak_count')
    .eq('id', id)
    .single()

  if (!student) notFound()

  const { data: achievements } = await supabase
    .from('achievements')
    .select('id, points_awarded, category, created_at')
    .eq('student_id', id)
    .order('created_at', { ascending: true })

  const allAchievements = achievements || []

  // Group by week for line chart
  const weekMap = new Map<string, number>()
  let cumulative = 0
  for (const a of allAchievements) {
    const date = new Date(a.created_at)
    const weekStart = new Date(date)
    weekStart.setDate(date.getDate() - date.getDay())
    const weekKey = weekStart.toISOString().split('T')[0]
    cumulative += a.points_awarded
    weekMap.set(weekKey, cumulative)
  }

  const weeklyData = Array.from(weekMap.entries()).map(([week, points]) => ({
    week,
    points,
  }))

  // Subject distribution
  const categoryMap = new Map<string, number>()
  for (const a of allAchievements) {
    const cat = a.category || 'General'
    categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1)
  }
  const categoryData = Array.from(categoryMap.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)

  const strongestSubject = categoryData[0]?.category || null

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#FFF1F2' }}>
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
          href={`/student/${id}`}
          className="font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-full px-3 py-1 transition-colors hover:bg-rose-50"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
        >
          ← Profile
        </Link>
        <span className="text-sm font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#FB7185' }}>
          📊 Analytics
        </span>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="clay-card p-6 mb-8 flex items-center gap-5">
          <div
            className="text-5xl select-none w-20 h-20 flex items-center justify-center rounded-3xl flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #FFF1F2, #FECDD3)',
              border: '2px solid #FECDD3',
            }}
          >
            {student.avatar_emoji}
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
            >
              {student.name}&apos;s Analytics
            </h1>
            <p className="text-sm mt-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
              {student.grade} · {student.total_points} points total · {allAchievements.length} achievements
            </p>
            {strongestSubject && (
              <div
                className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm font-bold"
                style={{
                  background: 'linear-gradient(135deg, #FFF1F2, #FECDD3)',
                  color: '#E11D48',
                  fontFamily: '"Baloo 2", sans-serif',
                  border: '1.5px solid #FECDD3',
                }}
              >
                ⭐ Strongest: {strongestSubject}
              </div>
            )}
          </div>
        </div>

        {/* Streak card */}
        <div className="clay-card p-6 mb-8">
          <h2
            className="text-lg font-bold mb-4"
            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
          >
            🔥 Streak Info
          </h2>
          <div className="flex items-center gap-6 flex-wrap">
            <div className="text-center">
              <div
                className="text-4xl font-bold"
                style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
              >
                {student.streak_count || 0}
              </div>
              <div
                className="text-sm"
                style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
              >
                Current Streak
              </div>
            </div>
            {(student.streak_count || 0) >= 7 && (
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-2xl font-bold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                  color: '#92400E',
                  fontFamily: '"Baloo 2", sans-serif',
                  border: '1.5px solid #FDE68A',
                }}
              >
                🔥 On Fire! {(student.streak_count || 0) >= 30 ? '— 30 Day Legend!' : (student.streak_count || 0) >= 14 ? '— 2 Week Warrior!' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Charts */}
        <AnalyticsCharts
          weeklyData={weeklyData}
          categoryData={categoryData}
          totalAchievements={allAchievements.length}
        />
      </div>
    </div>
  )
}
