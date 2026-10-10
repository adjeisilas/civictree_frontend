import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import { useAuthStore } from '../services/authStore'
import { queryClient } from '../lib/queryClient'

interface ForgotPasswordPayload {
  email: string
}

/**
 * Mutation hook for forgot-password flow.
 * On success: navigates to OTP verification page.
 */
export function useForgotPassword() {
  const navigate = useNavigate()

  return useMutation<void, Error, ForgotPasswordPayload>({
    mutationFn: (payload) =>
      apiClient
        .post(ENDPOINTS.AUTH.FORGOT_PASSWORD, payload)
        .then(() => undefined),
    onSuccess: (_data, { email }) => {
      navigate('/admin/verify-otp', { state: { email } })
    },
  })
}


interface LoginPayload {
  email: string
  password: string
}

interface LoginResponse {
  accessToken?: string
  refreshToken?: string
  user?: {
    id: string
    fullName: string
    email: string
    role: string
  }
  // Sent instead of a session when the account uses two-factor sign-in
  twoFactorRequired?: boolean
  challengeToken?: string
}

/**
 * Mutation hook for admin login.
 * On success: populates Zustand auth store and navigates to dashboard.
 */
export function useLogin() {
  const login = useAuthStore((s) => s.login)
  const navigate = useNavigate()

  return useMutation<LoginResponse, Error, LoginPayload>({
    mutationFn: (credentials) =>
      apiClient
        .post<{ success: boolean; data: LoginResponse }>(ENDPOINTS.AUTH.LOGIN, credentials)
        .then((r) => r.data.data),
    onSuccess: (data) => {
      // Two-factor accounts finish signing in on the code page
      if (data.twoFactorRequired && data.challengeToken) {
        navigate('/admin/two-factor', { state: { challengeToken: data.challengeToken }, replace: true })
        return
      }

      const { accessToken, refreshToken, user } = data
      if (!accessToken || !refreshToken || !user) return

      login(accessToken, refreshToken, {
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role
      })
      navigate('/admin/dashboard', { replace: true })
    },
  })
}


/**
 * Mutation hook for admin logout.
 * - Calls the server logout endpoint (invalidates the token server-side).
 * - Clears Zustand auth store.
 * - Clears all TanStack Query cache.
 * - Redirects to login.
 */
export function useLogout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  return useMutation<void, Error, void>({
    mutationFn: () => {
      const refreshToken = useAuthStore.getState().refreshToken
      return apiClient
        .post(ENDPOINTS.AUTH.LOGOUT, { refreshToken })
        .then(() => undefined)
    },
    onSettled: () => {
      // Always clear client state regardless of server response
      logout()
      queryClient.clear()
      navigate('/admin/login', { replace: true })
    },
  })
}


interface ResetPasswordPayload {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

/**
 * Mutation hook to set a new password with the verified OTP code.
 * On success: navigates back to login page.
 */
export function useResetPassword() {
  const navigate = useNavigate()

  return useMutation<void, Error, ResetPasswordPayload>({
    mutationFn: (payload) =>
      apiClient
        .post(ENDPOINTS.AUTH.RESET_PASSWORD, payload)
        .then(() => undefined),
    onSuccess: () => {
      navigate('/admin/login', { replace: true, state: { resetSuccess: true } })
    },
  })
}


interface VerifyOtpPayload {
  email: string
  otp: string
}

/**
 * Mutation hook for OTP verification.
 * On success: navigates to the reset-password page with the email and the checked code.
 */
export function useVerifyOtp() {
  const navigate = useNavigate()

  return useMutation<void, Error, VerifyOtpPayload>({
    mutationFn: (payload) =>
      apiClient
        .post(ENDPOINTS.AUTH.VERIFY_OTP, payload)
        .then(() => undefined),
    onSuccess: (_data, { email, otp }) => {
      navigate('/admin/reset-password', { state: { email, otp, verified: true } })
    },
  })
}
