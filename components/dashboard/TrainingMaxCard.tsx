import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Target } from 'lucide-react'
import type { TrainingMaxes, UserProfile } from '@/types'

interface Props {
  trainingMaxes: TrainingMaxes
  profile: UserProfile
}

function LiftRow({ label, barbell, smith, pfMode }: { label: string; barbell: number; smith?: number; pfMode: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-800 last:border-0">
      <span className="text-sm font-medium text-gray-300">{label}</span>
      <div className="flex items-center gap-3">
        {pfMode && smith !== undefined && smith > 0 ? (
          <>
            <div className="text-right">
              <p className="text-xs text-gray-500">Smith TM</p>
              <p className="text-sm font-bold text-violet-400">{smith} lbs</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Barbell TM</p>
              <p className="text-sm font-semibold text-gray-400">{barbell} lbs</p>
            </div>
          </>
        ) : (
          <div className="text-right">
            <p className="text-xs text-gray-500">Training Max</p>
            <p className="text-sm font-bold text-white">{barbell} lbs</p>
          </div>
        )}
      </div>
    </div>
  )
}

export function TrainingMaxCard({ trainingMaxes: tm, profile }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Maxes</CardTitle>
        <Target className="w-4 h-4 text-gray-600" />
      </CardHeader>
      <div>
        <LiftRow label="Bench Press" barbell={tm.bench_barbell} smith={tm.bench_smith} pfMode={profile.planet_fitness_mode} />
        <LiftRow label="Back Squat" barbell={tm.squat_barbell} smith={tm.squat_smith} pfMode={profile.planet_fitness_mode} />
        <LiftRow label="Deadlift" barbell={tm.deadlift} pfMode={false} />
        <LiftRow label="Overhead Press" barbell={tm.ohp_barbell} smith={tm.ohp_smith} pfMode={profile.planet_fitness_mode} />
      </div>
    </Card>
  )
}
