'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { submitAchievement, equipCosmetic } from '@/app/actions'
import { createClient } from '@/lib/supabase/client'
import { CelebrationOverlay } from '@/components/CelebrationOverlay'
import type {
  Student,
  Achievement,
  Badge,
  StudentBadge,
  Goal,
  Challenge,
  ChallengeParticipation,
  Cosmetic,
  StudentCosmetic,
} from '@/lib/types'

const tierRing: Record<string, string> = {
  gold: 'ring-2 ring-yellow-400 shadow-lg shadow-yellow-200',
  silver: 'ring-2 ring-gray-400',
  bronze: 'ring-2 ring-amber-600',
}

const tierLabel: Record<string, string> = {
  gold: '🥇 Gold',
  silver: '🥈 Silver',
  bronze: '🥉 Bronze',
}

const tierColor: Record<string, string> = {
  gold: '#FACC15',
  silver: '#9CA3AF',
  bronze: '#D97706',
}

const categoryEmojis: Record<string, string> = {
  Science: '🔬',
  Math: '📐',
  Reading: '📚',
  Art: '🎨',
  Sports: '⚽',
  Music: '🎵',
  General: '⭐',
}

interface StudentProfileProps {
  student: Student
  achievements: Achievement[]
  earnedBadges: (StudentBadge & { badge?: Badge })[]
  allBadges: Badge[]
  goals: Goal[]
  challenges: Challenge[]
  challengeParticipations: ChallengeParticipation[]
  cosmetics: Cosmetic[]
  studentCosmetics: (StudentCosmetic & { cosmetic?: Cosmetic })[]
}

function daysUntil(deadline: string): string {
  const now = new Date()
  const end = new Date(deadline)
  const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 0) return 'Overdue!'
  if (diff === 1) return '1 day left'
  return `${diff} days left`
}

export function StudentProfile({
  student,
  achievements,
  earnedBadges,
  allBadges,
  goals,
  challenges,
  challengeParticipations,
  cosmetics,
  studentCosmetics,
}: StudentProfileProps) {
  const [totalPoints, setTotalPoints] = useState(student.total_points)
  const [showModal, setShowModal] = useState(false)
  const [showCosmeticModal, setShowCosmeticModal] = useState(false)
  const [celebration, setCelebration] = useState<{
    badge?: { name: string; emoji: string; tier?: string }
    points?: number
    message?: string
  } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)
  const [equippedCosmetics, setEquippedCosmetics] = useState<
    (StudentCosmetic & { cosmetic?: Cosmetic })[]
  >(studentCosmetics)

  // Realtime subscription
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`student-points-${student.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'students',
          filter: `id=eq.${student.id}`,
        },
        (payload) => {
          const updated = payload.new as Student
          setTotalPoints(updated.total_points)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [student.id])

  // Get equipped cosmetics
  const equippedBorder = equippedCosmetics.find(
    (sc) => sc.equipped && sc.cosmetic?.type === 'border'
  )?.cosmetic
  const equippedBg = equippedCosmetics.find(
    (sc) => sc.equipped && sc.cosmetic?.type === 'background'
  )?.cosmetic
  const equippedAccessory = equippedCosmetics.find(
    (sc) => sc.equipped && sc.cosmetic?.type === 'accessory'
  )?.cosmetic

  // Progress to next badge
  const sortedBadges = [...allBadges].sort(
    (a, b) => a.points_required - b.points_required
  )
  const nextBadge = sortedBadges.find((b) => b.points_required > totalPoints)
  const prevBadge = sortedBadges
    .slice()
    .reverse()
    .find((b) => b.points_required <= totalPoints)

  const progressMin = prevBadge ? prevBadge.points_required : 0
  const progressMax = nextBadge ? nextBadge.points_required : totalPoints
  const progressPercent =
    progressMax > progressMin
      ? Math.min(100, ((totalPoints - progressMin) / (progressMax - progressMin)) * 100)
      : 100

  const streakCount = student.streak_count ?? 0
  const streakShields = student.streak_shields ?? 0

  async function handleAchievementSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await submitAchievement(student.id, formData)
      if (result.error) {
        setFormError(result.error)
        return
      }
      setShowModal(false)

      if (result.streakMilestone) {
        setCelebration({ message: `🔥 ${result.streakMilestone} Day Streak!` })
      } else if (result.tierUpgrades.length > 0) {
        const upgrade = result.tierUpgrades[0]
        setCelebration({
          badge: { name: upgrade.badge.name, emoji: upgrade.badge.icon_emoji, tier: upgrade.tier },
        })
      } else if (result.newBadges.length > 0) {
        const badge = result.newBadges[0]
        setCelebration({
          badge: { name: badge.name, emoji: badge.icon_emoji, tier: 'bronze' },
        })
      }
    })
  }

  async function handleEquipCosmetic(cosmeticId: string) {
    startTransition(async () => {
      const result = await equipCosmetic(student.id, cosmeticId)
      if (!result.error) {
        // Optimistically update equipped state
        setEquippedCosmetics((prev) => {
          const clicked = prev.find((sc) => sc.cosmetic_id === cosmeticId)
          const cosmeticType = clicked?.cosmetic?.type
          return prev.map((sc) => ({
            ...sc,
            equipped:
              sc.cosmetic?.type === cosmeticType
                ? sc.cosmetic_id === cosmeticId
                : sc.equipped,
          }))
        })
      }
    })
  }

  // Cosmetics grouped
  const cosmeticsByType = {
    border: cosmetics.filter((c) => c.type === 'border'),
    background: cosmetics.filter((c) => c.type === 'background'),
    accessory: cosmetics.filter((c) => c.type === 'accessory'),
  }

  // Card border/bg classes from equipped cosmetic
  const cardBorderClasses = equippedBorder?.emoji_or_css ?? ''
  const cardBgClasses = equippedBg?.emoji_or_css ?? ''

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: '#FFF1F2' }}>
      {/* Floating blobs */}
      <div className="absolute top-[-60px] right-[-60px] w-80 h-80 bg-rose-200 rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute bottom-40 left-[-40px] w-72 h-72 bg-pink-200 rounded-full blur-3xl opacity-20 pointer-events-none" />

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
        <div className="flex items-center gap-3">
          <Link
            href="/leaderboard"
            className="text-sm font-semibold px-3 py-1 rounded-full transition-colors hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400"
            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
          >
            🏆 Leaderboard
          </Link>
          <Link
            href={`/student/${student.id}/analytics`}
            className="text-sm font-semibold px-3 py-1 rounded-full transition-colors hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400"
            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
          >
            📊 Analytics
          </Link>
        </div>
        <span className="text-sm font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#FB7185' }}>
          Student Portal
        </span>
      </nav>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-10">
        {/* ── STREAK CARD ── */}
        {streakCount > 0 && (
          <div
            className="clay-card p-5 mb-6 flex items-center gap-4 flex-wrap"
            style={{ borderRadius: '2rem' }}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl select-none">🔥</span>
              <div>
                <div
                  className="text-3xl font-bold leading-none"
                  style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
                >
                  {streakCount}
                </div>
                <div
                  className="text-sm"
                  style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
                >
                  Day Streak
                </div>
              </div>
              {streakCount >= 7 && (
                <div
                  className="px-3 py-1 rounded-full text-sm font-bold"
                  style={{
                    fontFamily: '"Baloo 2", sans-serif',
                    background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                    color: '#92400E',
                    border: '1.5px solid #FDE68A',
                  }}
                >
                  🔥 On Fire!
                </div>
              )}
            </div>
            {streakShields > 0 && (
              <div
                className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold"
                style={{
                  fontFamily: '"Baloo 2", sans-serif',
                  background: '#EFF6FF',
                  color: '#1D4ED8',
                  border: '1.5px solid #BFDBFE',
                }}
              >
                🛡️ {streakShields} Shield{streakShields !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE CARD ── */}
        <div
          className={`clay-card p-8 mb-6 relative ${cardBorderClasses} ${cardBgClasses}`}
          style={{ borderRadius: '2rem' }}
        >
          {/* Accessory */}
          {equippedAccessory && (
            <div
              className="absolute top-4 right-4 text-3xl select-none"
              title={equippedAccessory.name}
            >
              {equippedAccessory.emoji_or_css}
            </div>
          )}

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
                {student.class_id && (
                  <span className="ml-2 text-sm opacity-70">· {student.class_id}</span>
                )}
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span
                  className="text-3xl font-bold"
                  style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
                >
                  {totalPoints}
                </span>
                <span className="font-medium" style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}>
                  points
                </span>
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
                    {totalPoints} / {nextBadge.points_required} pts
                  </span>
                </div>
                <div className="w-full rounded-full h-5 overflow-hidden" style={{ background: '#F0ECF2' }}>
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
                  {nextBadge.points_required - totalPoints} more points to earn {nextBadge.name}!
                </p>
              </>
            ) : (
              <div
                className="text-center py-3 rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #FFF1F2, #FECDD3)' }}
              >
                <span className="font-bold text-lg" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}>
                  🌟 Maximum rank achieved! You are a Legend!
                </span>
              </div>
            )}
          </div>

          {/* Customize button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={() => setShowCosmeticModal(true)}
              className="px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-rose-400"
              style={{
                fontFamily: '"Baloo 2", sans-serif',
                color: '#881337',
                background: 'white',
                border: '1.5px solid #FECDD3',
                boxShadow: '0 2px 8px rgba(225,29,72,0.1)',
              }}
            >
              🎨 Customize
            </button>
          </div>
        </div>

        {/* ── ACTIVE CHALLENGES ── */}
        {challenges.length > 0 && (
          <div className="clay-card p-8 mb-6">
            <h2
              className="text-xl font-bold mb-5"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
            >
              🎯 Active Challenges ({challenges.length})
            </h2>
            <div className="space-y-3">
              {challenges.map((challenge) => {
                const participation = challengeParticipations.find(
                  (p) => p.challenge_id === challenge.id
                )
                const myCount = participation?.contribution_count || 0
                const progressPct = Math.min(100, (myCount / challenge.target_count) * 100)
                const days = daysUntil(challenge.deadline)

                return (
                  <div
                    key={challenge.id}
                    className="p-4 rounded-2xl"
                    style={{
                      background: '#FFF8F9',
                      border: '1px solid #FECDD3',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span
                          className="font-bold text-sm"
                          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                        >
                          {challenge.title}
                        </span>
                        {challenge.category && (
                          <span className="ml-2 text-xs" style={{ color: '#BE123C' }}>
                            {categoryEmojis[challenge.category] || '⭐'} {challenge.category}
                          </span>
                        )}
                      </div>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{
                          fontFamily: '"Baloo 2", sans-serif',
                          background: days === 'Overdue!' ? '#FEF2F2' : '#FFF1F2',
                          color: days === 'Overdue!' ? '#DC2626' : '#BE123C',
                          border: `1px solid ${days === 'Overdue!' ? '#FECACA' : '#FECDD3'}`,
                        }}
                      >
                        ⏰ {days}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 rounded-full h-3 overflow-hidden"
                        style={{ background: '#F0ECF2' }}
                      >
                        <div
                          className="h-3 rounded-full transition-all duration-700"
                          style={{
                            width: `${progressPct}%`,
                            background: progressPct >= 100
                              ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                              : 'linear-gradient(90deg, #FB7185, #E11D48)',
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold flex-shrink-0"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
                      >
                        {myCount}/{challenge.target_count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-4">
              <Link
                href="/challenges"
                className="text-sm font-semibold"
                style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
              >
                View all challenges →
              </Link>
            </div>
          </div>
        )}

        {/* ── MY GOALS ── */}
        {goals.length > 0 && (
          <div className="clay-card p-8 mb-6">
            <h2
              className="text-xl font-bold mb-5"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
            >
              🎯 My Goals ({goals.length})
            </h2>
            <div className="space-y-4">
              {goals.map((goal) => {
                const progressPct = Math.min(
                  100,
                  ((goal.current_progress || 0) / goal.target_count) * 100
                )
                const deadline = goal.deadline ? daysUntil(goal.deadline + 'T23:59:59') : null

                return (
                  <div
                    key={goal.id}
                    className="p-5 rounded-2xl"
                    style={{
                      background: goal.completed
                        ? 'linear-gradient(135deg, #F0FDF4, #DCFCE7)'
                        : '#FFF8F9',
                      border: `1px solid ${goal.completed ? '#86EFAC' : '#FECDD3'}`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        {goal.completed && <span className="text-green-500 text-lg">✅</span>}
                        <span
                          className="font-bold"
                          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                        >
                          {goal.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {goal.category && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              fontFamily: '"Baloo 2", sans-serif',
                              background: '#FFF1F2',
                              color: '#E11D48',
                              border: '1px solid #FECDD3',
                            }}
                          >
                            {categoryEmojis[goal.category] || '⭐'} {goal.category}
                          </span>
                        )}
                        {deadline && !goal.completed && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              fontFamily: '"Baloo 2", sans-serif',
                              background: deadline === 'Overdue!' ? '#FEF2F2' : '#FFF8F9',
                              color: deadline === 'Overdue!' ? '#DC2626' : '#BE123C',
                              border: `1px solid ${deadline === 'Overdue!' ? '#FECACA' : '#FECDD3'}`,
                            }}
                          >
                            {deadline === 'Overdue!' ? '⚠️ Overdue!' : `📅 ${deadline}`}
                          </span>
                        )}
                      </div>
                    </div>
                    {goal.description && (
                      <p
                        className="text-sm mb-3"
                        style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
                      >
                        {goal.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3">
                      <div
                        className="flex-1 rounded-full h-3 overflow-hidden"
                        style={{ background: '#F0ECF2' }}
                      >
                        <div
                          className="h-3 rounded-full transition-all duration-700"
                          style={{
                            width: `${progressPct}%`,
                            background: goal.completed
                              ? 'linear-gradient(90deg, #22C55E, #16A34A)'
                              : 'linear-gradient(90deg, #FB7185, #E11D48)',
                          }}
                        />
                      </div>
                      <span
                        className="text-xs font-bold flex-shrink-0"
                        style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
                      >
                        {goal.current_progress}/{goal.target_count}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── EARNED BADGES ── */}
        <div className="clay-card p-8 mb-6">
          <h2
            className="text-xl font-bold mb-5"
            style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
          >
            Earned Badges ({earnedBadges.length})
          </h2>
          {earnedBadges.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3 select-none">🎯</div>
              <p className="font-semibold text-base mb-1" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}>
                No badges yet — you&apos;ve got this!
              </p>
              <p className="text-sm" style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}>
                Upload your first achievement to start earning badges.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {earnedBadges.map((sb) => {
                const tier = sb.tier || 'bronze'
                const ringClass = tierRing[tier] || ''
                const nextTierThreshold =
                  tier === 'bronze'
                    ? sb.badge?.silver_threshold
                    : tier === 'silver'
                    ? sb.badge?.gold_threshold
                    : null
                const progressPct =
                  nextTierThreshold && sb.progress != null
                    ? Math.min(100, (sb.progress / nextTierThreshold) * 100)
                    : 100

                return (
                  <div
                    key={sb.id}
                    className={`flex flex-col items-center p-5 rounded-3xl text-center ${ringClass}`}
                    style={{
                      background: 'linear-gradient(135deg, #FFF1F2, #FECDD3)',
                      border: '1px solid #FECDD3',
                      boxShadow: '0 4px 16px rgba(225,29,72,0.18), 0 1px 4px rgba(225,29,72,0.1)',
                    }}
                  >
                    <span className="text-5xl mb-2 select-none">{sb.badge?.icon_emoji}</span>
                    <span
                      className="font-bold text-sm"
                      style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                    >
                      {sb.badge?.name}
                    </span>

                    {/* Tier label */}
                    <span
                      className="text-xs font-bold mt-1 px-2 py-0.5 rounded-full"
                      style={{
                        fontFamily: '"Baloo 2", sans-serif',
                        color: tierColor[tier],
                        background: `${tierColor[tier]}18`,
                        border: `1px solid ${tierColor[tier]}50`,
                      }}
                    >
                      {tierLabel[tier]}
                    </span>

                    {/* Progress to next tier */}
                    {tier !== 'gold' && nextTierThreshold && (
                      <div className="w-full mt-2">
                        <div
                          className="w-full rounded-full h-1.5 overflow-hidden"
                          style={{ background: '#F0ECF2' }}
                        >
                          <div
                            className="h-1.5 rounded-full"
                            style={{
                              width: `${progressPct}%`,
                              background: `linear-gradient(90deg, ${tierColor[tier]}, ${tierColor[tier]}88)`,
                            }}
                          />
                        </div>
                        <p
                          className="text-xs mt-0.5"
                          style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}
                        >
                          {sb.progress}/{nextTierThreshold} to next tier
                        </p>
                      </div>
                    )}

                    {sb.badge?.description && (
                      <span
                        className="text-xs mt-1"
                        style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
                      >
                        {sb.badge.description}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── ACHIEVEMENTS LIST ── */}
        <div className="clay-card p-8 mb-6">
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <h2
              className="text-xl font-bold"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
            >
              Achievements ({achievements.length})
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="btn-rose px-6 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              + Upload Achievement
            </button>
          </div>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3 select-none">🚀</div>
              <p className="font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}>
                No achievements yet!
              </p>
              <p className="text-sm mt-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}>
                Add your first one to start collecting points.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-4 p-4 rounded-2xl"
                  style={{ background: '#FFF8F9', border: '1px solid #FECDD3' }}
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
                      <div className="flex items-center gap-2">
                        {a.category && a.category !== 'General' && (
                          <span
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{
                              fontFamily: '"Baloo 2", sans-serif',
                              background: '#FFF1F2',
                              color: '#BE123C',
                              border: '1px solid #FECDD3',
                            }}
                          >
                            {categoryEmojis[a.category] || '⭐'} {a.category}
                          </span>
                        )}
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
                    </div>
                    {a.description && (
                      <p
                        className="text-sm mt-1"
                        style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
                      >
                        {a.description}
                      </p>
                    )}
                    <p
                      className="text-xs mt-1"
                      style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}
                    >
                      {new Date(a.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
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

      {/* ── UPLOAD ACHIEVEMENT MODAL ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(136,19,55,0.4)' }}
        >
          <div
            className="w-full max-w-md p-8"
            style={{
              background: 'white',
              borderRadius: '2rem',
              border: '1px solid #FECDD3',
              boxShadow: '0 24px 64px rgba(225,29,72,0.25), 0 8px 24px rgba(225,29,72,0.15)',
            }}
          >
            <h2
              className="text-xl font-bold mb-6"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
            >
              🎉 Upload Achievement
            </h2>
            <form onSubmit={handleAchievementSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-semibold mb-1"
                  style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                >
                  Title <span style={{ color: '#E11D48' }}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  required
                  placeholder="e.g. Perfect Math Test"
                  className="input-clay w-full px-4 py-3 text-sm"
                  style={{ fontFamily: '"Comic Neue", cursive', color: '#881337' }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-1"
                  style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                >
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Tell us about this achievement..."
                  className="input-clay w-full px-4 py-3 text-sm resize-none"
                  style={{ fontFamily: '"Comic Neue", cursive', color: '#881337' }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-1"
                  style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                >
                  Category
                </label>
                <select
                  name="category"
                  className="input-clay w-full px-4 py-3 text-sm"
                  style={{ fontFamily: '"Comic Neue", cursive', color: '#881337', background: 'white' }}
                >
                  <option value="General">General ⭐</option>
                  <option value="Science">Science 🔬</option>
                  <option value="Math">Math 📐</option>
                  <option value="Reading">Reading 📚</option>
                  <option value="Art">Art 🎨</option>
                  <option value="Sports">Sports ⚽</option>
                  <option value="Music">Music 🎵</option>
                </select>
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-1"
                  style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                >
                  Image URL (optional)
                </label>
                <input
                  type="url"
                  name="image_url"
                  placeholder="https://..."
                  className="input-clay w-full px-4 py-3 text-sm"
                  style={{ fontFamily: '"Comic Neue", cursive', color: '#881337' }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-semibold mb-1"
                  style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                >
                  Points
                </label>
                <input
                  type="number"
                  name="points_awarded"
                  defaultValue={10}
                  min={1}
                  max={100}
                  className="input-clay w-full px-4 py-3 text-sm"
                  style={{ fontFamily: '"Comic Neue", cursive', color: '#881337' }}
                />
              </div>
              {formError && (
                <p
                  className="text-sm rounded-2xl px-4 py-2"
                  style={{
                    color: '#DC2626',
                    background: '#FFF1F2',
                    border: '1px solid #FECDD3',
                    fontFamily: '"Comic Neue", cursive',
                  }}
                >
                  {formError}
                </p>
              )}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setFormError(null) }}
                  className="flex-1 px-4 py-3 rounded-full font-semibold text-sm cursor-pointer transition-all duration-200 hover:scale-103 active:scale-97"
                  style={{
                    fontFamily: '"Baloo 2", sans-serif',
                    color: '#881337',
                    background: 'white',
                    border: '1.5px solid #FECDD3',
                    minHeight: '44px',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn-rose flex-1 px-4 py-3 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── COSMETIC CUSTOMIZATION MODAL ── */}
      {showCosmeticModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(136,19,55,0.4)' }}
          onClick={() => setShowCosmeticModal(false)}
        >
          <div
            className="w-full max-w-lg max-h-[85vh] overflow-y-auto p-8"
            style={{
              background: 'white',
              borderRadius: '2rem',
              border: '1px solid #FECDD3',
              boxShadow: '0 24px 64px rgba(225,29,72,0.25)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
              >
                🎨 Customize Profile
              </h2>
              <button
                onClick={() => setShowCosmeticModal(false)}
                className="text-sm font-semibold px-3 py-1 rounded-full cursor-pointer hover:bg-rose-50"
                style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
              >
                ✕ Close
              </button>
            </div>

            {(['border', 'background', 'accessory'] as const).map((type) => (
              <div key={type} className="mb-6">
                <h3
                  className="text-sm font-bold uppercase tracking-wider mb-3"
                  style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}
                >
                  {type === 'border' ? '🔲 Borders' : type === 'background' ? '🎨 Backgrounds' : '✨ Accessories'}
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {cosmeticsByType[type].map((cosmetic) => {
                    const unlocked = totalPoints >= cosmetic.unlock_points
                    const sc = equippedCosmetics.find(
                      (s) => s.cosmetic_id === cosmetic.id
                    )
                    const isEquipped = sc?.equipped ?? false

                    return (
                      <button
                        key={cosmetic.id}
                        disabled={!unlocked || isPending}
                        onClick={() => unlocked && handleEquipCosmetic(cosmetic.id)}
                        className="relative flex flex-col items-center p-3 rounded-2xl cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:cursor-not-allowed"
                        style={{
                          background: isEquipped
                            ? `${cosmetic.preview_color || '#E11D48'}18`
                            : unlocked
                            ? '#FFF8F9'
                            : '#F9FAFB',
                          border: isEquipped
                            ? `2px solid ${cosmetic.preview_color || '#E11D48'}`
                            : '1.5px solid #FECDD3',
                          opacity: unlocked ? 1 : 0.55,
                        }}
                      >
                        {isEquipped && (
                          <div
                            className="absolute top-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-xs"
                            style={{ background: '#22C55E', color: 'white' }}
                          >
                            ✓
                          </div>
                        )}
                        {/* Preview swatch */}
                        <div
                          className="w-10 h-10 rounded-xl mb-2 flex items-center justify-center text-xl"
                          style={{
                            background: cosmetic.preview_color
                              ? `${cosmetic.preview_color}30`
                              : '#FFF1F2',
                            border: `2px solid ${cosmetic.preview_color || '#FECDD3'}`,
                          }}
                        >
                          {type === 'accessory' ? cosmetic.emoji_or_css : '🎨'}
                        </div>
                        <span
                          className="text-xs font-bold text-center"
                          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
                        >
                          {cosmetic.name}
                        </span>
                        {!unlocked ? (
                          <span
                            className="text-xs mt-0.5"
                            style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}
                          >
                            Need {cosmetic.unlock_points} pts
                          </span>
                        ) : (
                          <span
                            className="text-xs mt-0.5"
                            style={{ fontFamily: '"Comic Neue", cursive', color: '#16A34A' }}
                          >
                            {isEquipped ? 'Equipped' : 'Unlocked ✓'}
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── CELEBRATION OVERLAY ── */}
      {celebration && (
        <CelebrationOverlay
          badge={celebration.badge}
          points={celebration.points}
          message={celebration.message}
          onDismiss={() => setCelebration(null)}
        />
      )}
    </div>
  )
}
