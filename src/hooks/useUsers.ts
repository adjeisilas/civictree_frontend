import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import { type UserLog } from '../components/admin/users/UserDetailsPage'
import { type AdminUser, type CreateUserPayload, type UpdateUserPayload } from '../types/admin'
import { useAuthStore } from '../services/authStore'

/** A user row as the API returns it, before it is mapped to the shape the screens use. */
interface ApiUserRow {
  id: string
  fullName?: string
  name?: string
  email: string
  phoneNumber?: string
  phone?: string
  role?: string
  isActive?: boolean
  createdAt?: string
}

/** An activity log row as the API returns it. */
interface ApiActivityLogRow {
  id: string
  userId?: string
  user?: { fullName?: string; email?: string }
  action?: string
  details?: string
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

interface ApiListResponse<T> {
  success?: boolean
  data?: T[]
  pagination?: PaginationInfo
}

/** The API answers with fullName/phoneNumber; the screens use name/phone. */
type UpdatedUser = AdminUser & { fullName?: string; phoneNumber?: string; phone?: string }

export function useAdminUsers(page: number = 1, limit: number = 10) {
  return useQuery<{ users: AdminUser[], pagination: PaginationInfo }>({
    queryKey: ['users', page, limit],
    queryFn: async () => {
      const r = await apiClient.get<ApiListResponse<ApiUserRow>>(ENDPOINTS.USERS.LIST, { params: { page, limit } })
      const rawUsers = Array.isArray(r.data?.data) ? r.data.data : []
      const pagination: PaginationInfo = r.data?.pagination || { page, limit, totalResults: rawUsers.length, totalPages: 1 }
      const users: AdminUser[] = rawUsers.map((u) => ({
        id: u.id,
        name: u.fullName || u.name || 'Unknown',
        email: u.email,
        phone: u.phoneNumber || u.phone || '',
        role: u.role || 'USER',
        status: u.isActive !== false ? 'Active' : 'Inactive',
        createdAt: u.createdAt,
      }))
      return { users, pagination }
    },
  })
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalResults: number;
  totalPages: number;
}

export function useActivityLogs(page: number = 1, limit: number = 10, userId?: string) {
  return useQuery<{ logs: UserLog[], pagination: PaginationInfo }>({
    queryKey: ['activity-logs', page, limit, userId],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, limit }
      if (userId) params.userId = userId

      const r = await apiClient.get<ApiListResponse<ApiActivityLogRow>>(ENDPOINTS.ACTIVITY_LOGS.LIST, {
        params
      })
      const rawLogs = Array.isArray(r.data?.data) ? r.data.data : []
      const pagination = r.data?.pagination || { page, limit, totalResults: rawLogs.length, totalPages: 1 }

      const logs: UserLog[] = rawLogs.map((log): UserLog => {
         let actionText = log.action;
         let category = 'System';
         if (log.action === 'USER_CREATED') actionText = 'Created a new user';
         if (log.action === 'USER_UPDATED') actionText = 'Updated user details';
         if (log.action === 'USER_DELETED') actionText = 'Deleted a user';
         if (log.action === 'USER_LOGIN') actionText = 'Logged into the system';

         if (log.action?.includes('USER')) category = 'Security';
         
         try {
           if (log.details) {
              const detailsObj = JSON.parse(log.details);
              if (detailsObj.targetUserEmail) actionText += ` (${detailsObj.targetUserEmail})`;
              else if (detailsObj.email) actionText += ` (${detailsObj.email})`;
           }
         } catch {
           // details is not valid JSON; keep the plain action text
         }

         let device = 'Unknown Device';
         if (log.userAgent) {
             if (log.userAgent.includes('Chrome')) device = 'Chrome';
             else if (log.userAgent.includes('Firefox')) device = 'Firefox';
             else if (log.userAgent.includes('Safari')) device = 'Safari';
             else if (log.userAgent.includes('Postman')) device = 'Postman';
             else device = log.userAgent.split('/')[0] || 'Unknown Device';
         }

         return {
           id: log.id,
           userId: log.userId || '',
           userName: log.user?.fullName || log.user?.email || 'Unknown User',
           role: 'ADMIN', 
           action: actionText || 'Activity',
           category,
           timestamp: new Date(log.createdAt).toLocaleString(),
           ipAddress: log.ipAddress || 'Unknown IP',
           device: device,
           status: 'Success'
         }
      })
      return { logs, pagination }
    }
  })
}


/** Mutation hook to create a new admin user account. */
export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation<AdminUser, Error, CreateUserPayload>({
    mutationFn: (payload) =>
      apiClient
        .post<{ success: boolean; data: AdminUser }>(ENDPOINTS.USERS.CREATE, payload)
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}


/** Mutation hook to permanently delete an admin user account. */
export function useDeleteUser() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiClient
        .delete(ENDPOINTS.USERS.DELETE(id))
        .then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}


interface UpdateUserParams {
  id: string
  payload: UpdateUserPayload
}

/** Mutation hook to update an existing admin user's details or status. */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((s) => s.setUser)
  const authUser = useAuthStore((s) => s.user)

  return useMutation<UpdatedUser, Error, UpdateUserParams>({
    mutationFn: ({ id, payload }) =>
      apiClient
        .patch<{ success: boolean; data: UpdatedUser }>(ENDPOINTS.USERS.UPDATE(id), payload)
        .then((r) => r.data.data),
    onSuccess: (updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      // If the updated user is the currently logged-in user, sync the auth store
      // so Profile, Settings, Sidebar, and AdminLayout all reflect the new data immediately
      if (authUser && authUser.id === id) {
        setUser({
          id: updated.id,
          name: updated.fullName || updated.name,
          email: updated.email,
          role: updated.role,
          phoneNumber: updated.phoneNumber || updated.phone,
        })
      }
    },
  })
}

/** Mutation hook to activate or deactivate a user account. */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient()

  return useMutation<AdminUser, Error, { id: string; isActive: boolean }>({
    mutationFn: ({ id, isActive }) =>
      apiClient
        .patch<{ success: boolean; data: AdminUser }>(ENDPOINTS.USERS.UPDATE_STATUS(id), { isActive })
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}
