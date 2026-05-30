'use client'

import { useState, useEffect, useCallback } from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import Button from '@/components/ui/Button'

interface RestTimerProps {
  defaultSeconds: number
  onComplete?: () => void
}

export function RestTimer({ defaultSeconds, onComplete }: RestTimerProps) {
  const [seconds, setSeconds] = useState(defaultSeconds)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    if (!running) return
    if (seconds <= 0) {
      setRunning(false)
      onComplete?.()
      return
    }
    const t = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [running, seconds, onComplete])

  const reset = useCallback(() => {
    setRunning(false)
    setSeconds(defaultSeconds)
  }, [defaultSeconds])

  const pct = ((defaultSeconds - seconds) / defaultSeconds) * 100
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  const color = seconds <= 10 ? 'text-red-400' : seconds <= 30 ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-4">
      <div className="relative w-14 h-14 shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" fill="none" stroke="#374151" strokeWidth="4" />
          <circle
            cx="28" cy="28" r="24" fill="none" stroke="currentColor"
            strokeWidth="4" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 24}`}
            strokeDashoffset={`${2 * Math.PI * 24 * (1 - pct / 100)}`}
            className={`transition-all duration-1000 ${color}`}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}>
          {mins}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
      <div className="flex-1">
        <p className="text-xs text-gray-500 mb-2">Rest Timer</p>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={() => setRunning(r => !r)}>
            {running ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            {running ? 'Pause' : 'Start'}
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            <RotateCcw className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
