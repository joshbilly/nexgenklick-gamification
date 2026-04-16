import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: students } = await supabase
    .from('students')
    .select('id, name, grade, avatar_emoji')
    .order('name', { ascending: true })
    .limit(3)

  const firstStudent = students?.[0]
  const hasStudents = students && students.length > 0

  return (
    <div className="flex flex-col flex-1 min-h-screen relative overflow-hidden" style={{ background: '#FFF1F2' }}>
      {/* Floating decorative blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-80 h-80 bg-rose-300 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute top-40 right-[-60px] w-72 h-72 bg-pink-300 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-rose-200 rounded-full blur-3xl opacity-20 pointer-events-none" />
      <div className="absolute bottom-[-40px] right-1/3 w-64 h-64 bg-orange-200 rounded-full blur-3xl opacity-15 pointer-events-none" />

      <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 relative z-10">
        {/* Hero */}
        <div className="text-center mb-14">
          <div className="text-8xl mb-5 select-none">🎓</div>
          <h1 className="text-6xl font-bold mb-4 tracking-tight" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
            NexGenKlick
            <span
              className="block"
              style={{
                background: 'linear-gradient(135deg, #E11D48, #FB7185)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Gamification
            </span>
          </h1>
          <p className="text-xl max-w-lg mx-auto leading-relaxed" style={{ fontFamily: '"Comic Neue", cursive', color: '#9f1239' }}>
            Celebrate student achievements and watch them grow! 🌟
          </p>
        </div>

        {/* Empty state onboarding banner */}
        {!hasStudents && (
          <div
            className="mb-10 w-full max-w-2xl rounded-3xl px-8 py-6 flex flex-col items-center gap-4 text-center"
            style={{
              background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
              border: '2px dashed #FECDD3',
              boxShadow: '0 4px 20px rgba(225,29,72,0.10)',
            }}
          >
            <div className="text-5xl select-none">🌱</div>
            <h2 className="text-2xl font-bold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
              No students yet!
            </h2>
            <p className="text-base leading-relaxed" style={{ fontFamily: '"Comic Neue", cursive', color: '#9f1239' }}>
              Head to Admin to add your first student and get the class started!
            </p>
            <Link
              href="/admin"
              className="btn-rose px-8 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-rose-400"
            >
              Go to Admin →
            </Link>
          </div>
        )}

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {/* Student Card */}
          <Link
            href={firstStudent ? `/student/${firstStudent.id}` : '/admin'}
            className="clay-card clay-card-hover group relative overflow-hidden p-8 flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
            style={{ borderRadius: '2rem' }}
          >
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, #E11D48, #FB7185)' }}
            />
            <div className="text-6xl mb-4 select-none">{firstStudent?.avatar_emoji ?? '🧑‍🎓'}</div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
              Student View
            </h2>
            <p className="text-sm leading-relaxed flex-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#9f1239' }}>
              {firstStudent
                ? `Viewing ${firstStudent.name}'s profile — ${firstStudent.grade}`
                : 'Set up students first to unlock the student view!'}
            </p>
            <div
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#E11D48' }}
            >
              {hasStudents ? 'View Profile' : 'Add Students'} <span className="text-lg">→</span>
            </div>
          </Link>

          {/* Parent Card */}
          <Link
            href={firstStudent ? `/parent/${firstStudent.id}` : '/admin'}
            className="clay-card clay-card-hover group relative overflow-hidden p-8 flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
            style={{ borderRadius: '2rem' }}
          >
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, #2563EB, #60a5fa)' }}
            />
            <div className="text-6xl mb-4 select-none">👨‍👩‍👧</div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
              Parent View
            </h2>
            <p className="text-sm leading-relaxed flex-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#9f1239' }}>
              {firstStudent
                ? `Viewing progress for ${firstStudent.name}`
                : 'Set up students first to unlock the parent view!'}
            </p>
            <div
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#2563EB' }}
            >
              {hasStudents ? 'View Progress' : 'Add Students'} <span className="text-lg">→</span>
            </div>
          </Link>

          {/* Admin Card */}
          <Link
            href="/admin"
            className="clay-card clay-card-hover group relative overflow-hidden p-8 flex flex-col cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400"
            style={{ borderRadius: '2rem' }}
          >
            <div
              className="absolute inset-0 opacity-5 pointer-events-none"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}
            />
            <div className="text-6xl mb-4 select-none">🛠️</div>
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}>
              Admin Dashboard
            </h2>
            <p className="text-sm leading-relaxed flex-1" style={{ fontFamily: '"Comic Neue", cursive', color: '#9f1239' }}>
              Manage students, add achievements, and monitor the progress of your entire class.
            </p>
            <div
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#7c3aed' }}
            >
              Open Dashboard <span className="text-lg">→</span>
            </div>
          </Link>
        </div>

        {/* Student Quick Links */}
        {hasStudents && (
          <div className="mt-12 w-full max-w-4xl">
            <h3
              className="text-center text-sm font-semibold uppercase tracking-wider mb-5"
              style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}
            >
              Jump to a Student
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {students.map((s) => (
                <Link
                  key={s.id}
                  href={`/student/${s.id}`}
                  className="flex items-center gap-2 bg-white border rounded-full px-5 py-2 text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-400 transition-all duration-200 hover:scale-105 active:scale-95"
                  style={{
                    borderColor: '#FECDD3',
                    color: '#881337',
                    fontFamily: '"Baloo 2", sans-serif',
                    boxShadow: '0 2px 8px rgba(225,29,72,0.1)',
                    minHeight: '44px',
                  }}
                >
                  <span>{s.avatar_emoji}</span>
                  <span>{s.name}</span>
                  <span style={{ color: '#FB7185', fontWeight: 400 }}>· {s.grade}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Quick Nav Pills */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link
            href="/leaderboard"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400"
            style={{
              fontFamily: '"Baloo 2", sans-serif',
              color: '#E11D48',
              background: 'white',
              border: '2px solid #FECDD3',
              boxShadow: '0 4px 16px rgba(225,29,72,0.15)',
              minHeight: '44px',
            }}
          >
            🏆 Leaderboard
          </Link>
          <Link
            href="/challenges"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400"
            style={{
              fontFamily: '"Baloo 2", sans-serif',
              color: '#E11D48',
              background: 'white',
              border: '2px solid #FECDD3',
              boxShadow: '0 4px 16px rgba(225,29,72,0.15)',
              minHeight: '44px',
            }}
          >
            🎯 Challenges
          </Link>
          <Link
            href="/teacher"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400"
            style={{
              fontFamily: '"Baloo 2", sans-serif',
              color: '#7c3aed',
              background: 'white',
              border: '2px solid #e9d5ff',
              boxShadow: '0 4px 16px rgba(124,58,237,0.12)',
              minHeight: '44px',
            }}
          >
            👩‍🏫 Teacher View
          </Link>
          <Link
            href="/login"
            className="flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400"
            style={{
              fontFamily: '"Baloo 2", sans-serif',
              color: 'white',
              background: 'linear-gradient(135deg, #fb7185, #e11d48)',
              boxShadow: '0 4px 16px rgba(225,29,72,0.25)',
              minHeight: '44px',
            }}
          >
            🔑 Select Role
          </Link>
        </div>

        {/* Stats strip */}
        <div className="mt-12 flex flex-wrap justify-center gap-10">
          {[
            { emoji: '🏆', label: 'Earn Badges' },
            { emoji: '⭐', label: 'Collect Points' },
            { emoji: '📈', label: 'Track Growth' },
            { emoji: '🎉', label: 'Celebrate Wins' },
          ].map(({ emoji, label }) => (
            <div key={label} className="flex flex-col items-center gap-2">
              <div
                className="w-14 h-14 flex items-center justify-center rounded-2xl text-2xl"
                style={{
                  background: 'white',
                  border: '1px solid #FECDD3',
                  boxShadow: '0 4px 12px rgba(225,29,72,0.12)',
                }}
              >
                {emoji}
              </div>
              <span className="text-xs font-semibold" style={{ fontFamily: '"Baloo 2", sans-serif', color: '#BE123C' }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </main>

      <footer
        className="text-center py-6 text-sm relative z-10"
        style={{ fontFamily: '"Comic Neue", cursive', color: '#FB7185' }}
      >
        NexGenKlick Gamification &mdash; Making learning rewarding
      </footer>
    </div>
  )
}
