import { useState } from 'react'
import { formatGhs } from '../../../utils/format'

interface DataPoint {
  month: string
  revenue: number
  x: number
  y: number
}

export default function RevenueTrendChart({ data = [] }: { data: Array<{ month: string, revenue: number }> }) {
  const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null)

  // Map backend data to visual data points. 
  // We use 800 width, 220 height container.
  // Left margin 40, right margin 40. Width = 720. Gap = 720 / max(1, len-1)
  // Rounded up to a readable step so the axis labels land on round numbers
  const peak = Math.max(...data.map(d => d.revenue), 0)
  const step = Math.max(1000, Math.pow(10, Math.floor(Math.log10(Math.max(peak, 1)))) / 2)
  const maxRevenue = Math.max(step * 4, Math.ceil(peak / step) * step)

  // Labels are derived from the same maximum the line is plotted against. They
  // used to be hardcoded at 12,000 down to 4,000, so the axis disagreed with
  // the curve for any revenue above 12,000 - and read "4,000" where zero sits.
  const yAxisTicks = Array.from({ length: 5 }, (_, i) => (maxRevenue / 4) * (4 - i))
  
  const chartData: DataPoint[] = data.map((item, index) => {
    const x = 40 + (index * (720 / Math.max(1, data.length - 1)))
    // Y maps revenue to [34, 189] range (inverted)
    const yRange = 189 - 34
    const y = 189 - ((item.revenue / maxRevenue) * yRange)
    return {
      month: item.month,
      revenue: item.revenue,
      x,
      y
    }
  })

  // Generate simple cubic bezier spline based on calculated points
  let strokePath = ''
  if (chartData.length > 0) {
    strokePath = `M ${chartData[0].x} ${chartData[0].y} `
    for (let i = 1; i < chartData.length; i++) {
      const prev = chartData[i - 1]
      const curr = chartData[i]
      const cpX1 = prev.x + (curr.x - prev.x) / 2
      const cpY1 = prev.y
      const cpX2 = prev.x + (curr.x - prev.x) / 2
      const cpY2 = curr.y
      strokePath += `C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${curr.x} ${curr.y} `
    }
  }



  const areaPath = `
    ${strokePath}
    L 760 220 
    L 40 220 
    Z
  `

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between h-96 relative">
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-serif font-bold text-primary text-lg">Revenue Trend</h3>
            <p className="text-xs text-gray-400">12-Month platform transaction metrics</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#3B82F6]" />
            <span className="text-xs font-bold text-gray-500">GHS Monthly Volume</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative flex-1 mt-6 h-56">
        {/* Y-Axis scale indicator */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs font-semibold text-gray-400 select-none">
          {yAxisTicks.map((tick) => (
            <span key={tick}>{formatGhs(tick)}</span>
          ))}
        </div>

        {/* Ambient Horizontal Grid lines */}
        <div className="absolute left-16 right-0 top-1 bottom-8 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-gray-200 w-full" />
          <div className="border-b border-gray-200 w-full" />
          <div className="border-b border-gray-200 w-full" />
          <div className="border-b border-gray-200 w-full" />
          <div className="border-b border-gray-200 w-full" />
        </div>

        {/* Vector SVG */}
        <div className="absolute left-16 right-0 top-0 bottom-8">
          <svg className="w-full h-full" viewBox="0 0 800 220" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenueGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Filled background area */}
            <path d={areaPath} fill="url(#revenueGlow)" />

            {/* Spline line */}
            <path
              d={strokePath}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {chartData.map((point) => (
              <circle
                key={point.month}
                cx={point.x}
                cy={point.y}
                r={hoveredPoint?.month === point.month ? 6.5 : 4}
                fill={hoveredPoint?.month === point.month ? '#ebc56b' : '#3B82F6'}
                stroke={hoveredPoint?.month === point.month ? '#3B82F6' : '#ffffff'}
                strokeWidth={hoveredPoint?.month === point.month ? 3 : 1.5}
                className="transition-all duration-150 cursor-pointer"
              />
            ))}
          </svg>

          {/* Transparent Hover Interceptors */}
          <div className="absolute inset-0 flex justify-between">
            {chartData.map((point, index) => {
              const widthPct = 100 / Math.max(1, chartData.length)
              return (
                <div
                  key={point.month}
                  style={{
                    width: `${widthPct}%`,
                    left: `${index * widthPct}%`,
                  }}
                  className="absolute top-0 bottom-0 cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(point)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
              )
            })}
          </div>

          {/* Interactive Tooltip Overlay */}
          {hoveredPoint && (
            <div
              className="absolute pointer-events-none transition-all duration-150 z-20"
              style={{
                // Calculate position relative to container
                left: `calc(${(hoveredPoint.x / 800) * 100}% - 55px)`,
                top: `calc(${(hoveredPoint.y / 220) * 100}% - 65px)`,
              }}
            >
              <div className="bg-text-primary text-white rounded-lg px-3 py-1.5 shadow-md flex flex-col items-center min-w-[110px] text-center border border-white/10 glassmorphism-dark">
                <span className="text-xs font-semibold text-accent uppercase leading-none mb-0.5">
                  {hoveredPoint.month}
                </span>
                <span className="text-xs font-bold text-white leading-none">
                  GH₵ {hoveredPoint.revenue.toLocaleString()}
                </span>
                {/* Arrow */}
                <div className="w-1.5 h-1.5 bg-text-primary rotate-45 mt-1 border-r border-b border-white/5" />
              </div>
            </div>
          )}
        </div>

        {/* X-Axis labels */}
        <div className="absolute left-16 right-0 bottom-1 flex justify-between px-2 text-xs font-bold text-gray-400 select-none">
          {chartData.map((item) => (
            <span key={item.month}>{item.month}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
