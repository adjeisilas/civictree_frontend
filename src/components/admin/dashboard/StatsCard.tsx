import React from 'react'

export interface StatsCardProps {
  title: string
  value: string | number
  /**
   * Shorter form of `value` shown below the `sm` breakpoint, where two cards
   * sit side by side and the full figure will not fit. Omit it when `value` is
   * already short — a count, a percentage — and it will be used at every size.
   */
  mobileValue?: string
  /**
   * Supporting line under the figure. Left out entirely when there is nothing
   * true to say — a card with no comparison is better than an invented one.
   */
  detail?: string
  /** Direction of `detail`. 'flat' states it without implying good or bad. */
  trend?: 'up' | 'down' | 'flat'
  icon: React.ReactNode
  /**
   * Colour is reserved for meaning, not decoration. 'critical' marks a figure
   * that needs attention; everything else stays neutral so the one that matters
   * is the one that stands out.
   */
  tone?: 'neutral' | 'critical'
}

const TREND_CLASS: Record<NonNullable<StatsCardProps['trend']>, string> = {
  up: 'text-emerald-700',
  down: 'text-red-700',
  flat: 'text-gray-500',
}

/**
 * Figures are set as large as they fit, measured against the narrowest column
 * they appear in.
 *
 * Two cards abreast on a 320px phone leave roughly 104px for the figure, so the
 * mobile sizes are deliberately small and the longest strings step down again.
 * From `sm` up there is room to let them be the headline they should be.
 */
const valueSizeFor = (value: string): string => {
  if (value.length > 16) return 'text-[15px] sm:text-[22px] lg:text-[26px]'
  if (value.length > 13) return 'text-[17px] sm:text-[26px] lg:text-[30px]'
  if (value.length > 10) return 'text-[19px] sm:text-[30px] lg:text-[32px]'
  return 'text-[21px] sm:text-[32px] lg:text-[34px]'
}

const TrendGlyph = ({ trend }: { trend: NonNullable<StatsCardProps['trend']> }) => {
  if (trend === 'flat') return null
  return (
    <svg
      className="w-3 h-3 shrink-0"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {trend === 'up' ? <path d="M2.5 8.5 6 5l3.5 3.5" /> : <path d="M2.5 3.5 6 7l3.5-3.5" />}
    </svg>
  )
}

/**
 * A single figure on the dashboard.
 *
 * Deliberately flat: a hairline border rather than a shadow, one weight of
 * surface, and no per-card accent colour. Eight cards in eight colours read as
 * decoration and leave nothing able to stand out.
 */
export default function StatsCard({
  title,
  value,
  mobileValue,
  detail,
  trend = 'flat',
  icon,
  tone = 'neutral',
}: StatsCardProps) {
  const isCritical = tone === 'critical'
  const full = String(value)
  const short = mobileValue ?? full

  // Size against whichever string is longer, so neither breakpoint overflows
  const sizeClass = valueSizeFor(short.length > full.length ? short : full)

  return (
    <div
      className={`group bg-white rounded-lg border px-3.5 py-4 sm:px-6 sm:py-5 transition-colors ${
        isCritical ? 'border-red-200 hover:border-red-300' : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs sm:text-sm font-medium text-gray-600 leading-snug">{title}</p>
        {/* The icon costs width the figure needs at 2-up on a phone */}
        <span
          className={`hidden sm:inline shrink-0 transition-colors ${
            isCritical ? 'text-red-400' : 'text-gray-300 group-hover:text-gray-400'
          }`}
          aria-hidden="true"
        >
          {icon}
        </span>
      </div>

      {/* tabular-nums keeps digits from shifting as figures update; the value is
          allowed its own line and never wraps mid-number */}
      <p
        className={`mt-2 sm:mt-3 leading-none font-semibold tabular-nums tracking-tight whitespace-nowrap ${sizeClass} ${
          isCritical ? 'text-red-700' : 'text-text-primary'
        }`}
        title={full}
      >
        {short === full ? (
          full
        ) : (
          <>
            <span className="sm:hidden">{short}</span>
            <span className="hidden sm:inline">{full}</span>
          </>
        )}
      </p>

      {detail ? (
        <p
          className={`mt-2 sm:mt-2.5 flex items-center gap-1 text-[11px] sm:text-[13px] font-medium ${TREND_CLASS[trend]}`}
        >
          <TrendGlyph trend={trend} />
          <span className="truncate">{detail}</span>
        </p>
      ) : (
        /* Keeps every card the same height whether or not it has a detail line */
        <p className="mt-2 sm:mt-2.5 text-[11px] sm:text-[13px] leading-5" aria-hidden="true">
          &nbsp;
        </p>
      )}
    </div>
  )
}
