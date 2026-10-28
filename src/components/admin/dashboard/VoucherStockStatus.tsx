import { VOUCHER_TYPES } from '../../../config/voucherTypes'
import type { ExamType } from '../../../types/admin'

interface StockStatus {
  id: string
  label: string
  sold: number
  remaining: number
  capacity: number
  color: string
  borderColor: string
  bgColor: string
}

type BackendStockStatus = {
  available: number
  sold: number
  total: number
  allocatedPercent: number
  remainingPercent: number
  isLowStock: boolean
}

export default function VoucherStockStatus({ data }: { data: Record<string, BackendStockStatus> }) {
  // One row per voucher type the API reported on. This used to look for a
  // `WASSCE` key while the API sends `WASSCE_NOVDEC`, so that row never
  // rendered; the type codes come from the shared list now.
  // `WASSCE` and `NOVDEC` are still accepted for older responses.
  const legacyKeys: Partial<Record<ExamType, string[]>> = {
    WASSCE_NOVDEC: ['WASSCE', 'NOVDEC'],
  }

  const stocks: StockStatus[] = VOUCHER_TYPES.flatMap((voucher) => {
    const candidates = [voucher.type, ...(legacyKeys[voucher.type] ?? [])]
    const key = candidates.find((candidate) => data?.[candidate])
    if (!key) return []

    const entry = data[key]
    return [{
      id: voucher.type,
      label: `${voucher.displayName} Checker Keys`,
      sold: entry.sold,
      remaining: entry.available,
      capacity: entry.total || 1, // prevent division by zero
      color: voucher.accent.dot,
      borderColor: 'border-gray-200',
      bgColor: 'bg-gray-50',
    }]
  })

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between h-[420px]">
      <div>
        <h3 className="font-serif font-bold text-primary text-lg">Voucher Stock Status</h3>
        <p className="text-xs text-gray-400">Available checker keys and allocation levels</p>
      </div>

      <div className="flex-1 mt-6 space-y-6">
        {stocks.map((item) => {
          const remainingPct = ((item.remaining / item.capacity) * 100).toFixed(1)
          const soldPct = ((item.sold / item.capacity) * 100).toFixed(1)
          const isLow = item.remaining / item.capacity < 0.15

          return (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-text-primary">{item.label}</span>
                  {isLow && (
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-700 animate-pulse uppercase">
                      Low Stock Alert
                    </span>
                  )}
                </div>
                <span className="text-xs text-gray-400 font-bold">
                  {item.remaining.toLocaleString()} / {item.capacity.toLocaleString()} left
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden relative">
                <div
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  style={{ width: `${soldPct}%` }}
                />
              </div>

              {/* Percentages and descriptions */}
              <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                <span>{soldPct}% allocated (sold)</span>
                <span className={isLow ? 'text-red-600 font-bold' : 'text-light-green'}>
                  {remainingPct}% remaining
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
