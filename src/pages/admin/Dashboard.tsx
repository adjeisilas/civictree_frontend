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
import { voucherTypeShortLabel } from '../../config/voucherTypes'
import { formatGhs, formatGhsCompact, formatCount } from '../../utils/format'
import PageHeader from '../../components/admin/layout/PageHeader'
import { Banknote, MessageSquare, Smartphone, TriangleAlert, Upload } from 'lucide-react'
import type { KpiStat } from '../../types/admin'
import { zeroedByVoucherType } from '../../config/voucherTypes'

export default function Dashboard() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useComprehensiveDashboard()
  const { isInstallable, promptToInstall } = usePWAInstall()
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('pwa_install_dismissed_dashboard') === 'true')
  const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-56 rounded bg-gray-100" />
          <div className="mt-2 h-4 w-80 rounded bg-gray-50" />
        </div>
        <StatsGrid />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white border border-red-200 rounded-lg p-5 flex items-start gap-3">
        <TriangleAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={1.75} />
        <div>
          <p className="text-sm font-semibold text-text-primary">Could not load the dashboard</p>
          <p className="text-[13px] text-gray-600 mt-0.5">
            {error ? error.message : 'The metrics request did not complete. Reload to try again.'}
          </p>
        </div>
      </div>
    )
  }

  // Rates are computed from the figures beside them. Anything the API does not
  // report - month-on-month movement, delivery rates - has no supporting line
  // rather than a placeholder: these were previously hardcoded strings such as
  // "+12.4% from last month", shown to admins as though measured.
  const asPercent = (part: number, whole: number) =>
    whole > 0 ? `${((part / whole) * 100).toFixed(1)}% of all orders` : undefined

  const lowStockTypes = Object.entries(data.voucherStockStatus || {})
    .filter(([, status]) => status.isLowStock)
    .map(([type]) => voucherTypeShortLabel(type))

  const kpiStats: KpiStat[] = [
    {
      label: 'Total revenue',
      value: formatGhs(data.totalRevenue),
      mobileValue: formatGhsCompact(data.totalRevenue),
      icon: 'revenue',
    },
    {
      label: 'Total orders',
      value: formatCount(data.totalOrders),
      icon: 'orders',
    },
    {
      label: 'Successful orders',
      value: formatCount(data.totalSuccessfulOrders),
      change: asPercent(data.totalSuccessfulOrders ?? 0, data.totalOrders ?? 0),
      trend: 'up',
      icon: 'successful',
    },
    {
      label: 'Failed orders',
      value: formatCount(data.totalFailedOrders),
      change: asPercent(data.totalFailedOrders ?? 0, data.totalOrders ?? 0),
      trend: 'flat',
      // The one card that should pull the eye, and only when it has to
      tone: (data.totalFailedOrders ?? 0) > 0 ? 'critical' : 'neutral',
      icon: 'failed',
    },
    {
      label: 'Vouchers in stock',
      value: formatCount(data.totalVoucherStock),
      change: lowStockTypes.length
        ? `${lowStockTypes.join(', ')} running low`
        : undefined,
      trend: 'flat',
      tone: lowStockTypes.length ? 'critical' : 'neutral',
      icon: 'stock',
    },
    {
      label: 'Customers',
      value: formatCount(data.totalCustomers),
      icon: 'customers',
    },
    {
      label: 'SMS delivered',
      value: formatCount(data.totalSmsDelivered),
      icon: 'sms',
    },
    {
      label: 'Average order value',
      value: formatGhs(data.averageOrderValue),
      mobileValue: formatGhsCompact(data.averageOrderValue),
      icon: 'avgValue',
    },
  ]

  return (
    <div className="space-y-6">
      {isInstallable && !dismissed && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" strokeWidth={1.75} />
            <div>
              <p className="text-sm font-semibold text-text-primary">Install the admin app</p>
              <p className="text-[13px] text-gray-600 mt-0.5">
                Open the dashboard from your home screen, and keep working when the connection drops.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setDismissed(true)
                localStorage.setItem('pwa_install_dismissed_dashboard', 'true')
              }}
              className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-text-primary hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
            >
              Not now
            </button>
            <button
              type="button"
              onClick={promptToInstall}
              className="px-3.5 py-1.5 bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold rounded-md transition-colors cursor-pointer"
            >
              Install
            </button>
          </div>
        </div>
      )}

      <PageHeader
        title="Dashboard"
        description="Sales, stock and delivery across the platform."
        actions={
          <>
            <button
              onClick={() => navigate('/admin/vouchers')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[13px] font-medium text-text-primary rounded-md transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
              Upload vouchers
            </button>
            <button
              onClick={() => navigate('/admin/sms')}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-[13px] font-medium text-text-primary rounded-md transition-colors cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
              Send SMS
            </button>
            <button
              onClick={() => setIsWithdrawalModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-hover text-white text-[13px] font-semibold rounded-md transition-colors cursor-pointer"
            >
              <Banknote className="w-4 h-4" strokeWidth={1.75} />
              Withdraw
            </button>
          </>
        }
      />

      <StatsGrid stats={kpiStats} />

      {/* Row 1: Revenue Spline & Voucher Sales Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueTrendChart data={data.revenueTrends || []} />
        </div>
        <div className="lg:col-span-1">
          <VoucherSalesChart data={data.voucherSalesCountByType || zeroedByVoucherType(0)} />
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
            message: `${log.user?.fullName || log.user?.email || 'System'} \u2014 ${log.action.replace(/_/g, ' ').toLowerCase()}`,
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
