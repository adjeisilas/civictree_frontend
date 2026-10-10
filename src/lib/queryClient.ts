import { QueryClient } from '@tanstack/react-query'

/**
 * Shared TanStack QueryClient with sensible CivicTree defaults.
 *
 * staleTime: 2 seconds — admin data is relatively fresh
 * retry: 2 — retry failed requests twice before surfacing errors
 * refetchOnWindowFocus: false — avoid surprise refetches on tab switch
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 2,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
})
