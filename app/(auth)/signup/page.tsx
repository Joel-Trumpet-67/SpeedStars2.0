'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAppStore } from '@/lib/store'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

const schema = z.object({
  display_name: z.string().min(2, 'At least 2 characters').max(30),
  experience_level: z.enum(['beginner', 'intermediate', 'advanced']),
  planet_fitness_mode: z.boolean(),
})
type FormData = z.infer<typeof schema>

export default function SignupPage() {
  const router = useRouter()
  const profile = useAppStore(s => s.profile)
  const createProfile = useAppStore(s => s.createProfile)

  useEffect(() => {
    if (profile) router.replace('/dashboard')
  }, [profile, router])

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { experience_level: 'beginner', planet_fitness_mode: false },
  })

  const pfMode = watch('planet_fitness_mode')

  const onSubmit = (data: FormData) => {
    createProfile({
      display_name: data.display_name,
      experience_level: data.experience_level,
      goals: ['strength'],
      planet_fitness_mode: data.planet_fitness_mode,
    })
    router.push('/calculator')
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-white">Start your ascent</h1>
        <p className="text-sm text-gray-400 mt-1">Set up your profile — no account needed</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Your Name"
          placeholder="e.g. Alex or Coach K"
          autoComplete="name"
          {...register('display_name')}
          error={errors.display_name?.message}
        />
        <Select
          label="Experience Level"
          options={[
            { value: 'beginner', label: 'Beginner (< 1 year)' },
            { value: 'intermediate', label: 'Intermediate (1–3 years)' },
            { value: 'advanced', label: 'Advanced (3+ years)' },
          ]}
          {...register('experience_level')}
        />
        <label className="flex items-center gap-3 cursor-pointer py-1">
          <button
            type="button"
            onClick={() => setValue('planet_fitness_mode', !pfMode)}
            className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${pfMode ? 'bg-violet-600' : 'bg-gray-700'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pfMode ? 'translate-x-4' : ''}`} />
          </button>
          <span className="text-sm text-gray-300">I train at Planet Fitness (Smith Machine)</span>
        </label>

        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create Profile
        </Button>
      </form>

      <p className="text-xs text-gray-600 text-center mt-4">
        All data is saved locally in your browser — nothing is sent to a server.
      </p>
    </div>
  )
}
