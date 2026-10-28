import React, { useState } from 'react'
import axios from 'axios'
import {
  useTwoFactorStatus,
  useStartTwoFactorSetup,
  useEnableTwoFactor,
  useDisableTwoFactor,
  useRegenerateRecoveryCodes,
} from '../../../hooks/useTwoFactor'

const serverMessage = (err: unknown, fallback: string) =>
  (axios.isAxiosError<{ message?: string }>(err) ? err.response?.data?.message : undefined) || fallback

/**
 * Two-step verification: set up an authenticator app, save recovery codes, or switch it off.
 */
export default function TwoFactorCard() {
  const { data: status, isLoading } = useTwoFactorStatus()
  const { mutate: startSetup, isPending: isStarting, data: setupData, reset: resetSetup } = useStartTwoFactorSetup()
  const { mutate: enable, isPending: isEnabling } = useEnableTwoFactor()
  const { mutate: disable, isPending: isDisabling } = useDisableTwoFactor()
  const { mutate: regenerate, isPending: isRegenerating } = useRegenerateRecoveryCodes()

  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const clearMessages = () => {
    setError('')
    setNotice('')
  }

  const handleStartSetup = (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    startSetup(
      { currentPassword: password },
      {
        onSuccess: () => setPassword(''),
        onError: (err) => setError(serverMessage(err, 'Could not start setup.')),
      }
    )
  }

  const handleEnable = (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    enable(
      { code },
      {
        onSuccess: (codes) => {
          setRecoveryCodes(codes)
          setCode('')
          resetSetup()
          setNotice('Two-step verification is on. Save the recovery codes below.')
        },
        onError: (err) => setError(serverMessage(err, 'That code was not accepted.')),
      }
    )
  }

  const handleDisable = (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    disable(
      { currentPassword: password, code },
      {
        onSuccess: () => {
          setPassword('')
          setCode('')
          setRecoveryCodes(null)
          setNotice('Two-step verification is off.')
        },
        onError: (err) => setError(serverMessage(err, 'Could not turn off two-step verification.')),
      }
    )
  }

  const handleRegenerate = (e: React.FormEvent) => {
    e.preventDefault()
    clearMessages()
    regenerate(
      { currentPassword: password, code },
      {
        onSuccess: (codes) => {
          setRecoveryCodes(codes)
          setPassword('')
          setCode('')
          setNotice('New recovery codes issued. The old ones no longer work.')
        },
        onError: (err) => setError(serverMessage(err, 'Could not issue new recovery codes.')),
      }
    )
  }

  const inputClass =
    'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all'

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
      <h3 className="text-xs font-bold text-gray-400 border-b border-gray-50 pb-2">
        Two-Step Verification
      </h3>

      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${status?.enabled ? 'bg-emerald-500' : 'bg-gray-300'}`}
            />
            <p className="text-sm font-semibold text-gray-700">
              {status?.enabled ? 'On' : 'Off'}
            </p>
            {status?.enabled && (
              <span className="text-xs text-gray-500">
                · {status.recoveryCodesRemaining} recovery code(s) left
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500">
            With two-step verification on, signing in needs a 6-digit code from an authenticator app
            (Google Authenticator, Microsoft Authenticator, Authy) as well as your password.
          </p>

          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg p-3">{error}</p>}
          {notice && <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg p-3">{notice}</p>}

          {recoveryCodes && (
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-bold text-amber-900">
                Save these recovery codes now — they are shown only once.
              </p>
              <p className="text-[11px] text-amber-800">
                Each code works once, if you cannot use your authenticator app.
              </p>
              <div className="grid grid-cols-2 gap-2 font-mono text-xs text-gray-800">
                {recoveryCodes.map((rc) => (
                  <span key={rc} className="bg-white border border-amber-100 rounded px-2 py-1 text-center">{rc}</span>
                ))}
              </div>
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(recoveryCodes.join('\n'))}
                className="text-[11px] font-bold text-amber-900 underline cursor-pointer"
              >
                Copy all codes
              </button>
            </div>
          )}

          {/* Off → start setup, then confirm a code */}
          {!status?.enabled && !setupData && (
            <form onSubmit={handleStartSetup} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Confirm your password to begin</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={inputClass}
                  placeholder="Your account password"
                />
              </div>
              <button
                type="submit"
                disabled={isStarting || !password}
                className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-secondary text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                {isStarting ? 'Preparing…' : 'Set up two-step verification'}
              </button>
            </form>
          )}

          {!status?.enabled && setupData && (
            <form onSubmit={handleEnable} className="space-y-3">
              <p className="text-xs text-gray-600">1. Scan this code with your authenticator app:</p>
              <img src={setupData.qrCodeDataUrl} alt="Two-step verification QR code" className="w-44 h-44 border border-gray-200 rounded-xl" />
              <p className="text-[11px] text-gray-500">
                Cannot scan? Enter this key by hand:{' '}
                <span className="font-mono text-gray-700 break-all">{setupData.manualEntryKey}</span>
              </p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">2. Enter the 6-digit code from the app</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  autoComplete="one-time-code"
                  className={`${inputClass} font-mono tracking-widest`}
                  placeholder="123456"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isEnabling || code.length < 6}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-primary hover:bg-secondary text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isEnabling ? 'Turning on…' : 'Turn on'}
                </button>
                <button
                  type="button"
                  onClick={() => { resetSetup(); setCode(''); clearMessages() }}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* On → new recovery codes, or switch off */}
          {status?.enabled && (
            <div className="space-y-3 border-t border-gray-50 pt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Your password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className={inputClass}
                    placeholder="Your account password"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Code from your app</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    maxLength={11}
                    autoComplete="one-time-code"
                    className={`${inputClass} font-mono tracking-widest`}
                    placeholder="123456"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating || !password || code.length < 6}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isRegenerating ? 'Working…' : 'New recovery codes'}
                </button>
                <button
                  type="button"
                  onClick={handleDisable}
                  disabled={isDisabling || !password || code.length < 6}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl bg-red-50 border border-red-100 text-red-700 hover:bg-red-100 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isDisabling ? 'Turning off…' : 'Turn off two-step verification'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
