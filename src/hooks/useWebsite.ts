import { useMutation, useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import type { InitiatePurchasePayload, InitiatePurchaseResponse, VoucherProduct } from '../types/website'

interface ContactFormPayload {
  name: string
  email: string
  subject: string
  message: string
}

/** Mutation hook to submit the contact form on the public website. */
export function useContactForm() {
  return useMutation<void, Error, ContactFormPayload>({
    mutationFn: (payload) =>
      apiClient
        .post(ENDPOINTS.WEBSITE.CONTACT, payload)
        .then(() => undefined),
  })
}


/** Mutation hook to initiate a purchase from the public website. */
export function useInitiatePurchase() {
  return useMutation<InitiatePurchaseResponse, Error, InitiatePurchasePayload>({
    mutationFn: (data) =>
      apiClient
        .post<{ success: boolean; data: InitiatePurchaseResponse }>(
          ENDPOINTS.WEBSITE.INITIATE_PURCHASE,
          data
        )
        .then((r) => r.data.data),
  })
}


/** Fetches available voucher products for the public website. */
export function useProducts() {
  return useQuery<VoucherProduct[]>({
    queryKey: ['website', 'products'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: VoucherProduct[] }>(ENDPOINTS.WEBSITE.PRODUCTS)
        .then((r) => r.data.data),
    staleTime: 1000 * 60 * 10, // 10 minutes — products rarely change
  })
}

export interface PublicVoucherConfigResponse {
  currency: string
  wassceNovdecPrice: number
  wassceNovdecHasReachedLimit: boolean
  becePrice: number
  beceHasReachedLimit: boolean
}

/** Fetches the public pricing and availability configuration from the backend. */
export function usePublicVoucherConfigs() {
  return useQuery<PublicVoucherConfigResponse>({
    queryKey: ['website', 'public-configs'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: PublicVoucherConfigResponse }>(ENDPOINTS.VOUCHERS.PUBLIC_CONFIGS)
        .then((r) => r.data.data),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}


interface TimetableEvent {
  id: string
  title: string
  date: string
  type: string
}

/** Fetches timetable events for the public website. */
export function useTimetable() {
  return useQuery<TimetableEvent[]>({
    queryKey: ['website', 'timetable'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: TimetableEvent[] }>(ENDPOINTS.WEBSITE.TIMETABLE)
        .then((r) => r.data.data),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}


interface VerifyPaymentPayload {
  checkoutid?: string | null
  orderId?: string | null
  id?: string | null
}

interface VerifyPaymentResponse {
  status: 'SUCCESS' | 'PENDING' | 'FAILED'
  paymentStatus?: 'SUCCESS' | 'PENDING' | 'FAILED'
  deliveryStatus?: string
  orderId?: string
  voucherDetails?: {
    serial: string
    pin: string
    examType: string
  }[]
}

/** Mutation hook to verify the payment status of an order. */
export function useVerifyPayment() {
  return useMutation<VerifyPaymentResponse, Error, VerifyPaymentPayload>({
    mutationFn: (payload) =>
      apiClient
        .get<{ success: boolean; status?: string; data: VerifyPaymentResponse }>(
          ENDPOINTS.WEBSITE.VERIFY_PAYMENT,
          { params: payload }
        )
        .then((r) => {
          const responseData = r.data.data
          const status = r.data.status || responseData.status || responseData.paymentStatus
          return {
            ...responseData,
            status: status as 'SUCCESS' | 'PENDING' | 'FAILED',
          }
        }),
  })
}
