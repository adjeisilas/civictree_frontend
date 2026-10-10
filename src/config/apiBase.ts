/**
 * The API's base URL, resolved in one place.
 *
 * Vite inlines `import.meta.env` at build time, so this value is baked into the
 * bundle when it is produced. A wrong value cannot be fixed by restarting the
 * server — it needs a rebuild. `vite.config.ts` refuses to produce a production
 * build without a sensible value, which is why there is no runtime guard here.
 */
const configured = import.meta.env.VITE_API_BASE_URL?.trim()

/** No trailing slash, so `${API_BASE_URL}/auth/login` never doubles up. */
export const API_BASE_URL = (configured || 'http://localhost:5000/api').replace(/\/+$/, '')
