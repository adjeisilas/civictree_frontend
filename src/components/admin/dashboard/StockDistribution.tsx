interface StockLevel {
  type: string
  count: number
  minLimit: number
  color: string
}

interface StockDistributionProps {
  levels: StockLevel[]
}

export default function StockDistribution({ levels }: StockDistributionProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between">
      <div>
        <h3 className="font-heading font-bold text-primary text-lg">Stock Distribution</h3>
        <p className="text-xs text-gray-400">Available vouchers by examination provider</p>
      </div>

      <div className="space-y-4 my-auto py-2">
        {levels.map((lvl) => {
          const percentage = Math.min((lvl.count / 1000) * 100, 100)
          const isLow = lvl.count < lvl.minLimit

          return (
            <div key={lvl.type} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-text-primary">{lvl.type}</span>
                <span className={`font-semibold ${isLow ? 'text-amber-600' : 'text-gray-500'}`}>
                  {lvl.count} pcs {isLow && '(Low Stock!)'}
                </span>
              </div>
              {/* Progress bar background */}
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${lvl.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Alert */}
      <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl flex items-start space-x-2 text-[11px] text-amber-800">
        <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <span>
          <strong>NOVDEC Checker</strong> stocks are below safety margin. Auto-payments will enqueue orders if depleted.
        </span>
      </div>
    </div>
  )
}
