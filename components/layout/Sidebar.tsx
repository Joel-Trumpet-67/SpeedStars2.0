'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Dumbbell, BarChart2, Trophy, User, Calculator, ListChecks, LogOut, Zap } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUser } from '@/hooks/useUser'
import { getRankIcon } from '@/lib/utils/ranks'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/workout', label: 'Workout', icon: Dumbbell },
  { href: '/programs', label: 'Programs', icon: ListChecks },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/achievements', label: 'Achievements', icon: Trophy },
  { href: '/calculator', label: 'Calculator', icon: Calculator },
  { href: '/profile', label: 'Profile', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { profile, signOut } = useUser()

  return (
    <aside className="hidden md:flex flex-col w-60 bg-gray-950 border-r border-gray-800 h-screen sticky top-0">
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Zap className="w-6 h-6 text-violet-500" />
          <span className="text-xl font-black text-white tracking-tight">ASCEND</span>
        </div>
      </div>

      {profile && (
        <div className="p-4 border-b border-gray-800">
          <p className="text-sm font-semibold text-white truncate">{profile.display_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {getRankIcon(profile.rank)} {profile.rank} · {profile.xp.toLocaleString()} XP
          </p>
        </div>
      )}

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-violet-600/20 text-violet-400 border border-violet-600/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-gray-800">
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-900/20 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
