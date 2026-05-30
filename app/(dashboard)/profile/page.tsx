'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '@/lib/store'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { getRankIcon, getRankColor } from '@/lib/utils/ranks'
import { useState } from 'react'

const profileSchema = z.object({
  display_name: z.string().min(2).max(30),
  weight_kg: z.coerce.number().min(0).optional(),
  height_cm: z.coerce.number().min(0).optional(),
  age: z.coerce.number().min(10).max(100).optional(),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
  planet_fitness_mode: z.boolean(),
})

const tmSchema = z.object({
  bench_barbell: z.coerce.number().min(0),
  squat_barbell: z.coerce.number().min(0),
  deadlift: z.coerce.number().min(0),
  ohp_barbell: z.coerce.number().min(0),
  bench_smith: z.coerce.number().min(0).optional(),
  squat_smith: z.coerce.number().min(0).optional(),
  ohp_smith: z.coerce.number().min(0).optional(),
})

type ProfileForm = z.infer<typeof profileSchema>
type TMForm = z.infer<typeof tmSchema>

export default function ProfilePage() {
  const profile = useAppStore(s => s.profile)
  const trainingMaxes = useAppStore(s => s.trainingMaxes)
  const updateProfile = useAppStore(s => s.updateProfile)
  const setTrainingMaxes = useAppStore(s => s.setTrainingMaxes)
  const [success, setSuccess] = useState('')

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      display_name: profile?.display_name ?? '',
      weight_kg: profile?.weight_kg,
      height_cm: profile?.height_cm,
      age: profile?.age,
      experience_level: profile?.experience_level ?? 'beginner',
      planet_fitness_mode: profile?.planet_fitness_mode ?? false,
    },
  })

  const tmForm = useForm<TMForm>({
    resolver: zodResolver(tmSchema),
    defaultValues: {
      bench_barbell: trainingMaxes.bench_barbell,
      squat_barbell: trainingMaxes.squat_barbell,
      deadlift: trainingMaxes.deadlift,
      ohp_barbell: trainingMaxes.ohp_barbell,
      bench_smith: trainingMaxes.bench_smith ?? undefined,
      squat_smith: trainingMaxes.squat_smith ?? undefined,
      ohp_smith: trainingMaxes.ohp_smith ?? undefined,
    },
  })

  const pfMode = profileForm.watch('planet_fitness_mode')

  const onSaveProfile = (data: ProfileForm) => {
    updateProfile(data)
    setSuccess('Profile saved!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const onSaveTM = (data: TMForm) => {
    setTrainingMaxes(data)
    setSuccess('Training maxes saved!')
    setTimeout(() => setSuccess(''), 3000)
  }

  if (!profile) return null

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        <p className={`text-sm mt-0.5 font-medium ${getRankColor(profile.rank)}`}>
          {getRankIcon(profile.rank)} {profile.rank} · {profile.xp.toLocaleString()} XP
        </p>
      </div>

      {success && (
        <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg px-3 py-2 text-sm text-emerald-400">
          {success}
        </div>
      )}

      <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Personal Info</CardTitle></CardHeader>
          <div className="space-y-3">
            <Input label="Display Name" {...profileForm.register('display_name')} error={profileForm.formState.errors.display_name?.message} />
            <div className="grid grid-cols-3 gap-3">
              <Input label="Weight" type="number" step="0.1" suffix="kg" {...profileForm.register('weight_kg')} />
              <Input label="Height" type="number" step="1" suffix="cm" {...profileForm.register('height_cm')} />
              <Input label="Age" type="number" {...profileForm.register('age')} />
            </div>
            <Select
              label="Experience Level"
              options={[
                { value: 'beginner', label: 'Beginner (< 1 year)' },
                { value: 'intermediate', label: 'Intermediate (1–3 years)' },
                { value: 'advanced', label: 'Advanced (3+ years)' },
              ]}
              {...profileForm.register('experience_level')}
            />
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                onClick={() => profileForm.setValue('planet_fitness_mode', !pfMode)}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${pfMode ? 'bg-violet-600' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pfMode ? 'translate-x-4' : ''}`} />
              </button>
              <span className="text-sm text-gray-300">Planet Fitness Mode</span>
            </label>
          </div>
        </Card>
        <Button type="submit" className="w-full">Save Profile</Button>
      </form>

      <form onSubmit={tmForm.handleSubmit(onSaveTM)} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Training Maxes (lbs)</CardTitle></CardHeader>
          <p className="text-xs text-gray-500 mb-3">
            Your Training Max = 90% of 1RM. Use the{' '}
            <a href="/calculator" className="text-violet-400 hover:underline">Calculator</a> if unsure.
          </p>
          <div className="space-y-3">
            <Input label="Bench Press TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('bench_barbell')} />
            <Input label="Back Squat TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('squat_barbell')} />
            <Input label="Deadlift TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('deadlift')} />
            <Input label="Overhead Press TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('ohp_barbell')} />
            {pfMode && (
              <div className="pt-3 border-t border-gray-800 space-y-3">
                <p className="text-xs text-amber-400 font-medium">Smith Machine TMs (optional overrides):</p>
                <Input label="Smith Bench TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('bench_smith')} />
                <Input label="Smith Squat TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('squat_smith')} />
                <Input label="Smith OHP TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('ohp_smith')} />
              </div>
            )}
          </div>
        </Card>
        <Button type="submit" className="w-full">Save Training Maxes</Button>
      </form>
    </div>
  )
}
