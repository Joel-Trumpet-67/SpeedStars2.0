'use client'

import { useState } from 'react'
import { Plus, ListChecks } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { ProgramCard } from '@/components/programs/ProgramCard'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import type { ProgramType, ProgramDuration } from '@/types'

const PROGRAM_TYPES = [
  { value: 'strength', label: 'Strength — 5/3/1 style, low reps' },
  { value: 'hypertrophy', label: 'Hypertrophy — Moderate reps, muscle building' },
  { value: 'powerbuilding', label: 'Powerbuilding — Hybrid strength + size' },
  { value: 'fat_loss', label: 'Fat Loss — Higher reps, circuit style' },
]

const DURATIONS = [
  { value: '4', label: '4 Weeks' },
  { value: '8', label: '8 Weeks (Recommended)' },
  { value: '12', label: '12 Weeks' },
  { value: '16', label: '16 Weeks — Full Peak Cycle' },
]

export default function ProgramsPage() {
  const programs = useAppStore(s => s.programs)
  const profile = useAppStore(s => s.profile)
  const createProgram = useAppStore(s => s.createProgram)

  const [showModal, setShowModal] = useState(false)
  const [pfMode, setPfMode] = useState(profile?.planet_fitness_mode ?? false)
  const [form, setForm] = useState({ name: '', type: 'strength', duration: '8' })

  const handleCreate = () => {
    if (!form.name.trim()) return
    createProgram({
      name: form.name,
      type: form.type as ProgramType,
      duration_weeks: parseInt(form.duration) as ProgramDuration,
      planet_fitness_mode: pfMode,
    })
    setShowModal(false)
    setForm({ name: '', type: 'strength', duration: '8' })
  }

  const sorted = [...programs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
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
          New
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-gray-800 rounded-xl">
          <ListChecks className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-4">No programs yet</p>
          <Button onClick={() => setShowModal(true)}>Create Your First Program</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(p => <ProgramCard key={p.id} program={p} />)}
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
            label="Type"
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
            <button
              type="button"
              onClick={() => setPfMode(m => !m)}
              className={`w-10 h-6 rounded-full transition-colors flex items-center px-1 shrink-0 ${pfMode ? 'bg-violet-600' : 'bg-gray-700'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full transition-transform ${pfMode ? 'translate-x-4' : ''}`} />
            </button>
            <span className="text-sm text-gray-300">Planet Fitness Mode</span>
          </label>
          <Button onClick={handleCreate} disabled={!form.name.trim()} className="w-full">
            Create Program
          </Button>
        </div>
      </Modal>
    </div>
  )
}
