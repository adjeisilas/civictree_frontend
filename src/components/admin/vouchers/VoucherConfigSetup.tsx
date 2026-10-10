import React, { useState } from 'react'
import { useCreateVoucherConfig, useVoucherConfigs } from '../../../hooks/useVouchers'

export default function VoucherConfigSetup() {
  const { data: configs = [] } = useVoucherConfigs()
  const { mutate: createConfig, isPending: isCreatingConfig } = useCreateVoucherConfig()

  const [wassceNovdecPrice, setWassceNovdecPrice] = useState('30')
  const [wassceNovdecLimit, setWassceNovdecLimit] = useState('100')
  const [becePrice, setBecePrice] = useState('30')
  const [beceLimit, setBeceLimit] = useState('100')
  const [currency, setCurrency] = useState('GHS')

  const isInitialized = configs.length > 0

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault()
    createConfig({
      currency,
      wassceNovdecPrice: parseFloat(wassceNovdecPrice),
      wassceNovdecLimit: parseInt(wassceNovdecLimit, 10),
      becePrice: parseFloat(becePrice),
      beceLimit: parseInt(beceLimit, 10),
    })
  }

  if (isInitialized) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-4">
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
    <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm space-y-6">
      <div className="space-y-2">
        <h3 className="font-serif font-bold text-primary text-xl">Initialize Global Configuration</h3>
        <p className="text-sm text-gray-500">
          Creates the single configuration record for prices and stock limits for WASSCE/NOVDEC and BECE vouchers. Only one config record is allowed in the entire system.
        </p>
      </div>

      <form onSubmit={handleSetup} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
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

        {/* WASSCE/NOVDEC Setup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">WASSCE / NOVDEC Price</label>
            <input
              type="number"
              step="0.01"
              value={wassceNovdecPrice}
              onChange={(e) => setWassceNovdecPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-text-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">WASSCE / NOVDEC Low Stock Limit</label>
            <input
              type="number"
              value={wassceNovdecLimit}
              onChange={(e) => setWassceNovdecLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-text-primary"
              required
            />
          </div>
        </div>

        {/* BECE Setup */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-gray-100 pb-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">BECE Price</label>
            <input
              type="number"
              step="0.01"
              value={becePrice}
              onChange={(e) => setBecePrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-text-primary"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">BECE Low Stock Limit</label>
            <input
              type="number"
              value={beceLimit}
              onChange={(e) => setBeceLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-text-primary"
              required
            />
          </div>
        </div>

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
