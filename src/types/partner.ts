// ─── Partner & Stakeholder Types ─────────────────────────────────────────────

export type PartnerStatus = 'Active' | 'Pending' | 'Suspended' | 'Inactive'
export type SettlementStatus = 'Pending' | 'Processing' | 'Completed' | 'Failed' | 'Rejected'
export type PayoutMethodType = 'MOMO' | 'BANK'
export type PeriodType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface PartnerUser {
  id: string
  partnerId: string             // e.g. "PRT-8801"
  partnerName: string           // e.g. "Apex Ventures / Dr. Emmanuel Osei"
  email: string
  phone: string
  contractRef: string          // e.g. "CTR-REV-2026-04"
  sharePercentage: number       // e.g. 5.0 (means 5%)
  status: PartnerStatus
  avatarUrl?: string
}

export interface PartnerProfile {
  id: string
  partnerId: string
  partnerName: string
  legalEntityName?: string
  email: string
  phone: string
  contractRef: string
  sharePercentage: number
  status: PartnerStatus
  startDate: string
  totalVouchersSold: number
  lifetimeGrossVolume: number
  lifetimeShareEarnings: number
  withdrawnAmount: number
  pendingWithdrawalAmount: number
  availableBalance: number
  payoutMethods: PartnerPayoutAccount[]
}

export interface PartnerPayoutAccount {
  id: string
  type: PayoutMethodType
  provider: string              // "MTN", "Telecel", "AirtelTigo", "GCB Bank", "Ecobank", etc.
  accountNumber: string
  accountName: string
  isDefault: boolean
}

export interface PartnerDashboardStats {
  partnerId: string
  partnerName: string
  contractRef: string
  sharePercentage: number
  lifetimeGrossVolume: number
  lifetimeShareEarnings: number
  availableBalance: number
  pendingWithdrawalAmount: number
  withdrawnAmount: number
  totalVouchersSold: number
  todayEarnings: number
  todayVouchersSold: number
  todayGrossVolume: number
  mtdEarnings: number
  mtdGrowthPercentage: number
  avgEarningPerVoucher: number
  recentTransactions: PartnerTransaction[]
  voucherDistribution: {
    wassce: { count: number; volume: number; earnings: number }
    bece: { count: number; volume: number; earnings: number }
    novdec: { count: number; volume: number; earnings: number }
  }
}

export interface PartnerTransaction {
  id: string
  orderRef: string              // e.g. "ORD-94812"
  voucherType: 'WASSCE' | 'BECE' | 'NOVDEC' | string
  quantity: number
  unitPrice: number
  grossAmount: number
  partnerPercentage: number
  partnerEarning: number
  channel: 'Web Direct' | 'USSD *123#' | 'Affiliate USSD' | string
  settlementStatus: 'Accrued' | 'Settled' | 'Processing'
  createdAt: string
  paymentMethod: string         // "MTN MoMo", "Telecel Cash", "Card"
}

export interface PartnerPeriodDataPoint {
  label: string                 // "09:00", "Mon", "Jan", "2026"
  timestamp?: string
  grossVolume: number
  partnerEarnings: number
  vouchersCount: number
}

export interface PartnerReportStats {
  period: PeriodType
  dateRange: { start: string; end: string }
  totalGrossVolume: number
  totalPartnerEarnings: number
  totalVouchersSold: number
  avgOrderValue: number
  chartData: PartnerPeriodDataPoint[]
  categoryBreakdown: {
    category: string
    vouchersSold: number
    grossVolume: number
    partnerShare: number
    percentageOfTotal: number
  }[]
}

export interface PartnerSettlement {
  id: string
  reference: string             // "PAY-88214"
  amount: number
  fee?: number
  netAmount: number
  payoutMethod: PayoutMethodType
  provider: string              // "MTN Mobile Money", "Standard Chartered"
  destinationAccount: string    // "024XXXX890" or "Account ***419"
  accountName: string
  status: SettlementStatus
  requestedAt: string
  processedAt?: string
  notes?: string
  receiptUrl?: string
}

export interface PartnerNotification {
  id: string
  title: string
  message: string
  type: 'TRANSACTION_SURGE' | 'PAYOUT_STATUS' | 'DAILY_DIGEST' | 'CONTRACT_UPDATE' | 'SYSTEM'
  isRead: boolean
  createdAt: string
  link?: string
  metadata?: Record<string, unknown>
}

export interface PartnerSettings {
  autoSettlementEnabled: boolean
  autoSettlementThreshold: number  // e.g. GHS 500
  settlementFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'THRESHOLD'
  defaultPayoutAccountId?: string
  emailDailyDigest: boolean
  emailPayoutAlerts: boolean
  smsSurgeAlerts: boolean
  smsPayoutAlerts: boolean
  surgeAlertThreshold: number      // e.g. 50 sales in 10 mins
  currencyDisplay: 'GHS' | 'USD'
  timezone: string
}
