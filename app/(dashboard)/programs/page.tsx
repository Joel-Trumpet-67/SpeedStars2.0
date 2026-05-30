'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ListChecks } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { ProgramCard } from '@/components/programs/ProgramCard'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import type { Program, ProgramType, ProgramDuration } from '@/types'

const PROGRAM_TYPES = [
  { value: 'strength', label: 'Strength — Low reps, high intensity (5/3/1 style)' },
  { value: 'hypertrophy', label: 'Hypertrophy — Moderate reps, muscle building' },
  { value: 'powerbuilding', label: 'Powerbuilding — Hybrid strength + size' },
  { value: 'fat_loss', label: 'Fat Loss — Higher reps, circuit style' },
]

const DURATIONS = [
  { value: '4', label: '4 Weeks' },
  { value: '8', label: '8 Weeks' },
  { value: '12', label: '12 Weeks' },
  { value: '16', label: '16 Weeks' },
]

export default function ProgramsPage() {
  const router = useRouter()
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [pfMode, setPfMode] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'strength', duration: '8' })

  const load = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const [{ data: progs }, { data: p }] = await Promise.all([
      supabase.from('programs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('profiles').select('planet_fitness_mode').eq('id', user.id).single(),
    ])
    setPrograms((progs ?? []) as Program[])
    if (p) setPfMode(p.planet_fitness_mode)
    setLoading(false)
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const createProgram = async () => {
    if (!form.name.trim()) return
    setCreating(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('programs').update({ status: 'paused' }).eq('user_id', user.id).eq('status', 'active')

    await supabase.from('programs').insert({
      user_id: user.id,
      name: form.name,
      type: form.type as ProgramType,
      duration_weeks: parseInt(form.duration) as ProgramDuration,
      current_week: 1,
      current_day: 1,
      status: 'active',
      planet_fitness_mode: pfMode,
    })

    setShowModal(false)
    setForm({ name: '', type: 'strength', duration: '8' })
    setCreating(false)
    load()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  )

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Programs</h1>
          <p className="text-sm text-gray-500 mt-0.5">{programs.length} program{programs.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          New Program
        </Button>
      </div>

      {programs.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-800 rounded-xl">
          <ListChecks className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">No programs yet</p>
          <Button onClick={() => setShowModal(true)}>Create Your First Program</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map(p => <ProgramCard key={p.id} program={p} />)}
        </div>
      )}

      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Program">
        <div className="space-y-4">
          <Input
            label="Program Name"
            placeholder="e.g. Summer Strength Block"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          />
          <Select
            label="Program Type"
            options={PROGRAM_TYPES}
            value={form.type}
            onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
          />
          <Select
            label="Duration"
            options={DURATIONS}
            value={form.duration}
            onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
          />
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setPfMode(m => !m)}
              className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 ${pfMode ? 'bg-violet-600' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pfMode ? 'translate-x-4' : ''}`} />
            </div>
            <span className="text-sm text-gray-300">Planet Fitness Mode (Smith Machine)</span>
          </label>
          <Button onClick={createProgram} loading={creating} className="w-full">
            Create Program
          </Button>
        </div>
      </Modal>
    </div>
  )
}
