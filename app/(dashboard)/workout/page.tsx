'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, AlertCircle } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { generateWorkout } from '@/lib/workout-engine/programs'
import { WorkoutSession } from '@/components/workout/WorkoutSession'
import Button from '@/components/ui/Button'
import { calculateWorkoutXP } from '@/lib/utils/xp'
import type { CompletedExercise, GeneratedWorkout } from '@/types'

export default function WorkoutPage() {
  const router = useRouter()
  const profile = useAppStore(s => s.profile)
  const trainingMaxes = useAppStore(s => s.trainingMaxes)
  const programs = useAppStore(s => s.programs)
  const updateProgram = useAppStore(s => s.updateProgram)
  const logWorkout = useAppStore(s => s.logWorkout)
  const checkAchievements = useAppStore(s => s.checkAchievements)

  const [sessionActive, setSessionActive] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeProgram = programs.find(p => p.status === 'active') ?? null

  const workout: GeneratedWorkout | null = activeProgram
    ? generateWorkout({
        programType: activeProgram.type,
        week: activeProgram.current_week,
        day: activeProgram.current_day,
        trainingMaxes,
        planetFitnessMode: activeProgram.planet_fitness_mode,
      })
    : null

  const handleComplete = (completedExercises: CompletedExercise[], durationSeconds: number) => {
    if (!profile || !activeProgram || !workout) return
    setSaving(true)
    setError(null)

    try {
      const totalVolume = completedExercises.reduce(
        (sum, ex) => sum + ex.sets.reduce((s, set) => s + set.weight * set.reps, 0), 0
      )
      const amrapSets = completedExercises.flatMap(e => e.sets).filter(s => s.is_amrap)
      const xpEarned = calculateWorkoutXP({
        completedSets: completedExercises.flatMap(e => e.sets).length,
        amrapSets: amrapSets.length,
        amrapBonusReps: 0,
        isPR: false,
        streak: profile.streak,
      })

      logWorkout({
        program_id: activeProgram.id,
        week: workout.week,
        day: workout.day,
        name: workout.name,
        exercises: completedExercises,
        total_volume: totalVolume,
        duration_seconds: durationSeconds,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString(),
      })

      // Advance program
      let nextDay = activeProgram.current_day + 1
      let nextWeek = activeProgram.current_week
      if (nextDay > 4) { nextDay = 1; nextWeek++ }
      const newStatus = nextWeek > activeProgram.duration_weeks ? 'completed' : 'active'
      updateProgram(activeProgram.id, { current_day: nextDay, current_week: nextWeek, status: newStatus })

      checkAchievements()
      router.push('/dashboard')
    } catch {
      setError('Failed to save workout.')
      setSaving(false)
    }
  }

  if (!activeProgram) return (
    <div className="p-4 md:p-6 max-w-xl mx-auto text-center">
      <Dumbbell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-white mb-2">No Active Program</h2>
      <p className="text-sm text-gray-500 mb-4">Create a program to get started.</p>
      <Button onClick={() => router.push('/programs')}>Go to Programs</Button>
    </div>
  )

  if (!workout) return (
    <div className="p-4 md:p-6 max-w-xl mx-auto text-center">
      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-white mb-2">No workout generated</h2>
      <p className="text-sm text-gray-500">Set your training maxes in the Calculator.</p>
    </div>
  )

  if (!sessionActive) return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-4">
      <div>
        <h1 className="text-xl font-bold text-white">{workout.name}</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Week {workout.week} · Day {workout.day} · ~{workout.estimated_duration} min
        </p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl divide-y divide-gray-800">
        {workout.exercises.map(ex => (
          <div key={ex.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold text-white">{ex.name}</p>
                <p className="text-xs text-gray-500 capitalize mt-0.5">{ex.category.replace('_', ' ')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-violet-400">{ex.sets.length} sets</p>
                {ex.sets[0]?.weight > 0 && (
                  <p className="text-xs text-gray-500">
                    {ex.sets.map(s => `${s.weight}`).join(' / ')} lbs
                  </p>
                )}
              </div>
            </div>
            {ex.notes && <p className="text-xs text-gray-600 mt-1">{ex.notes}</p>}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-3 text-sm text-red-400">{error}</div>
      )}

      <Button size="lg" className="w-full" onClick={() => setSessionActive(true)}>
        <Dumbbell className="w-4 h-4" />
        Start Workout
      </Button>
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto">
      <WorkoutSession
        workout={workout}
        onComplete={handleComplete}
        onCancel={() => setSessionActive(false)}
      />
    </div>
  )
}
