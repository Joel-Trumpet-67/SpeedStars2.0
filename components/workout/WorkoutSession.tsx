'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Clock, Zap } from 'lucide-react'
import Button from '@/components/ui/Button'
import { ExerciseCard } from './ExerciseCard'
import { useWorkout } from '@/hooks/useWorkout'
import type { GeneratedWorkout } from '@/types'

interface WorkoutSessionProps {
  workout: GeneratedWorkout
  onComplete: (completedExercises: ReturnType<ReturnType<typeof useWorkout>['finishWorkout']>, durationSeconds: number) => void
  onCancel: () => void
}

export function WorkoutSession({ workout, onComplete, onCancel }: WorkoutSessionProps) {
  const { activeWorkout, elapsedSeconds, startWorkout, completeSet, finishWorkout, resetWorkout } = useWorkout()

  useEffect(() => {
    startWorkout(workout)
    return () => resetWorkout()
  }, [workout]) // eslint-disable-line react-hooks/exhaustive-deps

  const mins = Math.floor(elapsedSeconds / 60)
  const secs = elapsedSeconds % 60

  const handleFinish = () => {
    const completed = finishWorkout()
    onComplete(completed, elapsedSeconds)
  }

  const totalSets = workout.exercises.reduce((a, e) => a + e.sets.length, 0)
  const completedSets = activeWorkout?.exercises.reduce(
    (a, e) => a + e.sets.filter(s => s.completed).length, 0
  ) ?? 0

  return (
    <div className="space-y-4">
      {/* Session header */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-white">{workout.name}</h2>
            <p className="text-xs text-gray-500">Week {workout.week} · Day {workout.day}</p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-violet-400">
              <Clock className="w-4 h-4" />
              <span className="font-mono font-bold text-lg">
                {mins}:{secs.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-violet-600 rounded-full transition-all duration-300"
              style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 shrink-0">{completedSets}/{totalSets}</span>
        </div>
        <p className="text-xs text-gray-600">{completedSets} of {totalSets} sets complete</p>
      </div>

      {/* Exercises */}
      <div className="space-y-3">
        {(activeWorkout ?? workout).exercises.map((exercise, i) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onCompleteSet={completeSet}
            defaultOpen={i === 0}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleFinish}
          className="flex-1"
          disabled={completedSets === 0}
        >
          <Zap className="w-4 h-4" />
          Finish Workout
        </Button>
      </div>

      {completedSets === totalSets && totalSets > 0 && (
        <div className="bg-emerald-900/20 border border-emerald-800/40 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300">All sets complete! Great work — finish to save your session.</p>
        </div>
      )}
    </div>
  )
}
