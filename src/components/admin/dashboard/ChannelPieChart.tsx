import { useState } from 'react'

interface ChannelSector {
  id: string
  label: string
  count: number
  percentage: number
  color: string
  dashLength: number
  dashOffset: number
}

export default function ChannelPieChart({ data }: { data: { WEB: number, USSD: number } }) {
  const [hoveredSector, setHoveredSector] = useState<ChannelSector | null>(null)

  const totalOrders = (data.WEB || 0) + (data.USSD || 0) || 1
  const webPct = (data.WEB / totalOrders) * 100
  const ussdPct = (data.USSD / totalOrders) * 100
  const circumference = 157.08 // 2 * Math.PI * 25

  const sectors: ChannelSector[] = [
    {
      id: 'website',
      label: 'Website Orders',
      count: data.WEB || 0,
      percentage: Number(webPct.toFixed(1)),
      color: '#EC4899', 
      dashLength: (webPct / 100) * circumference,
      dashOffset: 0,
    },
    {
      id: 'ussd',
      label: 'USSD Orders',
      count: data.USSD || 0,
      percentage: Number(ussdPct.toFixed(1)),
      color: '#84CC16',
      dashLength: (ussdPct / 100) * circumference,
      dashOffset: -((webPct / 100) * circumference),
    },
  ]

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-96">
      <div>
        <h3 className="font-serif font-bold text-primary text-lg">Orders by Channel</h3>
        <p className="text-xs text-gray-400">Web client vs USSD shortcode portals</p>
      </div>

      {/* SVG Pie Chart */}
      <div className="relative flex items-center justify-center my-4 h-40">
        <svg
          className="w-40 h-40 transform -rotate-90 select-none"
          viewBox="0 0 100 100"
        >
          {sectors.map((sec) => (
            <circle
              key={sec.id}
              cx="50"
              cy="50"
              r="25"
              fill="none"
              stroke={sec.color}
              strokeWidth={hoveredSector?.id === sec.id ? '28' : '25'}
              strokeDasharray="157.08"
              strokeDashoffset={sec.dashOffset}
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredSector(sec)}
              onMouseLeave={() => setHoveredSector(null)}
            />
          ))}
        </svg>

        {/* Hover Center Overlay Tag */}
        {hoveredSector && (
          <div className="absolute pointer-events-none bg-text-primary text-white rounded-lg px-2.5 py-1 shadow-md text-center max-w-[120px] glassmorphism-dark">
            <div className="text-[9px] uppercase font-bold text-accent leading-none">
              {hoveredSector.id}
            </div>
            <div className="text-[11px] font-bold mt-0.5 leading-none">
              {hoveredSector.count} ({hoveredSector.percentage}%)
            </div>
          </div>
        )}
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-4">
        {sectors.map((sec) => (
          <div
            key={sec.id}
            className={`p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
              hoveredSector?.id === sec.id
                ? 'bg-gray-50 border-gray-200 shadow-sm'
                : 'border-transparent hover:bg-gray-50/50'
            }`}
            onMouseEnter={() => setHoveredSector(sec)}
            onMouseLeave={() => setHoveredSector(null)}
          >
            <div className="flex items-center justify-center space-x-2 mb-1">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: sec.color }}
              />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                {sec.id}
              </span>
            </div>
            <div className="text-sm font-bold text-text-primary">
              {sec.count} ({sec.percentage}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
