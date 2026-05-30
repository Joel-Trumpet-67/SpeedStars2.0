import { Card } from '@/components/ui/Card'
import { Flame, Zap, Dumbbell, TrendingUp } from 'lucide-react'
import type { UserProfile } from '@/types'

interface Props {
  profile: UserProfile
  workoutCount?: number
  prCount?: number
}

function StatBox({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: string | number; color: string
}) {
  return (
    <Card className="flex items-center gap-3">
      <div className={`p-2.5 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-lg font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </Card>
  )
}

export function StatsGrid({ profile, workoutCount = 0, prCount = 0 }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <StatBox
        icon={Flame}
        label="Day Streak"
        value={profile.streak}
        color="bg-orange-900/50 text-orange-400"
      />
      <StatBox
        icon={Zap}
        label="Total XP"
        value={profile.xp.toLocaleString()}
        color="bg-violet-900/50 text-violet-400"
      />
      <StatBox
        icon={Dumbbell}
        label="Workouts"
        value={workoutCount}
        color="bg-blue-900/50 text-blue-400"
      />
      <StatBox
        icon={TrendingUp}
        label="PRs Set"
        value={prCount}
        color="bg-emerald-900/50 text-emerald-400"
      />
    </div>
  )
}
