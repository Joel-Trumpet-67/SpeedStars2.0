import { Card } from '@/components/ui/Card'
import { Progress } from '@/components/ui/Progress'
import { getRankColor, getRankIcon, getRankProgress, getNextRank, getXPForNextRank } from '@/lib/utils/ranks'
import type { UserProfile } from '@/types'

export function RankCard({ profile }: { profile: UserProfile }) {
  const progress = getRankProgress(profile.xp)
  const next = getNextRank(profile.rank)
  const xpForNext = getXPForNextRank(profile.xp)

  return (
    <Card glow className="col-span-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Current Rank</p>
          <div className="flex items-center gap-2">
            <span className="text-3xl">{getRankIcon(profile.rank)}</span>
            <span className={`text-2xl font-black tracking-tight ${getRankColor(profile.rank)}`}>
              {profile.rank}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Total XP</p>
          <p className="text-2xl font-bold text-white">{profile.xp.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-500">
          <span>{profile.rank}</span>
          {next && <span>{next}</span>}
        </div>
        <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
        {next && xpForNext !== null && (
          <p className="text-xs text-gray-500 text-right">
            {(xpForNext - profile.xp).toLocaleString()} XP to {next}
          </p>
        )}
        {!next && (
          <p className="text-xs text-red-400 text-right font-semibold">MAX RANK ACHIEVED</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-800">
        <div className="text-center">
          <p className="text-lg font-bold text-white">{profile.streak}</p>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>
        <div className="text-center border-x border-gray-800">
          <p className="text-lg font-bold text-emerald-400">{progress}%</p>
          <p className="text-xs text-gray-500">To Next</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-white capitalize">{profile.experience_level}</p>
          <p className="text-xs text-gray-500">Level</p>
        </div>
      </div>
    </Card>
  )
}
