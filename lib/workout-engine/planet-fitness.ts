import type { TrainingMaxes } from '@/types'

export const PF_ALTERNATIVES: Record<string, string> = {
  'Barbell Bench Press': 'Smith Machine Bench Press',
  'Barbell Back Squat': 'Smith Machine Squat',
  'Barbell Overhead Press': 'Smith Machine Overhead Press',
  'Deadlift': 'Leg Press',
  'Barbell Row': 'Seated Cable Row',
  'Incline Barbell Press': 'Incline Dumbbell Press',
  'Good Mornings': 'Back Extension Machine',
  'Romanian Deadlift': 'Dumbbell Romanian Deadlift',
}

export function getPFAlternative(exercise: string): string {
  return PF_ALTERNATIVES[exercise] ?? exercise
}

export function getMainLiftTM(
  liftName: 'bench' | 'squat' | 'ohp' | 'deadlift',
  trainingMaxes: TrainingMaxes,
  planetFitnessMode: boolean
): { tm: number; equipment: 'barbell' | 'smith' | 'machine'; exerciseName: string } {
  if (!planetFitnessMode) {
    const names = {
      bench: 'Barbell Bench Press',
      squat: 'Barbell Back Squat',
      ohp: 'Barbell Overhead Press',
      deadlift: 'Deadlift',
    }
    const tms = {
      bench: trainingMaxes.bench_barbell,
      squat: trainingMaxes.squat_barbell,
      ohp: trainingMaxes.ohp_barbell,
      deadlift: trainingMaxes.deadlift,
    }
    return { tm: tms[liftName], equipment: 'barbell', exerciseName: names[liftName] }
  }

  if (liftName === 'deadlift') {
    const legPressTM = Math.round((trainingMaxes.squat_barbell * trainingMaxes.squat_ratio * 1.5) / 2.5) * 2.5
    return { tm: legPressTM, equipment: 'machine', exerciseName: 'Leg Press' }
  }

  const smithTM = {
    bench: trainingMaxes.bench_smith ??
      Math.round((trainingMaxes.bench_barbell * trainingMaxes.bench_ratio) / 2.5) * 2.5,
    squat: trainingMaxes.squat_smith ??
      Math.round((trainingMaxes.squat_barbell * trainingMaxes.squat_ratio) / 2.5) * 2.5,
    ohp: trainingMaxes.ohp_smith ??
      Math.round((trainingMaxes.ohp_barbell * trainingMaxes.ohp_ratio) / 2.5) * 2.5,
  }

  const names = {
    bench: 'Smith Machine Bench Press',
    squat: 'Smith Machine Squat',
    ohp: 'Smith Machine Overhead Press',
  }

  return { tm: smithTM[liftName], equipment: 'smith', exerciseName: names[liftName] }
}
