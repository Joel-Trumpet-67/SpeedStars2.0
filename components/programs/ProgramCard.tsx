import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Calendar, Dumbbell } from 'lucide-react'
import type { Program } from '@/types'
import Link from 'next/link'

const TYPE_LABELS: Record<string, string> = {
  strength: 'Strength',
  hypertrophy: 'Hypertrophy',
  powerbuilding: 'Powerbuilding',
  fat_loss: 'Fat Loss',
}

const TYPE_COLORS: Record<string, 'violet' | 'success' | 'warning' | 'danger'> = {
  strength: 'violet',
  hypertrophy: 'success',
  powerbuilding: 'warning',
  fat_loss: 'danger',
}

export function ProgramCard({ program }: { program: Program }) {
  const progress = Math.round(((program.current_week - 1) / program.duration_weeks) * 100)
  const daysPerWeek = 4
  const totalWorkouts = program.duration_weeks * daysPerWeek
  const completedWorkouts = ((program.current_week - 1) * daysPerWeek) + (program.current_day - 1)

  return (
    <Card className="hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{program.name}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <Badge variant={TYPE_COLORS[program.type] ?? 'default'}>
              {TYPE_LABELS[program.type]}
            </Badge>
            <Badge variant={program.status === 'active' ? 'success' : 'default'}>
              {program.status}
            </Badge>
            {program.planet_fitness_mode && (
              <Badge variant="warning">Planet Fitness</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Week {program.current_week} of {program.duration_weeks}</span>
          <span>{completedWorkouts}/{totalWorkouts} workouts</span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-600 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>{program.duration_weeks} weeks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Dumbbell className="w-3.5 h-3.5" />
          <span>4 days/week</span>
        </div>
      </div>

      {program.status === 'active' && (
        <Link
          href="/workout"
          className="block w-full text-center bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold py-2 rounded-lg transition-colors"
        >
          Continue Training
        </Link>
      )}
    </Card>
  )
}
