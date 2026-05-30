import { cn } from '@/lib/utils/cn'

interface ProgressProps {
  value: number
  max?: number
  className?: string
  barClassName?: string
  showLabel?: boolean
}

export function Progress({ value, max = 100, className, barClassName, showLabel }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))

  return (
    <div className={cn('relative', className)}>
      <div className="h-full w-full bg-gray-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full bg-violet-600 rounded-full transition-all duration-500', barClassName)}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs text-gray-400">{Math.round(pct)}%</span>
      )}
    </div>
  )
}
