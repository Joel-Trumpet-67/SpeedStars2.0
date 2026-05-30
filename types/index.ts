export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced'
export type Goal = 'strength' | 'hypertrophy' | 'fat_loss' | 'powerbuilding'
export type ProgramType = 'strength' | 'hypertrophy' | 'powerbuilding' | 'fat_loss'
export type ProgramDuration = 4 | 8 | 12 | 16
export type Rank =
  | 'Recruit' | 'Private' | 'Corporal' | 'Sergeant' | 'Lieutenant'
  | 'Captain' | 'Major' | 'Colonel' | 'General' | 'Elite' | 'Legend'
export type EquipmentType = 'barbell' | 'smith' | 'dumbbell' | 'cable' | 'machine' | 'bodyweight'
export type ExerciseCategory = 'main' | 'superset_a' | 'superset_b' | 'finisher'
export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'
export type ProgramStatus = 'active' | 'completed' | 'paused'

export interface UserProfile {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  weight_kg?: number
  height_cm?: number
  age?: number
  experience_level: ExperienceLevel
  goals: Goal[]
  planet_fitness_mode: boolean
  xp: number
  rank: Rank
  streak: number
  last_workout_date?: string
  created_at: string
  updated_at: string
}

export interface TrainingMaxes {
  id: string
  user_id: string
  bench_barbell: number
  squat_barbell: number
  deadlift: number
  ohp_barbell: number
  bench_smith?: number
  squat_smith?: number
  ohp_smith?: number
  bench_ratio: number
  squat_ratio: number
  ohp_ratio: number
  updated_at: string
}

export interface Program {
  id: string
  user_id: string
  name: string
  type: ProgramType
  duration_weeks: ProgramDuration
  current_week: number
  current_day: number
  status: ProgramStatus
  planet_fitness_mode: boolean
  created_at: string
  updated_at: string
}

export interface SetConfig {
  percentage: number
  reps: number | 'AMRAP'
  is_amrap: boolean
}

export interface GeneratedSet {
  set_number: number
  weight: number
  target_reps: number | 'AMRAP'
  actual_reps?: number
  rpe?: number
  percentage?: number
  is_amrap: boolean
  completed: boolean
}

export interface GeneratedExercise {
  id: string
  name: string
  category: ExerciseCategory
  equipment: EquipmentType
  sets: GeneratedSet[]
  rest_seconds: number
  notes?: string
  superset_with?: string
}

export interface GeneratedWorkout {
  id?: string
  program_id?: string
  name: string
  week: number
  day: number
  exercises: GeneratedExercise[]
  estimated_duration: number
}

export interface CompletedSet {
  weight: number
  reps: number
  is_amrap: boolean
  rpe?: number
}

export interface CompletedExercise {
  name: string
  sets: CompletedSet[]
  equipment: EquipmentType
}

export interface WorkoutLog {
  id: string
  user_id: string
  program_id?: string
  week: number
  day: number
  name: string
  exercises: CompletedExercise[]
  total_volume: number
  duration_seconds: number
  xp_earned: number
  completed_at: string
}

export interface PersonalRecord {
  id: string
  user_id: string
  exercise_name: string
  weight: number
  reps: number
  estimated_1rm: number
  equipment: EquipmentType
  achieved_at: string
}

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  xp_reward: number
  condition_type: string
  condition_exercise?: string
  condition_value: number
  rarity: AchievementRarity
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  achievement: Achievement
  achieved_at: string
}

export interface GenerateWorkoutParams {
  programType: ProgramType
  week: number
  day: number
  trainingMaxes: TrainingMaxes
  planetFitnessMode: boolean
}

export interface WeightCalculatorInput {
  bench_barbell_1rm?: number
  squat_barbell_1rm?: number
  deadlift_1rm?: number
  ohp_barbell_1rm?: number
  bench_barbell_5rm?: number
  squat_barbell_5rm?: number
  deadlift_5rm?: number
  ohp_barbell_5rm?: number
  bench_smith_5rm?: number
  squat_smith_5rm?: number
  ohp_smith_5rm?: number
}

export interface CalculatedMaxes {
  bench_barbell_1rm: number
  bench_barbell_tm: number
  squat_barbell_1rm: number
  squat_barbell_tm: number
  deadlift_1rm: number
  deadlift_tm: number
  ohp_barbell_1rm: number
  ohp_barbell_tm: number
  bench_smith_tm?: number
  squat_smith_tm?: number
  ohp_smith_tm?: number
  bench_ratio: number
  squat_ratio: number
  ohp_ratio: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
}

export const RANK_THRESHOLDS: Record<Rank, number> = {
  Recruit: 0,
  Private: 500,
  Corporal: 1500,
  Sergeant: 3500,
  Lieutenant: 7000,
  Captain: 12000,
  Major: 20000,
  Colonel: 32000,
  General: 50000,
  Elite: 75000,
  Legend: 100000,
}

export const RANK_ORDER: Rank[] = [
  'Recruit', 'Private', 'Corporal', 'Sergeant', 'Lieutenant',
  'Captain', 'Major', 'Colonel', 'General', 'Elite', 'Legend',
]
