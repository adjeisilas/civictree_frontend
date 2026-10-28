import type { ExamType } from '../types/admin'

/**
 * The voucher types the system sells, described once.
 *
 * Prices, stock thresholds and commissions arrive from the API as one field per
 * type (`becePrice`, `wassceNovdecLimit`, …), so screens used to hardcode each
 * one. Anything that varies per type is named here instead, which is what makes
 * adding a type a matter of one entry rather than a hunt through every page.
 *
 * Mirrors civitree_backend/utils/voucher/voucherTypes.js — keep the two in step.
 */

export interface VoucherTypeDefinition {
  type: ExamType
  /** How the type is written for customers and admins. */
  displayName: string
  /** Shorter label for chart legends and narrow table columns. */
  shortName: string
  /** API field names on the voucher config payloads. */
  priceField: string
  limitField: string
  releaseDateField: string
  /** API field name on the affiliate commission config. */
  commissionField: string
  /**
   * Where a customer checks results for this type, or null when no portal is
   * configured. Mirrors resultsUrlFor() in the backend: a type with no URL must
   * have the link omitted, never substituted with another body's portal.
   */
  resultsUrl: string | null
  /** Tailwind classes for this type's chip, chart series and cards. */
  accent: {
    chip: string
    dot: string
    chartColor: string
  }
}

/** Order matters: it is the order shown in menus, charts and config screens. */
export const VOUCHER_TYPES: VoucherTypeDefinition[] = [
  {
    type: 'BECE',
    displayName: 'BECE',
    shortName: 'BECE',
    priceField: 'becePrice',
    limitField: 'beceLimit',
    releaseDateField: 'beceReleaseDate',
    commissionField: 'beceCommission',
    resultsUrl: 'https://eresults.waecgh.org/',
    accent: { chip: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', chartColor: '#2563eb' },
  },
  {
    type: 'WASSCE_NOVDEC',
    displayName: 'WASSCE/NOVDEC',
    shortName: 'WASSCE',
    priceField: 'wassceNovdecPrice',
    limitField: 'wassceNovdecLimit',
    releaseDateField: 'wassceNovdecReleaseDate',
    commissionField: 'wassceNovdecCommission',
    resultsUrl: 'https://ghana.waecdirect.org/',
    accent: { chip: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', chartColor: '#059669' },
  },
  {
    type: 'CTVET_NABTEX',
    displayName: 'CTVET/NABTEX',
    shortName: 'CTVET',
    priceField: 'ctvetNabtexPrice',
    limitField: 'ctvetNabtexLimit',
    releaseDateField: 'ctvetNabtexReleaseDate',
    commissionField: 'ctvetNabtexCommission',
    // TODO: set the CTVET/NABTEX results portal. Until it is set, links to it
    // are omitted rather than pointing customers at a WAEC page.
    resultsUrl: null,
    accent: { chip: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', chartColor: '#d97706' },
  },
]

/** Just the type codes, in display order. */
export const VOUCHER_TYPE_CODES: ExamType[] = VOUCHER_TYPES.map((v) => v.type)

const BY_TYPE = new Map(VOUCHER_TYPES.map((v) => [v.type, v]))

/** The definition for a type, or undefined for a value the API has not told us about. */
export const voucherTypeDefinition = (type: string | undefined | null) =>
  type ? BY_TYPE.get(type as ExamType) : undefined

/**
 * How to write a type on screen. Falls back to the raw value with underscores
 * replaced, so an unrecognised type from the API still reads sensibly rather
 * than showing blank.
 */
export const voucherTypeLabel = (type: string | undefined | null): string => {
  if (!type) return '—'
  return BY_TYPE.get(type as ExamType)?.displayName ?? type.replace(/_/g, ' ')
}

/** The short label, for chart legends and tight columns. */
export const voucherTypeShortLabel = (type: string | undefined | null): string => {
  if (!type) return '—'
  return BY_TYPE.get(type as ExamType)?.shortName ?? type.replace(/_/g, ' ')
}

/** Chip classes for a type, with a neutral fallback. */
export const voucherTypeChip = (type: string | undefined | null): string =>
  voucherTypeDefinition(type)?.accent.chip ?? 'bg-gray-100 text-gray-700'

/**
 * This type's live unit price, or null when it has no usable price yet.
 *
 * A type added by a migration starts at 0.00 until an admin sets a real price,
 * and 0 must not be shown or charged. It is also falsy, so `price || fallback`
 * silently swaps in a made-up number — the site would advertise one figure while
 * the backend charged nothing. Callers get null and must say "not yet priced"
 * rather than guess.
 *
 * @param config the public voucher config response
 * @param type the voucher type
 */
export const resolvePublicPrice = (
  config: { types?: { type: ExamType; price: number }[] } | undefined,
  type: ExamType
): number | null => {
  const fromTypes = config?.types?.find((t) => t.type === type)?.price

  // Older responses carry one field per type instead of the `types` array
  const definition = voucherTypeDefinition(type)
  const legacyFields = config as Record<string, unknown> | undefined
  const legacy = definition ? (legacyFields?.[definition.priceField] as number | undefined) : undefined

  const price = fromTypes ?? legacy
  return typeof price === 'number' && price > 0 ? price : null
}

/** `{ BECE: 0, WASSCE_NOVDEC: 0, CTVET_NABTEX: 0 }` — for chart and stat defaults. */
export const zeroedByVoucherType = <T,>(value: T): Record<ExamType, T> =>
  Object.fromEntries(VOUCHER_TYPE_CODES.map((type) => [type, value])) as Record<ExamType, T>
