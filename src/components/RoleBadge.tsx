'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

const roleConfig: Record<string, { label: string; emoji: string; color: string; bg: string }> = {
  student: { label: 'Student', emoji: '🧑‍🎓', color: '#E11D48', bg: '#fff1f2' },
  parent:  { label: 'Parent',  emoji: '👨‍👩‍👧', color: '#2563EB', bg: '#eff6ff' },
  teacher: { label: 'Teacher', emoji: '👩‍🏫', color: '#7c3aed', bg: '#f5f3ff' },
}

export function RoleBadge() {
  const [role, setRole] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setRole(localStorage.getItem('ngk_role'))

    const handler = () => setRole(localStorage.getItem('ngk_role'))
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  if (!mounted) return null

  if (!role) {
    return (
      <Link
        href="/login"
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400"
        style={{
          fontFamily: '"Baloo 2", sans-serif',
          color: 'white',
          background: 'linear-gradient(135deg, #fb7185, #e11d48)',
          boxShadow: '0 4px 16px rgba(225,29,72,0.30)',
        }}
      >
        🔑 Select Role
      </Link>
    )
  }

  const cfg = roleConfig[role] ?? { label: role, emoji: '👤', color: '#881337', bg: '#fff1f2' }

  return (
    <Link
      href="/login"
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400"
      style={{
        fontFamily: '"Baloo 2", sans-serif',
        color: cfg.color,
        background: cfg.bg,
        border: `1.5px solid ${cfg.color}33`,
        boxShadow: `0 4px 16px ${cfg.color}22`,
      }}
    >
      <span>{cfg.emoji}</span>
      <span>{cfg.label}</span>
    </Link>
  )
}
