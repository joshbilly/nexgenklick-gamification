import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StudentProfile } from './StudentProfile'

export default async function StudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch student
  const { data: student } = await supabase
    .from('students')
    .select('*')
    .eq('id', id)
    .single()

  if (!student) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: '#FFF1F2' }}>
        <div className="text-6xl mb-4">😕</div>
        <h1
          className="text-2xl font-bold mb-4"
          style={{ fontFamily: '"Baloo 2", sans-serif', color: '#881337' }}
        >
          Student not found
        </h1>
        <p className="mb-8" style={{ fontFamily: '"Comic Neue", cursive', color: '#BE123C' }}>
          The student profile you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="btn-rose px-6 py-3"
        >
          Back to Home
        </Link>
      </div>
    )
  }

  // Fetch achievements
  const { data: achievements } = await supabase
    .from('achievements')
    .select('*')
    .eq('student_id', id)
    .order('created_at', { ascending: false })

  // Fetch earned badges (with badge details)
  const { data: studentBadgesRaw } = await supabase
    .from('student_badges')
    .select('*, badge:badges(*)')
    .eq('student_id', id)

  // Fetch all badges
  const { data: allBadges } = await supabase
    .from('badges')
    .select('*')
    .order('points_required', { ascending: true })

  // Fetch active goals
  const { data: goals } = await supabase
    .from('goals')
    .select('*')
    .eq('student_id', id)
    .order('created_at', { ascending: false })

  // Fetch active challenges relevant to this student
  const { data: activeChallenges } = await supabase
    .from('challenges')
    .select('*')
    .gt('deadline', new Date().toISOString())
    .or(`is_class_wide.eq.true,class_id.eq.${student.class_id || 'Class A'}`)
    .order('deadline', { ascending: true })
    .limit(5)

  // Fetch this student's challenge participations
  const { data: challengeParticipations } = await supabase
    .from('challenge_participation')
    .select('*')
    .eq('student_id', id)

  // Fetch all cosmetics
  const { data: cosmetics } = await supabase
    .from('cosmetics')
    .select('*')
    .order('unlock_points', { ascending: true })

  // Fetch student's unlocked/equipped cosmetics
  const { data: studentCosmetics } = await supabase
    .from('student_cosmetics')
    .select('*, cosmetic:cosmetics(*)')
    .eq('student_id', id)

  return (
    <StudentProfile
      student={student}
      achievements={achievements || []}
      earnedBadges={studentBadgesRaw || []}
      allBadges={allBadges || []}
      goals={goals || []}
      challenges={activeChallenges || []}
      challengeParticipations={challengeParticipations || []}
      cosmetics={cosmetics || []}
      studentCosmetics={studentCosmetics || []}
    />
  )
}
