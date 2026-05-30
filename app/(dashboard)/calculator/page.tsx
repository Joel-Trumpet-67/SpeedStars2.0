'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { WeightCalculatorForm } from '@/components/calculator/WeightCalculatorForm'
import type { CalculatedMaxes } from '@/types'

export default function CalculatorPage() {
  const router = useRouter()
  const setTrainingMaxes = useAppStore(s => s.setTrainingMaxes)
  const [saving, setSaving] = useState(false)

  const handleSave = (maxes: CalculatedMaxes) => {
    setSaving(true)
    setTrainingMaxes({
      bench_barbell: maxes.bench_barbell_tm,
      squat_barbell: maxes.squat_barbell_tm,
      deadlift: maxes.deadlift_tm,
      ohp_barbell: maxes.ohp_barbell_tm,
      bench_smith: maxes.bench_smith_tm ?? undefined,
      squat_smith: maxes.squat_smith_tm ?? undefined,
      ohp_smith: maxes.ohp_smith_tm ?? undefined,
      bench_ratio: maxes.bench_ratio,
      squat_ratio: maxes.squat_ratio,
      ohp_ratio: maxes.ohp_ratio,
    })
    setSaving(false)
    router.push('/dashboard')
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Weight Calculator</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Enter your lifts — get exact weights for every set, automatically.
        </p>
      </div>
      <WeightCalculatorForm onSave={handleSave} saving={saving} />
    </div>
  )
}
