import { useState } from 'react'
import { Trash2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react'
import { useSmsContactSummary, useClearSmsContacts } from '../../../hooks/useSms'
import { VOUCHER_TYPES, voucherTypeLabel } from '../../../config/voucherTypes'
import { apiErrorMessage } from '../../../utils/apiError'
import type { ExamType } from '../../../types/admin'

/** null means "every voucher type". */
type ClearTarget = ExamType | null

const formatWhen = (iso: string | null) => {
  if (!iso) return 'never'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'never'
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Lets an admin empty the SMS contact list so new contacts can collect — one
 * button per voucher type, plus one for everything.
 *
 * Worth knowing what "clear" means here, because it is not a contact table:
 * recipients are derived from USSD dials and from orders. The dial records are
 * deleted. Orders are revenue records and are never deleted, so those contacts
 * are put behind a cut-off instead and return the next time they buy. The copy
 * below says so, because an admin pressing this needs to know it is not
 * deleting their sales history.
 */
export default function ClearContactsPanel() {
  const { data: summary, isLoading, isError, refetch, isFetching } = useSmsContactSummary()
  const { mutate: clearContacts, isPending } = useClearSmsContacts()

  const [pendingTarget, setPendingTarget] = useState<ClearTarget | undefined>(undefined)
  const [typedConfirmation, setTypedConfirmation] = useState('')
  const [error, setError] = useState('')
  const [lastResult, setLastResult] = useState<string | null>(null)

  const isConfirming = pendingTarget !== undefined
  const targetLabel = pendingTarget === null ? 'ALL' : pendingTarget ? voucherTypeLabel(pendingTarget) : ''

  // Clearing everything is the one that needs typing out; a single product is
  // a smaller, easily repeated action
  const requiresTyping = pendingTarget === null
  const canConfirm = !requiresTyping || typedConfirmation.trim().toUpperCase() === 'ALL'

  const countFor = (target: ClearTarget) =>
    target === null
      ? summary?.total.contacts
      : summary?.types.find((t) => t.voucherType === target)?.contacts

  const lastClearedFor = (target: ClearTarget) =>
    target === null
      ? summary?.total.lastClearedAt ?? null
      : summary?.types.find((t) => t.voucherType === target)?.lastClearedAt ?? null

  const startConfirm = (target: ClearTarget) => {
    setPendingTarget(target)
    setTypedConfirmation('')
    setError('')
    setLastResult(null)
  }

  const cancel = () => {
    setPendingTarget(undefined)
    setTypedConfirmation('')
    setError('')
  }

  const confirm = () => {
    if (pendingTarget === undefined || !canConfirm) return

    clearContacts(
      { voucherType: pendingTarget },
      {
        onSuccess: (result) => {
          const scope = result.voucherType ? voucherTypeLabel(result.voucherType) : 'all voucher types'
          setLastResult(
            `Cleared ${result.contactsBefore.toLocaleString()} contact(s) for ${scope}. ` +
              `${result.dialersDeleted.toLocaleString()} USSD record(s) deleted; ` +
              `${result.ordersExcluded.toLocaleString()} past customer(s) will return when they next order.`
          )
          cancel()
        },
        onError: (err) => setError(apiErrorMessage(err, 'Could not clear the contact list.')),
      }
    )
  }

  const rows: { target: ClearTarget; label: string; dot?: string }[] = [
    ...VOUCHER_TYPES.map((v) => ({
      target: v.type as ClearTarget,
      label: v.displayName,
      dot: v.accent.chartColor,
    })),
    { target: null, label: 'All contacts' },
  ]

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <div className="border-b border-gray-200 pb-3 flex items-center justify-between gap-3">
        <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
          <Trash2 className="w-3.5 h-3.5 text-red-600" />
          <span>Clear Contacts</span>
        </h3>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="text-xs font-bold text-gray-400 hover:text-gray-700 inline-flex items-center gap-1 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <p className="text-xs text-gray-500 font-medium leading-relaxed">
        Empties a contact list so new contacts start collecting from now. USSD dial records are
        deleted, so anyone who dials again is picked up as a new contact.
      </p>

      <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <p className="text-[11px] text-emerald-900 font-medium leading-relaxed">
          Your orders, vouchers and commissions are never deleted. Past customers simply stop
          receiving campaigns until they buy again.
        </p>
      </div>

      {isError && (
        <p className="text-[11px] text-red-600 font-semibold">
          Could not load contact counts. Try Refresh.
        </p>
      )}

      {lastResult && (
        <p className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3 font-medium leading-relaxed">
          {lastResult}
        </p>
      )}

      <div className="space-y-2">
        {rows.map(({ target, label, dot }) => {
          const count = countFor(target)
          const isAll = target === null
          const isEmpty = count === 0

          return (
            <div
              key={label}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${
                isAll ? 'border-red-200 bg-red-50/40' : 'border-gray-200'
              }`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  {dot && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: dot }}
                    />
                  )}
                  <span className={`text-xs font-bold truncate ${isAll ? 'text-red-900' : 'text-gray-800'}`}>
                    {label}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  {isLoading ? 'counting…' : `${(count ?? 0).toLocaleString()} contact(s)`}
                  {' · last cleared '}
                  {formatWhen(lastClearedFor(target))}
                </p>
              </div>

              <button
                type="button"
                onClick={() => startConfirm(target)}
                disabled={isPending || isLoading || isEmpty}
                title={isEmpty ? 'Already empty' : undefined}
                className={`px-3 py-2 text-[11px] font-bold rounded-xl transition-all shrink-0 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                  isAll
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {isEmpty ? 'Empty' : 'Clear'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Confirmation */}
      {isConfirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={cancel} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-lg text-gray-900">
                  Clear {targetLabel === 'ALL' ? 'all contacts' : `${targetLabel} contacts`}?
                </h4>
                <p className="text-xs text-gray-500 mt-1 font-medium">
                  {(countFor(pendingTarget) ?? 0).toLocaleString()} contact(s) will stop receiving
                  campaigns. This cannot be undone.
                </p>
              </div>
            </div>

            <ul className="text-[11px] text-gray-600 space-y-1.5 bg-gray-50 border border-gray-200 rounded-xl p-3 font-medium">
              <li>• USSD dial records are deleted permanently.</li>
              <li>• Orders, vouchers and commissions are kept.</li>
              <li>• Past customers return to the list when they next order.</li>
              <li>• Anyone who dials the shortcode again is picked up straight away.</li>
            </ul>

            {requiresTyping && (
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-gray-600">
                  Type <span className="font-mono font-bold text-red-700">ALL</span> to confirm
                </label>
                <input
                  type="text"
                  value={typedConfirmation}
                  onChange={(e) => {
                    setTypedConfirmation(e.target.value)
                    setError('')
                  }}
                  autoComplete="off"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-red-500 transition-all"
                />
              </div>
            )}

            {error && <p className="text-[11px] text-red-600 font-semibold">{error}</p>}

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={cancel}
                disabled={isPending}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={isPending || !canConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2.5 rounded-xl transition-all cursor-pointer"
              >
                {isPending ? 'Clearing…' : 'Clear contacts'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
