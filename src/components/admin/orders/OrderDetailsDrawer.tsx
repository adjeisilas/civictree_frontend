import { useState } from 'react'
import type { ExamType } from '../../../types/admin'

export interface Order {
  id: string
  customerName: string
  phone: string
  voucherType: ExamType
  quantity: number
  amount: number
  paymentStatus: 'Successful' | 'Pending' | 'Failed'
  deliveryStatus: 'Delivered' | 'Failed' | 'Delayed'
  date: string
  // Additional details for the drawer
  gatewayRef?: string
  paymentMethod?: string
  allocatedKeys?: { serial: string; pin: string }[]
}

interface OrderDetailsDrawerProps {
  order: Order | null
  onClose: () => void
  onResendSMS: (orderId: string) => void
  onReallocateKey: (orderId: string) => void
  onMarkRefunded: (orderId: string) => void
}

export default function OrderDetailsDrawer({
  order,
  onClose,
  onResendSMS,
  onReallocateKey,
  onMarkRefunded,
}: OrderDetailsDrawerProps) {
  const [showPins, setShowPins] = useState<{ [serial: string]: boolean }>({})
  const [isSendingSMS, setIsSendingSMS] = useState(false)
  const [smsLog, setSmsLog] = useState<string[]>([])

  if (!order) return null

  const togglePinReveal = (serial: string) => {
    setShowPins((prev) => ({ ...prev, [serial]: !prev[serial] }))
  }

  const handleResendClick = () => {
    setIsSendingSMS(true)
    // Simulate SMS dispatch queue
    setTimeout(() => {
      setIsSendingSMS(false)
      onResendSMS(order.id)
      setSmsLog((prev) => [
        `[${new Date().toLocaleTimeString()}] Keys dispatched successfully to node. Delivery receipt acknowledged.`,
        ...prev,
      ])
    }, 1500)
  }

  const getPaymentBadge = (status: Order['paymentStatus']) => {
    switch (status) {
      case 'Successful':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Successful</span>
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">Pending</span>
      case 'Failed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">Failed</span>
    }
  }

  const getDeliveryBadge = (status: Order['deliveryStatus']) => {
    switch (status) {
      case 'Delivered':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">Delivered</span>
      case 'Delayed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">Stock Delayed</span>
      case 'Failed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">Failed SMS Node</span>
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none">
      {/* Drawer Overlay Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-[#0c180b]/55 backdrop-blur-sm transition-opacity" 
      />

      {/* Sliding Drawer Container */}
      <div className="absolute inset-y-0 right-0 max-w-md w-full bg-white shadow-xl flex flex-col justify-between overflow-hidden border-l border-gray-200">
        
        {/* Top Header */}
        <div className="p-6 border-b border-gray-200 bg-[#FCFDFB] flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-gray-400 leading-none">Order Details</span>
            <h3 className="text-base font-serif font-bold text-primary mt-1.5 leading-none">{order.id}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable details contents */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto text-xs font-semibold text-gray-500 scrollbar">
          
          {/* Status summary banner */}
          <div className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-200">
            <div>
              <p className="text-[11px] font-bold text-gray-400">Payment</p>
              <div className="mt-1">{getPaymentBadge(order.paymentStatus)}</div>
            </div>
            <div>
              <p className="text-[11px] font-bold text-gray-400">SMS Delivery</p>
              <div className="mt-1">{getDeliveryBadge(order.deliveryStatus)}</div>
            </div>
          </div>

          {/* Customer Metadata Card */}
          <div className="space-y-2">
            <h4 className="font-serif text-sm font-bold text-primary">Customer Profile</h4>
            <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-2.5 text-text-primary">
              <div className="flex justify-between">
                <span className="text-gray-400">Full Name</span>
                <span>{order.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Phone Number</span>
                <span>{order.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Transaction Date</span>
                <span>{order.date}</span>
              </div>
            </div>
          </div>

          {/* Transaction Metadata Card */}
          <div className="space-y-2">
            <h4 className="font-serif text-sm font-bold text-primary">Transaction Info</h4>
            <div className="bg-white border border-gray-200 p-4 rounded-xl space-y-2.5 text-text-primary">
              <div className="flex justify-between">
                <span className="text-gray-400">Voucher Type</span>
                <span>{order.voucherType} Checker</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Quantity Ordered</span>
                <span>{order.quantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total Charged</span>
                <span className="font-bold">GHS {(Number(order.amount) || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Payment Gateway Ref</span>
                <span className="font-mono text-xs text-gray-500">{order.gatewayRef || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Method Used</span>
                <span>{order.paymentMethod || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Allocated Keys Panel */}
          {order.allocatedKeys && order.allocatedKeys.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-serif text-sm font-bold text-primary">Allocated Keys ({order.allocatedKeys.length})</h4>
              <div className="space-y-2.5">
                {order.allocatedKeys.map((key) => {
                  const isRevealed = !!showPins[key.serial]
                  return (
                    <div key={key.serial} className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl flex items-center justify-between text-text-primary">
                      <div>
                        <div className="text-xs text-gray-400 font-bold">SERIAL: {key.serial}</div>
                        <div className="font-mono text-sm mt-1 tracking-widest font-bold">
                          {isRevealed ? key.pin : '•••• •••• ••••'}
                        </div>
                      </div>
                      <button
                        onClick={() => togglePinReveal(key.serial)}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 transition-colors cursor-pointer"
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

          {/* SMS Dispatch Activity Logs */}
          <div className="space-y-2">
            <h4 className="font-serif text-sm font-bold text-primary">SMS Delivery Node Logs</h4>
            <div className="bg-gray-900 text-green-400 font-mono text-xs p-4 rounded-xl space-y-2 shadow-inner min-h-[90px] border border-white/5 max-h-44 overflow-y-auto">
              {smsLog.map((log, idx) => (
                <div key={idx} className="leading-relaxed">{log}</div>
              ))}
              <div>[SYSTEM] Order initialized. payment verified.</div>
              <div>[SYSTEM] SMS queued. payload: {order.quantity} PINs</div>
              {order.deliveryStatus === 'Delivered' && (
                <div className="text-emerald-300">[SUCCESS] SMS delivered to node. Handshake ok.</div>
              )}
              {order.deliveryStatus === 'Failed' && (
                <div className="text-red-400">[ERROR] Gateway node timeout (retry advised).</div>
              )}
            </div>
          </div>
        </div>

        {/* Action Panel Footer */}
        <div className="p-6 border-t border-gray-200 bg-[#FCFDFB] space-y-3">
          <div className="flex space-x-3">
            <button
              onClick={handleResendClick}
              disabled={isSendingSMS || order.paymentStatus !== 'Successful'}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-xl active:scale-[0.98] transition-all hover:bg-secondary disabled:opacity-50 disabled:scale-100 cursor-pointer flex justify-center items-center space-x-1.5"
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
              disabled={order.paymentStatus !== 'Successful'}
              className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-500 font-bold rounded-xl hover:text-text-primary hover:bg-gray-100 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Reallocate Voucher
            </button>
          </div>

          <button
            onClick={() => onMarkRefunded(order.id)}
            className="w-full py-2.5 text-center font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer block"
          >
            Mark as Refunded
          </button>
        </div>
      </div>
    </div>
  )
}
