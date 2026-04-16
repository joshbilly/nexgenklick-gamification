'use client'

import { useState, useEffect } from 'react'

export function PrivacyBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('ngk_privacy_dismissed')) {
      setVisible(true)
    }
  }, [])

  function dismiss() {
    localStorage.setItem('ngk_privacy_dismissed', '1')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between gap-4"
      style={{
        background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
        borderTop: '1.5px solid #FECDD3',
        boxShadow: '0 -4px 20px rgba(225,29,72,0.10)',
      }}
    >
      <p
        className="text-xs leading-relaxed flex-1"
        style={{ fontFamily: '"Comic Neue", cursive', color: '#881337' }}
      >
        🔒 This platform complies with <strong>COPPA</strong>, <strong>FERPA</strong>, and{' '}
        <strong>SOC 2</strong> standards. Student data is protected and never shared with third
        parties.
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss privacy notice"
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-all hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400"
        style={{
          background: '#FECDD3',
          color: '#881337',
          fontFamily: '"Baloo 2", sans-serif',
        }}
      >
        ×
      </button>
    </div>
  )
}
