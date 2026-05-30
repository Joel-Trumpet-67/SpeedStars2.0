import type {
  GeneratedWorkout,
  GeneratedExercise,
  GeneratedSet,
  GenerateWorkoutParams,
} from '@/types'
import { getSetConfigs, calculateWorkingWeight } from './percentages'
import { getMainLiftTM } from './planet-fitness'

function genId(): string {
  return Math.random().toString(36).slice(2, 11)
}

type LiftKey = 'bench' | 'squat' | 'ohp' | 'deadlift'

const WORKOUT_NAMES: Record<number, string> = {
  1: 'Bench Day',
  2: 'Squat Day',
  3: 'OHP Day',
  4: 'Deadlift Day',
}

const DAY_LIFTS: Record<number, LiftKey> = {
  1: 'bench',
  2: 'squat',
  3: 'ohp',
  4: 'deadlift',
}

function getAccessoryDefs(lift: LiftKey, pfMode: boolean): Omit<GeneratedExercise, 'sets'>[] {
  const defs: Record<LiftKey, Omit<GeneratedExercise, 'sets'>[]> = {
    bench: [
      { id: genId(), name: pfMode ? 'Incline Dumbbell Press' : 'Incline Barbell Press', category: 'superset_a', equipment: pfMode ? 'dumbbell' : 'barbell', rest_seconds: 60, superset_with: 'Seated Cable Row', notes: '3x10-12' },
      { id: genId(), name: 'Seated Cable Row', category: 'superset_a', equipment: 'cable', rest_seconds: 60, notes: '3x12' },
      { id: genId(), name: 'Cable Fly', category: 'superset_b', equipment: 'cable', rest_seconds: 60, superset_with: 'Face Pulls', notes: '3x15' },
      { id: genId(), name: 'Face Pulls', category: 'superset_b', equipment: 'cable', rest_seconds: 60, notes: '3x15' },
      { id: genId(), name: 'Tricep Pushdowns', category: 'finisher', equipment: 'cable', rest_seconds: 45, notes: '3x15' },
    ],
    squat: [
      { id: genId(), name: pfMode ? 'Dumbbell Romanian Deadlift' : 'Romanian Deadlift', category: 'superset_a', equipment: pfMode ? 'dumbbell' : 'barbell', rest_seconds: 60, superset_with: 'Leg Curl', notes: '3x10' },
      { id: genId(), name: 'Leg Curl', category: 'superset_a', equipment: 'machine', rest_seconds: 60, notes: '3x12' },
      { id: genId(), name: 'Leg Press', category: 'superset_b', equipment: 'machine', rest_seconds: 60, superset_with: 'Calf Raises', notes: '3x12' },
      { id: genId(), name: 'Calf Raises', category: 'superset_b', equipment: 'machine', rest_seconds: 45, notes: '3x20' },
      { id: genId(), name: 'Walking Lunges', category: 'finisher', equipment: 'bodyweight', rest_seconds: 45, notes: '3x16 steps' },
    ],
    ohp: [
      { id: genId(), name: 'Dumbbell Lateral Raise', category: 'superset_a', equipment: 'dumbbell', rest_seconds: 60, superset_with: 'Face Pulls', notes: '3x15' },
      { id: genId(), name: 'Face Pulls', category: 'superset_a', equipment: 'cable', rest_seconds: 60, notes: '3x15' },
      { id: genId(), name: 'Dumbbell Front Raise', category: 'superset_b', equipment: 'dumbbell', rest_seconds: 60, superset_with: 'Rear Delt Fly', notes: '3x12' },
      { id: genId(), name: 'Rear Delt Fly', category: 'superset_b', equipment: 'dumbbell', rest_seconds: 60, notes: '3x15' },
      { id: genId(), name: 'Tricep Dips', category: 'finisher', equipment: 'bodyweight', rest_seconds: 45, notes: '3x15' },
    ],
    deadlift: [
      { id: genId(), name: pfMode ? 'Lat Pulldown' : 'Pull-ups', category: 'superset_a', equipment: pfMode ? 'machine' : 'bodyweight', rest_seconds: 60, superset_with: 'Dumbbell Row', notes: '3x8-10' },
      { id: genId(), name: 'Dumbbell Row', category: 'superset_a', equipment: 'dumbbell', rest_seconds: 60, notes: '3x10 each side' },
      { id: genId(), name: pfMode ? 'Back Extension Machine' : 'Good Mornings', category: 'superset_b', equipment: pfMode ? 'machine' : 'barbell', rest_seconds: 60, superset_with: 'Hyperextensions', notes: '3x10' },
      { id: genId(), name: 'Hyperextensions', category: 'superset_b', equipment: 'bodyweight', rest_seconds: 60, notes: '3x15' },
      { id: genId(), name: 'Planks', category: 'finisher', equipment: 'bodyweight', rest_seconds: 30, notes: '3x60 seconds' },
    ],
  }
  return defs[lift]
}

function makeAccessorySets(notes: string): GeneratedSet[] {
  const repMatch = notes.match(/(\d+)-?(\d+)?/)
  const reps = repMatch ? parseInt(repMatch[1]) : 10
  return Array.from({ length: 3 }, (_, i) => ({
    set_number: i + 1,
    weight: 0,
    target_reps: reps,
    is_amrap: false,
    completed: false,
  }))
}

export function generateWorkout(params: GenerateWorkoutParams): GeneratedWorkout {
  const { programType, week, day, trainingMaxes, planetFitnessMode } = params
  const liftKey = DAY_LIFTS[day] ?? 'bench'
  const { tm, equipment, exerciseName } = getMainLiftTM(liftKey, trainingMaxes, planetFitnessMode)

  const setConfigs = getSetConfigs(programType, week)
  const mainSets: GeneratedSet[] = setConfigs.map((cfg, i) => ({
    set_number: i + 1,
    weight: calculateWorkingWeight(tm, cfg.percentage),
    target_reps: cfg.is_amrap ? 'AMRAP' : cfg.reps,
    percentage: cfg.percentage,
    is_amrap: cfg.is_amrap,
    completed: false,
  }))

  const mainExercise: GeneratedExercise = {
    id: genId(),
    name: exerciseName,
    category: 'main',
    equipment,
    sets: mainSets,
    rest_seconds: programType === 'fat_loss' ? 60 : 180,
    notes: `Training Max: ${tm} lbs`,
  }

  const accessoryDefs = getAccessoryDefs(liftKey, planetFitnessMode)
  const accessories: GeneratedExercise[] = accessoryDefs.map(def => ({
    ...def,
    sets: makeAccessorySets(def.notes ?? '3x10'),
  }))

  const isDeload = ((week - 1) % 4) + 1 === 4
  const estimatedMinutes = isDeload ? 45 : programType === 'fat_loss' ? 40 : 60

  return {
    name: WORKOUT_NAMES[day] ?? 'Workout',
    week,
    day,
    exercises: [mainExercise, ...accessories],
    estimated_duration: estimatedMinutes,
  }
}

export function getWorkoutName(day: number): string {
  return WORKOUT_NAMES[day] ?? 'Workout'
}

export function getDayLift(day: number): LiftKey {
  return DAY_LIFTS[day] ?? 'bench'
}
