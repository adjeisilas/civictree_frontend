// ─── Affiliate System Types ────────────────────────────────────────────────────

// ─── Enums / Status Unions ────────────────────────────────────────────────────

export type AffiliateStatus = 'Pending' | 'Active' | 'Suspended' | 'Inactive'

export type CommissionStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid' | 'Reversed'

export type WithdrawalStatus = 'Pending' | 'Approved' | 'Rejected' | 'Paid'

export type PaymentMethodType = 'Mobile Money' | 'Bank'

export type MomoNetwork = 'MTN' | 'Telecel' | 'AirtelTigo'

// ─── Payment Details ──────────────────────────────────────────────────────────

export interface MobileMoneyDetails {
  type: 'Mobile Money'
  network: MomoNetwork
  phoneNumber: string
  accountName: string
}

export interface BankDetails {
  type: 'Bank'
  bankName: string
  accountNumber: string
  accountName: string
}

export type PaymentDetails = MobileMoneyDetails | BankDetails
/**
 * Payout details as they come back from the API: either kind of account, and any field
 * may be missing on older records. Screens read from this rather than casting.
 *
 * Written out field by field: intersecting the two account types would clash on `type`.
 */
export interface StoredPaymentDetails {
  type?: PaymentMethodType
  network?: MomoNetwork | string
  phoneNumber?: string
  accountName?: string
  bankName?: string
  accountNumber?: string
}





// ─── Affiliate ────────────────────────────────────────────────────────────────

export interface Affiliate {
  id: string
  userId?: string
  affiliateId?: string         // e.g. AFF-001
  affiliateCode?: string       // Backend model e.g. AFF-1001
  fullName?: string
  email?: string
  phone?: string
  phoneNumber?: string
  location: string
  businessName?: string
  status: AffiliateStatus | 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'REJECTED'
  ussdCode?: string | null
  payoutMethod?: string
  momoNetwork?: string | null
  momoNumber?: string | null
  momoAccountName?: string | null
  bankName?: string | null
  bankAccountNumber?: string | null
  bankAccountName?: string | null
  paymentDetails?: PaymentDetails
  avatarColor?: string
  createdAt: string
  updatedAt?: string
  rejectionReason?: string | null

  // Financial summary
  totalVouchersSold?: number
  totalSalesAmount?: number
  totalSalesGenerated?: number | string
  pendingCommission?: number
  approvedCommission?: number
  withdrawnAmount?: number
  pendingWithdrawalAmount?: number
  availableBalance?: number
  commissionRate?: number

  // Nested user from backend
  user?: {
    id: string
    fullName: string
    email: string
    phoneNumber: string
    isActive?: boolean
    createdAt?: string
  }

  // Nested profile from backend
  affiliateProfile?: Partial<Affiliate>
}

// ─── Registration ─────────────────────────────────────────────────────────────

export interface AffiliateRegisterPayload {
  fullName: string
  email: string
  phone: string
  location: string
  businessName?: string
  paymentMethod: PaymentMethodType
  // MoMo
  momoNetwork?: MomoNetwork
  momoPhone?: string
  momoAccountName?: string
  // Bank
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
  password: string
  confirmPassword: string
}

export interface AffiliateLoginPayload {
  email: string
  password: string
}

export interface AffiliateApiRegisterPayload {
  fullName: string
  businessName?: string
  phoneNumber: string
  email: string
  location: string
  password: string
  payoutMethod: 'MOBILE_MONEY' | 'BANK_ACCOUNT'
  momoNetwork?: string
  momoNumber?: string
  momoAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
}

export interface AffiliateAuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    refreshToken: string
    user: {
      id: string
      email: string
      fullName?: string
    }
    profile: {
      id?: string
      affiliateId?: string
      status?: AffiliateStatus
    }
  }
}

// ─── Sales / Transactions ─────────────────────────────────────────────────────

export interface AffiliateSale {
  id: string
  transactionRef?: string        // e.g. TXN-12345 or #CT-9188-3ALX
  transactionId?: string
  date?: string
  createdAt?: string
  updatedAt?: string
  voucherType: string           // e.g. WASSCE_NOVDEC or WASSCE Checker
  saleAmount?: number | string
  amount?: number | string
  commissionEarned?: number | string
  commission?: {
    id?: string
    affiliateId?: string
    orderId?: string
    voucherType?: string
    amount?: number | string
    createdAt?: string
  } | number | string
  status?: 'Completed' | 'Refunded' | 'Reversed' | string
  paymentStatus?: string        // e.g. SUCCESS
  deliveryStatus?: string       // e.g. SENT
  maskedCustomerPhone?: string   // e.g. 024****567
  phoneNumber?: string           // e.g. 233556069880
  customerName?: string
  channel?: string
  affiliateId?: string
  affiliateCode?: string
}

// ─── Commissions ─────────────────────────────────────────────────────────────

export interface Commission {
  id: string
  affiliateId?: string
  saleId?: string
  orderId?: string
  transactionRef?: string
  amount: number | string
  status?: CommissionStatus | string
  date?: string
  createdAt?: string
  voucherType: string
  saleAmount?: number | string
  reversalReason?: string       // present when status = Reversed
  order?: {
    id?: string
    customerName?: string
    phoneNumber?: string
    voucherType?: string
    quantity?: number
    amount?: number | string
    channel?: string
    paymentStatus?: string
    deliveryStatus?: string
    transactionId?: string
    affiliateId?: string
    affiliateCode?: string
    createdAt?: string
    updatedAt?: string
  }
}

// ─── Withdrawals ─────────────────────────────────────────────────────────────

export interface WithdrawalRequest {
  id: string
  affiliateId: string
  affiliateName?: string
  amount: number
  paymentDetails: PaymentDetails
  status: WithdrawalStatus
  requestedAt: string
  processedAt?: string
  rejectionReason?: string
  reference?: string            // Payment reference once paid
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export interface AffiliateDashboardStats {
  affiliateCode?: string
  businessName?: string
  ussdCode?: string | null
  status?: AffiliateStatus | string
  totalVouchersSold: number
  approvedCommission: number
  withdrawnAmount: number
  pendingWithdrawalAmount: number
  availableBalance: number
  recentSales?: AffiliateSale[]
}

// ─── Admin Affiliate Filters ──────────────────────────────────────────────────

export interface AffiliateFilters {
  status?: AffiliateStatus | 'ALL'
  search?: string
  page?: number
  limit?: number
}

// ─── Approval / Admin Actions ─────────────────────────────────────────────────

export interface AffiliateSystemConfig {
  wassceNovdecCommission: number
  beceCommission: number
  ctvetNabtexCommission: number
  minWithdrawalAmount: number
  dailyWithdrawalCap: number
}

export interface DirectWithdrawalPayload {
  amount: number
  payoutMethod: 'MOBILE_MONEY' | 'BANK' | 'BANK_ACCOUNT'
  momoNetwork?: string
  momoNumber?: string
  momoAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
  /** The admin's own password, and an authenticator code when two-step verification is on */
  currentPassword?: string
  twoFactorCode?: string
}

/** Payout details an affiliate saves for themselves. */
export interface AffiliatePayoutDetailsPayload {
  payoutMethod: 'MOBILE_MONEY' | 'BANK' | 'BANK_ACCOUNT'
  momoNetwork?: string
  momoNumber?: string
  momoAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
  /** Required: confirms the change is really the account owner */
  currentPassword: string
  /** Older screens also send display-only fields such as type/network/accountName */
  [key: string]: unknown
}

/** What an admin fills in to create an affiliate directly. */
export interface AdminCreateAffiliatePayload {
  fullName: string
  email: string
  phoneNumber: string
  password: string
  businessName?: string
  location?: string
  status?: string
  ussdCode?: string
  payoutMethod?: 'MOBILE_MONEY' | 'BANK' | 'BANK_ACCOUNT'
  momoNetwork?: string
  momoNumber?: string
  momoAccountName?: string
  bankName?: string
  bankAccountNumber?: string
  bankAccountName?: string
}

export interface UpdateAdminStatusPayload {
  id: string
  status: 'APPROVED' | 'REJECTED' | 'SUSPENDED' | 'DEACTIVATED' | string
  ussdCode?: string
  rejectionReason?: string
}

export interface UpdateAdminUssdPayload {
  id: string
  ussdCode: string
}

export interface ProcessAdminWithdrawalPayload {
  id: string
  status: 'APPROVED' | 'REJECTED' | string
  adminNote?: string
  /** Required to approve, when the admin has two-step verification on */
  twoFactorCode?: string
}
