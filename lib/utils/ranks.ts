import { Rank, RANK_THRESHOLDS, RANK_ORDER } from '@/types'

export function getRankFromXP(xp: number): Rank {
  let rank: Rank = 'Recruit'
  for (const r of RANK_ORDER) {
    if (xp >= RANK_THRESHOLDS[r]) rank = r
    else break
  }
  return rank
}

export function getNextRank(rank: Rank): Rank | null {
  const idx = RANK_ORDER.indexOf(rank)
  return idx < RANK_ORDER.length - 1 ? RANK_ORDER[idx + 1] : null
}

export function getXPForNextRank(xp: number): number | null {
  const rank = getRankFromXP(xp)
  const next = getNextRank(rank)
  return next ? RANK_THRESHOLDS[next] : null
}

export function getRankProgress(xp: number): number {
  const rank = getRankFromXP(xp)
  const next = getNextRank(rank)
  if (!next) return 100
  const current = RANK_THRESHOLDS[rank]
  const target = RANK_THRESHOLDS[next]
  return Math.min(100, Math.round(((xp - current) / (target - current)) * 100))
}

export function getRankColor(rank: Rank): string {
  const map: Record<Rank, string> = {
    Recruit: 'text-gray-400',
    Private: 'text-gray-300',
    Corporal: 'text-blue-400',
    Sergeant: 'text-blue-300',
    Lieutenant: 'text-emerald-400',
    Captain: 'text-emerald-300',
    Major: 'text-violet-400',
    Colonel: 'text-violet-300',
    General: 'text-amber-400',
    Elite: 'text-orange-400',
    Legend: 'text-red-400',
  }
  return map[rank]
}

export function getRankBgColor(rank: Rank): string {
  const map: Record<Rank, string> = {
    Recruit: 'bg-gray-700',
    Private: 'bg-gray-600',
    Corporal: 'bg-blue-900',
    Sergeant: 'bg-blue-800',
    Lieutenant: 'bg-emerald-900',
    Captain: 'bg-emerald-800',
    Major: 'bg-violet-900',
    Colonel: 'bg-violet-800',
    General: 'bg-amber-900',
    Elite: 'bg-orange-900',
    Legend: 'bg-red-900',
  }
  return map[rank]
}

export function getRankIcon(rank: Rank): string {
  const map: Record<Rank, string> = {
    Recruit: '🪖',
    Private: '🎖️',
    Corporal: '🔵',
    Sergeant: '⭐',
    Lieutenant: '🌟',
    Captain: '💫',
    Major: '👑',
    Colonel: '💜',
    General: '🔱',
    Elite: '⚡',
    Legend: '🔥',
  }
  return map[rank]
}

export function getRankBorderColor(rank: Rank): string {
  const map: Record<Rank, string> = {
    Recruit: 'border-gray-600',
    Private: 'border-gray-500',
    Corporal: 'border-blue-600',
    Sergeant: 'border-blue-500',
    Lieutenant: 'border-emerald-600',
    Captain: 'border-emerald-500',
    Major: 'border-violet-600',
    Colonel: 'border-violet-500',
    General: 'border-amber-500',
    Elite: 'border-orange-500',
    Legend: 'border-red-500',
  }
  return map[rank]
}

export function getRankBadgeClass(rank: Rank): string {
  return [
    'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
    getRankColor(rank),
    getRankBgColor(rank),
    getRankBorderColor(rank),
  ].join(' ')
}
