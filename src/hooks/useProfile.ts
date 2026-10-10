import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import { type  ChangePasswordPayload, type  ProfileData, UpdateProfilePayload } from '../types/admin'
import { useAuthStore } from '../services/authStore'

/** The API answers with fullName/phoneNumber; the auth store uses name/phoneNumber. */
type UpdatedProfile = ProfileData & { fullName?: string; name?: string; phoneNumber?: string }

/** Mutation hook to change the admin's password. */
export function useChangePassword() {
  return useMutation<void, Error, ChangePasswordPayload>({
    mutationFn: (payload) =>
      apiClient
        .patch(ENDPOINTS.AUTH.CHANGE_PASSWORD, payload)
        .then(() => undefined),
  })
}


/** Fetches the currently authenticated admin's profile data. */
export function useProfile() {
  return useQuery<ProfileData>({
    queryKey: ['profile'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: ProfileData }>(ENDPOINTS.PROFILE.GET)
        .then((r) => r.data.data),
  })
}


export function useUpdateProfile() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  const user = useAuthStore((s) => s.user)

  return useMutation<UpdatedProfile, Error, UpdateProfilePayload>({
    mutationFn: (payload) =>
      apiClient
        .patch<{ success: boolean; data: UpdatedProfile }>(ENDPOINTS.USERS.UPDATE(user?.id || ''), payload)
        .then((r) => r.data.data),
    onSuccess: (updated) => {
      // Sync name/email changes back into the Zustand auth store
      setUser({ id: updated.id, name: updated.fullName || updated.name, email: updated.email, role: updated.role, phoneNumber: updated.phoneNumber })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}


interface UploadAvatarResponse {
  avatarUrl: string
}

/**
 * Mutation hook to upload a new profile avatar image.
 * Sends multipart/form-data. Invalidates the profile cache on success.
 */
export function useUploadAvatar() {
  const queryClient = useQueryClient()

  return useMutation<UploadAvatarResponse, Error, FormData>({
    mutationFn: (formData) =>
      apiClient
        .post<{ success: boolean; data: UploadAvatarResponse }>(
          ENDPOINTS.PROFILE.UPLOAD_AVATAR,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
