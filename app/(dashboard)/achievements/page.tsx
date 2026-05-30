'use client'

import { useAppStore } from '@/lib/store'
import { ACHIEVEMENTS } from '@/lib/data/achievements'
import { AchievementCard } from '@/components/achievements/AchievementCard'

export default function AchievementsPage() {
  const userAchievements = useAppStore(s => s.userAchievements)
  const earnedIds = new Set(userAchievements.map(ua => ua.achievement_id))

  const earned = ACHIEVEMENTS.filter(a => earnedIds.has(a.id))
  const locked = ACHIEVEMENTS.filter(a => !earnedIds.has(a.id))

  const earnedMap = Object.fromEntries(userAchievements.map(ua => [ua.achievement_id, ua.achieved_at]))

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Achievements</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {earned.length} / {ACHIEVEMENTS.length} unlocked
        </p>
      </div>

      {earned.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Earned ({earned.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {earned.map(a => (
              <AchievementCard
                key={a.id}
                achievement={a}
                earned
                earnedAt={earnedMap[a.id]}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Locked ({locked.length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {locked.map(a => (
            <AchievementCard key={a.id} achievement={a} earned={false} />
          ))}
        </div>
      </section>
    </div>
  )
}
