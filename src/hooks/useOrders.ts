import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import { type  Order, OrderFilters, type  RefundPayload, type  AllocatedKey } from '../types/admin'

/** Fetches full details for a single order by ID. */
export function useOrderById(id: string | null) {
  return useQuery<Order>({
    queryKey: ['orders', id],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: Order }>(ENDPOINTS.ORDERS.BY_ID(id!))
        .then((r) => r.data.data),
    enabled: !!id,
  })
}


export interface PaginatedOrders {
  items: Order[]
  totalCount: number
  totalPages: number
}

/**
 * Fetches a paginated, filtered list of orders.
 * All filtering is server-side — pass filter state directly from the Orders page.
 */
export function useOrders(filters: OrderFilters = {}) {
  return useQuery<PaginatedOrders>({
    queryKey: ['orders', filters],
    queryFn: () =>
      apiClient
        .get<{
          success: boolean
          data: ApiOrderRow[] | { orders?: ApiOrderRow[]; items?: ApiOrderRow[]; pagination?: OrderPagination }
          pagination?: OrderPagination
        }>(ENDPOINTS.ORDERS.LIST, { params: filters })
        .then((r) => {
          const rawData = r.data.data
          const itemsRaw = Array.isArray(rawData) ? rawData : (rawData?.orders || rawData?.items || [])
          
          const items = itemsRaw.map((o: ApiOrderRow): Order => {
            let paymentStatus = o.paymentStatus;
            if (paymentStatus === 'SUCCESS' || paymentStatus === 'PAID') paymentStatus = 'Paid';
            else if (paymentStatus === 'PENDING') paymentStatus = 'Pending';
            else if (paymentStatus === 'FAILED') paymentStatus = 'Failed';

            let deliveryStatus = o.deliveryStatus;
            if (deliveryStatus === 'SENT') deliveryStatus = 'Sent';
            else if (deliveryStatus === 'NOT_SENT') deliveryStatus = 'Not sent';
            else if (deliveryStatus === 'PENDING') deliveryStatus = 'Pending';

            return {
              customerName: '',
              phone: '',
              quantity: 0,
              amount: 0,
              channel: 'Web',
              voucherType: 'BECE',
              ...o,
              date: o.date || (o.createdAt ? new Date(o.createdAt).toLocaleDateString() : ''),
              paymentStatus: paymentStatus as Order['paymentStatus'],
              deliveryStatus: deliveryStatus as Order['deliveryStatus']
            }
          })

          const pagination: OrderPagination =
            (Array.isArray(rawData) ? undefined : rawData?.pagination) || r.data.pagination || {}
          return {
            items,
            totalCount: pagination.totalResults || pagination.total || items.length,
            totalPages: pagination.totalPages || 1,
          }
        }),
  })
}

/** An order row as the API returns it; the mapping normalises its status wording. */
interface ApiOrderRow extends Omit<Partial<Order>, 'paymentStatus' | 'deliveryStatus' | 'date'> {
  id: string
  date?: string
  createdAt?: string
  paymentStatus?: string
  deliveryStatus?: string
}

interface OrderPagination {
  page?: number
  limit?: number
  total?: number
  totalResults?: number
  totalPages?: number
}

export interface OrderStats {
  summary: {
    totalRevenue: number
    totalVouchersSold: number
    totalCompletedOrders: number
    totalOrders: number
    totalOrdersSuccessful: number
    totalOrdersPending: number
    totalOrdersFailed: number
  }
  byVoucherType: {
    WASSCE_NOVDEC: number
    BECE: number
  }
  byChannel: {
    WEB: number
    USSD: number
  }
  deliverySuccessRate: {
    SENT: number
    FAILED: number
    NOT_SENT: number
  }
}

/** Fetches global order statistics. */
export function useOrderStats() {
  return useQuery<OrderStats>({
    queryKey: ['orders', 'stats'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: OrderStats }>(ENDPOINTS.ORDERS.STATS)
        .then((r) => r.data.data),
  })
}


interface ProcessRefundParams {
  orderId: string
  refundDetails: RefundPayload
}

/**
 * Mutation hook to process a refund for a given order.
 * Invalidates the order caches on success.
 */
export function useProcessRefund() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, ProcessRefundParams>({
    mutationFn: ({ orderId, refundDetails }) =>
      apiClient
        .post(ENDPOINTS.ORDERS.REFUND(orderId), refundDetails)
        .then(() => undefined),
    onSuccess: (_, { orderId }) => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}


interface ReallocateResponse {
  newKey: AllocatedKey
}

/**
 * Mutation hook to reallocate a new voucher key to a failed/problem order.
 * Invalidates the order caches on success.
 */
export function useReallocateKey() {
  const queryClient = useQueryClient()

  return useMutation<ReallocateResponse, Error, string>({
    mutationFn: (orderId) =>
      apiClient
        .post<{ success: boolean; data: ReallocateResponse }>(ENDPOINTS.ORDERS.REALLOCATE(orderId))
        .then((r) => r.data.data),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
      queryClient.invalidateQueries({ queryKey: ['vouchers', 'keys'] })
    },
  })
}


/**
 * Mutation hook to resend the voucher SMS for a given order.
 * Invalidates the specific order cache on success.
 */
export function useResendSms() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (orderId) =>
      apiClient
        .post(ENDPOINTS.ORDERS.RESEND_SMS(orderId))
        .then(() => undefined),
    onSuccess: (_, orderId) => {
      queryClient.invalidateQueries({ queryKey: ['orders', orderId] })
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}
