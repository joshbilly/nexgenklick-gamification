import { createClient } from '@/lib/supabase/server'

export async function updateStreak(studentId: string): Promise<{ streakCount: number; milestone?: number }> {
  const supabase = await createClient()

  const { data: student, error } = await supabase
    .from('students')
    .select('streak_count, last_active_date, streak_shields')
    .eq('id', studentId)
    .single()

  if (error || !student) return { streakCount: 0 }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayStr = today.toISOString().split('T')[0]

  const lastActive = student.last_active_date
    ? new Date(student.last_active_date + 'T00:00:00')
    : null

  // Already counted today
  if (lastActive && lastActive.toISOString().split('T')[0] === todayStr) {
    return { streakCount: student.streak_count }
  }

  let newStreak = student.streak_count
  let newShields = student.streak_shields ?? 0

  if (lastActive) {
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    if (lastActive.toISOString().split('T')[0] === yesterdayStr) {
      // Consecutive day
      newStreak = (student.streak_count || 0) + 1
    } else {
      // Gap — use shield or reset
      if (newShields > 0) {
        newShields -= 1
        newStreak = (student.streak_count || 0) + 1
      } else {
        newStreak = 1
      }
    }
  } else {
    newStreak = 1
  }

  await supabase
    .from('students')
    .update({
      streak_count: newStreak,
      last_active_date: todayStr,
      streak_shields: newShields,
    })
    .eq('id', studentId)

  const milestones = [7, 14, 30, 60, 100]
  const milestone = milestones.includes(newStreak) ? newStreak : undefined

  return { streakCount: newStreak, milestone }
}
