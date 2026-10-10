import { create } from 'zustand'

interface NotificationState {
  unreadCount: number
  setUnreadCount: (n: number) => void
  decrement: () => void
  resetAll: () => void
}

/** 
 * Client-side notification store.
 * Tracks the unread badge count for the sidebar.
 */
export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (n) => set({ unreadCount: n }),
  decrement: () => set((s) => ({ unreadCount: Math.max(0, s.unreadCount - 1) })),
  resetAll: () => set({ unreadCount: 0 }),
}))
