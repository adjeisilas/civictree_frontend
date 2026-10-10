import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import type {
  PartnerProfile,
  PartnerDashboardStats,
  PartnerTransaction,
  PartnerReportStats,
  PartnerSettlement,
  PartnerNotification,
  PartnerSettings,
  PeriodType,
} from '../types/partner'

// ─── React Query Hooks ──────────────────────────────────────────────────────

export function usePartnerDashboard() {
  return useQuery<PartnerDashboardStats>({
    queryKey: ['partner', 'dashboard'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.PARTNER.DASHBOARD)
      return res.data?.data || res.data
    },
    staleTime: 30000,
  })
}

export function usePartnerProfile() {
  return useQuery<PartnerProfile>({
    queryKey: ['partner', 'profile'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.PARTNER.PROFILE)
      return res.data?.data || res.data
    },
    staleTime: 60000,
  })
}

export function usePartnerTransactions(params?: {
  page?: number
  limit?: number
  search?: string
  voucherType?: string
  settlementStatus?: string
  startDate?: string
  endDate?: string
}) {
  return useQuery<{
    transactions: PartnerTransaction[]
    total: number
    page: number
    totalPages: number
  }>({
    queryKey: ['partner', 'transactions', params],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.PARTNER.TRANSACTIONS, { params })
      if (res.data?.transactions) return res.data
      if (res.data?.data?.transactions) return res.data.data
      return {
        transactions: [],
        total: 0,
        page: params?.page || 1,
        totalPages: 1,
      }
    },
    staleTime: 15000,
  })
}

export function usePartnerReports(period: PeriodType = 'monthly', _dateRange?: { start: string; end: string }) {
  return useQuery<PartnerReportStats>({
    queryKey: ['partner', 'reports', period, _dateRange],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.PARTNER.REPORTS, {
        params: { period, ..._dateRange },
      })
      if (res.data?.data) return res.data.data
      if (res.data?.chartData) return res.data
      throw new Error('Invalid report data format returned from server.')
    },
    staleTime: 60000,
  })
}

export function usePartnerSettlements() {
  return useQuery<PartnerSettlement[]>({
    queryKey: ['partner', 'settlements'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.PARTNER.SETTLEMENTS)
      return res.data?.data || res.data || []
    },
    staleTime: 30000,
  })
}

export function useRequestPartnerPayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: { amount: number; payoutMethodId?: string; notes?: string }) => {
      const res = await apiClient.post(ENDPOINTS.PARTNER.REQUEST_PAYOUT, payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['partner', 'settlements'] })
      queryClient.invalidateQueries({ queryKey: ['partner', 'profile'] })
    },
  })
}

export function usePartnerNotifications() {
  return useQuery<PartnerNotification[]>({
    queryKey: ['partner', 'notifications'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.PARTNER.NOTIFICATIONS)
      return res.data?.data || res.data || []
    },
    staleTime: 20000,
  })
}

export function useMarkPartnerNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      try {
        await apiClient.patch(ENDPOINTS.PARTNER.MARK_READ(id))
      } catch {
        // Optimistic local update allowed to fail silently
      }
      return { id }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'notifications'] })
    },
  })
}

export function usePartnerSettings() {
  return useQuery<PartnerSettings>({
    queryKey: ['partner', 'settings'],
    queryFn: async () => {
      const res = await apiClient.get(ENDPOINTS.PARTNER.SETTINGS)
      return res.data?.data || res.data
    },
    staleTime: 60000,
  })
}

export function useUpdatePartnerSettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<PartnerSettings>) => {
      const res = await apiClient.put(ENDPOINTS.PARTNER.UPDATE_SETTINGS, payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'settings'] })
    },
  })
}

export function useUpdatePartnerProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<PartnerProfile>) => {
      const res = await apiClient.put(ENDPOINTS.PARTNER.UPDATE_PROFILE, payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'profile'] })
      queryClient.invalidateQueries({ queryKey: ['partner', 'dashboard'] })
    },
  })
}

export function useChangePartnerPassword() {
  return useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      const res = await apiClient.post(ENDPOINTS.PARTNER.CHANGE_PASSWORD, payload)
      return res.data
    },
  })
}

