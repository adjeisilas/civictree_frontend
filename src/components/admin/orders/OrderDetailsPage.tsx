import { useState } from 'react'
import type { Order } from '../../../types/admin'

interface OrderDetailsPageProps {
  order: Order
  onBack: () => void
  onResendSMS: (orderId: string) => void
  onReallocateKey: (orderId: string) => void
  onProcessRefund: (orderId: string, refundDetails: { method: string; reason: string; notes: string }) => void
}

export default function OrderDetailsPage({
  order,
  onBack,
  onResendSMS,
  onReallocateKey,
  onProcessRefund,
}: OrderDetailsPageProps) {
  const [showPins, setShowPins] = useState<{ [serial: string]: boolean }>({})
  const [isSendingSMS, setIsSendingSMS] = useState(false)
  const [smsLog, setSmsLog] = useState<string[]>([
    `[SYSTEM] Connection stable. Node ready.`,
  ])

  // Refund states
  const [refundMethod, setRefundMethod] = useState('momo')
  const [refundReason, setRefundReason] = useState('failed_sms')
  const [refundNotes, setRefundNotes] = useState('')
  const [isProcessingRefund, setIsProcessingRefund] = useState(false)

  const isRefunded = order.paymentStatus === 'Failed' && order.deliveryStatus === 'Not sent'

  const togglePinReveal = (serial: string) => {
    setShowPins((prev) => ({ ...prev, [serial]: !prev[serial] }))
  }

  const handleResendClick = () => {
    setIsSendingSMS(true)
    setTimeout(() => {
      setIsSendingSMS(false)
      onResendSMS(order.id)
      setSmsLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Resend triggered. SMS keys dispatched successfully. Retry attempts: ${(order.smsRetryAttempts || 0) + 1}`,
        ...prev,
      ])
    }, 1200)
  }

  const handleAuthorizeRefund = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessingRefund(true)
    setTimeout(() => {
      setIsProcessingRefund(false)
      onProcessRefund(order.id, {
        method: refundMethod,
        reason: refundReason,
        notes: refundNotes,
      })
      setSmsLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Order marked as REFUNDED. Keys invalidated. SMS notifications canceled.`,
        ...prev,
      ])
    }, 1500)
  }

  // Stepper Visualizer
  const renderStatusFlow = () => {
    if (order.paymentStatus === 'Paid' && order.deliveryStatus === 'Sent') {
      // Flow 1: Successful Path
      return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
          <p className="text-xs font-bold text-gray-400">Order Status Flow</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">1. Payment Initiated</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">2. Payment Gateway Callback</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">3. Payment Confirmed</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">4. Voucher Assigned</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">5. SMS Dispatched</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-emerald-500 text-white font-bold">6. Order Complete</span>
          </div>
        </div>
      )
    } else if (order.paymentStatus === 'Failed') {
      // Flow 2: Failed Payment Path
      return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
          <p className="text-xs font-bold text-gray-400">Order Status Flow</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
            <span className="px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-100">3. Payment Failed</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-200">Marked Failed - No Voucher Assigned</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-gray-50 text-gray-500 border border-gray-200">Admin notified</span>
          </div>
        </div>
      )
    } else {
      // Flow 3: No Stock Path
      return (
        <div className="bg-white p-5 rounded-xl border border-gray-200 space-y-3">
          <p className="text-xs font-bold text-gray-400">Order Status Flow</p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500">
            <span className="px-2.5 py-1 rounded bg-red-50 text-red-700 border border-red-100">4. No Stock Available</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-amber-50 text-amber-700 border border-amber-250 animate-pulse">Queued: Awaiting Stock</span>
            <span>&rarr;</span>
            <span className="px-2.5 py-1 rounded bg-gray-50 text-gray-500 border border-gray-200">SMS: Delay Notification Sent</span>
          </div>
        </div>
      )
    }
  }

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    if (isRefunded) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">Refunded</span>
    }
    switch (status) {
      case 'Paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Paid</span>
      case 'Failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">Failed</span>
    }
  }

  const getDeliveryBadge = (status: Order['deliveryStatus']) => {
    if (isRefunded) {
      return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-150 text-gray-500 border border-gray-200">Void</span>
    }
    switch (status) {
      case 'Sent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Sent</span>
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Pending</span>
      case 'Not sent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">Not sent</span>
    }
  }

  return (
    <div className="space-y-6 text-sm">
      {/* Back Header navigation */}
      <div className="flex items-center space-x-3 bg-white p-4 rounded-xl border border-gray-200">
        <button
          onClick={onBack}
          className="p-2 hover:bg-gray-100 text-gray-500 hover:text-gray-700 rounded-xl transition-colors cursor-pointer inline-flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-bold text-xs uppercase">Back to Orders</span>
        </button>
        <span className="text-gray-300">|</span>
        <div>
          <span className="text-xs font-bold text-gray-400">Order ID:</span>
          <span className="ml-1.5 font-bold font-mono text-primary text-xs">{order.id}</span>
        </div>
      </div>

      {/* Stepper progress layout */}
      {renderStatusFlow()}

      {/* Grid view containing detailed column segments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: Core Data & Refund Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer and transaction data card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <h3 className="font-serif font-bold text-primary text-lg">Order Details</h3>
              <div className="flex space-x-2">
                {getPaymentBadge(order.paymentStatus)}
                {getDeliveryBadge(order.deliveryStatus)}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-gray-500 font-semibold font-sans">
              <div className="space-y-3">
                <h4 className="font-bold text-text-primary text-xs">Core Order Fields</h4>
                <div className="space-y-2 border border-gray-200 p-4 rounded-xl bg-gray-50/50 text-text-primary">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Customer Name</span>
                    <span>{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Phone Number</span>
                    <span className="font-mono">{order.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Voucher Type</span>
                    <span>{order.voucherType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantity</span>
                    <span>{order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unit Price</span>
                    <span>GHC {((Number(order.amount) || 0) / order.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Amount Charged</span>
                    <span className="font-bold text-primary">GHC {(Number(order.amount) || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Channel</span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">{order.channel}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-text-primary text-xs">Transaction Fields</h4>
                <div className="space-y-2 border border-gray-200 p-4 rounded-xl bg-gray-50/50 text-text-primary">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Method</span>
                    <span>{order.paymentMethod || 'MoMo'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Network</span>
                    <span>{order.paymentNetwork || 'MTN'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Reference</span>
                    <span className="font-mono text-xs text-gray-500">{order.gatewayRef || 'TXN-000000'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Response Code</span>
                    <span className="font-mono text-emerald-600 font-bold">{order.gatewayResponseCode || '000 (Approved)'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created Timestamp</span>
                    <span>{order.createdTimestamp || order.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Payment Timestamp</span>
                    <span>{order.paymentTimestamp || order.date}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Fields */}
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-text-primary text-xs">Delivery Fields</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-gray-200 p-4 rounded-xl bg-gray-50/50 text-text-primary text-xs font-semibold">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMS Dispatch Timestamp</span>
                    <span>{order.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Delivery Status</span>
                    <span>{order.deliveryStatus}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">SMS Retry Attempts</span>
                    <span>{order.smsRetryAttempts || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Confirmation Timestamp</span>
                    <span>{order.deliveryConfirmationTimestamp || order.date}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-5">
            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
              <div>
                <h3 className="font-serif font-bold text-red-600 text-lg">Order Refund Controls</h3>
                <p className="text-xs text-gray-400">Process cash back allocations and invalidate allocated pins</p>
              </div>
            </div>

            {isRefunded ? (
              /* Already Refunded Alert Box */
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-800 space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold text-sm">Refund Authorized & Settled</span>
                </div>
                <p className="text-xs opacity-90 leading-relaxed font-semibold">
                  This transaction was refunded. The corresponding voucher keys were labeled void/withdrawn in the registry and the customer's payment provider was dispatched a return credit.
                </p>
              </div>
            ) : (
              /* Refund Input Form */
              <form onSubmit={handleAuthorizeRefund} className="space-y-4 text-xs font-semibold text-gray-600">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Refund channel select */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Refund Destination</label>
                    <select
                      value={refundMethod}
                      onChange={(e) => setRefundMethod(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-gray-700 cursor-pointer"
                    >
                      <option value="momo">Original Mobile Money Wallet</option>
                      <option value="manual">Manual Cash Reimbursement</option>
                      <option value="ledger">Add to Client Ledger Balance</option>
                    </select>
                  </div>

                  {/* Refund reason selector */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Primary Reason</label>
                    <select
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white text-gray-700 cursor-pointer"
                    >
                      <option value="double_charge">Gateway Double Charge</option>
                      <option value="no_stock">Stock Delay / Keys Unavailable</option>
                      <option value="failed_sms">Failed Key SMS node delivery</option>
                      <option value="customer_request">Customer Cancellation Request</option>
                    </select>
                  </div>
                </div>

                {/* Refund Notes */}
                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Administrative Notes / Comments</label>
                  <textarea
                    rows={3}
                    placeholder="Enter details on payment settlement, momo txn references, or customer feedback..."
                    value={refundNotes}
                    onChange={(e) => setRefundNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary text-text-primary font-medium"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessingRefund || order.paymentStatus !== 'Paid'}
                    className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl active:scale-[0.98] transition-all disabled:opacity-50 shadow-md cursor-pointer inline-flex items-center justify-center space-x-2"
                  >
                    {isProcessingRefund ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Settling Refund...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                        </svg>
                        <span>Authorize & Process Refund</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Right Column: Key details & Logs */}
        <div className="lg:col-span-1 space-y-6">
          {/* Action Tools Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
            <h3 className="font-serif font-bold text-primary text-base border-b border-gray-50 pb-2">Quick Actions</h3>
            
            <div className="space-y-2.5">
              <button
                onClick={handleResendClick}
                disabled={isSendingSMS || order.paymentStatus !== 'Paid' || isRefunded}
                className="w-full py-2.5 bg-primary text-white font-bold rounded-xl active:scale-[0.98] transition-all hover:bg-secondary disabled:opacity-50 disabled:scale-100 cursor-pointer flex justify-center items-center space-x-2 shadow-sm"
              >
                {isSendingSMS ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending SMS...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <span>Resend SMS keys</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onReallocateKey(order.id)}
                disabled={order.paymentStatus !== 'Paid' || isRefunded}
                className="w-full py-2.5 border border-gray-200 bg-white text-gray-500 font-bold rounded-xl hover:text-text-primary hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer text-center block"
              >
                Reallocate Checker Key
              </button>
            </div>
          </div>

          {/* Allocated Keys (Visual block) */}
          {order.allocatedKeys && order.allocatedKeys.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
              <h3 className="font-serif font-bold text-primary text-base border-b border-gray-50 pb-2">Allocated Keys ({order.allocatedKeys.length})</h3>
              
              <div className="space-y-3">
                {order.allocatedKeys.map((key) => {
                  const isRevealed = !!showPins[key.serial]
                  return (
                    <div key={key.serial} className={`bg-gray-50 border p-3.5 rounded-xl flex items-center justify-between text-text-primary ${isRefunded ? 'opacity-55' : ''}`}>
                      <div>
                        <div className="text-xs text-gray-400 font-bold">SERIAL: {key.serial}</div>
                        <div className="font-mono text-sm mt-1 tracking-widest font-bold">
                          {isRevealed ? key.pin : '•••• •••• ••••'}
                        </div>
                      </div>
                      <button
                        onClick={() => togglePinReveal(key.serial)}
                        disabled={isRefunded}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 disabled:opacity-30 transition-colors cursor-pointer"
                        title={isRevealed ? 'Hide PIN' : 'Reveal PIN'}
                      >
                        {isRevealed ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* SMS Timeline logs */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 space-y-4">
            <h3 className="font-serif font-bold text-primary text-base border-b border-gray-50 pb-2">SMS Node Status Logs</h3>
            <div className="bg-gray-950 font-mono text-xs p-4 rounded-xl space-y-2 border border-white/5 max-h-44 overflow-y-auto shadow-inner leading-relaxed select-text">
              {smsLog.map((log, idx) => (
                <div key={idx} className="text-gray-300">{log}</div>
              ))}
              <div className="text-gray-400">[SYSTEM] Transaction logged: {order.id}</div>
              {order.deliveryStatus === 'Sent' && (
                <div className="text-emerald-400">[SUCCESS] SMS keys successfully delivered.</div>
              )}
              {isRefunded && (
                <div className="text-red-400">[CANCEL] System withdrawn state. Keys marked void.</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
