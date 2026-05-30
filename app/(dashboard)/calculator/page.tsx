'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { WeightCalculatorForm } from '@/components/calculator/WeightCalculatorForm'
import type { CalculatedMaxes } from '@/types'

export default function CalculatorPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const handleSave = async (maxes: CalculatedMaxes) => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('training_maxes').upsert({
      user_id: user.id,
      bench_barbell: maxes.bench_barbell_tm,
      squat_barbell: maxes.squat_barbell_tm,
      deadlift: maxes.deadlift_tm,
      ohp_barbell: maxes.ohp_barbell_tm,
      bench_smith: maxes.bench_smith_tm ?? null,
      squat_smith: maxes.squat_smith_tm ?? null,
      ohp_smith: maxes.ohp_smith_tm ?? null,
      bench_ratio: maxes.bench_ratio,
      squat_ratio: maxes.squat_ratio,
      ohp_ratio: maxes.ohp_ratio,
      updated_at: new Date().toISOString(),
    })

    setSaving(false)
    router.push('/profile')
  }

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">Weight Calculator</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Calculate your Training Maxes and see exact weights for every set.
        </p>
      </div>
      <WeightCalculatorForm onSave={handleSave} saving={saving} />
    </div>
  )
}
