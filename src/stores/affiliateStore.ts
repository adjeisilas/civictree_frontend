import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AffiliateStatus } from '../types/affiliate'

// ─── Affiliate Auth Store (for logged-in affiliate user session) ─────────────

interface AffiliateUser {
  id: string
  affiliateId: string
  fullName: string
  email: string
  status: AffiliateStatus
}

interface AffiliateAuthState {
  isAuthenticated: boolean
  affiliateUser: AffiliateUser | null
  token: string | null
  refreshToken: string | null
  affiliateLogin: (token: string, user: AffiliateUser, refreshToken?: string | null) => void
  affiliateLogout: () => void
  setTokens: (token: string, refreshToken: string) => void
}

export const useAffiliateAuthStore = create<AffiliateAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      affiliateUser: null,
      token: null,
      refreshToken: null,
      affiliateLogin: (token, user, refreshToken = null) =>
        set({ isAuthenticated: true, affiliateUser: user, token, refreshToken }),
      affiliateLogout: () => set({ isAuthenticated: false, affiliateUser: null, token: null, refreshToken: null }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
    }),
    { name: 'civictree-affiliate-auth' }
  )
)
