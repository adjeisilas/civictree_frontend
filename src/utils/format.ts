/**
 * Number and money formatting, shared so every admin screen reads the same.
 */

/** Ghana cedi sign. Written as an escape so the glyph cannot be mangled in transit. */
export const CEDI = '₵'

/**
 * Money for display: thousands separated, and `.00` dropped on whole amounts.
 *
 * A dashboard figure is read, not reconciled against — "GH₵ 1,284,500" is
 * quicker to take in than "GH₵ 1,284,500.00", and the trailing zeros cost width
 * that long figures need. Pesewas are kept whenever they are not zero, so no
 * real precision is hidden.
 *
 *   1284500      -> "GH₵ 1,284,500"
 *   1284500.5    -> "GH₵ 1,284,500.50"
 *   0            -> "GH₵ 0"
 */
export const formatGhs = (amount: number | string | null | undefined): string => {
  const value = typeof amount === 'string' ? Number(amount) : amount
  if (value === null || value === undefined || !Number.isFinite(value)) return `GH${CEDI} 0`

  // Compare against the rounded value so floating point noise does not force decimals
  const hasPesewas = Math.abs(value * 100 - Math.round(value * 100)) > 1e-9 || Math.round(value * 100) % 100 !== 0

  return `GH${CEDI} ${value.toLocaleString('en-GH', {
    minimumFractionDigits: hasPesewas ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}

/** Plain counts with thousands separators, and a dash when there is nothing. */
export const formatCount = (value: number | null | undefined): string =>
  value === null || value === undefined || !Number.isFinite(value) ? '0' : value.toLocaleString()

/**
 * Shortens a very large figure so it still fits a card: 1.2M, 845.3K.
 * Only used where the exact value is available elsewhere (tooltip, table).
 */
export const formatCompact = (value: number | null | undefined): string => {
  if (value === null || value === undefined || !Number.isFinite(value)) return '0'
  const abs = Math.abs(value)
  if (abs >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 100_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toLocaleString()
}

/**
 * Money shortened for a narrow column: `GH₵ 12.8M`.
 *
 * Two stat cards side by side on a 320px phone leave about 104px for the
 * figure, which is less than "GH₵ 1,284,500" needs at any readable size. Cards
 * show this below the `sm` breakpoint and the exact figure above it, so nothing
 * is rounded away anywhere it would be read as precise.
 */
export const formatGhsCompact = (amount: number | string | null | undefined): string => {
  const value = typeof amount === 'string' ? Number(amount) : amount
  if (value === null || value === undefined || !Number.isFinite(value)) return `GH${CEDI} 0`
  return `GH${CEDI} ${formatCompact(value)}`
}
