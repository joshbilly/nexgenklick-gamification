'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const roles = [
  {
    key: 'student',
    emoji: '🧑‍🎓',
    label: 'I am a Student',
    description: 'View your achievements, badges, and track your progress!',
    color: '#E11D48',
    bg: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
    border: '#FECDD3',
    shadow: 'rgba(225,29,72,0.18)',
  },
  {
    key: 'parent',
    emoji: '👨‍👩‍👧',
    label: 'I am a Parent',
    description: "Keep an eye on your child's learning journey and celebrate milestones.",
    color: '#2563EB',
    bg: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
    border: '#bfdbfe',
    shadow: 'rgba(37,99,235,0.15)',
  },
  {
    key: 'teacher',
    emoji: '👩‍🏫',
    label: 'I am a Teacher / Admin',
    description: 'Manage students, assign challenges, and monitor class progress.',
    color: '#7c3aed',
    bg: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
    border: '#ddd6fe',
    shadow: 'rgba(124,58,237,0.15)',
  },
]

export default function LoginPage() {
  const router = useRouter()
  const [current, setCurrent] = useState<string | null>(null)

  useEffect(() => {
    setCurrent(localStorage.getItem('ngk_role'))
  }, [])

  function selectRole(roleKey: string) {
    localStorage.setItem('ngk_role', roleKey)
    setCurrent(roleKey)

    if (roleKey === 'student') {
      const studentId = localStorage.getItem('ngk_student_id')
      router.push(studentId ? `/student/${studentId}` : '/leaderboard')
    } else if (roleKey === 'parent') {
      const studentId = localStorage.getItem('ngk_student_id')
      router.push(studentId ? `/parent/${studentId}` : '/leaderboard')
    } else {
      router.push('/admin')
    }
  }

  function clearRole() {
    localStorage.removeItem('ngk_role')
    setCurrent(null)
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col" style={{ background: '#FFF1F2' }}>
      {/* Blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-rose-300 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 right-[-60px] w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-20 pointer-events-none" />

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
        <span className="text-sm font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#FB7185' }}>
          🔑 Select Your Role
        </span>
      </nav>

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-14 relative z-10">
        <div className="text-center mb-12">
          <div className="text-7xl mb-4 select-none">🔑</div>
          <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
            Who are you?
          </h1>
          <p className="text-lg" style={{ fontFamily: '"Comic Neue", cursive', color: '#9f1239' }}>
            Select your role to get the right experience!
          </p>
        </div>

        {current && (
          <div
            className="mb-8 px-5 py-3 rounded-full flex items-center gap-3 text-sm font-semibold"
            style={{
              background: 'white',
              border: '1.5px solid #FECDD3',
              fontFamily: '"Baloo 2", sans-serif',
              color: '#881337',
              boxShadow: '0 2px 8px rgba(225,29,72,0.10)',
            }}
          >
            <span>
              Current role: <strong>{roles.find((r) => r.key === current)?.label ?? current}</strong>
            </span>
            <button
              onClick={clearRole}
              className="ml-2 text-xs px-3 py-1 rounded-full transition-colors hover:bg-rose-100"
              style={{ color: '#E11D48', fontFamily: '"Baloo 2", sans-serif' }}
            >
              Clear
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
          {roles.map((role) => (
            <button
              key={role.key}
              onClick={() => selectRole(role.key)}
              className="clay-card clay-card-hover relative overflow-hidden p-8 flex flex-col items-center text-center cursor-pointer focus:outline-none focus:ring-4 transition-all"
              style={{
                background: role.bg,
                borderColor: role.border,
                borderRadius: '2rem',
                boxShadow: `0 8px 32px ${role.shadow}`,
                outline: current === role.key ? `3px solid ${role.color}` : undefined,
              }}
            >
              <div className="text-6xl mb-5 select-none">{role.emoji}</div>
              <h2 className="text-xl font-bold mb-3" style={{ fontFamily: '"Baloo 2", sans-serif', color: role.color }}>
                {role.label}
              </h2>
              <p className="text-sm leading-relaxed" style={{ fontFamily: '"Comic Neue", cursive', color: '#9f1239' }}>
                {role.description}
              </p>
              {current === role.key && (
                <span
                  className="mt-4 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: role.color, color: 'white', fontFamily: '"Baloo 2", sans-serif' }}
                >
                  ✓ Active
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="mt-10 text-sm text-center" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
          Your role is saved in this browser. You can change it anytime.
        </p>
      </main>
    </div>
  )
}
