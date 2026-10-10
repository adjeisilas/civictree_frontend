import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { usePartnerReports, usePartnerProfile } from '../../hooks/usePartner'
import type { PeriodType } from '../../types/partner'
import { downloadCsv, toCsv } from '../../utils/exportUtils'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function PartnerReportsPage() {
  const [period, setPeriod] = useState<PeriodType>('monthly')
  const { data: profile } = usePartnerProfile()
  const { data: report, isLoading } = usePartnerReports(period)

  const shareRate = profile?.sharePercentage ?? 5.0
  const calcGross = (earnings: number) => earnings / (shareRate / 100 || 1)
  const maxGross = Math.max(...(report?.chartData.map((d) => d.grossVolume ?? calcGross(d.partnerEarnings || 0)) || [1000]))

  // Export Financial Statement PDF
  const handleExportStatement = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text('CivicTree Enterprise Platform', 14, 20)

    doc.setFontSize(13)
    doc.text('Official Partner Revenue-Share Statement', 14, 28)

    doc.setFontSize(9)
    doc.text(`Partner Entity: ${profile?.legalEntityName || profile?.partnerName || 'Apex Capital'}`, 14, 36)
    doc.text(`Contract ID: ${profile?.contractRef || 'CTR-REV-2026-04'} | Agreement: ${shareRate}% Gross Cut`, 14, 42)
    doc.text(`Reporting Interval: ${period.toUpperCase()} | Generated: ${new Date().toLocaleString()}`, 14, 48)

    const tableData = (report?.chartData || []).map((d) => {
      const safeGross = d.grossVolume ?? calcGross(d.partnerEarnings || 0)
      return [
        d.label,
        `${d.vouchersCount}`,
        `GHS ${safeGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
        `${shareRate}%`,
        `GHS ${d.partnerEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      ]
    })

    autoTable(doc, {
      startY: 55,
      head: [['Period / Date', 'Vouchers Sold', 'Gross Sales Volume', 'Share Cut %', 'Net Partner Share']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [21, 62, 20] },
      styles: { fontSize: 9 },
    })

    // Add category breakdown table below
    const finalY = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY || 120
    doc.setFontSize(11)
    doc.text('Breakdown by Examination Category', 14, finalY + 12)

    const catData = (report?.categoryBreakdown || []).map((c) => [
      c.category,
      `${c.vouchersSold}`,
      `GHS ${c.grossVolume.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `GHS ${c.partnerShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `${c.percentageOfTotal}%`,
    ])

    autoTable(doc, {
      startY: finalY + 16,
      head: [['Voucher Category', 'Units Sold', 'Gross Volume', 'Partner Share', 'Volume %']],
      body: catData,
      theme: 'grid',
      headStyles: { fillColor: [81, 118, 67] },
      styles: { fontSize: 9 },
    })

    doc.save(`CivicTree_Partner_Revenue_Statement_${period}_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Export Excel
  const handleExportExcel = () => {
    const rows = (report?.chartData || []).map((d) => ({
      'Period': d.label,
      'Vouchers Sold': d.vouchersCount,
      'Gross Sales (GHS)': d.grossVolume,
      'Partner Cut Rate': `${shareRate}%`,
      'Partner Share (GHS)': d.partnerEarnings,
    }))

    downloadCsv(`CivicTree_Partner_Report_${period}_${new Date().toISOString().split('T')[0]}.csv`, toCsv(rows))
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <Helmet>
        <title>Financial Reports & Analytics — Partner Portal</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Financial Reports & Analytics</h1>
          <p className="text-xs text-gray-500 mt-1">
            Analyze gross platform sales and contractual {shareRate}% revenue splits across custom time horizons.
          </p>
        </div>

        {/* Action Controls */}
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
            onClick={handleExportStatement}
            className="px-4 py-2.5 bg-[#153e14] hover:bg-[#1a4f19] text-[#dfba60] text-xs font-bold rounded-xl transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Download Statement (PDF)</span>
          </button>
        </div>
      </div>

      {/* Interval Selector Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-2xs flex items-center justify-between sm:justify-start gap-1 overflow-x-auto">
        {(['hourly', 'daily', 'monthly', 'yearly'] as PeriodType[]).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition-all capitalize cursor-pointer ${
              period === p
                ? 'bg-[#153e14] text-[#dfba60] shadow-sm'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {p === 'hourly'
              ? 'Today (Hourly)'
              : p === 'daily'
              ? 'This Week (Daily)'
              : p === 'monthly'
              ? 'This Year (Monthly)'
              : 'Multi-Year Historical'}
          </button>
        ))}
      </div>

      {/* KPI Cards in Period */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-emerald-100 bg-emerald-50/30 shadow-2xs">
          <p className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Your {shareRate}% Share</p>
          <p className="text-2xl font-bold text-emerald-950 mt-1">
            GHS {Number(report?.totalPartnerEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Vouchers Sold in Interval</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Number(report?.totalVouchersSold || 0).toLocaleString()} Units
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Average Order Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            GHS {Number(report?.avgOrderValue ?? ((report?.totalGrossVolume ?? calcGross(report?.totalPartnerEarnings || 0)) / (report?.totalVouchersSold || 1))).toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Detailed Comparative Visualization */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">Gross Sales vs. Your Contractual Share</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Comparative visualization for {period} intervals
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-gray-200" />
              <span className="text-gray-500 font-medium">Gross Platform Volume</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-3 h-3 rounded-md bg-[#153e14]" />
              <span className="text-[#153e14] font-bold">Your Share Cut ({shareRate}%)</span>
            </div>
          </div>
        </div>

        {/* Dual Bar Graphic */}
        {isLoading ? (
          <div className="py-24 text-center text-xs text-gray-400">Rendering comparative analytics...</div>
        ) : (
          <div className="h-64 flex items-end justify-between gap-3 pt-8 px-2">
            {report?.chartData.map((d, idx) => {
              const safeGross = d.grossVolume ?? calcGross(d.partnerEarnings || 0)
              const grossHeightPct = Math.max(15, Math.round((safeGross / (maxGross || 1)) * 100))
              const shareHeightPct = Math.max(10, Math.round(grossHeightPct * (shareRate / 100)))

              return (
                <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 pointer-events-none absolute -top-14 bg-gray-900 text-white text-[10px] px-3 py-1.5 rounded-lg shadow-xl transition-opacity whitespace-nowrap z-20">
                    <p className="text-emerald-300 font-bold">Your Share: GHS {d.partnerEarnings.toFixed(2)}</p>
                    <p className="text-gray-300">Gross: GHS {safeGross.toLocaleString()}</p>
                    <p className="text-gray-400">{d.vouchersCount} vouchers</p>
                  </div>

                  {/* Dual Bar Container */}
                  <div className="w-full flex items-end justify-center gap-1 h-full">
                    {/* Gross Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${grossHeightPct}%` }}
                      transition={{ duration: 0.4, delay: idx * 0.03 }}
                      className="w-full max-w-[24px] bg-gray-200 rounded-t-md group-hover:bg-gray-300 transition-colors"
                    />

                    {/* Partner Share Bar */}
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${shareHeightPct}%` }}
                      transition={{ duration: 0.4, delay: idx * 0.03 + 0.05 }}
                      className="w-full max-w-[24px] bg-[#153e14] rounded-t-md group-hover:bg-[#1f5c1e] transition-colors"
                    />
                  </div>

                  <span className="text-[11px] text-gray-500 font-semibold mt-2 truncate w-full text-center">
                    {d.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs">
        <h2 className="text-base font-bold text-gray-900 mb-4">Voucher Category Breakdown</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-[10px] font-bold">
                <th className="py-3.5 px-5">Exam Checker Category</th>
                <th className="py-3.5 px-4 text-center">Units Sold</th>
                <th className="py-3.5 px-4 text-right">Gross Sales Volume</th>
                <th className="py-3.5 px-4 text-right">Share Cut ({shareRate}%)</th>
                <th className="py-3.5 px-5 text-right">Volume Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {report?.categoryBreakdown.map((cat, idx) => {
                const safeCatGross = cat.grossVolume ?? calcGross(cat.partnerShare || 0)
                return (
                  <tr key={idx} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-gray-800">{cat.category}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-gray-700">
                      {cat.vouchersSold.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-gray-900">
                      GHS {safeCatGross.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-emerald-700">
                      +GHS {cat.partnerShare.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold text-gray-600">
                      {cat.percentageOfTotal}%
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
