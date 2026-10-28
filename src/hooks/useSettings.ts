import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import type { PlatformSettings } from '../types/admin'

/**
 * The release-dates endpoint takes ISO timestamps, or null to clear a date.
 * One field per voucher type, named as the API names them
 * (`beceReleaseDate`, `wassceNovdecReleaseDate`, `ctvetNabtexReleaseDate`).
 */
export type UpdateReleaseDatesPayload = Record<string, string | null>

/** Fetches the current platform settings. */
export function useSettings() {
  return useQuery<PlatformSettings>({
    queryKey: ['settings'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: PlatformSettings }>(ENDPOINTS.SETTINGS.GET)
        .then((r) => r.data.data),
    staleTime: 1000 * 60 * 5, // 5 min — settings don't change often
  })
}


export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation<PlatformSettings, Error, UpdateReleaseDatesPayload>({
    mutationFn: (payload) =>
      apiClient
        .put<{ success: boolean; data: PlatformSettings }>(ENDPOINTS.VOUCHERS.RELEASE_DATES, payload)
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}
