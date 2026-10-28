import { API_BASE_URL } from '../config/apiBase'

const BASE = API_BASE_URL

export const ENDPOINTS = {
  // ─── Auth ────────────────────────────────────────────────────────────────
  AUTH: {
    LOGIN:           `${BASE}/auth/login`,
    LOGOUT:          `${BASE}/auth/logout`,
    FORGOT_PASSWORD: `${BASE}/auth/forgot-password`,
    VERIFY_OTP:      `${BASE}/auth/validate-otp`,
    REFRESH:         `${BASE}/auth/refresh`,
    RESET_PASSWORD:  `${BASE}/auth/reset-password`,
    CHANGE_PASSWORD: `${BASE}/auth/change-password`,
    ME:              `${BASE}/auth/me`,
    TWO_FACTOR_LOGIN:  `${BASE}/auth/login/two-factor`,
    TWO_FACTOR:        `${BASE}/auth/two-factor`,
    TWO_FACTOR_SETUP:  `${BASE}/auth/two-factor/setup`,
    TWO_FACTOR_ENABLE: `${BASE}/auth/two-factor/enable`,
    TWO_FACTOR_DISABLE:`${BASE}/auth/two-factor/disable`,
    TWO_FACTOR_CODES:  `${BASE}/auth/two-factor/recovery-codes`,
  },

  // ─── Activity Logs ───────────────────────────────────────────────────────
  ACTIVITY_LOGS: {
    LIST: `${BASE}/activity-logs`,
    BY_ID: (id: string) => `${BASE}/activity-logs/${id}`,
  },

  // ─── Dashboard ───────────────────────────────────────────────────────────
  DASHBOARD: {
    STATS: `${BASE}/admin/dashboard/stats`,
  },

  // ─── Vouchers ────────────────────────────────────────────────────────────
  VOUCHERS: {
    KEYS:           `${BASE}/vouchers`,
    KEY_BY_ID:      (id: string) => `${BASE}/vouchers/${id}`,
    REVEAL_PIN:     (id: string) => `${BASE}/vouchers/${id}/pin`,
    UPLOAD_BULK:    `${BASE}/vouchers/upload-bulk`,
    UPLOAD_SINGLE:  `${BASE}/vouchers/upload-single`,
    DELETE:         (id: string) => `${BASE}/vouchers/${id}`,
    CONFIGS:        `${BASE}/vouchers/configs`,
    PUBLIC_CONFIGS: `${BASE}/vouchers/configs/public`,
    RELEASE_DATES:  `${BASE}/vouchers/configs/release-dates`,
    UPLOAD_HISTORY: `${BASE}/vouchers/upload-history`,
    OVERVIEW:       `${BASE}/vouchers/overview`,
    SOLD:           `${BASE}/vouchers/sold`,
    CHECK_BULK_DUPLICATES: `${BASE}/vouchers/check-bulk-duplicates`,
  },

  // ─── Orders ──────────────────────────────────────────────────────────────
  ORDERS: {
    LIST:       `${BASE}/admin/orders`,
    STATS:      `${BASE}/admin/orders/stats`,
    BY_ID:      (id: string) => `${BASE}/admin/orders/${id}`,
    RESEND_SMS: (id: string) => `${BASE}/admin/orders/${id}/resend-sms`,
    REALLOCATE: (id: string) => `${BASE}/admin/orders/${id}/reallocate`,
    REFUND:     (id: string) => `${BASE}/admin/orders/${id}/refund`,
  },

  // ─── Customers ───────────────────────────────────────────────────────────
  CUSTOMERS: {
    LIST:       `${BASE}/admin/customers`,
    STATS:      `${BASE}/admin/customers/stats`,
    BY_PHONE:   (phone: string) => `${BASE}/admin/customers/${phone}`,
    DELETE:     (id: string) => `${BASE}/admin/customers/${id}`,
  },

  // ─── SMS ─────────────────────────────────────────────────────────────────
  SMS: {
    SEND_BULK:        `${BASE}/admin/sms/bulk`,
    SEND_BULK_BECE:   `${BASE}/admin/sms/bulk/bece`,
    SEND_BULK_WASSCE: `${BASE}/admin/sms/bulk/wassce`,
    SEND_BULK_CTVET_NABTEX: `${BASE}/admin/sms/bulk/ctvet-nabtex`,
    SEND_SINGLE:      `${BASE}/admin/sms/single`,
    RECIPIENT_COUNT:  `${BASE}/admin/sms/recipients/count`,
    CONTACTS:         `${BASE}/admin/sms/contacts`,
    HISTORY:          `${BASE}/sms/history`,
    TEMPLATES:        `${BASE}/sms/templates`,
  },

  // ─── Reports ─────────────────────────────────────────────────────────────
  REPORTS: {
    STATS:  `${BASE}/admin/reports/stats`,
    SALES:  `${BASE}/reports/sales`,
    EXPORT: `${BASE}/reports/export`,
  },

  // ─── Admin Users ─────────────────────────────────────────────────────────
  USERS: {
    LIST:   `${BASE}/users`,
    BY_ID:  (id: string) => `${BASE}/users/${id}`,
    CREATE: `${BASE}/users`,
    UPDATE: (id: string) => `${BASE}/users/${id}`,
    UPDATE_STATUS: (id: string) => `${BASE}/users/${id}/status`,
    DELETE: (id: string) => `${BASE}/users/${id}`,
  },

  // ─── Profile ─────────────────────────────────────────────────────────────
  PROFILE: {
    GET:             `${BASE}/profile`,
    UPDATE:          `${BASE}/profile`,
    UPLOAD_AVATAR:   `${BASE}/profile/avatar`,
  },

  // ─── Notifications ───────────────────────────────────────────────────────
  NOTIFICATIONS: {
    LIST:      `${BASE}/notifications`,
    TYPES:     `${BASE}/notifications/types`,
    MARK_READ: (id: string) => `${BASE}/notifications/${id}/read`,
    MARK_ALL:  `${BASE}/notifications/read-all`,
    BY_ID:     (id: string) => `${BASE}/notifications/${id}`,
    PUSH_SUBSCRIBE:   `${BASE}/notifications/push/subscribe`,
    PUSH_UNSUBSCRIBE: `${BASE}/notifications/push/unsubscribe`,
  },

  // ─── Settings ────────────────────────────────────────────────────────────
  SETTINGS: {
    GET:    `${BASE}/vouchers/configs`,
    UPDATE: `${BASE}/vouchers/configs`,
  },

  // ─── Public Website ──────────────────────────────────────────────────────
  WEBSITE: {
    PRODUCTS:          `${BASE}/public/products`,
    INITIATE_PURCHASE: `${BASE}/orders/`,
    VERIFY_PAYMENT:    `${BASE}/public/purchase/verify`,
    TIMETABLE:         `${BASE}/timetables`,
    CONTACT:           `${BASE}/public/contact`,
  },

  // ─── Admin Timetables ──────────────────────────────────────────────────────────
  ADMIN_TIMETABLES: {
    GET_ALL: `${BASE}/admin/timetables`,
    UPDATE: (type: string) => `${BASE}/admin/timetables/${type}`,
  },

  // ─── Affiliates ───────────────────────────────────────────────────────────────
  AFFILIATES: {
    // Public
    REGISTER:          `${BASE}/auth/affiliate/register`,
    LOGIN:             `${BASE}/auth/affiliate/login`,

    // Affiliate Portal (authenticated)
    PROFILE:           `${BASE}/affiliate/profile`,
    UPDATE_PROFILE:    `${BASE}/affiliate/profile`,
    UPDATE_PAYMENT:    `${BASE}/affiliate/profile/payment`,
    DASHBOARD:         `${BASE}/affiliate/dashboard`,
    SALES:             `${BASE}/affiliate/sales`,
    EARNINGS:          `${BASE}/affiliate/earnings`,
    WITHDRAWALS:       `${BASE}/affiliate/withdrawals`,
    REQUEST_WITHDRAWAL:`${BASE}/affiliate/withdrawals`,

    // Admin Management
    ADMIN_LIST:               `${BASE}/admin/affiliates`,
    ADMIN_BY_ID:              (id: string) => `${BASE}/admin/affiliates/${id}`,
    ADMIN_STATUS:             (id: string) => `${BASE}/admin/affiliates/${id}/status`,
    ADMIN_USSD:               (id: string) => `${BASE}/admin/affiliates/${id}/ussd`,
    ADMIN_WITHDRAWALS:        `${BASE}/admin/affiliates/withdrawals`,
    ADMIN_WITHDRAWAL_BY_ID:    (id: string) => `${BASE}/admin/affiliates/withdrawals/${id}`,
    ADMIN_DIRECT_WITHDRAWAL:  `${BASE}/admin/affiliates/withdrawals/direct`,
    ADMIN_CONFIG:             `${BASE}/admin/affiliates/config`,
  },

  // ─── Revenue-Share Partners & Stakeholders ─────────────────────────────────
  PARTNER: {
    // Auth
    LOGIN:             `${BASE}/auth/partner/login`,
    LOGOUT:            `${BASE}/auth/partner/logout`,
    FORGOT_PASSWORD:   `${BASE}/auth/partner/forgot-password`,
    ME:                `${BASE}/partner/profile`,

    // Dashboard & Metrics
    DASHBOARD:         `${BASE}/partner/dashboard`,
    STATS:             `${BASE}/partner/stats`,
    TRANSACTIONS:      `${BASE}/partner/transactions`,
    REPORTS:           `${BASE}/partner/reports`,
    REPORTS_EXPORT:    `${BASE}/partner/reports/export`,

    // Settlements / Cashouts
    SETTLEMENTS:       `${BASE}/partner/settlements`,
    REQUEST_PAYOUT:    `${BASE}/partner/settlements/request`,
    PAYOUT_ACCOUNTS:   `${BASE}/partner/payout-accounts`,

    // Notifications
    NOTIFICATIONS:     `${BASE}/partner/notifications`,
    MARK_READ:         (id: string) => `${BASE}/partner/notifications/${id}/read`,
    MARK_ALL_READ:     `${BASE}/partner/notifications/read-all`,

    // Profile & Settings
    PROFILE:           `${BASE}/partner/profile`,
    UPDATE_PROFILE:    `${BASE}/partner/profile`,
    SETTINGS:          `${BASE}/partner/settings`,
    UPDATE_SETTINGS:   `${BASE}/partner/settings`,
    CHANGE_PASSWORD:   `${BASE}/partner/change-password`,
  },
}

