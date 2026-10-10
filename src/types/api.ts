/**
 * The shape the CivicTree API returns: a wrapper with the payload under `data`.
 * Some endpoints also add `pagination`, `results` or `message` alongside it.
 *
 * Use it with the helpers in src/lib/unwrap.ts rather than reaching into `data.data`
 * at every call site.
 */
export interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  status?: number
  data?: T
  results?: number
  pagination?: {
    page?: number
    limit?: number
    total?: number
    totalResults?: number
    totalPages?: number
  }
}
