import type { ApiEnvelope } from '../types/api'

/**
 * Takes the payload out of an API response.
 *
 * Most endpoints answer with `{ success, data }`, but a few return the payload directly,
 * so both shapes are accepted — the same behaviour the hooks had before, with types.
 */
export const unwrap = <T>(response: { data: ApiEnvelope<T> }): T =>
  (response.data?.data || (response.data as unknown as T))

/**
 * Same as unwrap, for endpoints that return a list. Anything unexpected becomes an
 * empty array, so a component never has to guard against a missing list.
 */
export const unwrapList = <T>(response: { data: ApiEnvelope<T[]> }): T[] => {
  const payload = response.data?.data
  if (Array.isArray(payload)) return payload
  if (Array.isArray(response.data)) return response.data as unknown as T[]
  return []
}
