export function calculateWorkoutXP(params: {
  completedSets: number
  amrapSets: number
  amrapBonusReps: number
  isPR: boolean
  streak: number
}): number {
  const base = 100
  const amrapBonus = params.amrapSets * 20
  const repBonus = params.amrapBonusReps * 5
  const prBonus = params.isPR ? 200 : 0
  const streakBonus = Math.min(params.streak * 2, 50)
  return base + amrapBonus + repBonus + prBonus + streakBonus
}

export function calculatePRBonus(): number {
  return 200
}

export function calculateStreakBonus(streak: number): number {
  return Math.min(streak * 2, 50)
}

export function calculateProgramCompletionXP(): number {
  return 500
}
