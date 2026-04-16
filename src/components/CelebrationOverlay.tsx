'use client'

import { useEffect, useRef } from 'react'

interface CelebrationProps {
  badge?: { name: string; emoji: string; tier?: string }
  points?: number
  message?: string
  onDismiss: () => void
}

const tierColors: Record<string, string> = {
  gold: '#FACC15',
  silver: '#9CA3AF',
  bronze: '#D97706',
}

const tierLabels: Record<string, string> = {
  gold: '🥇 Gold',
  silver: '🥈 Silver',
  bronze: '🥉 Bronze',
}

export function CelebrationOverlay({ badge, points, message, onDismiss }: CelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let confetti: ((opts: object) => void) | null = null

    async function launchConfetti() {
      const mod = await import('canvas-confetti')
      confetti = mod.default

      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E11D48', '#FB7185', '#FACC15', '#F59E0B', '#FFF1F2', '#C084FC'],
        startVelocity: 40,
        gravity: 0.9,
        ticks: 200,
      })

      setTimeout(() => {
        confetti?.({
          particleCount: 60,
          spread: 120,
          origin: { x: 0.1, y: 0.5 },
          colors: ['#E11D48', '#FACC15', '#C084FC'],
          startVelocity: 30,
          gravity: 0.8,
          ticks: 180,
        })
        confetti?.({
          particleCount: 60,
          spread: 120,
          origin: { x: 0.9, y: 0.5 },
          colors: ['#E11D48', '#FACC15', '#C084FC'],
          startVelocity: 30,
          gravity: 0.8,
          ticks: 180,
        })
      }, 400)
    }

    launchConfetti()

    timerRef.current = setTimeout(() => {
      onDismiss()
    }, 4000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [onDismiss])

  const tierColor = badge?.tier ? tierColors[badge.tier] : '#E11D48'
  const tierLabel = badge?.tier ? tierLabels[badge.tier] : null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      style={{ background: 'rgba(136,19,55,0.55)', backdropFilter: 'blur(4px)' }}
      onClick={onDismiss}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 101 }}
      />
      <div
        className="relative text-center px-10 py-12 max-w-sm w-full"
        style={{
          background: 'white',
          borderRadius: '2.5rem',
          border: `3px solid ${tierColor}`,
          boxShadow: `0 0 0 6px ${tierColor}22, 0 32px 80px rgba(225,29,72,0.35)`,
          animation: 'celebrationPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 102,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`
          @keyframes celebrationPop {
            0% { transform: scale(0.5) translateY(60px); opacity: 0; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
        `}</style>

        {badge ? (
          <>
            <div className="text-8xl mb-3 select-none">{badge.emoji}</div>
            {tierLabel && (
              <div
                className="inline-block text-sm font-bold px-4 py-1 rounded-full mb-3"
                style={{
                  background: `${tierColor}22`,
                  color: tierColor,
                  fontFamily: '"Baloo 2", sans-serif',
                  border: `1.5px solid ${tierColor}`,
                }}
              >
                {tierLabel}
              </div>
            )}
            <h2
              className="text-2xl font-bold mb-1"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
            >
              {badge.tier === 'gold' ? '🌟 Tier Upgraded!' : '🎉 Badge Earned!'}
            </h2>
            <p
              className="text-xl font-bold mb-4"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
            >
              {badge.name}
            </p>
          </>
        ) : points ? (
          <>
            <div className="text-7xl mb-3 select-none">⭐</div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
            >
              +{points} Points!
            </h2>
          </>
        ) : (
          <>
            <div className="text-7xl mb-3 select-none">🔥</div>
            <h2
              className="text-2xl font-bold mb-2"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
            >
              {message || 'Amazing!'}
            </h2>
          </>
        )}

        <p
          className="text-sm mb-6"
          style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}
        >
          {badge ? 'Keep up the amazing work!' : 'You\'re on fire! Keep going!'}
        </p>

        <button
          onClick={onDismiss}
          className="btn-rose px-8 py-3 text-base cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
        >
          Awesome! 🎉
        </button>

        <p
          className="text-xs mt-3"
          style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}
        >
          Auto-closes in a moment...
        </p>
      </div>
    </div>
  )
}
