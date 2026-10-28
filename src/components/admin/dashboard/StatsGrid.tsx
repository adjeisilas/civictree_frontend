import {
  Banknote,
  ShoppingBag,
  CircleCheck,
  TriangleAlert,
  Package,
  Users,
  MessageSquare,
  Receipt,
  type LucideIcon,
} from 'lucide-react'
import StatsCard from './StatsCard'
import type { KpiStat } from '../../../types/admin'

interface StatsGridProps {
  stats?: KpiStat[]
}

/**
 * Icons come from lucide, which is already a dependency. The previous inline
 * SVG switch duplicated paths the library ships and drifted in stroke weight.
 */
const ICONS: Record<string, LucideIcon> = {
  revenue: Banknote,
  orders: ShoppingBag,
  successful: CircleCheck,
  failed: TriangleAlert,
  stock: Package,
  customers: Users,
  sms: MessageSquare,
  avgValue: Receipt,
}

export default function StatsGrid({ stats = [] }: StatsGridProps) {
  if (stats.length === 0) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {Array.from({ length: 8 }, (_, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 px-3.5 py-4 sm:px-6 sm:py-5 h-[104px] sm:h-[134px]">
            <div className="h-3 w-24 rounded bg-gray-100" />
            <div className="mt-4 h-6 w-28 rounded bg-gray-100" />
            <div className="mt-3 h-3 w-20 rounded bg-gray-50" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4">
      {stats.map((item) => {
        const Icon = ICONS[item.icon || ''] ?? Receipt
        return (
          <StatsCard
            key={item.label}
            title={item.label}
            value={String(item.value)}
            mobileValue={item.mobileValue}
            detail={item.change}
            trend={item.trend}
            tone={item.tone}
            icon={<Icon className="w-[18px] h-[18px]" strokeWidth={1.75} />}
          />
        )
      })}
    </div>
  )
}
