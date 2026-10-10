import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import { unwrap, unwrapList } from '../lib/unwrap'
import type { ApiEnvelope } from '../types/api'
import { useAffiliateAuthStore } from '../stores/affiliateStore'
import type { 
  Affiliate, 
  AffiliateDashboardStats, 
  AffiliateSale, 
  Commission, 
  WithdrawalRequest,
  AffiliateLoginPayload,
  AffiliateApiRegisterPayload,
  AffiliateAuthResponse,
  AffiliatePayoutDetailsPayload,
  AffiliateSystemConfig,
  AdminCreateAffiliatePayload,
  DirectWithdrawalPayload
} from '../types/affiliate'

// ─── Authentication ────────────────────────────────────────────────────────

export function useAffiliateLogin() {
  const { affiliateLogin } = useAffiliateAuthStore()
  return useMutation<AffiliateAuthResponse, Error, AffiliateLoginPayload>({
    mutationFn: (data) =>
      apiClient
        .post<AffiliateAuthResponse>(ENDPOINTS.AFFILIATES.LOGIN, data)
        .then((res) => res.data),
    onSuccess: (res) => {
      const token = res.data.accessToken
      const user = {
        id: res.data.user.id,
        affiliateId: res.data.profile.affiliateId || '',
        fullName: res.data.user.fullName || '',
        email: res.data.user.email,
        status: res.data.profile.status || 'Active',
      }
      affiliateLogin(token, user, res.data.refreshToken)
    },
  })
}

export function useAffiliateRegister() {
  return useMutation<
    { success: boolean; message: string; data: { id: string; affiliateCode?: string; status: string } },
    Error,
    AffiliateApiRegisterPayload
  >({
    mutationFn: (data) =>
      apiClient
        .post(ENDPOINTS.AFFILIATES.REGISTER, data)
        .then((res) => res.data),
  })
}

// ─── Profile ─────────────────────────────────────────────────────────────

// ─── Profile ─────────────────────────────────────────────────────────────

export function useAffiliateProfile() {
  return useQuery<Affiliate>({
    queryKey: ['affiliate', 'me'],
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<Affiliate>>(ENDPOINTS.AFFILIATES.PROFILE)
        .then(unwrap),
  })
}

export function useUpdateAffiliateProfile() {
  const queryClient = useQueryClient()
  return useMutation<Affiliate, Error, Partial<Affiliate>>({
    mutationFn: (data) =>
      apiClient
        .patch<ApiEnvelope<Affiliate>>(ENDPOINTS.AFFILIATES.UPDATE_PROFILE, data)
        .then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate', 'me'] })
    },
  })
}

export function useUpdateAffiliatePayment() {
  const queryClient = useQueryClient()
  return useMutation<Affiliate, Error, AffiliatePayoutDetailsPayload>({
    mutationFn: (data) =>
      apiClient
        .patch<ApiEnvelope<Affiliate>>(ENDPOINTS.AFFILIATES.UPDATE_PAYMENT, data)
        .then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate', 'me'] })
    },
  })
}

// ─── Dashboard ───────────────────────────────────────────────────────────

export function useAffiliateDashboard() {
  return useQuery<AffiliateDashboardStats>({
    queryKey: ['affiliate', 'dashboard'],
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<AffiliateDashboardStats>>(ENDPOINTS.AFFILIATES.DASHBOARD)
        .then(unwrap),
  })
}

// ─── Sales & Earnings ──────────────────────────────────────────────────

export function useAffiliateSales(filters?: { page?: number; limit?: number }) {
  return useQuery<AffiliateSale[]>({
    queryKey: ['affiliate', 'sales', filters],
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<AffiliateSale[]>>(ENDPOINTS.AFFILIATES.SALES, { params: filters })
        .then(unwrapList),
  })
}

export function useAffiliateEarnings() {
  return useQuery<Commission[]>({
    queryKey: ['affiliate', 'earnings'],
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<Commission[]>>(ENDPOINTS.AFFILIATES.EARNINGS)
        .then(unwrapList),
  })
}

export function useAffiliateCommissions() {
  return useQuery<Commission[]>({
    queryKey: ['affiliate', 'commissions'],
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<Commission[]>>(ENDPOINTS.AFFILIATES.EARNINGS)
        .then(unwrapList),
  })
}

// ─── Withdrawals ─────────────────────────────────────────────────────────

export function useAffiliateWithdrawals() {
  return useQuery<WithdrawalRequest[]>({
    queryKey: ['affiliate', 'withdrawals'],
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<WithdrawalRequest[]>>(ENDPOINTS.AFFILIATES.WITHDRAWALS)
        .then(unwrapList),
  })
}

export function useRequestWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation<WithdrawalRequest, Error, { amount: number }>({
    mutationFn: (data) =>
      apiClient
        .post<ApiEnvelope<WithdrawalRequest>>(ENDPOINTS.AFFILIATES.REQUEST_WITHDRAWAL, data)
        .then(unwrap),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['affiliate', 'withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['affiliate', 'dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['affiliate', 'me'] })
    },
  })
}

// ─── Admin Affiliates Management ──────────────────────────────────────────────

export function useAdminAffiliates(filters?: { status?: string; search?: string; page?: number; limit?: number }) {
  return useQuery<Affiliate[]>({
    queryKey: ['admin', 'affiliates', filters],
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<Affiliate[]>>(ENDPOINTS.AFFILIATES.ADMIN_LIST, { params: filters })
        .then(unwrapList),
  })
}

export function useAdminAffiliateDetails(id?: string) {
  return useQuery<Affiliate>({
    queryKey: ['admin', 'affiliate-details', id],
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<Affiliate>>(ENDPOINTS.AFFILIATES.ADMIN_BY_ID(id!))
        .then(unwrap),
    enabled: !!id,
  })
}

export function useDeleteAdminAffiliate() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean; message: string }, Error, string>({
    mutationFn: (id) =>
      apiClient
        .delete(ENDPOINTS.AFFILIATES.ADMIN_BY_ID(id))
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'affiliates'] })
    },
  })
}

export function useUpdateAdminAffiliateStatus() {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean; data: Affiliate },
    Error,
    { id: string; status: string; ussdCode?: string; rejectionReason?: string; suspensionReason?: string }
  >({
    mutationFn: ({ id, status, ussdCode, rejectionReason, suspensionReason }) =>
      apiClient
        .patch(ENDPOINTS.AFFILIATES.ADMIN_STATUS(id), {
          status,
          ussdCode,
          // For SUSPENDED, pass the reason as rejectionReason (backend field)
          rejectionReason: status === 'SUSPENDED' ? suspensionReason : rejectionReason,
        })
        .then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'affiliates'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-details', variables.id] })
    },
  })
}

export function useUpdateAdminAffiliateUSSD() {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean; data: Affiliate }, Error, { id: string; ussdCode: string }>({
    mutationFn: ({ id, ussdCode }) =>
      apiClient
        .patch(ENDPOINTS.AFFILIATES.ADMIN_USSD(id), { ussdCode })
        .then((res) => res.data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'affiliates'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-details', variables.id] })
    },
  })
}

export function useAdminWithdrawals(filters?: { status?: string; page?: number; limit?: number }) {
  return useQuery<WithdrawalRequest[]>({
    queryKey: ['admin', 'affiliate-withdrawals', filters],
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<WithdrawalRequest[]>>(ENDPOINTS.AFFILIATES.ADMIN_WITHDRAWALS, { params: filters })
        .then(unwrapList),
  })
}

export function useProcessAdminWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean; data: WithdrawalRequest },
    Error,
    { id: string; status: string; adminNote?: string; twoFactorCode?: string }
  >({
    mutationFn: ({ id, status, adminNote, twoFactorCode }) =>
      apiClient
        .patch(ENDPOINTS.AFFILIATES.ADMIN_WITHDRAWAL_BY_ID(id), { status, adminNote, twoFactorCode })
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-withdrawals'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'affiliates'] })
    },
  })
}

export function useAdminAffiliateConfig() {
  return useQuery<AffiliateSystemConfig>({
    queryKey: ['admin', 'affiliate-config'],
    queryFn: () =>
      apiClient
        .get<ApiEnvelope<AffiliateSystemConfig>>(ENDPOINTS.AFFILIATES.ADMIN_CONFIG)
        .then(unwrap),
  })
}

export function useUpdateAdminAffiliateConfig() {
  const queryClient = useQueryClient()
  return useMutation<ApiEnvelope<AffiliateSystemConfig>, Error, Partial<AffiliateSystemConfig>>({
    mutationFn: (data) =>
      apiClient
        .patch<ApiEnvelope<AffiliateSystemConfig>>(ENDPOINTS.AFFILIATES.ADMIN_CONFIG, data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-config'] })
    },
  })
}

export function useAdminDirectWithdrawal() {
  const queryClient = useQueryClient()
  return useMutation<ApiEnvelope<unknown>, Error, DirectWithdrawalPayload>({
    mutationFn: (data) =>
      apiClient
        .post<ApiEnvelope<unknown>>(ENDPOINTS.AFFILIATES.ADMIN_DIRECT_WITHDRAWAL, data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'affiliate-withdrawals'] })
    },
  })
}

export function useAdminCreateAffiliate() {
  const queryClient = useQueryClient()
  return useMutation<ApiEnvelope<Affiliate>, Error, AdminCreateAffiliatePayload>({
    mutationFn: (data) =>
      apiClient
        .post<ApiEnvelope<Affiliate>>(ENDPOINTS.AFFILIATES.ADMIN_LIST, data)
        .then((res) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'affiliates'] })
    },
  })
}

