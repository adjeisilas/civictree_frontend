import { useState } from 'react'
import { VOUCHER_TYPES } from '../../../config/voucherTypes'
import type { ExamType } from '../../../types/admin'

interface Segment {
  id: ExamType
  label: string
  count: number
  percentage: number
  color: string
  dashLength: number
  dashOffset: number
}

/** r=50 donut, so 2πr. Segment lengths are fractions of this. */
const CIRCUMFERENCE = 314.16

/**
 * Sales counts keyed by voucher type. Older responses used `WASSCE` and
 * `NOVDEC` separately, so both still fold into WASSCE/NOVDEC.
 */
type SalesByType = Partial<Record<ExamType, number>> & {
  WASSCE?: number
  NOVDEC?: number
}

export default function VoucherSalesChart({ data }: { data: SalesByType }) {
  const [hoveredSegment, setHoveredSegment] = useState<Segment | null>(null)

  const countFor = (type: ExamType) => {
    const base = data[type] || 0
    // Fold the legacy split keys into WASSCE/NOVDEC
    return type === 'WASSCE_NOVDEC' ? base + (data.WASSCE || 0) + (data.NOVDEC || 0) : base
  }

  const counts = VOUCHER_TYPES.map((voucher) => ({ voucher, count: countFor(voucher.type) }))
  const totalSales = counts.reduce((sum, c) => sum + c.count, 0)

  const arcLength = (count: number) =>
    totalSales > 0 ? (count / totalSales) * CIRCUMFERENCE : 0

  // Each arc starts where the previous ones ended, so its offset is the total
  // length of everything before it
  const segments: Segment[] = counts.map(({ voucher, count }, index) => {
    const precedingLength = counts
      .slice(0, index)
      .reduce((sum, earlier) => sum + arcLength(earlier.count), 0)

    return {
      id: voucher.type,
      label: voucher.displayName,
      count,
      percentage: Number((totalSales > 0 ? (count / totalSales) * 100 : 0).toFixed(1)),
      color: voucher.accent.chartColor,
      dashLength: arcLength(count),
      dashOffset: -precedingLength,
    }
  })

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between h-96">
      <div>
        <h3 className="font-serif font-bold text-primary text-lg">Voucher Sales by Type</h3>
        <p className="text-xs text-gray-400">Distribution across major exams</p>
      </div>

      {/* SVG Donut Container */}
      <div className="relative flex items-center justify-center my-4 h-40">
        <svg className="w-40 h-40 transform -rotate-90 select-none" viewBox="0 0 120 120">
          {/* Base track */}
          <circle cx="60" cy="60" r="50" fill="none" stroke="#f3f4f6" strokeWidth="10" />

          {/* One arc per voucher type */}
          {segments.map((seg) => (
            <circle
              key={seg.id}
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke={seg.color}
              strokeWidth={hoveredSegment?.id === seg.id ? '13' : '10'}
              strokeDasharray={`${seg.dashLength} ${CIRCUMFERENCE}`}
              strokeDashoffset={seg.dashOffset}
              strokeLinecap="butt"
              className="transition-all duration-200 cursor-pointer"
              onMouseEnter={() => setHoveredSegment(seg)}
              onMouseLeave={() => setHoveredSegment(null)}
            />
          ))}
        </svg>

        {/* Center label */}
        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-xs uppercase font-bold text-gray-400 leading-none">
            {hoveredSegment ? hoveredSegment.label : 'Total Sales'}
          </span>
          <span className="text-base font-bold text-text-primary mt-1 leading-none">
            {hoveredSegment
              ? `${hoveredSegment.count.toLocaleString()} (${hoveredSegment.percentage}%)`
              : `${totalSales.toLocaleString()} Sold`}
          </span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-3 gap-2">
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
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-xs font-bold text-gray-500 truncate">
                {seg.label}
              </span>
            </div>
            <div className="text-xs font-bold text-text-primary">{seg.count}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
