import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StrengthChart } from '@/components/analytics/StrengthChart'
import { VolumeChart } from '@/components/analytics/VolumeChart'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { format, subWeeks, startOfWeek } from 'date-fns'
import type { WorkoutLog } from '@/types'

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: logs } = await supabase
    .from('workout_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('completed_at', { ascending: true })
    .limit(200)

  const { data: prs } = await supabase
    .from('personal_records')
    .select('*')
    .eq('user_id', user.id)
    .order('achieved_at', { ascending: true })

  // Build strength chart data from PRs
  const strengthData = (prs ?? []).reduce((acc: Record<string, { bench?: number; squat?: number; deadlift?: number; ohp?: number }>, pr) => {
    const date = format(new Date(pr.achieved_at), 'MMM d')
    if (!acc[date]) acc[date] = {}
    const name = pr.exercise_name.toLowerCase()
    if (name.includes('bench')) acc[date].bench = pr.estimated_1rm
    else if (name.includes('squat')) acc[date].squat = pr.estimated_1rm
    else if (name.includes('deadlift')) acc[date].deadlift = pr.estimated_1rm
    else if (name.includes('overhead') || name.includes('ohp')) acc[date].ohp = pr.estimated_1rm
    return acc
  }, {})

  // Build volume chart (last 8 weeks)
  const weeklyVolume: Record<string, number> = {}
  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(new Date(), i))
    const label = format(weekStart, 'MMM d')
    weeklyVolume[label] = 0
  }
  ;(logs ?? []).forEach((log: WorkoutLog) => {
    const weekStart = format(startOfWeek(new Date(log.completed_at)), 'MMM d')
    if (weekStart in weeklyVolume) {
      weeklyVolume[weekStart] += log.total_volume
    }
  })

  const volumeData = Object.entries(weeklyVolume).map(([week, volume]) => ({ week, volume: Math.round(volume) }))
  const chartData = Object.entries(strengthData).map(([date, vals]) => ({ date, ...vals }))

  const totalVolume = (logs ?? []).reduce((s: number, l: WorkoutLog) => s + l.total_volume, 0)
  const avgDuration = (logs ?? []).length > 0
    ? Math.round((logs ?? []).reduce((s: number, l: WorkoutLog) => s + l.duration_seconds, 0) / (logs ?? []).length / 60)
    : 0

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Workouts', value: (logs ?? []).length },
          { label: 'Total Volume', value: `${(totalVolume / 1000).toFixed(0)}k lbs` },
          { label: 'Avg Duration', value: `${avgDuration} min` },
          { label: 'PRs Set', value: (prs ?? []).length },
        ].map(stat => (
          <Card key={stat.label}>
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Strength Progress (Estimated 1RM)</CardTitle>
        </CardHeader>
        <StrengthChart data={chartData} />
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Volume</CardTitle>
        </CardHeader>
        <VolumeChart data={volumeData} />
      </Card>

      {(prs ?? []).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Personal Records</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {(prs ?? []).slice(-10).reverse().map((pr) => (
              <div key={pr.id} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-sm font-medium text-white">{pr.exercise_name}</p>
                  <p className="text-xs text-gray-500">{format(new Date(pr.achieved_at), 'MMM d, yyyy')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-amber-400">{pr.weight} × {pr.reps}</p>
                  <p className="text-xs text-gray-500">e1RM: {Math.round(pr.estimated_1rm)} lbs</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
