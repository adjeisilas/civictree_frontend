import axios from 'axios'

/** The shape every endpoint uses when it explains a failure. */
interface ApiErrorBody {
  message?: string
  error?: string
}

/**
 * Pulls the message the API sent, so users see the real reason — "withdrawals are
 * paused for 48 hours", not a status code. Falls back to `fallback` when the
 * server said nothing useful, and names a connection problem for what it is.
 */
export function apiErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiErrorBody>(err)) {
    const body = err.response?.data
    const serverMessage = body?.message || body?.error
    if (serverMessage) return serverMessage
    if (!err.response) return 'Cannot reach the server. Check your connection and try again.'
  }
  return fallback
}
