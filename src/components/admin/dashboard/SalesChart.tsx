interface SalesTrend {
  day: string
  sales: number
}

interface SalesChartProps {
  data: SalesTrend[]
  peakSalesText: string
}

export default function SalesChart({ data, peakSalesText }: SalesChartProps) {
  return (
    <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-heading font-bold text-primary text-lg">Sales Trend (Last 7 Days)</h3>
          <p className="text-xs text-gray-400">Visual representations of transaction volume</p>
        </div>
        <span className="text-xs font-bold text-secondary bg-[#F8FAF8] px-3 py-1.5 rounded-xl border border-gray-200">
          {peakSalesText} Peak
        </span>
      </div>

      {/* Vector Chart Area */}
      <div className="h-56 w-full relative mt-4 flex items-end">
        {/* Ambient grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div className="border-b border-gray-200/80 w-full h-0" />
          <div className="border-b border-gray-200/80 w-full h-0" />
          <div className="border-b border-gray-200/80 w-full h-0" />
          <div className="border-b border-gray-200/80 w-full h-0" />
        </div>

        {/* SVG Area & Line Chart */}
        <svg className="absolute inset-0 h-full w-full pointer-events-none" viewBox="0 0 700 220" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#346231" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#346231" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area under curve */}
          <path
            d="M 10 200 L 100 160 L 200 180 L 300 120 L 400 135 L 500 100 L 690 30 L 690 220 L 10 220 Z"
            fill="url(#chartGlow)"
          />

          {/* Stroke path */}
          <path
            d="M 10 200 L 100 160 L 200 180 L 300 120 L 400 135 L 500 100 L 690 30"
            fill="none"
            stroke="#346231"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data Points */}
          <circle cx="10" cy="200" r="5" fill="#346231" stroke="#ffffff" strokeWidth="2" />
          <circle cx="100" cy="160" r="5" fill="#346231" stroke="#ffffff" strokeWidth="2" />
          <circle cx="200" cy="180" r="5" fill="#346231" stroke="#ffffff" strokeWidth="2" />
          <circle cx="300" cy="120" r="5" fill="#346231" stroke="#ffffff" strokeWidth="2" />
          <circle cx="400" cy="135" r="5" fill="#346231" stroke="#ffffff" strokeWidth="2" />
          <circle cx="500" cy="100" r="5" fill="#346231" stroke="#ffffff" strokeWidth="2" />
          <circle cx="690" cy="30" r="6" fill="#ebc56b" stroke="#346231" strokeWidth="2.5" />
        </svg>

        {/* X-Axis Labels */}
        <div className="absolute left-0 right-0 bottom-[-22px] flex justify-between px-2 text-xs font-semibold text-gray-400 select-none">
          {data.map((item) => (
            <span key={item.day}>{item.day}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
