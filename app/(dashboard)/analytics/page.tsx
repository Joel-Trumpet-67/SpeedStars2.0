'use client'

import { useAppStore } from '@/lib/store'
import { StrengthChart } from '@/components/analytics/StrengthChart'
import { VolumeChart } from '@/components/analytics/VolumeChart'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { format, subWeeks, startOfWeek } from 'date-fns'
import type { WorkoutLog } from '@/types'

export default function AnalyticsPage() {
  const workoutLogs = useAppStore(s => s.workoutLogs)
  const personalRecords = useAppStore(s => s.personalRecords)

  // Build strength chart data from PRs
  const strengthData = personalRecords.reduce(
    (acc: Record<string, { bench?: number; squat?: number; deadlift?: number; ohp?: number }>, pr) => {
      const date = format(new Date(pr.achieved_at), 'MMM d')
      if (!acc[date]) acc[date] = {}
      const n = pr.exercise_name.toLowerCase()
      if (n.includes('bench')) acc[date].bench = pr.estimated_1rm
      else if (n.includes('squat')) acc[date].squat = pr.estimated_1rm
      else if (n.includes('deadlift')) acc[date].deadlift = pr.estimated_1rm
      else if (n.includes('overhead') || n.includes('ohp') || n.includes('press')) acc[date].ohp = pr.estimated_1rm
      return acc
    },
    {}
  )
  const chartData = Object.entries(strengthData).map(([date, vals]) => ({ date, ...vals }))

  // Build weekly volume (last 8 weeks)
  const weeklyVolume: Record<string, number> = {}
  for (let i = 7; i >= 0; i--) {
    const label = format(startOfWeek(subWeeks(new Date(), i)), 'MMM d')
    weeklyVolume[label] = 0
  }
  workoutLogs.forEach((log: WorkoutLog) => {
    const label = format(startOfWeek(new Date(log.completed_at)), 'MMM d')
    if (label in weeklyVolume) weeklyVolume[label] += log.total_volume
  })
  const volumeData = Object.entries(weeklyVolume).map(([week, volume]) => ({ week, volume: Math.round(volume) }))

  const totalVolume = workoutLogs.reduce((s, l) => s + l.total_volume, 0)
  const avgDuration = workoutLogs.length > 0
    ? Math.round(workoutLogs.reduce((s, l) => s + l.duration_seconds, 0) / workoutLogs.length / 60)
    : 0

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-bold text-white">Analytics</h1>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Total Workouts', value: workoutLogs.length },
          { label: 'Total Volume', value: totalVolume > 0 ? `${(totalVolume / 1000).toFixed(0)}k lbs` : '0 lbs' },
          { label: 'Avg Duration', value: `${avgDuration} min` },
          { label: 'PRs Set', value: personalRecords.length },
        ].map(stat => (
          <Card key={stat.label}>
            <p className="text-lg font-bold text-white">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle>Strength Progress (Est. 1RM)</CardTitle></CardHeader>
        <StrengthChart data={chartData} />
      </Card>

      <Card>
        <CardHeader><CardTitle>Weekly Volume</CardTitle></CardHeader>
        <VolumeChart data={volumeData} />
      </Card>

      {personalRecords.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Personal Records</CardTitle></CardHeader>
          <div className="space-y-0">
            {[...personalRecords].sort(
              (a, b) => new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime()
            ).slice(0, 10).map(pr => (
              <div key={pr.id} className="flex justify-between items-center py-2.5 border-b border-gray-800 last:border-0">
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
