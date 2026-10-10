import { useState } from 'react'

interface DailyData {
  day: string
  label: string
  count: number
  x: number
  width: number
}

export default function DailyOrdersChart({ data: propData }: { data: Array<{ day: string, count: number }> }) {
  const [hoveredBar, setHoveredBar] = useState<DailyData | null>(null)

  const data: DailyData[] = (propData || []).map((item, index) => ({
    day: item.day,
    label: item.day, // can map to full day name if needed
    count: item.count,
    x: 15 + index * 40,
    width: 25,
  }))

  const maxVal = Math.max(...data.map(d => d.count), 300)
  const chartHeight = 160

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-96 relative">
      <div>
        <h3 className="font-serif font-bold text-primary text-lg">Daily Orders</h3>
        <p className="text-xs text-gray-400">Transaction counts over the current week</p>
      </div>

      <div className="relative flex-1 mt-6 h-48">
        {/* Y Axis Indicators */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] font-bold text-gray-400 select-none">
          <span>{Math.round(maxVal)}</span>
          <span>{Math.round(maxVal * 0.66)}</span>
          <span>{Math.round(maxVal * 0.33)}</span>
          <span>0</span>
        </div>

        {/* Grid lines */}
        <div className="absolute left-10 right-0 top-1 bottom-6 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-gray-100 w-full" />
          <div className="border-b border-gray-100 w-full" />
          <div className="border-b border-gray-100 w-full" />
          <div className="border-b border-gray-100/50 w-full" />
        </div>

        {/* SVG Bars */}
        <div className="absolute left-10 right-0 top-0 bottom-6">
          <svg className="w-full h-full" viewBox="0 0 300 160" preserveAspectRatio="none">
            {data.map((item) => {
              const barHeight = (item.count / maxVal) * chartHeight
              const yVal = chartHeight - barHeight
              return (
                <g key={item.day}>
                  {/* Background Track */}
                  <rect
                    x={item.x}
                    y="0"
                    width={item.width}
                    height={chartHeight}
                    fill="#f9fafb"
                    rx="4"
                  />
                  {/* Colored Filled Bar */}
                  <rect
                    x={item.x}
                    y={yVal}
                    width={item.width}
                    height={barHeight}
                    fill="#6366F1" // Indigo
                    rx="4"
                    className="transition-all duration-200 cursor-pointer hover:fill-indigo-500"
                    onMouseEnter={() => setHoveredBar(item)}
                    onMouseLeave={() => setHoveredBar(null)}
                  />
                </g>
              )
            })}
          </svg>

          {/* Interactive Tooltip */}
          {hoveredBar && (
            <div
              className="absolute pointer-events-none transition-all duration-150 z-20"
              style={{
                left: `${(hoveredBar.x / 300) * 100}%`,
                top: `${((chartHeight - (hoveredBar.count / maxVal) * chartHeight) / chartHeight) * 100 - 25}%`,
              }}
            >
              <div className="bg-text-primary text-white text-[10px] font-bold rounded px-2 py-1 shadow-md -translate-x-1/4 -translate-y-1/2 whitespace-nowrap glassmorphism-dark">
                {hoveredBar.label}: {hoveredBar.count} orders
              </div>
            </div>
          )}
        </div>

        {/* X Axis Labels */}
        <div className="absolute left-10 right-0 bottom-1 flex justify-between px-1 text-[10px] font-bold text-gray-400 select-none">
          {data.map((item) => (
            <span key={item.day} className="w-[25px] text-center">
              {item.day}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
