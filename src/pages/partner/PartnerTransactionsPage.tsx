import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { usePartnerTransactions, usePartnerProfile } from '../../hooks/usePartner'
import { downloadCsv, toCsv } from '../../utils/exportUtils'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PartnerTransactionsPage() {
  const { data: profile } = usePartnerProfile()
  const [search, setSearch] = useState('')
  const [voucherType, setVoucherType] = useState('ALL')
  const [settlementStatus, setSettlementStatus] = useState('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 10

  const { data, isLoading } = usePartnerTransactions({
    search,
    voucherType,
    settlementStatus,
    page,
    limit: pageSize,
  })

  const transactions = data?.transactions || []
  const sharePercentage = profile?.sharePercentage ?? 5.0

  // Export to Excel
  const handleExportExcel = () => {
    const rows = transactions.map((t) => ({
      'Order Ref': t.orderRef,
      'Checker Type': t.voucherType,
      'Quantity': t.quantity,
      'Gross Amount (GHS)': t.grossAmount,
      'Partner Share %': `${t.partnerPercentage}%`,
      'Partner Earning (GHS)': t.partnerEarning,
      'Channel': t.channel,
      'Payment Method': t.paymentMethod,
      'Settlement Status': t.settlementStatus,
      'Date': new Date(t.createdAt).toLocaleString(),
    }))

    downloadCsv(`CivicTree_Partner_Transactions_${new Date().toISOString().split('T')[0]}.csv`, toCsv(rows))
  }

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(16)
    doc.text('CivicTree — Revenue-Share Transaction Statement', 14, 20)

    doc.setFontSize(10)
    doc.text(`Partner: ${profile?.partnerName || 'Revenue Partner'} (${profile?.contractRef || 'CTR-2026'})`, 14, 28)
    doc.text(`Effective Share Cut: ${sharePercentage}% | Generated: ${new Date().toLocaleString()}`, 14, 34)

    const tableData = transactions.map((t) => [
      t.orderRef,
      t.voucherType,
      t.quantity,
      `GHS ${t.grossAmount.toFixed(2)}`,
      `${t.partnerPercentage}%`,
      `GHS ${t.partnerEarning.toFixed(2)}`,
      t.channel,
      t.settlementStatus,
      new Date(t.createdAt).toLocaleDateString(),
    ])

    autoTable(doc, {
      startY: 42,
      head: [['Ref', 'Type', 'Qty', 'Gross Total', 'Share %', 'Net Cut', 'Channel', 'Status', 'Date']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [21, 62, 20] },
      styles: { fontSize: 8 },
    })

    doc.save(`CivicTree_Partner_Statement_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <Helmet>
        <title>Transaction Ledger — Partner Portal</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Platform Transaction Ledger</h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete audit trail of all examination result checker sales generating your {sharePercentage}% contractual share.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center space-x-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Excel</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="px-4 py-2.5 bg-[#153e14] hover:bg-[#1a4f19] text-[#dfba60] text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search order ref, voucher, or payment..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-[#153e14]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Voucher Type */}
          <select
            value={voucherType}
            onChange={(e) => setVoucherType(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold focus:outline-none focus:border-[#153e14]"
          >
            <option value="ALL">All Checker Types</option>
            <option value="WASSCE">WASSCE</option>
            <option value="BECE">BECE</option>
            <option value="NOVDEC">NOVDEC</option>
          </select>

          {/* Settlement Status */}
          <select
            value={settlementStatus}
            onChange={(e) => setSettlementStatus(e.target.value)}
            className="px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-semibold focus:outline-none focus:border-[#153e14]"
          >
            <option value="ALL">All Statuses</option>
            <option value="Accrued">Accrued</option>
            <option value="Settled">Settled</option>
            <option value="Processing">Processing</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400">Loading platform transactions...</div>
        ) : transactions.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-400">No matching transactions found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-5">Order Reference</th>
                  <th className="py-3.5 px-4">Checker Type</th>
                  <th className="py-3.5 px-4">Qty</th>
                  <th className="py-3.5 px-4">Channel</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4 text-right">Gross Total</th>
                  <th className="py-3.5 px-4 text-right">Share %</th>
                  <th className="py-3.5 px-4 text-right">Your Earning</th>
                  <th className="py-3.5 px-5 text-right">Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {transactions.map((tx) => (
                  <motion.tr
                    key={tx.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/70 transition-colors"
                  >
                    <td className="py-3.5 px-5">
                      <span className="font-mono font-bold text-gray-900">{tx.orderRef}</span>
                      <span className="block text-[10px] text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString()} · {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-gray-800">{tx.voucherType}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-700">{tx.quantity}</td>
                    <td className="py-3.5 px-4 text-gray-600">{tx.channel}</td>
                    <td className="py-3.5 px-4 text-gray-600">{tx.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-gray-900">
                      GHS {(Number(tx.grossAmount) || (Number(tx.partnerEarning) ? Number(tx.partnerEarning) / ((tx.partnerPercentage || 5) / 100) : 0)).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-gray-500">
                      {tx.partnerPercentage}%
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      +GHS {(Number(tx.partnerEarning) || 0).toFixed(2)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.settlementStatus === 'Settled'
                            ? 'bg-blue-100 text-blue-800'
                            : tx.settlementStatus === 'Processing'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {tx.settlementStatus}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing page <span className="font-semibold text-gray-900">{page}</span> of <span className="font-semibold text-gray-900">{data?.totalPages || 1}</span> 
            {' '}({data?.total || 0} total records)
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              disabled={!data?.totalPages || page >= data.totalPages}
              onClick={() => setPage((p) => Math.min(data?.totalPages || 1, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-gray-200 font-semibold hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
