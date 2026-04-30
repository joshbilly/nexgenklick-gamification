import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function ParentPage({
  params,
}: {
  params: Promise<{ studentId: string }>
}) {
  const { studentId } = await params
  const supabase = await createClient()

  // Fetch student
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  if (!student) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6"
        style={{ background: '#FFF1F2' }}
      >
        <div className="text-6xl mb-4 select-none">😕</div>
        <h1
          className="text-2xl font-bold mb-4"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
        >
          Student not found
        </h1>
        <p
          className="mb-8 text-center"
          style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
        >
          The student profile you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href="/" className="btn-rose px-8 py-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400">
          Back to Home
        </Link>
      </div>
    )
  }

  // Fetch last 5 achievements (DEMO-06)
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false })
    .limit(5)

  // Fetch all badges for progress bar calculation
  const { data: allBadges } = await supabase
    .from('badges')
    .select('*')
    .order('points_required', { ascending: true })

  // Fetch earned badges with details (for badge list with tier icons, DEMO-06)
  const { data: earnedBadges } = await supabase
    .from('student_badges')
    .select('*, badge:badges(*)')
    .eq('student_id', studentId)
    .order('earned_at', { ascending: false })

  const badgeCount = earnedBadges?.length ?? 0

  const sortedBadges = (allBadges || []).sort(
    (a, b) => a.points_required - b.points_required
  )
  const nextBadge = sortedBadges.find(
    (b) => b.points_required > student.total_points
  )
  const prevBadge = sortedBadges
    .slice()
    .reverse()
    .find((b) => b.points_required <= student.total_points)

  const progressMin = prevBadge ? prevBadge.points_required : 0
  const progressMax = nextBadge ? nextBadge.points_required : student.total_points
  const progressPercent =
    progressMax > progressMin
      ? Math.min(
          100,
          ((student.total_points - progressMin) / (progressMax - progressMin)) * 100
        )
      : 100

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#FFF1F2' }}>
      {/* Floating blobs */}
      <div className="absolute top-[-60px] left-[-60px] w-80 h-80 bg-rose-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 right-[-40px] w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

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
          Parent Portal
        </span>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10">
        {/* Student Info Card */}
        <div className="clay-card p-8 mb-6">
          <div className="flex items-center gap-6 flex-wrap">
            <div
              className="text-7xl select-none w-24 h-24 flex items-center justify-center rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, #FFF1F2, #FECDD3)',
                border: '2px solid #FECDD3',
                boxShadow: '0 4px 16px rgba(225,29,72,0.15)',
              }}
            >
              {student.avatar_emoji}
            </div>
            <div className="flex-1">
              <h1
                className="text-3xl font-bold"
                style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
              >
                {student.name}
              </h1>
              <p className="text-base mt-0.5" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
                {student.grade}
              </p>
              <div className="flex items-center gap-4 mt-3 flex-wrap">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
                  style={{ background: '#FFF1F2', border: '1.5px solid #FECDD3', fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
                >
                  ⭐ {student.total_points} pts
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
                  style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', fontFamily: '"Baloo 2", sans-serif', color: '#1D4ED8' }}
                >
                  🏅 {badgeCount} badge{badgeCount !== 1 ? 's' : ''}
                </div>
                {(student.streak_count ?? 0) > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold"
                    style={{ background: '#FFF8F0', border: '1.5px solid #FDE68A', fontFamily: '"Baloo 2", sans-serif', color: '#D97706' }}
                  >
                    🔥 {student.streak_count} day streak
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8">
            {nextBadge ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium" style={{ fontFamily: '"Comic Neue", cursive', color: '#881337' }}>
                    Progress to{' '}
                    <span className="font-bold" style={{ color: '#E11D48' }}>
                      {nextBadge.icon_emoji} {nextBadge.name}
                    </span>
                  </span>
                  <span className="text-sm font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}>
                    {student.total_points} / {nextBadge.points_required} pts
                  </span>
                </div>
                <div
                  className="w-full rounded-full h-5 overflow-hidden"
                  style={{ background: '#F0ECF2' }}
                >
                  <div
                    className="h-5 rounded-full transition-all duration-700"
                    style={{
                      width: `${progressPercent}%`,
                      background: 'linear-gradient(90deg, #FB7185, #E11D48)',
                      boxShadow: '0 2px 8px rgba(225,29,72,0.3)',
                    }}
                  />
                </div>
                <p className="text-xs mt-2" style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}>
                  {nextBadge.points_required - student.total_points} more points to earn{' '}
                  {nextBadge.name}
                </p>
              </>
            ) : (
              <div
                className="text-center py-3 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #FFF1F2, #FECDD3)' }}
              >
                <span className="font-bold text-lg" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}>
                  🌟 {student.name} has reached the highest rank — Legend!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Earned Badges (DEMO-06) */}
        {earnedBadges && earnedBadges.length > 0 && (
          <div className="clay-card p-8 mb-6">
            <h2
              className="text-xl font-bold mb-5"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
            >
              Badges Earned ({earnedBadges.length})
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {earnedBadges.map((sb: { id: string; tier?: string; earned_at: string; badge?: { icon_emoji: string; name: string; description: string | null } }) => {
                const tier = sb.tier ?? 'bronze'
                const tierLabelMap: Record<string, string> = { gold: '🥇 Gold', silver: '🥈 Silver', bronze: '🥉 Bronze' }
                const tierColorMap: Record<string, string> = { gold: '#FACC15', silver: '#9CA3AF', bronze: '#D97706' }
                const color = tierColorMap[tier] ?? '#D97706'
                return (
                  <div
                    key={sb.id}
                    className="flex flex-col items-center p-4 rounded-2xl text-center"
                    style={{
                      background: 'linear-gradient(135deg, #FFF1F2, #FECDD3)',
                      border: `2px solid ${color}44`,
                      boxShadow: '0 2px 8px rgba(225,29,72,0.1)',
                    }}
                  >
                    <span className="text-4xl mb-1 select-none">{sb.badge?.icon_emoji}</span>
                    <span className="font-bold text-xs" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
                      {sb.badge?.name}
                    </span>
                    <span className="text-xs font-bold mt-1 px-2 py-0.5 rounded-full"
                      style={{ color, background: `${color}18`, border: `1px solid ${color}50`, fontFamily: '"Baloo 2", sans-serif' }}
                    >
                      {tierLabelMap[tier]}
                    </span>
                    <span className="text-xs mt-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}>
                      {new Date(sb.earned_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recent Achievements (last 5, DEMO-06) */}
        <div className="clay-card p-8">
          <h2
            className="text-xl font-bold mb-5"
            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
          >
            Recent Achievements (last 5)
          </h2>
          {(!achievements || achievements.length === 0) ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3 select-none">📋</div>
              <p className="font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}>
                No achievements recorded yet.
              </p>
              <p className="text-sm mt-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}>
                Achievements will appear here as they&apos;re added.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{
                    background: '#FFF8F9',
                    border: '1px solid #FECDD3',
                    borderLeft: '4px solid #E11D48',
                  }}
                >
                  <span className="text-2xl select-none">🏆</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span
                        className="font-semibold"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                      >
                        {a.title}
                      </span>
                      <span
                        className="font-bold text-sm px-3 py-0.5 rounded-full"
                        style={{
                          fontFamily: '"Baloo 2", sans-serif',
                          color: 'white',
                          background: 'linear-gradient(135deg, #FB7185, #E11D48)',
                        }}
                      >
                        +{a.points_awarded} pts
                      </span>
                    </div>
                    {a.description && (
                      <p className="text-sm mt-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
                        {a.description}
                      </p>
                    )}
                    <p className="text-xs mt-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}>
                      {new Date(a.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
