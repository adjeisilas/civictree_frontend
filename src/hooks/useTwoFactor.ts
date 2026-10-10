import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import { useAuthStore } from '../services/authStore'
import { queryClient } from '../lib/queryClient'

export interface TwoFactorStatus {
  enabled: boolean
  setupStarted: boolean
  recoveryCodesRemaining: number
}

interface SetupResponse {
  qrCodeDataUrl: string
  otpauthUrl: string
  manualEntryKey: string
}

interface LoginSession {
  accessToken: string
  refreshToken: string
  user: { id: string; fullName: string; email: string; role: string }
}

/** Whether two-factor sign-in is on for the signed-in admin. */
export function useTwoFactorStatus() {
  return useQuery<TwoFactorStatus>({
    queryKey: ['two-factor-status'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: TwoFactorStatus }>(ENDPOINTS.AUTH.TWO_FACTOR)
        .then((r) => r.data.data),
  })
}

/** Second login step: exchanges the challenge token and a code for a session. */
export function useTwoFactorLogin() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  return useMutation<LoginSession, Error, { challengeToken: string; code: string }>({
    mutationFn: (payload) =>
      apiClient
        .post<{ success: boolean; data: LoginSession }>(ENDPOINTS.AUTH.TWO_FACTOR_LOGIN, payload)
        .then((r) => r.data.data),
    onSuccess: ({ accessToken, refreshToken, user }) => {
      login(accessToken, refreshToken, {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
      })
      navigate('/admin/dashboard', { replace: true })
    },
  })
}

/** Starts enrolment and returns the QR code to scan. */
export function useStartTwoFactorSetup() {
  return useMutation<SetupResponse, Error, { currentPassword: string }>({
    mutationFn: (payload) =>
      apiClient
        .post<{ success: boolean; data: SetupResponse }>(ENDPOINTS.AUTH.TWO_FACTOR_SETUP, payload)
        .then((r) => r.data.data),
  })
}

/** Confirms a code from the app and switches two-factor on. Returns the recovery codes. */
export function useEnableTwoFactor() {
  return useMutation<string[], Error, { code: string }>({
    mutationFn: (payload) =>
      apiClient
        .post<{ success: boolean; data: { recoveryCodes: string[] } }>(ENDPOINTS.AUTH.TWO_FACTOR_ENABLE, payload)
        .then((r) => r.data.data.recoveryCodes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor-status'] })
    },
  })
}

/** Turns two-factor off. Needs the password and a current code. */
export function useDisableTwoFactor() {
  return useMutation<void, Error, { currentPassword: string; code: string }>({
    mutationFn: (payload) =>
      apiClient.post(ENDPOINTS.AUTH.TWO_FACTOR_DISABLE, payload).then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor-status'] })
    },
  })
}

/** Replaces the recovery codes with a new set. */
export function useRegenerateRecoveryCodes() {
  return useMutation<string[], Error, { currentPassword: string; code: string }>({
    mutationFn: (payload) =>
      apiClient
        .post<{ success: boolean; data: { recoveryCodes: string[] } }>(ENDPOINTS.AUTH.TWO_FACTOR_CODES, payload)
        .then((r) => r.data.data.recoveryCodes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['two-factor-status'] })
    },
  })
}
