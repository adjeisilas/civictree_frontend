import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import { useNotificationStore } from '../stores/notificationStore'
import type {  Notification } from '../types/admin'

import { type PaginationInfo } from './useUsers'
/** Mutation hook to mark all notifications as read at once. */
export function useMarkAllRead() {
  const queryClient = useQueryClient()
  const resetAll = useNotificationStore((s) => s.resetAll)

  return useMutation<void, Error, void>({
    mutationFn: () =>
      apiClient
        .patch(ENDPOINTS.NOTIFICATIONS.MARK_ALL)
        .then(() => undefined),
    onSuccess: () => {
      resetAll()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}


/** Mutation hook to mark a single notification as read by its ID. */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const decrement = useNotificationStore((s) => s.decrement)

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiClient
        .patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id))
        .then(() => undefined),
    onSuccess: () => {
      decrement()
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}


export function useNotifications(page: number = 1, limit: number = 10, category?: string) {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)

  return useQuery<{ notifications: Notification[], pagination: PaginationInfo }>({
    queryKey: ['notifications', page, limit, category],
    queryFn: () =>
      apiClient
        .get<{
          success?: boolean
          data?: Notification[]
          pagination?: { page: number; limit: number; totalResults: number; totalPages: number }
        }>(ENDPOINTS.NOTIFICATIONS.LIST, { params: { page, limit, ...(category !== 'all' && category ? { type: category } : {}) } })
        .then((r) => {
          const notifications = Array.isArray(r.data?.data) ? r.data.data : []
          const pagination = r.data?.pagination || { page, limit, totalResults: notifications.length, totalPages: 1 }
          const unread = notifications.filter((n: Notification) => !n.isRead).length
          setUnreadCount(unread) // Note: This only counts unread on the current page
          return { notifications, pagination }
        }),
    staleTime: 1000 * 30, // 30s — notifications are time-sensitive
  })
}

export interface NotificationTypeData {
  type: string
  name: string
  description: string
  unreadCount: number
}

/** Query hook to fetch notification types and categories. */
export function useNotificationTypes() {
  return useQuery<{ success: boolean; totalUnread: number; data: NotificationTypeData[] }>({
    queryKey: ['notificationTypes'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; totalUnread: number; data: NotificationTypeData[] }>(ENDPOINTS.NOTIFICATIONS.TYPES)
        .then((r) => r.data),
  })
}

/** Query hook to fetch a single notification by ID. */
export function useNotification(id: string) {
  return useQuery<{ success: boolean; data: Notification }>({
    queryKey: ['notification', id],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Notification }>(ENDPOINTS.NOTIFICATIONS.BY_ID(id))
        .then((r) => r.data),
    enabled: !!id,
  })
}

export function useSubscribePush() {
  return useMutation<void, Error, PushSubscription>({
    mutationFn: (subscription) =>
      apiClient
        .post(ENDPOINTS.NOTIFICATIONS.PUSH_SUBSCRIBE, subscription)
        .then(() => undefined),
  })
}

export function useUnsubscribePush() {
  return useMutation<void, Error, { endpoint: string }>({
    mutationFn: (data) =>
      apiClient
        .post(ENDPOINTS.NOTIFICATIONS.PUSH_UNSUBSCRIBE, data)
        .then(() => undefined),
  })
}
