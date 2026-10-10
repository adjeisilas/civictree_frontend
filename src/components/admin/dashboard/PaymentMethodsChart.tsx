import { useState } from 'react'

interface PaymentMethod {
  id: string
  label: string
  count: number
  color: string
  x: number
  width: number
}

export default function PaymentMethodsChart() {
  const [hoveredBar, setHoveredBar] = useState<PaymentMethod | null>(null)

  // Total orders = 1,340
  const data: PaymentMethod[] = [
    { id: 'momo', label: 'MTN MoMo', count: 555, color: '#F59E0B', x: 25, width: 45 },
    { id: 'telecel', label: 'Telecel', count: 285, color: '#EF4444', x: 105, width: 45 },
    { id: 'airtel', label: 'AirtelTigo', count: 180, color: '#F97316', x: 185, width: 45 },
    { id: 'card', label: 'Visa/MC', count: 320, color: '#3B82F6', x: 265, width: 45 },
  ]

  const maxVal = 600
  const chartHeight = 160

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-96 relative">
      <div>
        <h3 className="font-serif font-bold text-primary text-lg">Payment Methods</h3>
        <p className="text-xs text-gray-400">Order volumes by payment gateway provider</p>
      </div>

      <div className="relative flex-1 mt-6 h-48">
        {/* Y Axis Indicators */}
        <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9px] font-bold text-gray-400 select-none">
          <span>600</span>
          <span>400</span>
          <span>200</span>
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
          <svg className="w-full h-full" viewBox="0 0 340 160" preserveAspectRatio="none">
            {data.map((item) => {
              const barHeight = (item.count / maxVal) * chartHeight
              const yVal = chartHeight - barHeight
              return (
                <g key={item.id}>
                  {/* Background Track */}
                  <rect
                    x={item.x}
                    y="0"
                    width={item.width}
                    height={chartHeight}
                    fill="#f9fafb"
                    rx="6"
                  />
                  {/* Colored Filled Bar */}
                  <rect
                    x={item.x}
                    y={yVal}
                    width={item.width}
                    height={barHeight}
                    fill={item.color}
                    rx="6"
                    className="transition-all duration-200 cursor-pointer hover:opacity-90"
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
                left: `${(hoveredBar.x / 340) * 100}%`,
                top: `${((chartHeight - (hoveredBar.count / maxVal) * chartHeight) / chartHeight) * 100 - 25}%`,
              }}
            >
              <div className="bg-text-primary text-white text-[10px] font-bold rounded px-2 py-1 shadow-md -translate-x-1/4 -translate-y-1/2 whitespace-nowrap glassmorphism-dark">
                {hoveredBar.label}: {hoveredBar.count}
              </div>
            </div>
          )}
        </div>

        {/* X Axis Labels */}
        <div className="absolute left-10 right-0 bottom-1 flex justify-between px-3 text-[10px] font-bold text-gray-400 select-none">
          {data.map((item) => (
            <span key={item.id} className="w-[45px] text-center">
              {item.label.split(' ')[0]}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
