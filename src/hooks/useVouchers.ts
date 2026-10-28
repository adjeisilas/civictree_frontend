import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import { ENDPOINTS } from '../services/endpoints'
import { type ExamType, type UploadLog, type VoucherConfig, type VoucherKey, type GlobalVoucherConfig } from '../types/admin'
import { VOUCHER_TYPES, voucherTypeDefinition } from '../config/voucherTypes'

/**
 * Mutation hook to delete a single voucher key by its ID.
 * Invalidates the vouchers cache on success.
 */
export function useDeleteVoucher() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) =>
      apiClient
        .delete(ENDPOINTS.VOUCHERS.DELETE(id))
        .then(() => undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers', 'keys'] })
    },
  })
}

/**
 * Mutation hook to create the initial global voucher configuration.
 */
export function useCreateVoucherConfig() {
  const queryClient = useQueryClient()

  return useMutation<GlobalVoucherConfig, Error, GlobalVoucherConfig>({
    mutationFn: (payload) =>
      apiClient
        .post<{ success: boolean; data: GlobalVoucherConfig }>(ENDPOINTS.VOUCHERS.CONFIGS, payload)
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers', 'configs'] })
    },
  })
}

interface UpdateConfigPayload {
  type: ExamType
  price: number
  minLimit: number
}

/**
 * Mutation hook to update pricing and low-stock threshold for an exam type.
 * Invalidates the configs cache on success.
 */
export function useUpdateVoucherConfig() {
  const queryClient = useQueryClient()

  return useMutation<VoucherConfig, Error, UpdateConfigPayload | Partial<GlobalVoucherConfig>>({
    mutationFn: async (payload) => {
      // If it's a single type update, fetch the current global config and merge
      if ('type' in payload && payload.type) {
        const getRes = await apiClient.get<{ success: boolean; data: GlobalVoucherConfig | GlobalVoucherConfig[] }>(ENDPOINTS.VOUCHERS.CONFIGS)
        const raw = getRes.data.data
        const currentConfig = Array.isArray(raw) ? raw[0] : raw
        const updatedConfig = { ...currentConfig }

        // Write into whichever pair of fields this type uses
        const definition = voucherTypeDefinition(payload.type)
        if (definition) {
          const target = updatedConfig as unknown as Record<string, number>
          target[definition.priceField] = payload.price!
          target[definition.limitField] = payload.minLimit!
        }

        const putRes = await apiClient.put<{ success: boolean; data: VoucherConfig }>(ENDPOINTS.VOUCHERS.CONFIGS, updatedConfig)
        return putRes.data.data
      }

      const putRes = await apiClient.put<{ success: boolean; data: VoucherConfig }>(ENDPOINTS.VOUCHERS.CONFIGS, payload)
      return putRes.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers', 'configs'] })
    },
  })
}


/** An upload history row as the API returns it. */
interface ApiUploadLogRow {
  id: string
  filename?: string
  fileName?: string
  uploadType?: string
  voucherType?: string
  uploadedBy?: string | { fullName?: string; email?: string }
  uploadedById?: string
  createdAt?: string
  uploadDate?: string
  totalUploaded?: number
  count?: number
  status?: string
  totalRecords?: number
  successfulImports?: number
  failedImports?: number
}

/** A voucher row as the API returns it: field names vary by endpoint. */
interface ApiVoucherKeyRow {
  id?: string
  serial?: string
  serialNumber?: string
  pin?: string
  pinNumber?: string
  pinMasked?: boolean
  examType?: string
  type?: string
  checker_type?: string
  status?: string
  importDate?: string
  createdAt?: string
}

/** Fetches the history of all voucher batch uploads. */
export function useUploadHistory() {
  return useQuery<UploadLog[]>({
    queryKey: ['vouchers', 'upload-history'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: ApiUploadLogRow[] | { items?: ApiUploadLogRow[] } }>(ENDPOINTS.VOUCHERS.UPLOAD_HISTORY)
        .then((r) => {
          const rawData = r.data.data
          const items = Array.isArray(rawData) ? rawData : (rawData?.items || [])
          return items.map((log: ApiUploadLogRow) => ({
            id: log.id,
            fileName: log.filename || log.fileName || 'Unknown File',
            voucherType: log.uploadType || log.voucherType || 'Unknown',
            uploadedBy: log.uploadedBy || log.uploadedById || 'System',
            uploadDate: log.createdAt ? new Date(log.createdAt).toLocaleString() : (log.uploadDate || '-'),
            totalRecords: log.totalUploaded || log.totalRecords || 0,
            successfulImports: log.successfulImports ?? log.totalUploaded ?? 0,
            failedImports: log.failedImports ?? 0,
          })) as UploadLog[]
        }),
  })
}


interface UploadVouchersResponse {
  uploadLog: UploadLog
  imported: number
  failed: number
}

/**
 * Mutation hook for uploading voucher keys via CSV/PDF/Word file.
 * Sends multipart/form-data. On success, invalidates the vouchers and history caches.
 */
export function useUploadBulkVouchers() {
  const queryClient = useQueryClient()

  return useMutation<UploadVouchersResponse, Error, FormData>({
    mutationFn: (formData) =>
      apiClient
        .post<{ success: boolean; data: UploadVouchersResponse }>(
          ENDPOINTS.VOUCHERS.UPLOAD_BULK,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
    },
  })
}

export function useUploadSingleVoucher() {
  const queryClient = useQueryClient()

  return useMutation<UploadVouchersResponse, Error, { type: string, serialNumber: string, pin: string }>({
    mutationFn: (payload) =>
      apiClient
        .post<{ success: boolean; data: UploadVouchersResponse }>(
          ENDPOINTS.VOUCHERS.UPLOAD_SINGLE,
          payload
        )
        .then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
    },
  })
}


/** Fetches pricing and low-stock threshold configurations per exam type. */
export function useVoucherConfigs() {
  return useQuery<VoucherConfig[]>({
    queryKey: ['vouchers', 'configs'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: GlobalVoucherConfig | GlobalVoucherConfig[] }>(ENDPOINTS.VOUCHERS.CONFIGS)
        .then((r) => {
          const raw = r.data.data
          if (!raw) return []
          // Sometimes APIs return arrays even if there's only one object allowed
          const d = Array.isArray(raw) ? raw[0] : raw
          if (!d) return []
          
          const fields = d as unknown as Record<string, number | undefined>
          return VOUCHER_TYPES.map((v) => ({
            type: v.type,
            price: fields[v.priceField] ?? 0,
            minLimit: fields[v.limitField] ?? 0,
          })) as VoucherConfig[]
        }),
  })
}


interface VoucherKeyFilters {
  examType?: string
  status?: string
  page?: number
  limit?: number
}

/** Fetches all voucher keys from inventory, with optional filters. */
export function useVoucherKeys(filters: VoucherKeyFilters = {}) {
  return useQuery<VoucherKey[]>({
    queryKey: ['vouchers', 'keys', filters],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: ApiVoucherKeyRow[] }>(ENDPOINTS.VOUCHERS.KEYS, { params: filters })
        .then((r) => {
          const rawKeys = r.data.data || []
          return rawKeys.map((k) => ({
            ...k,
            serial: k.serial || k.serialNumber || '',
            pin: k.pin || k.pinNumber || '',
            examType: k.examType || k.type || k.checker_type || '',
            status: k.status || 'Available',
            importDate: k.importDate || k.createdAt || new Date().toISOString()
          })) as VoucherKey[]
        }),
  })
}

/** Fetches all sold voucher keys from inventory, with optional filters. */
export function useSoldVouchers(filters: VoucherKeyFilters = {}) {
  return useQuery<VoucherKey[]>({
    queryKey: ['vouchers', 'sold', filters],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: ApiVoucherKeyRow[] | { items?: ApiVoucherKeyRow[] } }>(ENDPOINTS.VOUCHERS.SOLD, { params: filters })
        .then((r) => {
          const rawData = r.data.data
          const rawKeys = Array.isArray(rawData) ? rawData : (rawData?.items || [])
          
          return (Array.isArray(rawKeys) ? rawKeys : []).map((k: ApiVoucherKeyRow) => ({
            ...k,
            serial: k.serial || k.serialNumber || '',
            pin: k.pin || k.pinNumber || '',
            examType: k.examType || k.type || k.checker_type || '',
            status: k.status || 'Sold',
            importDate: k.importDate || k.createdAt || new Date().toISOString()
          })) as VoucherKey[]
        }),
  })
}

export interface VoucherOverviewStat {
  available: number
  sold: number
  total: number
}

export type VoucherOverviewResponse = Partial<Record<ExamType, VoucherOverviewStat>> & {
  totals: VoucherOverviewStat
}

/** Fetches the inventory statistics overview. */
export function useVoucherOverview() {
  return useQuery<VoucherOverviewResponse>({
    queryKey: ['vouchers', 'overview'],
    queryFn: () =>
      apiClient
        .get<{ success: boolean; data: VoucherOverviewResponse }>(ENDPOINTS.VOUCHERS.OVERVIEW)
        .then((r) => r.data.data),
  })
}

export interface CheckBulkDuplicatesResponse {
  totalParsed: number
  totalUnique: number
  totalDuplicates: number
  duplicates: {
    database: { serialNumber: string; pin: string }[]
    local: { serialNumber: string; pin: string }[]
  }
}

/** Hook to check for duplicates before bulk upload */
export function useCheckBulkDuplicates() {
  return useMutation<{ success: boolean; message: string; data: CheckBulkDuplicatesResponse }, Error, FormData>({
    mutationFn: (formData) =>
      apiClient
        .post<{ success: boolean; message: string; data: CheckBulkDuplicatesResponse }>(
          ENDPOINTS.VOUCHERS.CHECK_BULK_DUPLICATES,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        )
        .then((r) => r.data),
  })
}
