'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { updateStreak } from '@/lib/streak'
import type { Badge } from '@/lib/types'

export interface SubmitAchievementResult {
  newBadges: Badge[]
  tierUpgrades: { badge: Badge; tier: string }[]
  streakMilestone?: number
  error?: string
}

export async function submitAchievement(
  studentId: string,
  formData: FormData
): Promise<SubmitAchievementResult> {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const image_url = formData.get('image_url') as string | null
  const points_awarded = parseInt(
    (formData.get('points_awarded') as string) || '10',
    10
  )
  const category = (formData.get('category') as string) || 'General'

  if (!title?.trim()) {
    return { newBadges: [], tierUpgrades: [], error: 'Title is required' }
  }

  // Insert achievement
  const { error: achievementError } = await supabase
    .from('achievements')
    .insert({
      student_id: studentId,
      title: title.trim(),
      description: description?.trim() || null,
      image_url: image_url?.trim() || null,
      points_awarded,
      category,
    })

  if (achievementError) {
    return { newBadges: [], tierUpgrades: [], error: achievementError.message }
  }

  // Fetch current student
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('total_points')
    .eq('id', studentId)
    .single()

  if (studentError || !student) {
    return { newBadges: [], tierUpgrades: [], error: 'Student not found' }
  }

  const newTotal = student.total_points + points_awarded

  // Update points
  const { error: updateError } = await supabase
    .from('students')
    .update({ total_points: newTotal })
    .eq('id', studentId)

  if (updateError) {
    return { newBadges: [], tierUpgrades: [], error: updateError.message }
  }

  // Update streak
  const { streakCount: _, milestone: streakMilestone } = await updateStreak(studentId)

  // Count total achievements for tiered badge check
  const { count: achievementCount } = await supabase
    .from('achievements')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)

  const totalAchievements = achievementCount || 0

  // Fetch all badges
  const { data: allBadges } = await supabase.from('badges').select('*')

  // Fetch already earned badges
  const { data: alreadyEarned } = await supabase
    .from('student_badges')
    .select('badge_id, tier')
    .eq('student_id', studentId)

  const earnedMap = new Map<string, string>(
    (alreadyEarned || []).map((sb) => [sb.badge_id, sb.tier || 'bronze'])
  )

  const newBadges: Badge[] = []
  const tierUpgrades: { badge: Badge; tier: string }[] = []

  for (const badge of allBadges || []) {
    const goldThreshold = badge.gold_threshold ?? 15
    const silverThreshold = badge.silver_threshold ?? 5
    const bronzeThreshold = badge.bronze_threshold ?? 1

    let newTier: string | null = null
    if (totalAchievements >= goldThreshold) newTier = 'gold'
    else if (totalAchievements >= silverThreshold) newTier = 'silver'
    else if (totalAchievements >= bronzeThreshold) newTier = 'bronze'

    // Also check points_required
    const qualifiesByPoints = newTotal >= badge.points_required
    if (!qualifiesByPoints && !newTier) continue

    if (!earnedMap.has(badge.id)) {
      // New badge earned
      const tier = newTier || 'bronze'
      await supabase.from('student_badges').insert({
        student_id: studentId,
        badge_id: badge.id,
        tier,
        progress: totalAchievements,
      })
      newBadges.push(badge)
    } else if (newTier && earnedMap.get(badge.id) !== newTier) {
      // Tier upgrade
      const currentTier = earnedMap.get(badge.id)!
      const tierOrder = ['bronze', 'silver', 'gold']
      if (tierOrder.indexOf(newTier) > tierOrder.indexOf(currentTier)) {
        await supabase
          .from('student_badges')
          .update({ tier: newTier, progress: totalAchievements })
          .eq('student_id', studentId)
          .eq('badge_id', badge.id)
        tierUpgrades.push({ badge, tier: newTier })
      }
    }
  }

  // Update goal progress for matching category
  const { data: activeGoals } = await supabase
    .from('goals')
    .select('*')
    .eq('student_id', studentId)
    .eq('completed', false)

  for (const goal of activeGoals || []) {
    if (!goal.category || goal.category === category || goal.category === 'General') {
      const newProgress = (goal.current_progress || 0) + 1
      const completed = newProgress >= goal.target_count
      await supabase
        .from('goals')
        .update({ current_progress: newProgress, completed })
        .eq('id', goal.id)
    }
  }

  // Update challenge participation
  const { data: activeChallenges } = await supabase
    .from('challenges')
    .select('*')
    .gt('deadline', new Date().toISOString())

  for (const challenge of activeChallenges || []) {
    if (
      challenge.category &&
      challenge.category !== category &&
      challenge.category !== 'General'
    )
      continue

    const { data: existing } = await supabase
      .from('challenge_participation')
      .select('*')
      .eq('challenge_id', challenge.id)
      .eq('student_id', studentId)
      .single()

    if (existing) {
      const newCount = (existing.contribution_count || 0) + 1
      const completed = newCount >= challenge.target_count
      await supabase
        .from('challenge_participation')
        .update({ contribution_count: newCount, completed, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase.from('challenge_participation').insert({
        challenge_id: challenge.id,
        student_id: studentId,
        contribution_count: 1,
        completed: 1 >= challenge.target_count,
      })
    }
  }

  revalidatePath(`/student/${studentId}`)
  revalidatePath('/admin')
  revalidatePath('/leaderboard')
  revalidatePath('/challenges')

  return { newBadges, tierUpgrades, streakMilestone }
}

export async function addStudent(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const grade = formData.get('grade') as string

  if (!name?.trim() || !grade?.trim()) {
    return { error: 'Name and grade are required' }
  }

  const { error } = await supabase.from('students').insert({
    name: name.trim(),
    grade: grade.trim(),
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin')
  return {}
}

export async function adminAddAchievement(
  formData: FormData
): Promise<{ newBadges: Badge[]; error?: string }> {
  const supabase = await createClient()

  const studentId = formData.get('student_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const points_awarded = parseInt(
    (formData.get('points_awarded') as string) || '10',
    10
  )
  const category = (formData.get('category') as string) || 'General'

  if (!studentId || !title?.trim()) {
    return { newBadges: [], error: 'Student and title are required' }
  }

  const fd = new FormData()
  fd.set('title', title)
  if (description) fd.set('description', description)
  fd.set('points_awarded', String(points_awarded))
  fd.set('category', category)

  const result = await submitAchievement(studentId, fd)
  return { newBadges: result.newBadges, error: result.error }
}

export async function equipCosmetic(
  studentId: string,
  cosmeticId: string
): Promise<{ error?: string }> {
  const supabase = await createClient()

  // Check if student has enough points or has this cosmetic unlocked
  const { data: cosmetic } = await supabase
    .from('cosmetics')
    .select('*')
    .eq('id', cosmeticId)
    .single()

  if (!cosmetic) return { error: 'Cosmetic not found' }

  const { data: student } = await supabase
    .from('students')
    .select('total_points')
    .eq('id', studentId)
    .single()

  if (!student || student.total_points < cosmetic.unlock_points) {
    return { error: 'Not enough points to unlock this cosmetic' }
  }

  // Check if already in student_cosmetics
  const { data: existing } = await supabase
    .from('student_cosmetics')
    .select('*')
    .eq('student_id', studentId)
    .eq('cosmetic_id', cosmeticId)
    .single()

  if (!existing) {
    await supabase.from('student_cosmetics').insert({
      student_id: studentId,
      cosmetic_id: cosmeticId,
      equipped: true,
    })
  }

  // Unequip all cosmetics of same type, then equip selected
  const { data: sameType } = await supabase
    .from('student_cosmetics')
    .select('*, cosmetic:cosmetics(*)')
    .eq('student_id', studentId)

  for (const sc of sameType || []) {
    if (sc.cosmetic?.type === cosmetic.type) {
      await supabase
        .from('student_cosmetics')
        .update({ equipped: sc.cosmetic_id === cosmeticId })
        .eq('id', sc.id)
    }
  }

  revalidatePath(`/student/${studentId}`)
  return {}
}

export async function createChallenge(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const deadline = formData.get('deadline') as string
  const target_count = parseInt((formData.get('target_count') as string) || '3', 10)
  const category = formData.get('category') as string | null
  const is_class_wide = formData.get('is_class_wide') === 'true'
  const class_id = formData.get('class_id') as string | null

  if (!title?.trim() || !deadline) {
    return { error: 'Title and deadline are required' }
  }

  const { error } = await supabase.from('challenges').insert({
    title: title.trim(),
    description: description?.trim() || null,
    deadline: new Date(deadline).toISOString(),
    target_count,
    category: category || null,
    is_class_wide,
    class_id: class_id || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/challenges')
  revalidatePath('/admin')
  return {}
}

export async function setGoal(
  formData: FormData
): Promise<{ error?: string }> {
  const supabase = await createClient()

  const student_id = formData.get('student_id') as string
  const title = formData.get('title') as string
  const description = formData.get('description') as string | null
  const target_count = parseInt((formData.get('target_count') as string) || '5', 10)
  const category = formData.get('category') as string | null
  const deadline = formData.get('deadline') as string | null

  if (!student_id || !title?.trim()) {
    return { error: 'Student and title are required' }
  }

  const { error } = await supabase.from('goals').insert({
    student_id,
    title: title.trim(),
    description: description?.trim() || null,
    target_count,
    category: category || null,
    deadline: deadline || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/student/${student_id}`)
  revalidatePath('/admin')
  return {}
}

export async function deleteStudent(
  studentId: string
): Promise<{ error?: string }> {
  if (!studentId?.trim()) return { error: 'Student ID is required' }

  const supabase = await createClient()

  // Delete in dependency order to respect FK constraints
  await supabase.from('challenge_participation').delete().eq('student_id', studentId)
  await supabase.from('student_cosmetics').delete().eq('student_id', studentId)
  await supabase.from('student_badges').delete().eq('student_id', studentId)
  await supabase.from('goals').delete().eq('student_id', studentId)
  await supabase.from('achievements').delete().eq('student_id', studentId)

  const { error } = await supabase.from('students').delete().eq('id', studentId)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  revalidatePath('/leaderboard')
  revalidatePath('/teacher')
  return {}
}
