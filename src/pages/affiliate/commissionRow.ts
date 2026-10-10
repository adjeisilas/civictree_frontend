import type { CommissionStatus, Commission } from '../../types/affiliate'

export const DEFAULT_CFG = { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' }

export const STATUS_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  Pending:   { label: 'Pending',  color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  PENDING:   { label: 'Pending',  color: 'bg-amber-100 text-amber-700',   dot: 'bg-amber-500' },
  Approved:  { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  APPROVED:  { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  SUCCESS:   { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Rejected:  { label: 'Rejected', color: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  REJECTED:  { label: 'Rejected', color: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  Paid:      { label: 'Paid',     color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  PAID:      { label: 'Paid',     color: 'bg-blue-100 text-blue-700',     dot: 'bg-blue-500' },
  Reversed:  { label: 'Reversed', color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
  REVERSED:  { label: 'Reversed', color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
}

export function parseCommission(c: Commission) {
  const ref = c?.transactionRef || c?.orderId || c?.order?.id || c?.id || '—'

  const rawDate = c?.date || c?.createdAt || c?.order?.createdAt
  const dateObj = rawDate ? new Date(rawDate) : null
  const isValidDate = Boolean(dateObj && !isNaN(dateObj.getTime()))
  const dateStr = isValidDate && dateObj
    ? dateObj.toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—'

  let rawVoucher = (c?.voucherType || c?.order?.voucherType || '—').toString()
  if (rawVoucher.includes('_')) {
    rawVoucher = rawVoucher.replace(/_/g, ' ')
  }
  const voucherType = rawVoucher

  const saleAmount = Number(c?.saleAmount ?? c?.order?.amount ?? 0) || 0
  const amount = Number(c?.amount ?? 0) || 0

  const rawStatus = (c?.status || c?.order?.paymentStatus || 'APPROVED').toString().toUpperCase()
  const isApproved = rawStatus === 'APPROVED' || rawStatus === 'SUCCESS' || rawStatus === 'COMPLETED'
  const isPending = rawStatus === 'PENDING'
  const isRejected = rawStatus === 'REJECTED'
  const isPaid = rawStatus === 'PAID'
  const isReversed = rawStatus === 'REVERSED' || rawStatus === 'FAILED'

  const displayStatus: CommissionStatus = isPaid
    ? 'Paid'
    : isApproved
    ? 'Approved'
    : isPending
    ? 'Pending'
    : isRejected
    ? 'Rejected'
    : isReversed
    ? 'Reversed'
    : ('Approved' as CommissionStatus)

  const cfg = STATUS_CONFIG[displayStatus] || STATUS_CONFIG[rawStatus] || DEFAULT_CFG

  return {
    ref,
    rawDate,
    dateObj,
    isValidDate,
    dateStr,
    voucherType,
    saleAmount,
    amount,
    rawStatus,
    displayStatus,
    cfg,
    reversalReason: c?.reversalReason ?? (isReversed ? 'Reversed' : '—')
  }
}
