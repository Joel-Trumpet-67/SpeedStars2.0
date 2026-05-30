import type { WeightCalculatorInput, CalculatedMaxes } from '@/types'

export function roundToNearest(weight: number, increment = 2.5): number {
  return Math.round(weight / increment) * increment
}

export function estimateOneRM(weight: number, reps: number): number {
  if (reps === 1) return weight
  return Math.round(weight * (1 + reps / 30) * 10) / 10
}

export function calculateTrainingMax(oneRM: number): number {
  return roundToNearest(oneRM * 0.9)
}

export function calculateFromNRM(weight: number, reps: number) {
  const oneRM = estimateOneRM(weight, reps)
  return { oneRM, trainingMax: calculateTrainingMax(oneRM) }
}

export function calculateSmithRatio(
  barbellOneRM: number,
  smithWeight: number,
  smithReps: number
): number {
  const smithOneRM = estimateOneRM(smithWeight, smithReps)
  const ratio = smithOneRM / barbellOneRM
  return Math.min(Math.max(ratio, 0.6), 1.1)
}

export function calculateAllMaxes(input: WeightCalculatorInput): CalculatedMaxes {
  const resolve = (oneRM?: number, fiveRM?: number) => {
    if (oneRM && oneRM > 0) return { oneRM, trainingMax: calculateTrainingMax(oneRM) }
    if (fiveRM && fiveRM > 0) return calculateFromNRM(fiveRM, 5)
    return { oneRM: 0, trainingMax: 0 }
  }

  const bench = resolve(input.bench_barbell_1rm, input.bench_barbell_5rm)
  const squat = resolve(input.squat_barbell_1rm, input.squat_barbell_5rm)
  const dl = resolve(input.deadlift_1rm, input.deadlift_5rm)
  const ohp = resolve(input.ohp_barbell_1rm, input.ohp_barbell_5rm)

  const benchRatio = bench.oneRM > 0 && input.bench_smith_5rm
    ? calculateSmithRatio(bench.oneRM, input.bench_smith_5rm, 5)
    : 0.9
  const squatRatio = squat.oneRM > 0 && input.squat_smith_5rm
    ? calculateSmithRatio(squat.oneRM, input.squat_smith_5rm, 5)
    : 0.9
  const ohpRatio = ohp.oneRM > 0 && input.ohp_smith_5rm
    ? calculateSmithRatio(ohp.oneRM, input.ohp_smith_5rm, 5)
    : 0.9

  return {
    bench_barbell_1rm: bench.oneRM,
    bench_barbell_tm: bench.trainingMax,
    squat_barbell_1rm: squat.oneRM,
    squat_barbell_tm: squat.trainingMax,
    deadlift_1rm: dl.oneRM,
    deadlift_tm: dl.trainingMax,
    ohp_barbell_1rm: ohp.oneRM,
    ohp_barbell_tm: ohp.trainingMax,
    bench_smith_tm: bench.trainingMax > 0 ? roundToNearest(bench.trainingMax * benchRatio) : undefined,
    squat_smith_tm: squat.trainingMax > 0 ? roundToNearest(squat.trainingMax * squatRatio) : undefined,
    ohp_smith_tm: ohp.trainingMax > 0 ? roundToNearest(ohp.trainingMax * ohpRatio) : undefined,
    bench_ratio: benchRatio,
    squat_ratio: squatRatio,
    ohp_ratio: ohpRatio,
  }
}
