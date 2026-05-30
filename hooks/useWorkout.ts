'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { GeneratedWorkout, GeneratedExercise, CompletedExercise, CompletedSet } from '@/types'

export function useWorkout() {
  const [activeWorkout, setActiveWorkout] = useState<GeneratedWorkout | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (activeWorkout && !isComplete) {
      timerRef.current = setInterval(() => {
        setElapsedSeconds(s => s + 1)
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeWorkout, isComplete])

  const startWorkout = useCallback((workout: GeneratedWorkout) => {
    setActiveWorkout(workout)
    setElapsedSeconds(0)
    setIsComplete(false)
  }, [])

  const completeSet = useCallback((exerciseId: string, setNumber: number, actualReps: number, weight: number) => {
    setActiveWorkout(prev => {
      if (!prev) return prev
      return {
        ...prev,
        exercises: prev.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex
          return {
            ...ex,
            sets: ex.sets.map(s =>
              s.set_number === setNumber
                ? { ...s, actual_reps: actualReps, weight, completed: true }
                : s
            ),
          }
        }),
      }
    })
  }, [])

  const finishWorkout = useCallback((): CompletedExercise[] => {
    if (timerRef.current) clearInterval(timerRef.current)
    setIsComplete(true)

    if (!activeWorkout) return []

    return activeWorkout.exercises.map((ex: GeneratedExercise): CompletedExercise => ({
      name: ex.name,
      equipment: ex.equipment,
      sets: ex.sets
        .filter(s => s.completed)
        .map((s): CompletedSet => ({
          weight: s.weight,
          reps: s.actual_reps ?? (typeof s.target_reps === 'number' ? s.target_reps : 0),
          is_amrap: s.is_amrap,
        })),
    }))
  }, [activeWorkout])

  const resetWorkout = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    setActiveWorkout(null)
    setElapsedSeconds(0)
    setIsComplete(false)
  }, [])

  return {
    activeWorkout,
    elapsedSeconds,
    isComplete,
    startWorkout,
    completeSet,
    finishWorkout,
    resetWorkout,
  }
}
