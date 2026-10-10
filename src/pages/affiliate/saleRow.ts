import type { AffiliateSale } from '../../types/affiliate'

/** Older endpoints name some fields differently, so both spellings are accepted. */
type SaleRow = AffiliateSale & { voucherName?: string; type?: string; phone?: string }

export const STATUS_COLORS: Record<string, string> = {
  Completed: 'bg-emerald-100 text-emerald-700',
  Refunded: 'bg-amber-100 text-amber-700',
  Reversed: 'bg-red-100 text-red-700',
}

export function parseSale(s: AffiliateSale) {
  // 1. Transaction Ref
  const ref = s.transactionRef || s.id || s.transactionId || '—'

  // 2. Date
  const rawDate = s.date || s.createdAt || (typeof s.commission === 'object' && s.commission?.createdAt)
  const dateObj = rawDate ? new Date(rawDate) : null
  const isValidDate = Boolean(dateObj && !isNaN(dateObj.getTime()))
  const dateStr = isValidDate && dateObj
    ? dateObj.toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  // 3. Voucher Type
  let rawVoucher = (s.voucherType || (s as SaleRow).voucherName || (s as SaleRow).type || '—').toString()
  if (rawVoucher.includes('_')) {
    rawVoucher = rawVoucher.replace(/_/g, ' ')
  }
  const voucherType = rawVoucher

  // 4. Customer Phone & Name
  let phone = s.maskedCustomerPhone || s.phoneNumber || (s as SaleRow).phone || ''
  if (phone.startsWith('233') && phone.length === 12) {
    phone = '0' + phone.slice(3)
  }
  const customerDisplay = phone || s.customerName || '—'

  // 5. Sale Amount
  const saleAmount = Number(s.saleAmount ?? s.amount ?? 0) || 0

  // 6. Commission Earned
  let commissionEarned = 0
  if (s.commissionEarned !== undefined && s.commissionEarned !== null) {
    commissionEarned = Number(s.commissionEarned) || 0
  } else if (typeof s.commission === 'object' && s.commission !== null && s.commission.amount !== undefined) {
    commissionEarned = Number(s.commission.amount) || 0
  } else if (s.commission !== undefined && s.commission !== null && typeof s.commission !== 'object') {
    commissionEarned = Number(s.commission) || 0
  }

  // 7. Status & Completion check
  const rawStatus = (s.paymentStatus || s.status || 'SUCCESS').toString().toUpperCase()
  const isCompleted = rawStatus === 'SUCCESS' || rawStatus === 'COMPLETED' || rawStatus === 'PAID'
  const isRefunded = rawStatus === 'REFUNDED'
  const isReversed = rawStatus === 'REVERSED' || rawStatus === 'FAILED'

  const displayStatus: string = isCompleted
    ? 'Completed'
    : isRefunded
    ? 'Refunded'
    : isReversed
    ? 'Reversed'
    : (s?.status || rawStatus || 'Completed')

  return {
    ref,
    rawDate,
    dateObj,
    isValidDate,
    dateStr,
    voucherType,
    phone,
    customerDisplay,
    saleAmount,
    commissionEarned,
    isCompleted,
    displayStatus,
    rawStatus,
  }
}
