import React, { useState } from 'react'
import { useCreateVoucherConfig, useVoucherConfigs } from '../../../hooks/useVouchers'
import { VOUCHER_TYPES } from '../../../config/voucherTypes'
import type { GlobalVoucherConfig } from '../../../types/admin'

/** Starting values for a fresh configuration, before the admin edits anything. */
const DEFAULT_PRICE = '30'
const DEFAULT_LIMIT = '100'

export default function VoucherConfigSetup() {
  const { data: configs = [] } = useVoucherConfigs()
  const { mutate: createConfig, isPending: isCreatingConfig } = useCreateVoucherConfig()

  const [currency, setCurrency] = useState('GHS')

  // One price and one stock threshold per voucher type, keyed by the API's own
  // field names, so adding a type needs no change here
  const [fields, setFields] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      VOUCHER_TYPES.flatMap((v) => [
        [v.priceField, DEFAULT_PRICE],
        [v.limitField, DEFAULT_LIMIT],
      ])
    )
  )

  const setField = (name: string, value: string) =>
    setFields((previous) => ({ ...previous, [name]: value }))

  const isInitialized = configs.length > 0

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault()

    const numeric = Object.fromEntries(
      VOUCHER_TYPES.flatMap((v) => [
        [v.priceField, parseFloat(fields[v.priceField])],
        [v.limitField, parseInt(fields[v.limitField], 10)],
      ])
    )

    createConfig({ currency, ...numeric } as GlobalVoucherConfig)
  }

  if (isInitialized) {
    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center space-x-3 text-emerald-600">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="font-serif font-bold text-lg">Configuration Initialized</h3>
        </div>
        <p className="text-sm text-gray-500">
          The global voucher configuration has already been created. Only one configuration record is allowed in the entire system.
          To update prices or limits, please use the <strong>Stock Alerts</strong> tab.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
      <div className="space-y-2">
        <h3 className="font-serif font-bold text-primary text-xl">Initialize Global Configuration</h3>
        <p className="text-sm text-gray-500">
          Creates the single configuration record holding the price and low-stock limit for every
          voucher type. Only one config record is allowed in the entire system.
        </p>
      </div>

      <form onSubmit={handleSetup} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Currency</label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-text-primary"
              required
            />
          </div>
        </div>

        {VOUCHER_TYPES.map((voucher) => (
          <div
            key={voucher.type}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-200 pb-6"
          >
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                {voucher.displayName} Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={fields[voucher.priceField]}
                onChange={(e) => setField(voucher.priceField, e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-text-primary"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">
                {voucher.displayName} Low Stock Limit
              </label>
              <input
                type="number"
                min="0"
                value={fields[voucher.limitField]}
                onChange={(e) => setField(voucher.limitField, e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-text-primary"
                required
              />
            </div>
          </div>
        ))}

        <button
          type="submit"
          disabled={isCreatingConfig}
          className="px-6 py-3 bg-[#dfba60] hover:bg-[#cfa54f] text-primary font-bold rounded-xl active:scale-98 transition-all disabled:opacity-50 shadow-sm cursor-pointer inline-flex items-center space-x-2 w-full justify-center md:w-auto"
        >
          {isCreatingConfig ? 'Creating Configuration...' : 'Create Global Configuration'}
        </button>
      </form>
    </div>
  )
}
