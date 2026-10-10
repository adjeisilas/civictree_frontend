import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { usePartnerSettings, useUpdatePartnerSettings } from '../../hooks/usePartner'
import type { PartnerSettings } from '../../types/partner'

/** Used until the saved settings arrive from the API. */
const DEFAULT_SETTINGS: PartnerSettings = {
  autoSettlementEnabled: true,
  autoSettlementThreshold: 1000.0,
  settlementFrequency: 'WEEKLY',
  defaultPayoutAccountId: 'pm_1',
  emailDailyDigest: true,
  emailPayoutAlerts: true,
  smsSurgeAlerts: true,
  smsPayoutAlerts: true,
  surgeAlertThreshold: 50,
  currencyDisplay: 'GHS',
  timezone: 'GMT (Accra)',
}

export default function PartnerSettingsPage() {
  const { data: settings, isLoading } = usePartnerSettings()
  const { mutate: updateSettings, isPending: isSaving } = useUpdatePartnerSettings()

  // The form shows the saved settings until the partner changes something
  const [formEdits, setForm] = useState<PartnerSettings | null>(null)
  const form = formEdits ?? settings ?? DEFAULT_SETTINGS

  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSettings(form, {
      onSuccess: () => {
        setForm(null)
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 2500)
      },
    })
  }

  if (isLoading) {
    return (
      <div className="py-24 text-center text-xs text-gray-400">Loading settings...</div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Helmet>
        <title>Settings & Preferences — Partner Portal</title>
      </Helmet>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Settings & Preferences</h1>
        <p className="text-xs text-gray-500 mt-1">
          Configure automated settlement thresholds, surge alerts, and financial report digest deliveries.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-2xl border border-emerald-200 shadow-2xs">
          Settings and settlement preferences saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Settlement & Disbursement Rules */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Settlement & Payout Automation</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Set automated triggers so you don't need to manually request payouts.
            </p>
          </div>

          <div className="pt-2 space-y-4">
            {/* Auto Settlement Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50/70 rounded-2xl border border-gray-100">
              <div>
                <p className="text-xs font-bold text-gray-800">Enable Automated Disbursements</p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Automatically transfer earnings to your primary account when conditions are met.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.autoSettlementEnabled}
                  onChange={(e) => setForm({ ...form, autoSettlementEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#153e14]" />
              </label>
            </div>

            {form.autoSettlementEnabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Minimum Threshold (GHS)
                  </label>
                  <input
                    type="number"
                    value={form.autoSettlementThreshold}
                    onChange={(e) =>
                      setForm({ ...form, autoSettlementThreshold: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-semibold focus:outline-none focus:border-[#153e14]"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Auto-payout initiates as soon as balance reaches this amount.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Payout Frequency Schedule
                  </label>
                  <select
                    value={form.settlementFrequency}
                    onChange={(e) => setForm({ ...form, settlementFrequency: e.target.value as PartnerSettings['settlementFrequency'] })}
                    className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-[#153e14]"
                  >
                    <option value="DAILY">Daily at 23:59 GMT</option>
                    <option value="WEEKLY">Weekly (Every Monday 09:00 GMT)</option>
                    <option value="MONTHLY">Monthly (1st of each month)</option>
                    <option value="THRESHOLD">Instant upon reaching threshold</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notifications & Surge Alert Preferences */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
          <div>
            <h2 className="text-base font-bold text-gray-900">Surge Alerts & Digest Channels</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Choose how you want to be notified during peak WAEC release sales.
            </p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Surge Alert */}
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">SMS Instant Surge Alert</p>
                <p className="text-[11px] text-gray-500">
                  Receive SMS when platform sales exceed 50 purchases in a 10-minute window.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.smsSurgeAlerts}
                onChange={(e) => setForm({ ...form, smsSurgeAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[#153e14] focus:ring-[#153e14] border-gray-300"
              />
            </div>

            {/* Daily Digest */}
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">Email Daily Financial Digest</p>
                <p className="text-[11px] text-gray-500">
                  Receive an automated email every evening summarizing daily volume and your share earnings.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.emailDailyDigest}
                onChange={(e) => setForm({ ...form, emailDailyDigest: e.target.checked })}
                className="w-4 h-4 rounded text-[#153e14] focus:ring-[#153e14] border-gray-300"
              />
            </div>

            {/* Payout SMS Alert */}
            <div className="py-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-800">Disbursement Confirmation SMS</p>
                <p className="text-[11px] text-gray-500">
                  Receive an SMS confirmation whenever a payout is credited to your bank/MoMo.
                </p>
              </div>
              <input
                type="checkbox"
                checked={form.smsPayoutAlerts}
                onChange={(e) => setForm({ ...form, smsPayoutAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-[#153e14] focus:ring-[#153e14] border-gray-300"
              />
            </div>
          </div>
        </div>

        {/* Currency & Localization */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900">Localization & Presentation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Primary Currency Display
              </label>
              <select
                value={form.currencyDisplay}
                onChange={(e) => setForm({ ...form, currencyDisplay: e.target.value as PartnerSettings['currencyDisplay'] })}
                className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl font-semibold text-gray-700 focus:outline-none focus:border-[#153e14]"
              >
                <option value="GHS">Ghanaian Cedi (GHS)</option>
                <option value="USD">US Dollar (USD - FX converted)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                Timezone
              </label>
              <input
                type="text"
                value={form.timezone}
                disabled
                className="w-full px-4 py-2.5 text-xs bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3.5 bg-[#153e14] hover:bg-[#1a4f19] text-[#dfba60] text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? 'Saving Changes...' : 'Save All Preferences'}
          </button>
        </div>
      </form>
    </div>
  )
}
