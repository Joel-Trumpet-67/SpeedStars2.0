'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { calculateAllMaxes } from '@/lib/utils/weight-calculator'
import type { WeightCalculatorInput, CalculatedMaxes } from '@/types'

const schema = z.object({
  bench_barbell_1rm: z.coerce.number().min(0).optional(),
  bench_barbell_5rm: z.coerce.number().min(0).optional(),
  squat_barbell_1rm: z.coerce.number().min(0).optional(),
  squat_barbell_5rm: z.coerce.number().min(0).optional(),
  deadlift_1rm: z.coerce.number().min(0).optional(),
  deadlift_5rm: z.coerce.number().min(0).optional(),
  ohp_barbell_1rm: z.coerce.number().min(0).optional(),
  ohp_barbell_5rm: z.coerce.number().min(0).optional(),
  bench_smith_5rm: z.coerce.number().min(0).optional(),
  squat_smith_5rm: z.coerce.number().min(0).optional(),
  ohp_smith_5rm: z.coerce.number().min(0).optional(),
})

type FormData = z.infer<typeof schema>

function ResultRow({ label, oneRM, tm, smithTM, ratio }: { label: string; oneRM: number; tm: number; smithTM?: number; ratio?: number }) {
  if (!oneRM && !tm) return null
  return (
    <div className="border-b border-gray-800 last:border-0 py-3">
      <p className="text-sm font-semibold text-white mb-2">{label}</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <p className="text-xs text-gray-500">Est. 1RM</p>
          <p className="text-sm font-bold text-white">{oneRM} lbs</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Training Max</p>
          <p className="text-sm font-bold text-violet-400">{tm} lbs</p>
        </div>
        {smithTM !== undefined && smithTM > 0 && (
          <div>
            <p className="text-xs text-gray-500">Smith TM</p>
            <p className="text-sm font-bold text-amber-400">{smithTM} lbs</p>
          </div>
        )}
        {ratio !== undefined && ratio !== 1 && (
          <div>
            <p className="text-xs text-gray-500">Smith Ratio</p>
            <p className="text-sm font-bold text-gray-300">{(ratio * 100).toFixed(1)}%</p>
          </div>
        )}
      </div>
      {tm > 0 && (
        <div className="mt-2 p-2 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 mb-1 font-medium">Weekly working weights (barbell):</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div>
              <span className="text-gray-500">65%: </span>
              <span className="font-mono text-white">{Math.round(tm * 0.65 / 2.5) * 2.5} lbs</span>
            </div>
            <div>
              <span className="text-gray-500">75%: </span>
              <span className="font-mono text-white">{Math.round(tm * 0.75 / 2.5) * 2.5} lbs</span>
            </div>
            <div>
              <span className="text-gray-500">85%: </span>
              <span className="font-mono text-white">{Math.round(tm * 0.85 / 2.5) * 2.5} lbs</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface Props {
  onSave?: (maxes: CalculatedMaxes) => void
  saving?: boolean
}

export function WeightCalculatorForm({ onSave, saving }: Props) {
  const [results, setResults] = useState<CalculatedMaxes | null>(null)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    const input: WeightCalculatorInput = {
      bench_barbell_1rm: data.bench_barbell_1rm || undefined,
      bench_barbell_5rm: data.bench_barbell_5rm || undefined,
      squat_barbell_1rm: data.squat_barbell_1rm || undefined,
      squat_barbell_5rm: data.squat_barbell_5rm || undefined,
      deadlift_1rm: data.deadlift_1rm || undefined,
      deadlift_5rm: data.deadlift_5rm || undefined,
      ohp_barbell_1rm: data.ohp_barbell_1rm || undefined,
      ohp_barbell_5rm: data.ohp_barbell_5rm || undefined,
      bench_smith_5rm: data.bench_smith_5rm || undefined,
      squat_smith_5rm: data.squat_smith_5rm || undefined,
      ohp_smith_5rm: data.ohp_smith_5rm || undefined,
    }
    setResults(calculateAllMaxes(input))
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <p className="text-sm text-gray-400">
          Enter either your 1RM or a recent 5RM — the calculator will estimate your Training Max automatically.
          Training Max = 90% of 1RM, rounded to nearest 2.5 lbs.
        </p>

        {[
          { title: 'Bench Press', prefix: 'bench_barbell', smithKey: 'bench_smith_5rm' },
          { title: 'Back Squat', prefix: 'squat_barbell', smithKey: 'squat_smith_5rm' },
          { title: 'Deadlift', prefix: 'deadlift', smithKey: null },
          { title: 'Overhead Press', prefix: 'ohp_barbell', smithKey: 'ohp_smith_5rm' },
        ].map(({ title, prefix, smithKey }) => (
          <Card key={prefix}>
            <h3 className="text-sm font-semibold text-white mb-3">{title}</h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="1RM (lbs)"
                type="number"
                step="2.5"
                placeholder="e.g. 225"
                suffix="lbs"
                {...register(`${prefix}_1rm` as keyof FormData)}
              />
              <Input
                label="5RM (lbs)"
                type="number"
                step="2.5"
                placeholder="e.g. 185"
                suffix="lbs"
                {...register(`${prefix}_5rm` as keyof FormData)}
              />
            </div>
            {smithKey && (
              <div className="mt-3 pt-3 border-t border-gray-800">
                <Input
                  label="Smith Machine 5RM (lbs) — optional, for PF users"
                  type="number"
                  step="2.5"
                  placeholder="e.g. 165"
                  suffix="lbs"
                  {...register(smithKey as keyof FormData)}
                />
              </div>
            )}
          </Card>
        ))}

        <Button type="submit" size="lg" className="w-full">
          Calculate Training Maxes
        </Button>
      </form>

      {results && (
        <Card glow>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Your Training Maxes</h3>
          <ResultRow label="Bench Press" oneRM={results.bench_barbell_1rm} tm={results.bench_barbell_tm} smithTM={results.bench_smith_tm} ratio={results.bench_ratio} />
          <ResultRow label="Back Squat" oneRM={results.squat_barbell_1rm} tm={results.squat_barbell_tm} smithTM={results.squat_smith_tm} ratio={results.squat_ratio} />
          <ResultRow label="Deadlift" oneRM={results.deadlift_1rm} tm={results.deadlift_tm} />
          <ResultRow label="Overhead Press" oneRM={results.ohp_barbell_1rm} tm={results.ohp_barbell_tm} smithTM={results.ohp_smith_tm} ratio={results.ohp_ratio} />

          {onSave && (
            <Button onClick={() => onSave(results)} loading={saving} className="w-full mt-4">
              Save & Update Training Maxes
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
