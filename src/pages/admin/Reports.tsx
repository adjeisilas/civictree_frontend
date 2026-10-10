import { useState } from 'react'
import { useReportStats, useSalesReport } from '../../hooks/useReports'
import { exportReportsToPDF, exportReportsToExcel } from '../../utils/exportUtils'
interface MonthlyRevenue {
  month: string
  wassceNovdec: number
  bece: number
}

export default function Reports() {
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const [activeHoverBar, setActiveHoverBar] = useState<{ month: string; type: string; value: number } | null>(null)
  const [activeHoverPoint, setActiveHoverPoint] = useState<{ month: string; success: number; failure: number } | null>(null)
  const [activeHoverStack, setActiveHoverStack] = useState<{ month: string; newCustomers: number; returning: number } | null>(null)

  // Fetch real stats data
  const { data: statsData } = useReportStats()
  const stats = statsData || []
  
  const { data: salesData } = useSalesReport('monthly')
  const sales = salesData || []

  // Monthly Revenue Data
  const monthlyData: MonthlyRevenue[] = stats.map(s => ({
    month: s.month,
    wassceNovdec: s.revenue.WASSCE_NOVDEC || (s.revenue as Record<string, number | undefined>).WASSCE || 0,
    bece: s.revenue.BECE,
  }))

  // Operational Trend Data
  const operationalTrends = stats.map(s => ({
    month: s.month,
    success: s.orderRates.successRate,
    failure: s.orderRates.failureRate,
  }))

  // Customer acquisition/retention trends
  const customerTrends = stats.map(s => ({
    month: s.month,
    newCustomers: s.customers.new,
    returning: s.customers.returning,
  }))

  // Channel usage mapping
  const totalWeb = stats.reduce((sum, s) => sum + (s.channels?.WEB || 0), 0)
  const totalUssd = stats.reduce((sum, s) => sum + (s.channels?.USSD || 0), 0)
  const totalChannels = totalWeb + totalUssd || 1 // fallback to 1

  const webPercent = Math.round((totalWeb / totalChannels) * 100)
  const ussdPercent = Math.round((totalUssd / totalChannels) * 100)

  // the circle perimeter is 251. 
  const webDash = (webPercent / 100) * 251
  const ussdDash = (ussdPercent / 100) * 251

  // Y-axis labels for reference
  const rawMax = Math.max(5000, ...monthlyData.flatMap(d => [d.wassceNovdec, d.bece]))
  const maxVal = Math.ceil(rawMax / 1000) * 1000
  const yAxisTicks = Array.from({ length: 6 }, (_, i) => Math.round(maxVal - (maxVal / 5) * i))

  // Handle client-side report generation
  const handleExport = (format: string) => {
    setGeneratingReport(format)
    
    setTimeout(() => {
      try {
        if (format.toLowerCase() === 'pdf') {
          exportReportsToPDF(sales, stats, 'monthly');
        } else if (format.toLowerCase() === 'excel' || format.toLowerCase() === 'xlsx') {
          exportReportsToExcel(sales, stats, 'monthly', false);
        } else if (format.toLowerCase() === 'csv') {
          exportReportsToExcel(sales, stats, 'monthly', true);
        }
        
        setGeneratingReport(null)
        setToastMessage(`Successfully exported ${format} report to your downloads folder!`)
      } catch (err) {
        console.error(err);
        setGeneratingReport(null)
        setToastMessage(`Failed to export ${format} report.`)
      }
      setTimeout(() => setToastMessage(null), 4000)
    }, 500); // Simulate short generation delay for UI
  }

  return (
    <div className="space-y-6">
      {/* Toast Alert Popups */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-primary border border-accent text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-bounce flex items-center space-x-2 text-xs font-semibold">
          <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title Header Banner */}
      <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary">Reports & Analytics</h2>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5 font-mono">
            CivicTree Enterprise Results Checker Platform
          </p>
          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-3xl mt-2 font-sans">
            Time-based, category-based, and channel-based sales analytics with visual charts and multi-format data exports for business decision-making.
          </p>
        </div>
      </div>


      {/* CHARTS & VISUALISATIONS Section */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 font-sans select-none">
          Charts & Visualisations
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Revenue by Voucher Type - Monthly Column Chart (2/3 width) */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <div>
              <h4 className="font-serif font-bold text-primary text-base">
                Revenue by Voucher Type &mdash; Monthly
              </h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                GH₵ revenue per exam type over 6 months
              </p>
            </div>

            {/* Custom Interactive Column Chart */}
            <div className="relative pt-6 pb-2">
              {/* Tooltip Overlay */}
              {activeHoverBar && (
                <div 
                  className="absolute top-0 bg-[#0c180b] text-[#ebd56b] border border-[#ebd56b]/20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-md z-30 animate-fadeIn"
                  style={{
                    left: `${Math.min(85, Math.max(10, (monthlyData.findIndex(d => d.month === activeHoverBar.month) + 0.5) * 16))}%`,
                    transform: 'translateX(-50%)',
                  }}
                >
                  {activeHoverBar.month} {activeHoverBar.type}: GH₵ {activeHoverBar.value.toLocaleString()}
                </div>
              )}

              {/* Chart Grid Lines & Columns */}
              <div className="flex h-72 border-b border-gray-200">
                
                {/* Y-Axis Scale Marks */}
                <div className="flex flex-col justify-between text-[9px] font-bold text-gray-400 w-12 pr-2 border-r border-gray-100 select-none pb-1">
                  {yAxisTicks.map((tick) => (
                    <div key={tick} className="text-right leading-none h-3">GH₵{tick}</div>
                  ))}
                </div>

                {/* Columns Container */}
                <div className="flex-1 flex justify-around items-end px-4 relative">
                  
                  {/* Grid background reference lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1 select-none">
                    {yAxisTicks.slice(0, -1).map((_, idx) => (
                      <div key={idx} className="border-t border-gray-100/50 w-full h-0" />
                    ))}
                  </div>

                  {/* Monthly Columns */}
                  {monthlyData.map((d) => (
                    <div key={d.month} className="flex items-end justify-center space-x-1.5 sm:space-x-2.5 h-full w-1/6 group relative">
                      
                      {/* WASSCE / NOVDEC Bar */}
                      <div 
                        onMouseEnter={() => setActiveHoverBar({ month: d.month, type: 'WASSCE_NOVDEC', value: d.wassceNovdec })}
                        onMouseLeave={() => setActiveHoverBar(null)}
                        className="w-3.5 sm:w-5 bg-primary rounded-t transition-all duration-300 hover:brightness-125 cursor-pointer relative"
                        style={{ height: `${(d.wassceNovdec / maxVal) * 100}%` }}
                      />

                      {/* BECE Bar */}
                      <div 
                        onMouseEnter={() => setActiveHoverBar({ month: d.month, type: 'BECE', value: d.bece })}
                        onMouseLeave={() => setActiveHoverBar(null)}
                        className="w-3.5 sm:w-5 bg-[#dfba60] rounded-t transition-all duration-300 hover:brightness-110 cursor-pointer relative"
                        style={{ height: `${(d.bece / maxVal) * 100}%` }}
                      />
                    </div>
                  ))}

                </div>
              </div>

              {/* X-Axis labels */}
              <div className="flex pl-12">
                <div className="flex-1 flex justify-around pt-2 text-[10px] font-bold text-gray-400 select-none">
                  {monthlyData.map((d) => (
                    <div key={d.month} className="w-1/6 text-center">{d.month}</div>
                  ))}
                </div>
              </div>

              {/* Legends */}
              <div className="flex justify-center items-center space-x-6 pt-4 text-[10px] font-bold text-gray-500 select-none">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                  <span>WASSCE / NOVDEC</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#dfba60]" />
                  <span>BECE</span>
                </div>
              </div>

            </div>
          </div>

          {/* Chart 2: Order Channels Split - Donut Chart (1/3 width) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
              <h4 className="font-serif font-bold text-primary text-base">
                Order Channels Split
              </h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
                Orders by purchasing platform
              </p>
            </div>

            {/* Custom SVG Donut Component */}
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-44 h-44">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  {/* Concentric Circle Arcs mapping percentages */}
                  {/* WEB */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#1e3a1e"
                    strokeWidth="11"
                    strokeDasharray={`${webDash} 251`}
                    strokeDashoffset="0"
                    className="hover:scale-102 transform origin-center transition-transform cursor-pointer"
                  />
                  {/* USSD */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#dfba60"
                    strokeWidth="11"
                    strokeDasharray={`${ussdDash} 251`}
                    strokeDashoffset={`-${webDash}`}
                    className="hover:scale-102 transform origin-center transition-transform cursor-pointer"
                  />
                </svg>
                {/* Center Hole Details */}
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-[22px] shadow-inner select-none">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Share</span>
                  <span className="text-xl font-bold text-primary font-serif">100%</span>
                </div>
              </div>
            </div>

            {/* Legends & Details */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 border-t border-gray-50 pt-3 select-none">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
                <span className="truncate">Web Portal ({webPercent}%)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dfba60] shrink-0" />
                <span className="truncate">USSD ({ussdPercent}%)</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Row 2: Success Rate Line & Customer Stacked Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        
        {/* Chart 3: Order Success vs Failure Rate Trend (Line chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
          <div>
            <h4 className="font-serif font-bold text-primary text-base">
              Order Success vs Failure Rate Trend
            </h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Operational success rate vs gateway payment failures
            </p>
          </div>

          <div className="relative pt-6 pb-2">
            {/* Tooltip Overlay */}
            {activeHoverPoint && (
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#0c180b] text-[#ebd56b] border border-[#ebd56b]/20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-md z-30 animate-fadeIn"
              >
                {activeHoverPoint.month} &mdash; Success: {activeHoverPoint.success}% | Failure: {activeHoverPoint.failure}%
              </div>
            )}

            <div className="flex h-56 border-b border-gray-200 relative">
              {/* Y Axis labels */}
              <div className="flex flex-col justify-between text-[9px] font-bold text-gray-400 w-8 pr-2 border-r border-gray-100 select-none pb-1">
                <div>100%</div>
                <div>75%</div>
                <div>50%</div>
                <div>25%</div>
                <div>0%</div>
              </div>

              {/* Line Area */}
              <div className="flex-1 relative">
                {/* Horizontal reference lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1 select-none">
                  <div className="border-t border-gray-100 w-full h-0" />
                  <div className="border-t border-gray-100 w-full h-0" />
                  <div className="border-t border-gray-100 w-full h-0" />
                  <div className="border-t border-gray-100 w-full h-0" />
                </div>

                {/* SVG Lines */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 400 200" preserveAspectRatio="none">
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="failGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1"/>
                      <stop offset="100%" stopColor="#ef4444" stopOpacity="0"/>
                    </linearGradient>
                  </defs>

                  {/* Areas */}
                  <path d="M 30 200 L 30 32.8 L 100 29.6 L 170 36 L 240 26.4 L 310 24.8 L 380 23.2 L 380 200 Z" fill="url(#successGrad)" />
                  
                  {/* Success Rate Line */}
                  <path d="M 30 32.8 L 100 29.6 L 170 36 L 240 26.4 L 310 24.8 L 380 23.2" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  
                  {/* Failure Rate Line */}
                  <path d="M 30 187.2 L 100 190.4 L 170 184 L 240 193.6 L 310 195.2 L 380 196.8" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />

                  {/* Node Dots */}
                  {operationalTrends.map((p, idx) => {
                    const x = 30 + idx * 70
                    const y = 200 - (p.success / 100) * 167.2
                    return (
                      <g key={idx} className="cursor-pointer" onMouseEnter={() => setActiveHoverPoint({ month: p.month, success: p.success, failure: p.failure })} onMouseLeave={() => setActiveHoverPoint(null)}>
                        <circle cx={x} cy={y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx={x} cy={200 - (p.failure / 100) * 167.2} r="3" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                      </g>
                    )
                  })}
                </svg>

                {/* Invisible hover intercept columns */}
                <div className="absolute inset-0 flex">
                  {operationalTrends.map((t, idx) => (
                    <div
                      key={idx}
                      className="w-1/6 h-full cursor-pointer hover:bg-gray-500/5 transition-colors border-r border-dashed border-gray-100 last:border-0"
                      onMouseEnter={() => setActiveHoverPoint({ month: t.month, success: t.success, failure: t.failure })}
                      onMouseLeave={() => setActiveHoverPoint(null)}
                    />
                  ))}
                </div>

              </div>
            </div>

            {/* X Axis Labels */}
            <div className="flex pl-8">
              <div className="flex-1 flex justify-around pt-2 text-[10px] font-bold text-gray-400 select-none">
                {operationalTrends.map((d) => (
                  <div key={d.month} className="w-1/6 text-center">{d.month}</div>
                ))}
              </div>
            </div>

            {/* Legends */}
            <div className="flex justify-center space-x-6 pt-4 text-[10px] font-bold text-gray-500 select-none">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-[#10b981] inline-block border-t border-t-[#10b981]" />
                <span>Success Rate (%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-0.5 bg-[#ef4444] inline-block border-t border-t-[#ef4444]" />
                <span>Payment Failures (%)</span>
              </div>
            </div>

          </div>
        </div>

        {/* Chart 4: Customer Acquisition (Stacked Column Chart) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
          <div>
            <h4 className="font-serif font-bold text-primary text-base">
              New vs Returning Customers
            </h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">
              Monthly breakdown of customer acquisition and retention
            </p>
          </div>

          <div className="relative pt-6 pb-2">
            {/* Tooltip Overlay */}
            {activeHoverStack && (
              <div 
                className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#0c180b] text-[#ebd56b] border border-[#ebd56b]/20 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold shadow-md z-30 animate-fadeIn"
              >
                {activeHoverStack.month} &mdash; New: {activeHoverStack.newCustomers} | Returning: {activeHoverStack.returning} (Total: {activeHoverStack.newCustomers + activeHoverStack.returning})
              </div>
            )}

            <div className="flex h-56 border-b border-gray-200">
              {/* Y Axis scale marks */}
              <div className="flex flex-col justify-between text-[9px] font-bold text-gray-400 w-8 pr-2 border-r border-gray-100 select-none pb-1">
                <div>500</div>
                <div>375</div>
                <div>250</div>
                <div>125</div>
                <div>0</div>
              </div>

              {/* Columns Container */}
              <div className="flex-1 flex justify-around items-end px-4 relative">
                {/* Horizontal reference lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-1 select-none">
                  <div className="border-t border-gray-100 w-full h-0" />
                  <div className="border-t border-gray-100 w-full h-0" />
                  <div className="border-t border-gray-100 w-full h-0" />
                  <div className="border-t border-gray-100 w-full h-0" />
                </div>

                {customerTrends.map((t) => {
                  const maxStackVal = Math.max(500, ...customerTrends.map(c => c.newCustomers + c.returning))
                  const newPercent = (t.newCustomers / maxStackVal) * 100
                  const retPercent = (t.returning / maxStackVal) * 100

                  return (
                    <div 
                      key={t.month}
                      onMouseEnter={() => setActiveHoverStack(t)}
                      onMouseLeave={() => setActiveHoverStack(null)}
                      className="w-8 sm:w-10 flex flex-col justify-end h-full cursor-pointer group"
                    >
                      {/* Returning segment (top) */}
                      <div 
                        className="bg-[#dfba60] rounded-t-sm group-hover:brightness-110 transition-all duration-200"
                        style={{ height: `${retPercent}%` }}
                        title={`Returning: ${t.returning}`}
                      />
                      {/* New segment (bottom) */}
                      <div 
                        className="bg-primary rounded-b-sm group-hover:brightness-105 transition-all duration-200 border-t border-white/20"
                        style={{ height: `${newPercent}%` }}
                        title={`New: ${t.newCustomers}`}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* X Axis Labels */}
            <div className="flex pl-8">
              <div className="flex-1 flex justify-around pt-2 text-[10px] font-bold text-gray-400 select-none">
                {customerTrends.map((d) => (
                  <div key={d.month} className="w-1/6 text-center">{d.month}</div>
                ))}
              </div>
            </div>

            {/* Legends */}
            <div className="flex justify-center space-x-6 pt-4 text-[10px] font-bold text-gray-500 select-none">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span>New Customers</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#dfba60]" />
                <span>Returning Customers</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* EXPORT OPTIONS Section */}
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2 font-sans select-none">
          Export Options
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: PDF */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div>
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-gray-50 pb-2">
                PDF Report
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-gray-500 font-sans mt-3.5">
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Formatted, printable layout</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> CivicTree brand header included</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Charts embedded as images</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Summary table + full data table</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Date range stated in report header</li>
              </ul>
            </div>
            <div className="pt-2 border-t border-gray-50">
              <button
                onClick={() => handleExport('PDF')}
                disabled={generatingReport !== null}
                className="w-full py-2 bg-[#dfba60] hover:bg-[#cfa54f] text-primary font-bold rounded-xl text-xs transition-colors cursor-pointer flex justify-center items-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {generatingReport === 'PDF' ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <span>Download PDF Report</span>
                )}
              </button>
            </div>
          </div>

          {/* Card 2: Excel */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div>
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-gray-50 pb-2">
                Excel (.xlsx)
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-gray-500 font-sans mt-3.5">
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Full raw data with all fields</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Charts on separate sheet</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Pivot-ready data structure</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Multiple sheets (orders/customers/vouchers)</li>
              </ul>
            </div>
            <div className="pt-2 border-t border-gray-50">
              <button
                onClick={() => handleExport('Excel')}
                disabled={generatingReport !== null}
                className="w-full py-2 bg-[#dfba60] hover:bg-[#cfa54f] text-primary font-bold rounded-xl text-xs transition-colors cursor-pointer flex justify-center items-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {generatingReport === 'Excel' ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating Excel...</span>
                  </>
                ) : (
                  <span>Download XLSX Sheet</span>
                )}
              </button>
            </div>
          </div>

          {/* Card 3: CSV */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div>
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-gray-50 pb-2">
                CSV
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-gray-500 font-sans mt-3.5">
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Raw data only &mdash; no formatting</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Ideal for data analysis tools</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> UTF-8 encoding for Ghanaian characters</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> All filter/date settings applied to export</li>
              </ul>
            </div>
            <div className="pt-2 border-t border-gray-50">
              <button
                onClick={() => handleExport('CSV')}
                disabled={generatingReport !== null}
                className="w-full py-2 bg-[#dfba60] hover:bg-[#cfa54f] text-primary font-bold rounded-xl text-xs transition-colors cursor-pointer flex justify-center items-center space-x-2 shadow-sm disabled:opacity-50"
              >
                {generatingReport === 'CSV' ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Generating CSV...</span>
                  </>
                ) : (
                  <span>Download CSV Log</span>
                )}
              </button>
            </div>
          </div>

          {/* Card 4: Scheduled Reports */}
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div>
              <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-gray-50 pb-2">
                Scheduled Reports (Future)
              </h4>
              <ul className="space-y-2.5 text-xs font-medium text-gray-500 font-sans mt-3.5">
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Daily summary email to Super Admin</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Weekly digest (Monday AM)</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Monthly report auto-generated</li>
                <li className="flex items-start"><span className="text-emerald-600 mr-2">•</span> Configurable recipients</li>
              </ul>
            </div>
            <div className="pt-2 border-t border-gray-50">
              <button
                type="button"
                onClick={() => {
                  setToastMessage('Schedule portal will be integrated in Phase 2 deployment.')
                  setTimeout(() => setToastMessage(null), 3000)
                }}
                className="w-full py-2 border border-gray-250 bg-white hover:bg-gray-50 text-gray-500 hover:text-text-primary font-bold rounded-xl text-xs transition-colors cursor-pointer text-center block shadow-sm"
              >
                Configure Schedule
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Spacer bottom */}
      <div className="h-4" />
    </div>
  )
}
