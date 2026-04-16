export interface Student {
  id: string
  name: string
  grade: string
  avatar_emoji: string
  total_points: number
  created_at: string
  streak_count?: number
  last_active_date?: string | null
  streak_shields?: number
  parent_email?: string | null
  class_id?: string
}

export interface Achievement {
  id: string
  student_id: string
  title: string
  description: string | null
  image_url: string | null
  points_awarded: number
  created_at: string
  category?: string
}

export interface Badge {
  id: string
  name: string
  icon_emoji: string
  description: string | null
  points_required: number
  bronze_threshold?: number
  silver_threshold?: number
  gold_threshold?: number
}

export interface StudentBadge {
  id: string
  student_id: string
  badge_id: string
  earned_at: string
  tier?: string
  progress?: number
  badge?: Badge
}

export interface Challenge {
  id: string
  title: string
  description: string | null
  deadline: string
  target_count: number
  category: string | null
  is_class_wide: boolean
  class_id: string | null
  created_by: string
  created_at: string
}

export interface ChallengeParticipation {
  id: string
  challenge_id: string
  student_id: string
  contribution_count: number
  completed: boolean
  updated_at: string
}

export interface Cosmetic {
  id: string
  name: string
  type: string
  emoji_or_css: string
  unlock_points: number
  unlock_badge_id: string | null
  preview_color: string | null
}

export interface StudentCosmetic {
  id: string
  student_id: string
  cosmetic_id: string
  equipped: boolean
  unlocked_at: string
  cosmetic?: Cosmetic
}

export interface Goal {
  id: string
  student_id: string
  title: string
  description: string | null
  target_count: number
  category: string | null
  deadline: string | null
  current_progress: number
  completed: boolean
  created_at: string
}
