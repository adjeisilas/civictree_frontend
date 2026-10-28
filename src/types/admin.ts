// ─── Shared Enums ────────────────────────────────────────────────────────────

export type ExamType = 'WASSCE_NOVDEC' | 'BECE' | 'CTVET_NABTEX'
export type VoucherStatus = 'Available' | 'Reserved' | 'Sold' | 'Delivered'
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed'
export type DeliveryStatus = 'Sent' | 'Pending' | 'Not sent'
export type Channel = 'Web' | 'USSD'
export type AdminRole = 'Super Admin' | 'Stock Manager' | 'Support Admin' | 'Auditor' | string

// ─── Vouchers ────────────────────────────────────────────────────────────────

export interface VoucherKey {
  id: string
  serial: string
  pin: string
  examType: ExamType
  status: VoucherStatus
  importDate: string
  updatedAt?: string
}

export interface VoucherConfig {
  type: ExamType
  price: number
  minLimit: number
}

export interface GlobalVoucherConfig {
  currency: string
  wassceNovdecPrice: number
  wassceNovdecLimit: number
  becePrice: number
  beceLimit: number
  ctvetNabtexPrice: number
  ctvetNabtexLimit: number
}

export interface VoucherStats {
  type: ExamType
  available: number
  sold: number
  remaining: number
  reserved: number
}

export interface UploadLog {
  id: string
  fileName: string
  /** Either the name as text, or the user record the API nests here */
  uploadedBy: string | { fullName?: string; email?: string }
  uploadDate: string
  voucherType: ExamType
  totalRecords: number
  successfulImports: number
  failedImports: number
}

export interface UploadVouchersPayload {
  defaultType: ExamType
  fileName: string
  keys: Omit<VoucherKey, 'importDate'>[]
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface AllocatedKey {
  serial: string
  pin: string
}

export interface Order {
  id: string
  customerName: string
  phone: string
  voucherType: ExamType
  quantity: number
  amount: number
  channel: Channel | 'Omnichannel' | string
  paymentStatus: PaymentStatus
  deliveryStatus: DeliveryStatus
  date: string
  allocatedKeys?: AllocatedKey[]
  smsRetryAttempts?: number
  gatewayRef?: string
  paymentMethod?: string
  paymentNetwork?: string
  gatewayResponseCode?: string
  paymentTimestamp?: string
  createdTimestamp?: string
  deliveryConfirmationTimestamp?: string
}

export type DateRangePreset =
  | 'All Time'
  | 'Today'
  | 'Yesterday'
  | 'This Week'
  | 'Last 7 Days'
  | 'This Month'
  | 'Last 30 Days'
  | 'Custom'

export interface OrderFilters {
  page?: number
  limit?: number
  q?: string
  search?: string
  voucherType?: ExamType | 'ALL'
  paymentStatus?: PaymentStatus | 'ALL' | 'SUCCESS' | 'PENDING' | 'FAILED'
  deliveryStatus?: DeliveryStatus | 'ALL' | 'SENT' | 'NOT_SENT' | 'FAILED'
  channel?: Channel | 'ALL' | 'WEB' | 'USSD'
  dateRange?: string
  startDate?: string
  endDate?: string
  date?: string
}

export interface RefundPayload {
  method: string
  reason: string
  notes: string
}

// ─── Customers ───────────────────────────────────────────────────────────────

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  totalOrders: number
  totalSpend: number
  lastOrderDate: string
  channel: Channel | 'Omnichannel' | string

  // UI fields from mock
  status?: 'Active' | 'Inactive' | string
  lifetimeSpend?: number
  firstPurchase?: string
  lastPurchase?: string
  preferredPayment?: string
  voucherTypes?: string[]
  ussdNetwork?: string
  ussdSessionsCount?: number
  linkedWallet?: string
  purchaseHistory?: Array<{
    id: string
    date: string
    voucherType: string
    quantity: number
    amount: number
    paymentMethod: string
    paymentStatus: 'Paid' | 'Failed' | string
    deliveryStatus: 'Sent' | 'Pending' | 'Not sent' | string
  }>
  smsHistory?: Array<{
    id: string
    timestamp: string
    message: string
    status: 'Delivered' | 'Failed' | 'Sending' | string
  }>
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface KpiStat {
  label: string
  value: string | number
  /**
   * Shorter form of `value` for narrow screens, where two cards sit abreast.
   * Only needed for long figures such as money.
   */
  mobileValue?: string
  /**
   * Supporting line under the figure. Leave it out when the data does not
   * support a comparison — an omitted line beats an invented statistic.
   */
  change?: string
  trend?: 'up' | 'down' | 'flat'
  icon?: string
  /**
   * Colour is reserved for meaning. 'critical' marks a figure needing
   * attention; anything else stays neutral.
   */
  tone?: 'neutral' | 'critical'
}

export interface ActivityItem {
  id: string
  message: string
  timestamp: string
  type: 'order' | 'sms' | 'voucher' | 'system'
}

export interface DashboardData {
  kpiStats: KpiStat[]
  recentOrders: Order[]
  activities: ActivityItem[]
}

export interface ChartDataPoint {
  label: string
  value: number
}

export interface RevenueTrendPoint {
  period: string
  revenue: number
  orders: number
}

export interface StockStatusItem {
  type: ExamType
  available: number
  sold: number
  remaining: number
  minLimit: number
}

// ─── Admin Users ─────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string
  name: string
  email: string
  role: AdminRole
  status: 'Active' | 'Inactive' | string
  createdAt?: string
  lastLogin?: string
  phone?: string
  avatarColor?: string
  professionalTitle?: string
  lastActive?: string
  firstLogin?: string
}

export interface CreateUserPayload {
  fullName: string
  email: string
  phoneNumber?: string
  role: string
  password: string
}

export interface UpdateUserPayload {
  fullName?: string
  email?: string
  phoneNumber?: string
  password?: string
  role?: AdminRole | string
  isActive?: boolean
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface ProfileData {
  id: string
  name: string
  email: string
  role: AdminRole
  avatarUrl?: string
  phoneNumber?: string
}

export interface UpdateProfilePayload {
  fullName?: string
  email?: string
  phoneNumber?: string
  role?: string
  password?: string
  isActive?: boolean
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType = 'critical' | 'warning' | 'success' | 'info' | 'error' | 'SYSTEM' | string

export interface Notification {
  id: string
  userId?: string
  type: NotificationType
  category?: 'stock' | 'gateway' | 'order' | 'user' | string
  title: string
  message: string
  time?: string
  isRead: boolean
  actionLabel?: string
  actionPath?: string
  createdAt?: string
  updatedAt?: string
}

// ─── SMS ─────────────────────────────────────────────────────────────────────

export interface SmsTemplate {
  id: string
  name: string
  body: string
}

export interface SmsHistoryItem {
  id: string
  date: string
  senderId: string
  recipientsGroup: string
  contactsCount: number
  type: string
  message: string
  status: 'Sent' | 'Failed' | 'Processing'
}

export interface SendBulkSmsPayload {
  body: string
  recipientType: 'ALL' | 'SUCCESSFUL' | 'FAILED_ONLY' | ExamType
  title: string
  // Optional metadata for frontend tracking or backwards compatibility
  voucherType?: string
  contactsCount?: number
  senderId?: string
  templateId?: string
}

export interface SendSingleSmsPayload {
  phoneNumber: string
  title: string
  body: string
  senderId?: string
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'annual'
export type ExportFormat = 'pdf' | 'excel' | 'csv'

export interface ReportStats {
  month: string
  year: number
  revenue: {
    WASSCE_NOVDEC: number
    BECE: number
  }
  orderRates: {
    successRate: number
    failureRate: number
  }
  customers: {
    new: number
    returning: number
  }
  channels: {
    WEB: number
    USSD: number
  }
}

export interface SalesReport {
  period: string
  totalSales: number
  totalOrders: number
  bece: number
  wassceNovdec: number
  revenue: number
}

export interface ExportReportPayload {
  period: ReportPeriod
  format: ExportFormat
}

// ─── Settings ────────────────────────────────────────────────────────────────

export interface PlatformSettings {
  // API Configurations
  senderId: string
  smsProvider: 'hubtel' | 'arkesel' | 'twilio'
  apiKey: string
  apiSecret: string
  webhookUrl: string

  // Platform Configurations
  autoSendSms: boolean
  lowStockAlerts: boolean
  autoRetrySms: boolean
  activeGateways: {
    mtnMomo: boolean
    telecelCash: boolean
    airtelTigoMoney: boolean
    visaMc: boolean
  }
  waecUrl: string
  ussdShortcode: string
  paymentCallback: string
  
  // Result Release Dates
  releaseDates?: Partial<Record<ExamType, string>>
}

export type UpdateSettingsPayload = Partial<PlatformSettings>
