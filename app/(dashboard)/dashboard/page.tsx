'use client'

import Link from 'next/link'
import { useAppStore } from '@/lib/store'
import { RankCard } from '@/components/dashboard/RankCard'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { TrainingMaxCard } from '@/components/dashboard/TrainingMaxCard'
import { ProgramCard } from '@/components/programs/ProgramCard'
import { Dumbbell, Plus } from 'lucide-react'

export default function DashboardPage() {
  const profile = useAppStore(s => s.profile)
  const trainingMaxes = useAppStore(s => s.trainingMaxes)
  const programs = useAppStore(s => s.programs)
  const workoutLogs = useAppStore(s => s.workoutLogs)
  const personalRecords = useAppStore(s => s.personalRecords)

  if (!profile) return null

  const activeProgram = programs.find(p => p.status === 'active') ?? null

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">
          Welcome back, {profile.display_name}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <RankCard profile={profile} />
      <StatsGrid
        profile={profile}
        workoutCount={workoutLogs.length}
        prCount={personalRecords.length}
      />

      <div className="bg-gradient-to-r from-violet-900/40 to-violet-800/20 border border-violet-700/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-1">Ready to Train?</p>
            <h3 className="font-bold text-white">
              {activeProgram
                ? `${activeProgram.name} — Week ${activeProgram.current_week}`
                : 'Start a Program'}
            </h3>
          </div>
          <Link
            href="/workout"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Dumbbell className="w-4 h-4" />
            Train
          </Link>
        </div>
      </div>

      <TrainingMaxCard trainingMaxes={trainingMaxes} profile={profile} />

      {activeProgram ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Program</h2>
          <ProgramCard program={activeProgram} />
        </div>
      ) : (
        <div className="bg-gray-900 border border-dashed border-gray-700 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-500 mb-3">No active program</p>
          <Link
            href="/programs"
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create a Program
          </Link>
        </div>
      )}
    </div>
  )
}
