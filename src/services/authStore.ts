import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  name: string
  email: string
  role: string
  phoneNumber?: string
}

interface AuthState {
  isAuthenticated: boolean
  user: User | null
  token: string | null
  refreshToken: string | null
  login: (token: string, refreshToken: string, user: User) => void
  logout: () => void
  setUser: (user: User) => void
  setTokens: (token: string, refreshToken: string) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      token: null,
      refreshToken: null,
      login: (token, refreshToken, user) =>
        set({
          isAuthenticated: true,
          user,
          token,
          refreshToken,
        }),
      logout: () =>
        set({
          isAuthenticated: false,
          user: null,
          token: null,
          refreshToken: null,
        }),
      setUser: (user) => set({ user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
    }),
    {
      name: 'civictree-auth-storage',
    }
  )
)
