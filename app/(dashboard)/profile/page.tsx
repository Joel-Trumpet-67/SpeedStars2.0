'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import { getRankIcon, getRankColor } from '@/lib/utils/ranks'
import type { UserProfile, TrainingMaxes } from '@/types'

const profileSchema = z.object({
  display_name: z.string().min(2).max(30),
  weight_kg: z.coerce.number().min(0).max(500).optional(),
  height_cm: z.coerce.number().min(0).max(300).optional(),
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
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingTM, setSavingTM] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [success, setSuccess] = useState('')

  const profileForm = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })
  const tmForm = useForm<TMForm>({ resolver: zodResolver(tmSchema) })

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const [{ data: p }, { data: tm }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('training_maxes').select('*').eq('user_id', user.id).single(),
      ])

      if (p) {
        setProfile(p as UserProfile)
        profileForm.reset({
          display_name: p.display_name,
          weight_kg: p.weight_kg ?? undefined,
          height_cm: p.height_cm ?? undefined,
          age: p.age ?? undefined,
          experience_level: p.experience_level,
          planet_fitness_mode: p.planet_fitness_mode,
        })
      }
      if (tm) {
        tmForm.reset({
          bench_barbell: tm.bench_barbell,
          squat_barbell: tm.squat_barbell,
          deadlift: tm.deadlift,
          ohp_barbell: tm.ohp_barbell,
          bench_smith: tm.bench_smith ?? undefined,
          squat_smith: tm.squat_smith ?? undefined,
          ohp_smith: tm.ohp_smith ?? undefined,
        })
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const onSaveProfile = async (data: ProfileForm) => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', user.id)
    setSuccess('Profile saved!')
    setSaving(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  const onSaveTM = async (data: TMForm) => {
    setSavingTM(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('training_maxes').upsert({
      user_id: user.id,
      ...data,
      updated_at: new Date().toISOString(),
    })
    setSuccess('Training maxes saved!')
    setSavingTM(false)
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Profile</h1>
        {profile && (
          <p className={`text-sm mt-0.5 font-medium ${getRankColor(profile.rank)}`}>
            {getRankIcon(profile.rank)} {profile.rank} · {profile.xp.toLocaleString()} XP
          </p>
        )}
      </div>

      {success && (
        <div className="bg-emerald-900/30 border border-emerald-800 rounded-lg px-3 py-2 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {/* Profile form */}
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
              <input type="checkbox" {...profileForm.register('planet_fitness_mode')} className="sr-only" />
              <div
                onClick={() => profileForm.setValue('planet_fitness_mode', !profileForm.watch('planet_fitness_mode'))}
                className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${profileForm.watch('planet_fitness_mode') ? 'bg-violet-600' : 'bg-gray-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${profileForm.watch('planet_fitness_mode') ? 'translate-x-4' : ''}`} />
              </div>
              <span className="text-sm text-gray-300">Planet Fitness Mode</span>
            </label>
          </div>
        </Card>
        <Button type="submit" loading={saving} className="w-full">Save Profile</Button>
      </form>

      {/* Training maxes form */}
      <form onSubmit={tmForm.handleSubmit(onSaveTM)} className="space-y-4">
        <Card>
          <CardHeader><CardTitle>Training Maxes (lbs)</CardTitle></CardHeader>
          <p className="text-xs text-gray-500 mb-3">Enter your current training max (90% of 1RM). Use the Calculator page if you need to calculate these.</p>
          <div className="space-y-3">
            <Input label="Bench Press TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('bench_barbell')} />
            <Input label="Back Squat TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('squat_barbell')} />
            <Input label="Deadlift TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('deadlift')} />
            <Input label="Overhead Press TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('ohp_barbell')} />

            {profileForm.watch('planet_fitness_mode') && (
              <div className="pt-3 border-t border-gray-800 space-y-3">
                <p className="text-xs text-amber-400 font-medium">Smith Machine TMs (override auto-calculated values):</p>
                <Input label="Smith Bench TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('bench_smith')} />
                <Input label="Smith Squat TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('squat_smith')} />
                <Input label="Smith OHP TM" type="number" step="2.5" suffix="lbs" {...tmForm.register('ohp_smith')} />
              </div>
            )}
          </div>
        </Card>
        <Button type="submit" loading={savingTM} className="w-full">Save Training Maxes</Button>
      </form>
    </div>
  )
}
