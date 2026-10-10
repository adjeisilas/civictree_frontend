import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import type {  Customer } from '../types/admin'

/** A customer row as the API returns it, before it is mapped to the shape the screens use. */
interface ApiCustomerRow {
  id?: string
  name?: string
  phoneNumber?: string
  totalOrdersCount?: number
  lifetimeSpent?: number
  lastPurchasedDate?: string
  firstPurchaseDate?: string
  usedChannels?: string[]
  status?: string
  defaultPaymentChannel?: string
  purchasedVoucherTypes?: string[]
}

/** An order row inside a customer's history. */
interface ApiCustomerOrderRow {
  id: string
  createdAt?: string
  voucherType?: string
  quantity?: number
  amount?: string | number
  paymentNetwork?: string
  channel?: string
  paymentStatus?: string
  deliveryStatus?: string
}

interface ApiCustomerDetails {
  profile?: ApiCustomerRow
  orders?: ApiCustomerOrderRow[]
}

/** Totals as the stats endpoint names them. */
interface ApiCustomerStats {
  totalCustomers?: number
  totalCustomersWeb?: number
  totalCustomersUssd?: number
}

/** Fetches full details for a single customer by phone number, including their order history. */
export function useCustomerByPhone(phone: string | null) {
  return useQuery<Customer>({
    queryKey: ['customers', phone],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: ApiCustomerDetails }>(ENDPOINTS.CUSTOMERS.BY_PHONE(phone!))
        .then((r) => {
          const res = r.data.data;
          if (res && res.profile) {
            const p = res.profile;
            return {
              id: p.phoneNumber || p.id,
              name: p.name,
              phone: p.phoneNumber,
              totalOrders: p.totalOrdersCount || 0,
              totalSpend: p.lifetimeSpent || 0,
              lastOrderDate: p.lastPurchasedDate,
              channel: p.usedChannels && p.usedChannels.length > 1 ? 'Omnichannel' : (p.usedChannels?.[0] || 'Unknown'),
              status: p.status === 'active' ? 'Active' : 'Inactive',
              lifetimeSpend: p.lifetimeSpent || 0,
              firstPurchase: p.firstPurchaseDate ? new Date(p.firstPurchaseDate).toLocaleDateString() : undefined,
              lastPurchase: p.lastPurchasedDate ? new Date(p.lastPurchasedDate).toLocaleDateString() : undefined,
              preferredPayment: p.defaultPaymentChannel,
              voucherTypes: p.purchasedVoucherTypes || [],
              purchaseHistory: (res.orders || []).map((o) => ({
                id: o.id,
                date: o.createdAt ? new Date(o.createdAt).toLocaleDateString() : '',
                voucherType: o.voucherType,
                quantity: o.quantity || 0,
                amount: parseFloat(String(o.amount ?? 0)) || 0,
                paymentMethod: o.paymentNetwork || o.channel || 'Unknown',
                paymentStatus: o.paymentStatus === 'PENDING' ? 'Pending' : (o.paymentStatus === 'PAID' ? 'Paid' : (o.paymentStatus === 'FAILED' ? 'Failed' : o.paymentStatus)),
                deliveryStatus: o.deliveryStatus === 'NOT_SENT' ? 'Not sent' : (o.deliveryStatus === 'SENT' ? 'Sent' : (o.deliveryStatus === 'PENDING' ? 'Pending' : o.deliveryStatus)),
              }))
            } as Customer;
          }
          return res as Customer;
        }),
    enabled: !!phone,
  })
}


export interface CustomerFilters {
  page?: number
  limit?: number
  search?: string
  channel?: string
  voucherType?: string
  segment?: string
}

export interface PaginatedCustomers {
  items: Customer[]
  totalCount: number
  totalPages: number
}

export interface CustomerStats {
  total: number
  webOnly: number
  ussdOnly: number
}

/** Fetches overall customer statistics. */
export function useCustomerStats() {
  return useQuery<CustomerStats>({
    queryKey: ['customers', 'stats'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: ApiCustomerStats }>(ENDPOINTS.CUSTOMERS.STATS)
        .then((r) => {
          const data: ApiCustomerStats = r.data.data || r.data
          return {
            total: data.totalCustomers || 0,
            webOnly: data.totalCustomersWeb || 0,
            ussdOnly: data.totalCustomersUssd || 0,
          }
        }),
  })
}

/** Fetches the paginated customers list with filtering. */
export function useCustomers(filters: CustomerFilters = {}) {
  return useQuery<PaginatedCustomers>({
    queryKey: ['customers', filters],
    queryFn: () =>
      apiClient
        .get<{
          success: boolean
          data: ApiCustomerRow[] | { items?: ApiCustomerRow[]; data?: ApiCustomerRow[] }
          pagination?: { page?: number; limit?: number; total?: number; totalResults?: number; totalPages?: number }
          results?: number
        }>(ENDPOINTS.CUSTOMERS.LIST, {
          params: filters,
        })
        .then((r) => {
          const rawData = r.data.data || r.data
          const rawItems = Array.isArray(rawData) ? rawData : (rawData?.items || rawData?.data || [])
          const items = rawItems.map((c: ApiCustomerRow): Customer => ({
            id: c.id || c.phoneNumber || '',
            name: c.name || 'Unknown Customer',
            phone: c.phoneNumber || '',
            totalOrders: c.totalOrdersCount || 0,
            totalSpend: c.lifetimeSpent || 0,
            lastOrderDate: c.lastPurchasedDate || '',
            channel: c.usedChannels && c.usedChannels.length > 1 ? 'Omnichannel' : (c.usedChannels?.[0] || 'Unknown'),
            status: c.status === 'active' ? 'Active' : 'Inactive',
            lifetimeSpend: c.lifetimeSpent,
            firstPurchase: c.firstPurchaseDate ? new Date(c.firstPurchaseDate).toLocaleDateString() : undefined,
            lastPurchase: c.lastPurchasedDate ? new Date(c.lastPurchasedDate).toLocaleDateString() : undefined,
            preferredPayment: c.defaultPaymentChannel,
            voucherTypes: c.purchasedVoucherTypes,
            ...c
          }))
          const page = filters.page || 1
          const limit = filters.limit || 8

          let paginatedItems = items
          let totalCount = r.data.pagination?.totalResults || r.data.pagination?.total || r.data.results || items.length
          let totalPages = r.data.pagination?.totalPages

          if (!totalPages) {
             totalPages = Math.ceil(totalCount / limit) || 1
          }

          if (items.length > limit) {
             paginatedItems = items.slice((page - 1) * limit, page * limit)
             totalCount = items.length
             totalPages = Math.ceil(totalCount / limit) || 1
          }

          return {
            items: paginatedItems,
            totalCount,
            totalPages,
          }
        }),
  })
}


/** Mutation hook to permanently delete a customer record. */
export function useDeleteCustomer() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiClient
        .delete(ENDPOINTS.CUSTOMERS.DELETE(id))
        .then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}
