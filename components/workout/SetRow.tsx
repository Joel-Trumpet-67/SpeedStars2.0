'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { GeneratedSet } from '@/types'

interface SetRowProps {
  set: GeneratedSet
  exerciseId: string
  onComplete: (exerciseId: string, setNumber: number, reps: number, weight: number) => void
}

export function SetRow({ set, exerciseId, onComplete }: SetRowProps) {
  const [reps, setReps] = useState<string>(
    set.target_reps === 'AMRAP' ? '' : String(set.target_reps)
  )
  const [weight, setWeight] = useState<string>(set.weight > 0 ? String(set.weight) : '')

  const handleComplete = () => {
    const r = parseInt(reps)
    const w = parseFloat(weight)
    if (!r || !w) return
    onComplete(exerciseId, set.set_number, r, w)
  }

  return (
    <div className={cn(
      'flex items-center gap-3 py-2.5 px-3 rounded-lg transition-colors',
      set.completed ? 'bg-emerald-900/20 border border-emerald-800/30' : 'bg-gray-800/50'
    )}>
      <span className="text-xs text-gray-500 w-6 text-center font-mono">{set.set_number}</span>

      {set.percentage && (
        <span className="text-xs text-violet-400 w-10 text-center">{set.percentage}%</span>
      )}

      <div className="flex items-center gap-2 flex-1">
        <div className="flex-1">
          <input
            type="number"
            value={weight}
            onChange={e => setWeight(e.target.value)}
            placeholder={set.weight > 0 ? String(set.weight) : 'lbs'}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-violet-500"
            disabled={set.completed}
          />
          <p className="text-[10px] text-gray-600 text-center mt-0.5">lbs</p>
        </div>
        <span className="text-gray-600">×</span>
        <div className="flex-1">
          <input
            type="number"
            value={reps}
            onChange={e => setReps(e.target.value)}
            placeholder={set.target_reps === 'AMRAP' ? 'AMRAP' : String(set.target_reps)}
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white text-center focus:outline-none focus:ring-1 focus:ring-violet-500"
            disabled={set.completed}
          />
          <p className="text-[10px] text-gray-600 text-center mt-0.5">
            {set.is_amrap ? 'AMRAP' : 'reps'}
          </p>
        </div>
      </div>

      <button
        onClick={handleComplete}
        disabled={set.completed}
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center transition-all shrink-0',
          set.completed
            ? 'bg-emerald-600 text-white'
            : 'bg-gray-700 text-gray-500 hover:bg-violet-600 hover:text-white'
        )}
      >
        <Check className="w-4 h-4" />
      </button>
    </div>
  )
}
