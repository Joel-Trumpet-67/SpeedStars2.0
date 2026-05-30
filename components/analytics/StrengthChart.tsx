'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface DataPoint {
  date: string
  bench?: number
  squat?: number
  deadlift?: number
  ohp?: number
}

interface StrengthChartProps {
  data: DataPoint[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
      <p className="text-xs text-gray-400 mb-2">{label}</p>
      {payload.map(p => (
        <div key={p.name} className="flex items-center gap-2 text-sm">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-gray-300 capitalize">{p.name}:</span>
          <span className="font-semibold text-white">{p.value} lbs</span>
        </div>
      ))}
    </div>
  )
}

export function StrengthChart({ data }: StrengthChartProps) {
  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center">
        <p className="text-sm text-gray-500">No data yet — complete workouts to see progress</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
        <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} />
        <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
        <Line type="monotone" dataKey="bench" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Bench" />
        <Line type="monotone" dataKey="squat" stroke="#10b981" strokeWidth={2} dot={false} name="Squat" />
        <Line type="monotone" dataKey="deadlift" stroke="#f59e0b" strokeWidth={2} dot={false} name="Deadlift" />
        <Line type="monotone" dataKey="ohp" stroke="#3b82f6" strokeWidth={2} dot={false} name="OHP" />
      </LineChart>
    </ResponsiveContainer>
  )
}
