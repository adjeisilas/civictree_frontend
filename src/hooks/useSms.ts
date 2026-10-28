import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import type {  SendBulkSmsPayload,  SendSingleSmsPayload,  SmsHistoryItem,  SmsTemplate } from '../types/admin'
import type { ExamType } from '../types/admin'

export interface SmsResponse {
  success: boolean
  message: string
  data?: {
    totalRecipients?: number
    successCount?: number
    failedCount?: number
  }
}

/** What a campaign would actually reach, counted by the server. */
export interface SmsRecipientCount {
  totalRecipients: number
  /** Rows read before duplicates were merged */
  sourceRows: number
  /** Rows that turned out to be the same person reachable in two formats */
  duplicatesMerged: number
  /** Stored values that are not usable phone numbers */
  unusable: number
}

/**
 * Asks the server how many people a segment reaches, using the same query the
 * send path uses. The page used to estimate this from voucher sales multiplied
 * by invented ratios, so the figure — and the credit cost shown beside it — bore
 * no relation to who would receive the campaign.
 */
export function useSmsRecipientCount(
  recipientType: 'ALL' | 'SUCCESSFUL' | 'FAILED_ONLY',
  voucherType?: ExamType,
  enabled = true
) {
  return useQuery<SmsRecipientCount>({
    queryKey: ['sms', 'recipientCount', recipientType, voucherType ?? 'ALL_TYPES'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: SmsRecipientCount }>(ENDPOINTS.SMS.RECIPIENT_COUNT, {
          params: { recipientType, ...(voucherType ? { voucherType } : {}) }
        })
        .then((r) => r.data.data),
    enabled,
    // Recipients change as orders arrive, so do not show a stale count before a send
    staleTime: 30 * 1000,
  })
}

/** Mutation hook to send an SMS blast to all customers. */
export function useSendBulkSms() {
  const queryClient = useQueryClient()

  return useMutation<SmsResponse, Error, SendBulkSmsPayload>({
    mutationFn: (payload) =>
      apiClient
        .post<SmsResponse>(ENDPOINTS.SMS.SEND_BULK, payload)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms', 'history'] })
    },
  })
}

/** Mutation hook to send a dedicated BECE bulk SMS campaign (ALL, SUCCESSFUL, or FAILED_ONLY). */
export function useSendBeceBulkSms() {
  const queryClient = useQueryClient()

  return useMutation<SmsResponse, Error, { recipientType: 'ALL' | 'SUCCESSFUL' | 'FAILED_ONLY'; title: string; body: string; senderId?: string }>({
    mutationFn: (payload) =>
      apiClient
        .post<SmsResponse>(ENDPOINTS.SMS.SEND_BULK_BECE, payload)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms', 'history'] })
    },
  })
}

/** Mutation hook to send a dedicated WASSCE/NOVDEC bulk SMS campaign (ALL, SUCCESSFUL, or FAILED_ONLY). */
export function useSendWassceBulkSms() {
  const queryClient = useQueryClient()

  return useMutation<SmsResponse, Error, { recipientType: 'ALL' | 'SUCCESSFUL' | 'FAILED_ONLY'; title: string; body: string; senderId?: string }>({
    mutationFn: (payload) =>
      apiClient
        .post<SmsResponse>(ENDPOINTS.SMS.SEND_BULK_WASSCE, payload)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms', 'history'] })
    },
  })
}


/** The bulk endpoint for each voucher type. */
const BULK_ENDPOINT_BY_TYPE: Record<ExamType, string> = {
  BECE: ENDPOINTS.SMS.SEND_BULK_BECE,
  WASSCE_NOVDEC: ENDPOINTS.SMS.SEND_BULK_WASSCE,
  CTVET_NABTEX: ENDPOINTS.SMS.SEND_BULK_CTVET_NABTEX,
}

export interface VoucherTypeBulkSmsPayload {
  voucherType: ExamType
  recipientType: 'ALL' | 'SUCCESSFUL' | 'FAILED_ONLY'
  title: string
  body: string
  senderId?: string
}

/**
 * Sends a campaign to the customers of one voucher type.
 *
 * Replaces the per-type hooks (BECE, WASSCE) that had to be added one by one;
 * the voucher type picks the endpoint, so a new type needs only an entry in
 * BULK_ENDPOINT_BY_TYPE above.
 */
export function useSendVoucherTypeBulkSms() {
  const queryClient = useQueryClient()

  return useMutation<SmsResponse, Error, VoucherTypeBulkSmsPayload>({
    mutationFn: ({ voucherType, ...payload }) =>
      apiClient
        .post<SmsResponse>(BULK_ENDPOINT_BY_TYPE[voucherType], payload)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms', 'history'] })
    },
  })
}

/** One voucher type's contact count, and when it was last cleared. */
export interface SmsContactTypeSummary {
  voucherType: ExamType
  contacts: number
  lastClearedAt: string | null
}

export interface SmsContactSummary {
  total: { contacts: number; lastClearedAt: string | null }
  types: SmsContactTypeSummary[]
}

/** What a clearance actually did, for the confirmation message. */
export interface SmsContactClearResult {
  voucherType: ExamType | null
  clearedAt: string
  dialersDeleted: number
  ordersExcluded: number
  contactsBefore: number
  contactsAfter: number
}

/** Contact counts per voucher type, for the clear-contacts panel. */
export function useSmsContactSummary() {
  return useQuery<SmsContactSummary>({
    queryKey: ['sms', 'contacts'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: SmsContactSummary }>(ENDPOINTS.SMS.CONTACTS)
        .then((r) => r.data.data),
    staleTime: 30 * 1000,
  })
}

/**
 * Clears the contact list so new contacts can accumulate.
 *
 * Pass a voucher type to clear one product, or null for all of them. USSD dialer
 * records are deleted; orders are kept and their contacts sit behind a cut-off
 * until that customer orders again, so nothing financial is lost.
 */
export function useClearSmsContacts() {
  const queryClient = useQueryClient()

  return useMutation<SmsContactClearResult, Error, { voucherType: ExamType | null }>({
    mutationFn: ({ voucherType }) =>
      apiClient
        .delete<{ success: boolean; data: SmsContactClearResult }>(ENDPOINTS.SMS.CONTACTS, {
          params: voucherType ? { voucherType } : undefined,
        })
        .then((r) => r.data.data),
    onSuccess: () => {
      // Both the panel counts and the campaign reach figure are now stale
      queryClient.invalidateQueries({ queryKey: ['sms', 'contacts'] })
      queryClient.invalidateQueries({ queryKey: ['sms', 'recipientCount'] })
    },
  })
}

/** Mutation hook to send an SMS to a specific phone number. */
export function useSendSingleSms() {
  const queryClient = useQueryClient()

  return useMutation<SmsResponse, Error, SendSingleSmsPayload>({
    mutationFn: (payload) =>
      apiClient
        .post<SmsResponse>(ENDPOINTS.SMS.SEND_SINGLE, payload)
        .then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sms', 'history'] })
    },
  })
}


/** Fetches the SMS send history log. */
export function useSmsHistory() {
  return useQuery<SmsHistoryItem[]>({
    queryKey: ['sms', 'history'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: SmsHistoryItem[] }>(ENDPOINTS.SMS.HISTORY)
        .then((r) => r.data.data),
  })
}


/** Fetches all saved SMS message templates. */
export function useSmsTemplates() {
  return useQuery<SmsTemplate[]>({
    queryKey: ['sms', 'templates'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: SmsTemplate[] }>(ENDPOINTS.SMS.TEMPLATES)
        .then((r) => r.data.data),
    staleTime: 1000 * 60 * 10, // Templates are rarely changed
  })
}
