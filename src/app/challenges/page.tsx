import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const categoryEmojis: Record<string, string> = {
  Science: '🔬',
  Math: '📐',
  Reading: '📚',
  Art: '🎨',
  Sports: '⚽',
  Music: '🎵',
  General: '⭐',
}

function daysUntil(deadline: string): string {
  const now = new Date()
  const end = new Date(deadline)
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return 'Ended'
  if (diff === 1) return '1 day left'
  return `${diff} days left`
}

export default async function ChallengesPage() {
  const supabase = await createClient()

  const { data: challenges } = await supabase
    .from('challenges')
    .select('*')
    .gt('deadline', new Date().toISOString())
    .order('deadline', { ascending: true })

  const { data: participations } = await supabase
    .from('challenge_participation')
    .select('challenge_id, contribution_count, student_id')

  // Aggregate contributions per challenge
  const contributionMap = new Map<string, number>()
  const participantMap = new Map<string, number>()
  for (const p of participations || []) {
    contributionMap.set(
      p.challenge_id,
      (contributionMap.get(p.challenge_id) || 0) + p.contribution_count
    )
    participantMap.set(
      p.challenge_id,
      (participantMap.get(p.challenge_id) || 0) + 1
    )
  }

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
          href="/"
          className="font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 rounded-full px-3 py-1 transition-colors hover:bg-rose-50"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
        >
          ← Home
        </Link>
        <span className="text-sm font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#FB7185' }}>
          🎯 Challenges
        </span>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <div className="mb-10 text-center">
          <h1
            className="text-4xl font-bold"
            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
          >
            🎯 Active Challenges
          </h1>
          <p className="mt-2" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
            Team up, complete missions, and earn extra glory!
          </p>
        </div>

        {(!challenges || challenges.length === 0) ? (
          <div className="clay-card p-12 text-center">
            <div className="text-6xl mb-4 select-none">🎯</div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
            >
              No active challenges
            </h2>
            <p style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
              Check back soon or ask your teacher to create one!
            </p>
            <Link
              href="/admin"
              className="btn-rose inline-block mt-6 px-8 py-3"
            >
              Create Challenge (Admin)
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {challenges.map((challenge) => {
              const totalContributions = contributionMap.get(challenge.id) || 0
              const progressPercent = Math.min(
                100,
                (totalContributions / challenge.target_count) * 100
              )
              const catEmoji = categoryEmojis[challenge.category || 'General'] || '⭐'
              const daysLeft = daysUntil(challenge.deadline)
              const isUrgent = daysLeft === '1 day left' || daysLeft === 'Ended'

              return (
                <div
                  key={challenge.id}
                  className="clay-card p-6 flex flex-col"
                  style={{ borderRadius: '2rem' }}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="text-xs font-bold px-3 py-1 rounded-full"
                        style={{
                          fontFamily: '"Baloo 2", sans-serif',
                          background: challenge.is_class_wide ? '#FEF9C3' : '#F0FDF4',
                          color: challenge.is_class_wide ? '#92400E' : '#15803D',
                          border: `1.5px solid ${challenge.is_class_wide ? '#FDE68A' : '#86EFAC'}`,
                        }}
                      >
                        {challenge.is_class_wide ? '🏫 Class-wide' : '🎯 Individual'}
                      </span>
                      {challenge.category && (
                        <span
                          className="text-xs font-bold px-3 py-1 rounded-full"
                          style={{
                            fontFamily: '"Baloo 2", sans-serif',
                            background: '#FFF1F2',
                            color: '#E11D48',
                            border: '1.5px solid #FECDD3',
                          }}
                        >
                          {catEmoji} {challenge.category}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-xs font-bold px-3 py-1 rounded-full flex-shrink-0"
                      style={{
                        fontFamily: '"Baloo 2", sans-serif',
                        background: isUrgent ? '#FEF2F2' : '#FFF8F9',
                        color: isUrgent ? '#DC2626' : '#BE123C',
                        border: `1.5px solid ${isUrgent ? '#FECACA' : '#FECDD3'}`,
                      }}
                    >
                      ⏰ {daysLeft}
                    </span>
                  </div>

                  <h3
                    className="text-lg font-bold mb-1"
                    style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                  >
                    {challenge.title}
                  </h3>
                  {challenge.description && (
                    <p
                      className="text-sm mb-4 flex-1"
                      style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
                    >
                      {challenge.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                      >
                        Progress
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
                      >
                        {totalContributions} / {challenge.target_count}
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full h-4 overflow-hidden"
                      style={{ background: '#F0ECF2' }}
                    >
                      <div
                        className="h-4 rounded-full transition-all duration-700"
                        style={{
                          width: `${progressPercent}%`,
                          background:
                            progressPercent >= 100
                              ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                              : 'linear-gradient(90deg, #FB7185, #E11D48)',
                          boxShadow: '0 2px 8px rgba(225,29,72,0.3)',
                        }}
                      />
                    </div>
                    {progressPercent >= 100 && (
                      <p
                        className="text-xs mt-1 font-bold"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#16A34A' }}
                      >
                        ✅ Challenge Complete!
                      </p>
                    )}
                    {challenge.class_id && (
                      <p
                        className="text-xs mt-1"
                        style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}
                      >
                        {challenge.class_id} • {participantMap.get(challenge.id) || 0} participants
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105"
            style={{
              fontFamily: '"Baloo 2", sans-serif',
              color: '#E11D48',
              background: 'white',
              border: '2px solid #FECDD3',
              boxShadow: '0 4px 12px rgba(225,29,72,0.12)',
            }}
          >
            🛠️ Manage Challenges (Admin)
          </Link>
        </div>
      </div>
    </div>
  )
}
