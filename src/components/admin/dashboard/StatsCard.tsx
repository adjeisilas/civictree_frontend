import React from 'react'

interface StatsCardProps {
  title: string
  value: string | number
  trendText: string
  isPositive?: boolean
  icon: React.ReactNode
  topBorderColor?: 'emerald' | 'gray' | 'red' | 'amber' | 'blue' | 'teal' | 'black' | 'success' | 'primary' | 'accent'
}

const borderMap = {
  emerald: 'border-t-4 border-t-emerald-500',
  gray: 'border-t-4 border-t-gray-400',
  red: 'border-t-4 border-t-red-500',
  amber: 'border-t-4 border-t-amber-500',
  blue: 'border-t-4 border-t-blue-500',
  teal: 'border-t-4 border-t-teal-500',
  black: 'border-t-4 border-t-gray-900',
  success: 'border-t-4 border-t-success',
  primary: 'border-t-4 border-t-primary',
  accent: 'border-t-4 border-t-accent',
}

const iconColorMap = {
  emerald: 'bg-emerald-50 text-emerald-600',
  gray: 'bg-gray-100 text-gray-600',
  red: 'bg-red-50 text-red-600',
  amber: 'bg-amber-50 text-amber-600',
  blue: 'bg-blue-50 text-blue-600',
  teal: 'bg-teal-50 text-teal-600',
  black: 'bg-gray-100 text-gray-900',
  success: 'bg-emerald-50 text-emerald-600',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-amber-50 text-amber-700',
}

export default function StatsCard({ 
  title, 
  value, 
  trendText, 
  isPositive = true, 
  icon,
  topBorderColor
}: StatsCardProps) {
  const borderClass = topBorderColor ? borderMap[topBorderColor] : ''
  const iconColorClass = topBorderColor ? iconColorMap[topBorderColor] : 'bg-primary/10 text-primary'

  return (
    <div className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow ${borderClass}`}>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-text-primary mt-1.5">{value}</h3>
        <span
          className={`inline-flex items-center text-[11px] font-semibold mt-1 px-2 py-0.5 rounded-md ${
            isPositive
              ? 'text-success bg-emerald-50'
              : 'text-gray-500 bg-gray-100'
          }`}
        >
          {trendText}
        </span>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${iconColorClass}`}>
        {icon}
      </div>
    </div>
  )
}
