import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import type { Order } from '../types/admin'

export interface ComprehensiveDashboardData {
  totalRevenue: number
  totalOrders: number
  totalSuccessfulOrders: number
  totalFailedOrders: number
  totalPendingOrders: number
  totalVoucherStock: number
  totalCustomers: number
  totalSmsDelivered: number
  averageOrderValue: number
  revenueTrends: Array<{ month: string, revenue: number }>
  voucherSalesCountByType: { WASSCE_NOVDEC: number, BECE: number }
  ordersCountByChannel: { WEB: number, USSD: number }
  dailyOrdersCount: Array<{ day: string, count: number }>
  recentOrders: Order[]
  voucherStockStatus: Record<string, { available: number, sold: number, total: number, allocatedPercent: number, remainingPercent: number, isLowStock: boolean }>
  recentActivityLogs: Array<{ id: string, action: string, details: string, createdAt: string, user?: { fullName: string, email: string } | null }>
}

/** Fetches all dashboard statistics and metrics in a single payload. */
export function useComprehensiveDashboard() {
  return useQuery<ComprehensiveDashboardData>({
    queryKey: ['dashboard', 'comprehensive'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: ComprehensiveDashboardData }>(ENDPOINTS.DASHBOARD.STATS)
        .then((r) => r.data.data),
  })
}
