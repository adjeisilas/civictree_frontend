export * from './website'
export * from './admin'

// ─── Generic API envelope ────────────────────────────────────────────────────

/** Standard single-resource response shape from the CivicTree backend */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

/** Standard paginated-list response shape from the CivicTree backend */
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  total: number
  page: number
  limit: number
}
