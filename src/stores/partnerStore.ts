import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PartnerUser } from '../types/partner'

// ─── Partner Auth & Session Store ───────────────────────────────────────────

interface PartnerAuthState {
  isAuthenticated: boolean
  partnerUser: PartnerUser | null
  token: string | null
  refreshToken: string | null
  unreadNotificationCount: number
  partnerLogin: (token: string, user: PartnerUser, refreshToken?: string | null) => void
  setTokens: (token: string, refreshToken: string) => void
  partnerLogout: () => void
  updatePartnerProfile: (userUpdates: Partial<PartnerUser>) => void
  setUnreadNotificationCount: (count: number) => void
  decrementNotificationCount: () => void
}

export const usePartnerStore = create<PartnerAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      partnerUser: null,
      token: null,
      refreshToken: null,
      unreadNotificationCount: 0,

      partnerLogin: (token, user, refreshToken = null) =>
        set({ isAuthenticated: true, partnerUser: user, token, refreshToken }),

      setTokens: (token, refreshToken) => set({ token, refreshToken }),

      partnerLogout: () =>
        set({
          isAuthenticated: false,
          partnerUser: null,
          token: null,
          refreshToken: null,
          unreadNotificationCount: 0,
        }),

      updatePartnerProfile: (userUpdates) =>
        set((state) => ({
          partnerUser: state.partnerUser
            ? { ...state.partnerUser, ...userUpdates }
            : null,
        })),

      setUnreadNotificationCount: (count) =>
        set({ unreadNotificationCount: Math.max(0, count) }),

      decrementNotificationCount: () =>
        set((state) => ({
          unreadNotificationCount: Math.max(0, state.unreadNotificationCount - 1),
        })),
    }),
    { name: 'civictree-partner-auth' }
  )
)
