import type { SetConfig, ProgramType } from '@/types'

export function getSetConfigs(programType: ProgramType, week: number): SetConfig[] {
  const cycleWeek = ((week - 1) % 4) + 1

  switch (programType) {
    case 'strength':
      if (cycleWeek === 1) return [
        { percentage: 65, reps: 5, is_amrap: false },
        { percentage: 75, reps: 5, is_amrap: false },
        { percentage: 85, reps: 5, is_amrap: true },
      ]
      if (cycleWeek === 2) return [
        { percentage: 70, reps: 3, is_amrap: false },
        { percentage: 80, reps: 3, is_amrap: false },
        { percentage: 90, reps: 3, is_amrap: true },
      ]
      if (cycleWeek === 3) return [
        { percentage: 75, reps: 5, is_amrap: false },
        { percentage: 85, reps: 3, is_amrap: false },
        { percentage: 95, reps: 1, is_amrap: true },
      ]
      return [
        { percentage: 40, reps: 5, is_amrap: false },
        { percentage: 50, reps: 5, is_amrap: false },
        { percentage: 60, reps: 5, is_amrap: false },
      ]

    case 'hypertrophy':
      if (cycleWeek === 1) return [
        { percentage: 65, reps: 12, is_amrap: false },
        { percentage: 70, reps: 10, is_amrap: false },
        { percentage: 75, reps: 8, is_amrap: true },
      ]
      if (cycleWeek === 2) return [
        { percentage: 67.5, reps: 10, is_amrap: false },
        { percentage: 72.5, reps: 8, is_amrap: false },
        { percentage: 77.5, reps: 8, is_amrap: true },
      ]
      if (cycleWeek === 3) return [
        { percentage: 70, reps: 10, is_amrap: false },
        { percentage: 75, reps: 8, is_amrap: false },
        { percentage: 80, reps: 6, is_amrap: true },
      ]
      return [
        { percentage: 50, reps: 12, is_amrap: false },
        { percentage: 55, reps: 10, is_amrap: false },
        { percentage: 60, reps: 10, is_amrap: false },
      ]

    case 'powerbuilding':
      return cycleWeek % 2 === 1
        ? getSetConfigs('strength', week)
        : getSetConfigs('hypertrophy', week)

    case 'fat_loss':
      return [
        { percentage: 55, reps: 15, is_amrap: false },
        { percentage: 60, reps: 12, is_amrap: false },
        { percentage: 65, reps: 10, is_amrap: true },
      ]
  }
}

export function calculateWorkingWeight(tm: number, percentage: number): number {
  const raw = (tm * percentage) / 100
  return Math.round(raw / 2.5) * 2.5
}

export function shouldIncreaseTM(amrapReps: number, targetReps: number): boolean {
  return amrapReps >= targetReps + 1
}

export function getTMIncrease(isUpperBody: boolean): number {
  return isUpperBody ? 5 : 10
}
