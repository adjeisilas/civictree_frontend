import { useState } from 'react'

interface Segment {
  id: string
  label: string
  count: number
  percentage: number
  color: string
  borderColor: string
  dashLength: number
  dashOffset: number
}

export default function VoucherSalesChart({ data }: { data: { WASSCE_NOVDEC?: number, WASSCE?: number, BECE: number, NOVDEC?: number } }) {
  const [hoveredSegment, setHoveredSegment] = useState<Segment | null>(null)

  const wassceNovdecVal = (data.WASSCE_NOVDEC || 0) + (data.WASSCE || 0) + (data.NOVDEC || 0)
  const totalSales = wassceNovdecVal + data.BECE || 1
  const circumference = 314.16

  const wassceNovdecPct = (wassceNovdecVal / totalSales) * 100
  const becePct = (data.BECE / totalSales) * 100

  const segments: Segment[] = [
    {
      id: 'wassce_novdec',
      label: 'WASSCE / NOVDEC',
      count: wassceNovdecVal,
      percentage: Number(wassceNovdecPct.toFixed(1)),
      color: '#8B5CF6',
      borderColor: 'border-[#8B5CF6]',
      dashLength: (wassceNovdecPct / 100) * circumference,
      dashOffset: 0,
    },
    {
      id: 'bece',
      label: 'BECE Checker',
      count: data.BECE,
      percentage: Number(becePct.toFixed(1)),
      color: '#FBBF24',
      borderColor: 'border-[#FBBF24]',
      dashLength: (becePct / 100) * circumference,
      dashOffset: -((wassceNovdecPct / 100) * circumference),
    },
  ]

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-96">
      <div>
        <h3 className="font-serif font-bold text-primary text-lg">Voucher Sales by Type</h3>
        <p className="text-xs text-gray-400">Distribution across major exams</p>
      </div>

      {/* SVG Donut Container */}
      <div className="relative flex items-center justify-center my-4 h-40">
        <svg
          className="w-40 h-40 transform -rotate-90 select-none"
          viewBox="0 0 120 120"
        >
          {/* Base track */}
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="10"
          />

          {/* Dynamic segments */}
          {segments.map((seg) => (
            <circle
              key={seg.id}
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={seg.color}
              strokeWidth={hoveredSegment?.id === seg.id ? '13' : '10'}
              strokeDasharray="314.16"
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="round"
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredSegment(seg)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-[10px] uppercase font-bold text-gray-400 leading-none">
            {hoveredSegment ? hoveredSegment.label.split(' ')[0] : 'Total Sales'}
          </span>
          <span className="text-base font-bold text-text-primary mt-1 leading-none">
            {hoveredSegment
              ? `${hoveredSegment.count.toLocaleString()} (${hoveredSegment.percentage}%)`
              : `${(wassceNovdecVal + data.BECE).toLocaleString()} Sold`}
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-2 gap-2">
        {segments.map((seg) => (
          <div
            key={seg.id}
            className={`p-2 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
              hoveredSegment?.id === seg.id
                ? 'bg-gray-50 border-gray-200 shadow-sm'
                : 'border-transparent hover:bg-gray-50/50'
            }`}
            onMouseEnter={() => setHoveredSegment(seg)}
            onMouseLeave={() => setHoveredSegment(null)}
          >
            <div className="flex items-center justify-center space-x-1.5 mb-0.5">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                {seg.id === 'wassce_novdec' ? 'WASSCE / NOVDEC' : seg.id}
              </span>
            </div>
            <div className="text-xs font-bold text-text-primary">
              {seg.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
