import { useState } from 'react'
import { Globe, AlertTriangle } from 'lucide-react'
import { useCustomerByPhone } from '../../../hooks/useCustomers'
import { exportCustomerHistoryToPDF } from '../../../utils/exportUtils'


interface CustomerDetailsPageProps {
  phoneNumber: string
  onBack: () => void
  onSendSMS: (smsText: string) => void
}

export default function CustomerDetailsPage({ phoneNumber, onBack, onSendSMS }: CustomerDetailsPageProps) {
  const [smsText, setSmsText] = useState('')
  const { data: customer, isLoading, error } = useCustomerByPhone(phoneNumber)

  const handleSend = () => {
    if (!smsText.trim()) return
    onSendSMS(smsText)
    setSmsText('')
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-3">
        <svg className="w-10 h-10 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest animate-pulse">Loading profile data...</span>
      </div>
    )
  }

  if (error || !customer) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl flex items-center space-x-3 shadow-sm">
        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
        <p className="text-xs font-semibold">{error?.message || 'Customer profile not found.'}</p>
        <button onClick={onBack} className="ml-auto underline font-bold">Go Back</button>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer select-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Customers Directory</span>
        </button>

        <span className="text-xs font-medium text-gray-400 font-mono">Profile ID: {customer.id}</span>
      </div>

      {/* Main Profile Info Banner Header */}
      <div className="bg-primary p-6 sm:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,197,107,0.15),transparent_60%)]" />
        <div className="z-10 flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4 w-full">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 min-w-[64px] min-h-[64px] aspect-square rounded-full bg-white text-primary flex items-center justify-center font-bold text-xl shadow-md border-2 border-accent shrink-0 select-none">
              {(customer.name || '?').split(' ').map(n => n[0]).join('').substring(0, 2)}
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-serif font-bold">{customer.name || 'Unknown Customer'}</h3>
              <p className="text-white/85 text-xs sm:text-sm font-mono mt-1">
                {customer.phone} &bull; <span className="font-sans uppercase font-bold text-[10px] text-accent tracking-wide">{customer.channel} Profile</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              customer.status === 'Active' ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' : 'bg-red-500/20 text-red-100 border border-red-500/30'
            }`}>
              {customer.status}
            </span>
          </div>
        </div>
      </div>

      {/* Data Summary Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Core Fields */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">Core Profile Fields</h4>
          <div className="space-y-4 text-xs font-sans">
            <div>
              <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Full Customer Name</span>
              <p className="font-bold text-primary mt-0.5">{customer.name}</p>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Primary Phone Number</span>
              <p className="font-mono font-bold text-gray-600 mt-0.5">{customer.phone}</p>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">First Acquisition Route</span>
              <p className="font-bold mt-0.5 text-gray-700">{customer.channel} Checkout</p>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Account Status</span>
              <p className="font-bold text-emerald-600 mt-0.5">{customer.status}</p>
            </div>
          </div>
        </div>

        {/* Card 2: Purchase Summary */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">Purchase Summary</h4>
          <div className="space-y-4 text-xs font-sans">
            <div>
              <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Total Placed Orders</span>
              <p className="font-bold text-primary mt-0.5">{customer.totalOrders} Completed Orders</p>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Lifetime Gross Spend</span>
              <p className="font-bold text-emerald-600 mt-0.5">GH₵ {(customer.lifetimeSpend || 0).toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Average Transaction Value</span>
              <p className="font-bold text-gray-600 mt-0.5">GH₵ {((customer.lifetimeSpend || 0) / (customer.totalOrders || 1)).toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Active Voucher Subscriptions</span>
              <p className="font-bold text-primary mt-0.5">{(customer.voucherTypes || []).join(', ')}</p>
            </div>
          </div>
        </div>

        {/* Card 3: USSD Data */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
          <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">USSD-Specific Attributes</h4>
          {customer.ussdNetwork ? (
            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">USSD Mobile Network</span>
                <p className="font-bold text-orange-600 mt-0.5">{customer.ussdNetwork}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">USSD Mobile Wallet</span>
                <p className="font-mono font-bold text-gray-600 mt-0.5">{customer.linkedWallet}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Total Interactive Sessions</span>
                <p className="font-bold text-gray-600 mt-0.5">{customer.ussdSessionsCount} sessions</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Session Identifier</span>
                <p className="font-mono text-gray-400 mt-0.5">REF-USSD-{customer.phone.replace(/\s/g, '').slice(-4)}-92A</p>
              </div>
            </div>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-center text-gray-400">
              <Globe className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-wider mt-2">No USSD Session Data</p>
              <p className="text-[10px] text-gray-400 max-w-[180px] mx-auto mt-1 leading-relaxed">This customer has placed orders exclusively via Web channel.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chronological Purchase History Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 bg-[#FCFDFB] border-b border-gray-50 flex justify-between items-center">
          <h4 className="font-serif font-bold text-primary text-base">Chronological Purchase History</h4>
          <button
            onClick={() => customer && exportCustomerHistoryToPDF(customer)}
            className="flex items-center space-x-1.5 text-xs font-bold text-secondary bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer select-none"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download PDF History</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-text-primary font-sans">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[10px] font-bold uppercase border-b border-gray-100">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Voucher Type</th>
                <th className="px-6 py-4 text-center">Qty</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Payment Status</th>
                <th className="px-6 py-4">Delivery Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {(customer.purchaseHistory || []).map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/20 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary font-mono text-xs">{item.id}</td>
                  <td className="px-6 py-4 text-gray-500 font-semibold">{item.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-600">{item.voucherType}</td>
                  <td className="px-6 py-4 text-center text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 font-bold">GH₵ {(Number(item.amount) || 0).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      item.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {item.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      item.deliveryStatus === 'Sent' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : item.deliveryStatus === 'Pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                      {item.deliveryStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Outbound SMS logs and Compose Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Outbound SMS History log */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[250px]">
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">Outbound SMS History</h4>
            <div className="space-y-4 max-h-[190px] overflow-y-auto pr-1 font-sans">
              {(customer.smsHistory || []).length === 0 ? (
                <p className="text-xs text-gray-400 italic">No SMS logs found for this customer.</p>
              ) : (
                (customer.smsHistory || []).map((sms) => (
                  <div key={sms.id} className="border-l-2 border-gray-100 pl-4 space-y-1 relative">
                    {/* Status dot indicator */}
                    <div className={`absolute left-[-6px] top-1.5 w-2.5 h-2.5 rounded-full border border-white ${
                      sms.status === 'Delivered' ? 'bg-emerald-500' : sms.status === 'Sending' ? 'bg-amber-400' : 'bg-red-500'
                    }`} />
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-bold">
                      <span>{sms.timestamp}</span>
                      <span className={`uppercase font-bold ${
                        sms.status === 'Delivered' ? 'text-emerald-600' : sms.status === 'Sending' ? 'text-amber-500' : 'text-red-500'
                      }`}>{sms.status}</span>
                    </div>
                    <p className="text-xs font-semibold text-gray-600 leading-relaxed">{sms.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dispatch Direct SMS Panel */}
        <div className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between min-h-[250px]">
          <div>
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-50 pb-2">Dispatch Direct SMS Notification</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed mb-4 font-sans">
              Draft and dispatch customized text notifications directly to the customer's mobile device via CivicTree's integrated bulk SMS nodes.
            </p>
            <textarea
              rows={3}
              placeholder="Enter message text to transmit..."
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              className="w-full text-xs p-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400 resize-none font-semibold text-gray-700"
            />
          </div>
          <div className="pt-3 flex justify-end border-t border-gray-50 mt-2">
            <button
              onClick={handleSend}
              disabled={!smsText.trim()}
              className="flex items-center space-x-2 bg-primary hover:bg-secondary disabled:bg-gray-100 disabled:text-gray-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed select-none active:scale-98"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
