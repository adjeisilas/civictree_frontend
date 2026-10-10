

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
  // If data is missing or empty, fallback to an empty array so UI doesn't crash
  const stocks: StockStatus[] = []

  if (data) {
    if (data.WASSCE) {
      stocks.push({
        id: 'wassce',
        label: 'WASSCE Checker Keys',
        sold: data.WASSCE.sold,
        remaining: data.WASSCE.available,
        capacity: data.WASSCE.total || 1, // prevent division by zero
        color: 'bg-primary',
        borderColor: 'border-primary/20',
        bgColor: 'bg-primary/5',
      })
    }
    if (data.BECE) {
      stocks.push({
        id: 'bece',
        label: 'BECE Checker Keys',
        sold: data.BECE.sold,
        remaining: data.BECE.available,
        capacity: data.BECE.total || 1,
        color: 'bg-amber-500',
        borderColor: 'border-amber-200',
        bgColor: 'bg-amber-50',
      })
    }
    if (data.NOVDEC) {
      stocks.push({
        id: 'novdec',
        label: 'NOVDEC Checker Keys',
        sold: data.NOVDEC.sold,
        remaining: data.NOVDEC.available,
        capacity: data.NOVDEC.total || 1,
        color: 'bg-success',
        borderColor: 'border-success/20',
        bgColor: 'bg-success/5',
      })
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between h-[420px]">
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
                    <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-700 animate-pulse uppercase">
                      Low Stock Alert
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-gray-400 font-bold">
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
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
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
