import axios, { type InternalAxiosRequestConfig } from 'axios'
import { useAuthStore } from '../services/authStore'
import { useAffiliateAuthStore } from '../stores/affiliateStore'
import { usePartnerStore } from '../stores/partnerStore'
import { ENDPOINTS } from '../services/endpoints'
import { API_BASE_URL } from '../config/apiBase'

/**
 * Central Axios instance for all CivicTree API calls.
 * - Automatically injects the Bearer token from Zustand auth stores.
 * - Renews expired access tokens with the refresh token and retries the request once.
 * - Logs out and redirects to the correct login page when the session cannot be renewed.
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

type Portal = 'admin' | 'affiliate' | 'partner'

const portalForUrl = (url: string): Portal => {
  if (url.includes('/api/partner/') || url.includes('/partner/')) return 'partner'
  if (url.includes('/api/affiliate/') && !url.includes('/api/admin/')) return 'affiliate'
  return 'admin'
}

// Session access for each portal's store
const sessions = {
  admin: {
    store: useAuthStore,
    token: () => useAuthStore.getState().token,
    refreshToken: () => useAuthStore.getState().refreshToken,
    setTokens: (token: string, refreshToken: string) => useAuthStore.getState().setTokens(token, refreshToken),
    logout: () => useAuthStore.getState().logout(),
    loginPath: '/admin/login',
  },
  affiliate: {
    store: useAffiliateAuthStore,
    token: () => useAffiliateAuthStore.getState().token,
    refreshToken: () => useAffiliateAuthStore.getState().refreshToken,
    setTokens: (token: string, refreshToken: string) => useAffiliateAuthStore.getState().setTokens(token, refreshToken),
    logout: () => useAffiliateAuthStore.getState().affiliateLogout(),
    loginPath: '/affiliate/login',
  },
  partner: {
    store: usePartnerStore,
    token: () => usePartnerStore.getState().token,
    refreshToken: () => usePartnerStore.getState().refreshToken,
    setTokens: (token: string, refreshToken: string) => usePartnerStore.getState().setTokens(token, refreshToken),
    logout: () => usePartnerStore.getState().partnerLogout(),
    loginPath: '/partner/login',
  },
} as const

// Endpoints where a 401 means "wrong credentials/code", not "session expired"
const AUTH_ENDPOINT_PATTERN = /\/auth\/(login|refresh|logout|forgot-password|validate-otp|reset-password|affiliate\/login|affiliate\/register|partner\/login|partner\/forgot-password)$/

// One refresh at a time per portal; concurrent 401s wait for the same renewal
const refreshInFlight: Partial<Record<Portal, Promise<string | null>>> = {}

const renewAccessToken = (portal: Portal): Promise<string | null> => {
  const pending = refreshInFlight[portal]
  if (pending) return pending

  const session = sessions[portal]

  const renewal = (async () => {
    try {
      // Another tab may have rotated the refresh token; pick up the latest stored copy first
      await session.store.persist.rehydrate()
      const refreshToken = session.refreshToken()
      if (!refreshToken) return null

      // Plain axios, so this request never goes through the interceptors below
      const response = await axios.post<{ data: { accessToken: string; refreshToken: string } }>(
        ENDPOINTS.AUTH.REFRESH,
        { refreshToken },
        { timeout: 15000 }
      )
      const { accessToken, refreshToken: nextRefreshToken } = response.data.data
      session.setTokens(accessToken, nextRefreshToken)
      return accessToken
    } catch {
      return null
    } finally {
      delete refreshInFlight[portal]
    }
  })()

  refreshInFlight[portal] = renewal
  return renewal
}

// ─── Request Interceptor ─────────────────────────────────────────────────────
// Reads token from the correct Zustand store and injects it as Bearer auth header
apiClient.interceptors.request.use(
  (config) => {
    const token = sessions[portalForUrl(config.url || '')].token()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor ────────────────────────────────────────────────────
// On 401: renew the session once and retry; if that fails, log out and redirect to the right login page
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined
    const url = config?.url || ''

    if (error.response?.status !== 401 || !config || AUTH_ENDPOINT_PATTERN.test(url)) {
      return Promise.reject(error)
    }

    const portal = portalForUrl(url)

    if (!config._retried) {
      config._retried = true
      const newToken = await renewAccessToken(portal)
      if (newToken) {
        config.headers.Authorization = `Bearer ${newToken}`
        return apiClient(config)
      }
    }

    const session = sessions[portal]
    session.logout()
    window.location.href = session.loginPath
    return Promise.reject(error)
  }
)
