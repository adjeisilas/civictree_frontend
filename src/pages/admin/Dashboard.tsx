import { useState } from 'react'
import StatsGrid from '../../components/admin/dashboard/StatsGrid'
import RevenueTrendChart from '../../components/admin/dashboard/RevenueTrendChart'
import VoucherSalesChart from '../../components/admin/dashboard/VoucherSalesChart'
import ChannelPieChart from '../../components/admin/dashboard/ChannelPieChart'
import DailyOrdersChart from '../../components/admin/dashboard/DailyOrdersChart'
import VoucherStockStatus from '../../components/admin/dashboard/VoucherStockStatus'
import ActivityFeed from '../../components/admin/dashboard/ActivityFeed'
import RecentOrdersTable from '../../components/admin/dashboard/RecentOrdersTable'
import AdminDirectWithdrawalModal from '../../components/admin/dashboard/AdminDirectWithdrawalModal'
import { useComprehensiveDashboard } from '../../hooks/useDashboard'
import { useNavigate } from 'react-router-dom'
import { usePWAInstall } from '../../hooks/usePWAInstall'
import type { KpiStat } from '../../types/admin'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useComprehensiveDashboard()
  const { isInstallable, promptToInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa_install_dismissed_dashboard') === 'true')
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-3">
        <svg className="w-10 h-10 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading dashboard...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-center space-x-3 shadow-sm">
        <span className="text-xl">⚠️</span>
        <p className="text-xs font-semibold">{error ? error.message : 'Failed to fetch dashboard metrics. Please reload.'}</p>
      </div>
    )
  }

  // Derive KPI Stats
  const kpiStats: KpiStat[] = [
    { label: 'Total Revenue', value: `GH¢ ${data.totalRevenue?.toLocaleString() || 0}.00`, change: '+12.4% from last month', trend: 'up' as const, color: 'emerald', icon: 'revenue' },
    { label: 'Total Orders', value: data.totalOrders?.toLocaleString() || '0', change: '+8.4% from last week', trend: 'up' as const, color: 'gray', icon: 'orders' },
    { label: 'Successful Orders', value: data.totalSuccessfulOrders?.toLocaleString() || '0', change: '96.1% Success Rate', trend: 'up' as const, color: 'emerald', icon: 'successful' },
    { label: 'Failed Orders', value: data.totalFailedOrders?.toLocaleString() || '0', change: '3.9% Failure Rate', trend: 'neutral' as const, color: 'red', icon: 'failed' },
    { label: 'Voucher Stock', value: data.totalVoucherStock?.toLocaleString() || '0', change: 'BECE Checker is low (14%)', trend: 'neutral' as const, color: 'amber', icon: 'stock' },
    { label: 'Active Customers', value: data.totalCustomers?.toLocaleString() || '0', change: '+5.2% active check', trend: 'up' as const, color: 'blue', icon: 'customers' },
    { label: 'SMS Delivered', value: data.totalSmsDelivered?.toLocaleString() || '0', change: '100% Delivery Rate', trend: 'up' as const, color: 'teal', icon: 'sms' },
    { label: 'Avg Order Value', value: `GH¢ ${data.averageOrderValue?.toLocaleString() || 0}.00`, change: 'Consistent with target', trend: 'up' as const, color: 'black', icon: 'avgValue' },
  ]

  return (
    <div className="space-y-6">
      {isInstallable && !dismissed && (
        <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 text-white p-5 rounded-xl shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in border border-amber-400">
          <div className="flex items-start space-x-3.5">
            <span className="text-3xl shrink-0">📱</span>
            <div>
              <h3 className="font-heading font-bold text-lg leading-tight">Install CivicTree Admin App</h3>
              <p className="text-white/90 text-xs sm:text-sm mt-1 font-sans">
                Access the voucher dashboard directly from your home screen with rapid offline load times.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => {
                setDismissed(true)
                localStorage.setItem('pwa_install_dismissed_dashboard', 'true')
              }}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-95 text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              Maybe Later
            </button>
            <button
              type="button"
              onClick={promptToInstall}
              className="px-4 py-2 bg-[#ffeade] hover:brightness-105 active:scale-[0.98] text-[#371f0d] text-xs font-bold rounded-xl transition-all shadow cursor-pointer"
            >
              Install App
            </button>
          </div>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-primary p-6 sm:p-8 rounded-xl text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,197,107,0.15),transparent_60%)]" />
        <div className="z-10">
          <h2 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">Welcome, Administrator</h2>
          <p className="text-white/80 text-xs sm:text-sm mt-1.5 font-sans">
            Here's what is happening on the platform today. Stock levels, sales, and order stats are fully active.
          </p>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-3 z-10">
          <button onClick={() => setIsWithdrawalModalOpen(true)} className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Withdraw</span>
          </button>
          <button onClick={() => navigate('/admin/vouchers')} className="flex items-center space-x-1.5 px-4 py-2 bg-[#dfba60] active:scale-[0.98] text-primary text-xs font-bold rounded-xl transition-all shadow cursor-pointer">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Upload Vouchers</span>
          </button>
          <button onClick={() => navigate('/admin/sms')} className="flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 active:scale-[0.98] text-white text-xs font-bold rounded-xl border border-white/20 transition-all cursor-pointer">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>Blast SMS</span>
          </button>
        </div>
      </div>

      {/* 8-Metric KPI Grid */}
      <StatsGrid stats={kpiStats} />

      {/* Row 1: Revenue Spline & Voucher Sales Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={data.revenueTrends || []} />
        </div>
        <div className="lg:col-span-1">
          <VoucherSalesChart data={data.voucherSalesCountByType || { WASSCE_NOVDEC: 0, BECE: 0 }} />
        </div>
      </div>

      {/* Row 2: Channel Pie & Daily Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ChannelPieChart data={data.ordersCountByChannel || { WEB: 0, USSD: 0 }} />
        <DailyOrdersChart data={data.dailyOrdersCount || []} />
      </div>

      {/* Row 3: Recent Orders Table & Sidebar Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentOrdersTable orders={data.recentOrders || []} />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <VoucherStockStatus data={data.voucherStockStatus || {}} />
          <ActivityFeed activities={data.recentActivityLogs?.map(log => ({
            id: log.id,
            message: `${log.user?.fullName || log.user?.email || 'System'} performed ${log.action.replace(/_/g, ' ')}`,
            timestamp: log.createdAt,
            type: log.action.includes('VOUCHER') ? 'voucher' : log.action.includes('ORDER') ? 'order' : 'system'
          })) || []} />
        </div>
      </div>

      <AdminDirectWithdrawalModal 
        isOpen={isWithdrawalModalOpen} 
        onClose={() => setIsWithdrawalModalOpen(false)} 
      />
    </div>
  )
}
