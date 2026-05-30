import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AchievementCard } from '@/components/achievements/AchievementCard'
import type { Achievement, UserAchievement } from '@/types'

export default async function AchievementsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: allAchievements }, { data: userAchievements }] = await Promise.all([
    supabase.from('achievements').select('*').order('condition_value', { ascending: true }),
    supabase.from('user_achievements').select('*, achievement:achievements(*)').eq('user_id', user.id),
  ])

  const earnedIds = new Set((userAchievements ?? []).map((ua: UserAchievement) => ua.achievement_id))
  const earned = (userAchievements ?? []) as UserAchievement[]

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Achievements</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {earned.length} / {(allAchievements ?? []).length} unlocked
        </p>
      </div>

      {/* Earned section */}
      {earned.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Earned ({earned.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {earned.map(ua => (
              <AchievementCard
                key={ua.id}
                achievement={ua.achievement}
                earned
                earnedAt={ua.achieved_at}
              />
            ))}
          </div>
        </section>
      )}

      {/* Locked section */}
      <section>
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Locked ({(allAchievements ?? []).filter((a: Achievement) => !earnedIds.has(a.id)).length})
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {(allAchievements ?? [])
            .filter((a: Achievement) => !earnedIds.has(a.id))
            .map((achievement: Achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} earned={false} />
            ))}
        </div>
      </section>
    </div>
  )
}
