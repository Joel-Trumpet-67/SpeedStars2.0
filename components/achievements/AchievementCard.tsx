import { cn } from '@/lib/utils/cn'
import type { Achievement, AchievementRarity } from '@/types'

const RARITY_STYLES: Record<AchievementRarity, { border: string; glow: string; label: string; labelColor: string }> = {
  common: { border: 'border-gray-700', glow: '', label: 'Common', labelColor: 'text-gray-400' },
  rare: { border: 'border-blue-700', glow: 'shadow-blue-500/10', label: 'Rare', labelColor: 'text-blue-400' },
  epic: { border: 'border-violet-600', glow: 'shadow-violet-500/20', label: 'Epic', labelColor: 'text-violet-400' },
  legendary: { border: 'border-amber-500', glow: 'shadow-amber-500/20', label: 'Legendary', labelColor: 'text-amber-400' },
}

interface AchievementCardProps {
  achievement: Achievement
  earned?: boolean
  earnedAt?: string
}

export function AchievementCard({ achievement, earned = false, earnedAt }: AchievementCardProps) {
  const style = RARITY_STYLES[achievement.rarity]

  return (
    <div className={cn(
      'relative bg-gray-900 border rounded-xl p-4 transition-all duration-200',
      style.border,
      style.glow && `shadow-lg ${style.glow}`,
      !earned && 'opacity-50 grayscale'
    )}>
      {earned && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full" />
      )}

      <div className="flex flex-col items-center text-center gap-2">
        <span className="text-3xl">{achievement.icon}</span>
        <div>
          <h3 className="text-sm font-bold text-white leading-tight">{achievement.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5 leading-snug">{achievement.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-semibold', style.labelColor)}>{style.label}</span>
          <span className="text-xs text-violet-400">+{achievement.xp_reward} XP</span>
        </div>
        {earned && earnedAt && (
          <p className="text-[10px] text-gray-600">
            {new Date(earnedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  )
}
