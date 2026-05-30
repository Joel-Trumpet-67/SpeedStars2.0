'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Dumbbell, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { generateWorkout } from '@/lib/workout-engine/programs'
import { WorkoutSession } from '@/components/workout/WorkoutSession'
import Button from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { calculateWorkoutXP } from '@/lib/utils/xp'
import type { UserProfile, TrainingMaxes, Program, GeneratedWorkout, CompletedExercise } from '@/types'

export default function WorkoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [trainingMaxes, setTrainingMaxes] = useState<TrainingMaxes | null>(null)
  const [activeProgram, setActiveProgram] = useState<Program | null>(null)
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null)
  const [sessionActive, setSessionActive] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: p }, { data: tm }, { data: prog }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('training_maxes').select('*').eq('user_id', user.id).single(),
        supabase.from('programs').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).single(),
      ])

      setProfile(p as UserProfile)
      setTrainingMaxes(tm as TrainingMaxes)
      setActiveProgram(prog as Program)

      if (p && tm && prog) {
        const w = generateWorkout({
          programType: (prog as Program).type,
          week: (prog as Program).current_week,
          day: (prog as Program).current_day,
          trainingMaxes: tm as TrainingMaxes,
          planetFitnessMode: (prog as Program).planet_fitness_mode,
        })
        setWorkout(w)
      }
      setLoading(false)
    }
    load()
  }, [router])

  const handleComplete = async (completedExercises: CompletedExercise[], durationSeconds: number) => {
    if (!profile || !trainingMaxes || !activeProgram || !workout) return
    setSaving(true)

    try {
      const supabase = createClient()
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

      await supabase.from('workout_logs').insert({
        user_id: profile.id,
        program_id: activeProgram.id,
        week: workout.week,
        day: workout.day,
        name: workout.name,
        exercises: completedExercises,
        total_volume: totalVolume,
        duration_seconds: durationSeconds,
        xp_earned: xpEarned,
      })

      // Advance program day
      let nextDay = activeProgram.current_day + 1
      let nextWeek = activeProgram.current_week
      if (nextDay > 4) { nextDay = 1; nextWeek++ }
      const newStatus = nextWeek > activeProgram.duration_weeks ? 'completed' : 'active'

      await supabase.from('programs').update({
        current_day: nextDay,
        current_week: nextWeek,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }).eq('id', activeProgram.id)

      // Update XP, streak
      const today = new Date().toISOString().split('T')[0]
      const lastWorkout = profile.last_workout_date
      const streakIncrement = lastWorkout === new Date(Date.now() - 86400000).toISOString().split('T')[0] ? 1 : 0

      await supabase.from('profiles').update({
        xp: profile.xp + xpEarned,
        streak: streakIncrement ? profile.streak + 1 : 1,
        last_workout_date: today,
        updated_at: new Date().toISOString(),
      }).eq('id', profile.id)

      router.push('/dashboard')
    } catch (e) {
      setError('Failed to save workout. Please try again.')
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )

  if (!activeProgram) return (
    <div className="p-4 md:p-6 max-w-xl mx-auto text-center">
      <Dumbbell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-white mb-2">No Active Program</h2>
      <p className="text-sm text-gray-500 mb-4">Create a program to get your workouts.</p>
      <Button onClick={() => router.push('/programs')}>Go to Programs</Button>
    </div>
  )

  if (!workout) return (
    <div className="p-4 md:p-6 max-w-xl mx-auto text-center">
      <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
      <h2 className="text-lg font-bold text-white mb-2">Workout generation failed</h2>
      <p className="text-sm text-gray-500">Check your training maxes in your profile.</p>
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
