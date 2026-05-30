'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { SetRow } from './SetRow'
import { RestTimer } from './RestTimer'
import { cn } from '@/lib/utils/cn'
import type { GeneratedExercise } from '@/types'

const CATEGORY_LABELS: Record<string, string> = {
  main: 'Main Lift',
  superset_a: 'Superset A',
  superset_b: 'Superset B',
  finisher: 'Finisher',
}

interface ExerciseCardProps {
  exercise: GeneratedExercise
  onCompleteSet: (exerciseId: string, setNumber: number, reps: number, weight: number) => void
  defaultOpen?: boolean
}

export function ExerciseCard({ exercise, onCompleteSet, defaultOpen = false }: ExerciseCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [showTimer, setShowTimer] = useState(false)
  const completedSets = exercise.sets.filter(s => s.completed).length
  const allDone = completedSets === exercise.sets.length

  return (
    <Card className={cn(allDone && 'border-emerald-800/40 bg-emerald-900/10')}>
      <button
        className="flex items-start justify-between w-full text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant={exercise.category === 'main' ? 'violet' : 'default'} size="sm">
              {CATEGORY_LABELS[exercise.category]}
            </Badge>
            {exercise.superset_with && (
              <Badge variant="warning" size="sm">Superset</Badge>
            )}
            {allDone && <Badge variant="success" size="sm">Done</Badge>}
          </div>
          <h3 className="text-sm font-semibold text-white">{exercise.name}</h3>
          {exercise.notes && (
            <p className="text-xs text-gray-500 mt-0.5">{exercise.notes}</p>
          )}
        </div>
        <div className="flex items-center gap-3 ml-3 shrink-0">
          <span className="text-xs text-gray-500">{completedSets}/{exercise.sets.length} sets</span>
          {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {exercise.sets.map(set => (
            <SetRow
              key={set.set_number}
              set={set}
              exerciseId={exercise.id}
              onComplete={(id, num, reps, weight) => {
                onCompleteSet(id, num, reps, weight)
                if (exercise.rest_seconds > 0) setShowTimer(true)
              }}
            />
          ))}
          {showTimer && (
            <RestTimer
              defaultSeconds={exercise.rest_seconds}
              onComplete={() => setShowTimer(false)}
            />
          )}
        </div>
      )}
    </Card>
  )
}
