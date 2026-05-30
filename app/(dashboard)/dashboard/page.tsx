import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RankCard } from '@/components/dashboard/RankCard'
import { StatsGrid } from '@/components/dashboard/StatsGrid'
import { TrainingMaxCard } from '@/components/dashboard/TrainingMaxCard'
import { ProgramCard } from '@/components/programs/ProgramCard'
import { Dumbbell, Plus } from 'lucide-react'
import type { UserProfile, TrainingMaxes, Program } from '@/types'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: profile },
    { data: trainingMaxes },
    { data: activeProgram },
    { count: workoutCount },
    { count: prCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    supabase.from('training_maxes').select('*').eq('user_id', user.id).single(),
    supabase.from('programs').select('*').eq('user_id', user.id).eq('status', 'active').order('created_at', { ascending: false }).limit(1).single(),
    supabase.from('workout_logs').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('personal_records').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  if (!profile || !trainingMaxes) redirect('/profile')

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">
          Welcome back, {(profile as UserProfile).display_name}
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <RankCard profile={profile as UserProfile} />
      <StatsGrid
        profile={profile as UserProfile}
        workoutCount={workoutCount ?? 0}
        prCount={prCount ?? 0}
      />

      {/* Today's Workout CTA */}
      <div className="bg-gradient-to-r from-violet-900/40 to-violet-800/20 border border-violet-700/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-wider mb-1">Ready to Train?</p>
            <h3 className="font-bold text-white">
              {activeProgram ? `${(activeProgram as Program).name} — Week ${(activeProgram as Program).current_week}` : 'Start a Program'}
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

      <TrainingMaxCard trainingMaxes={trainingMaxes as TrainingMaxes} profile={profile as UserProfile} />

      {activeProgram ? (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Active Program</h2>
          <ProgramCard program={activeProgram as Program} />
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
