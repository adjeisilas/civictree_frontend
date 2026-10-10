import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import type { StoredPaymentDetails } from '../../types/affiliate'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  useAdminAffiliateDetails, 
  useUpdateAdminAffiliateStatus, 
  useUpdateAdminAffiliateUSSD, 
  useDeleteAdminAffiliate 
} from '../../hooks/useAffiliates'


const STATUS_COLORS: Record<string, string> = {
  Pending:   'bg-amber-100 text-amber-700 border-amber-200',
  PENDING:   'bg-amber-100 text-amber-700 border-amber-200',
  Approved:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  APPROVED:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  Active:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  ACTIVE:    'bg-emerald-100 text-emerald-700 border-emerald-200',
  Suspended: 'bg-red-100 text-red-700 border-red-200',
  SUSPENDED: 'bg-red-100 text-red-700 border-red-200',
  Deactivated: 'bg-gray-100 text-gray-600 border-gray-200',
  DEACTIVATED: 'bg-gray-100 text-gray-600 border-gray-200',
  Rejected:  'bg-red-100 text-red-700 border-red-200',
  REJECTED:  'bg-red-100 text-red-700 border-red-200',
}

export default function AffiliateDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { data: affiliate, isLoading, isError } = useAdminAffiliateDetails(id)

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateAdminAffiliateStatus()
  const { mutate: updateUssd, isPending: isUpdatingUssd } = useUpdateAdminAffiliateUSSD()
  const { mutate: deleteAffiliate, isPending: isDeleting } = useDeleteAdminAffiliate()

  // Modal states
  const [approveModalOpen, setApproveModalOpen] = useState(false)
  const [rejectModalOpen, setRejectModalOpen] = useState(false)
  const [suspendModalOpen, setSuspendModalOpen] = useState(false)
  const [ussdModalOpen, setUssdModalOpen] = useState(false)
  const [confirmModal, setConfirmModal] = useState<{ status: string; label: string } | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)

  const [ussdCode, setUssdCode] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [suspensionReason, setSuspensionReason] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 2500)
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <svg className="w-10 h-10 animate-spin text-[#1a5c18]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">Loading affiliate details...</p>
      </div>
    )
  }

  if (isError || !affiliate) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4 bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-2xl font-bold">!</div>
        <h2 className="text-xl font-bold text-gray-900">Affiliate Profile Not Found</h2>
        <p className="text-gray-500 text-sm max-w-sm">The affiliate profile you are trying to view does not exist or has been removed.</p>
        <Link to="/admin/affiliates" className="px-5 py-2.5 bg-[#1a5c18] text-white text-sm font-semibold rounded-xl hover:bg-[#154a14] transition-all">
          ← Return to Affiliates
        </Link>
      </div>
    )
  }

  // Derived properties
  const fullName = affiliate.user?.fullName || affiliate.fullName || 'Affiliate'
  const email = affiliate.user?.email || affiliate.email || '—'
  const phone = affiliate.user?.phoneNumber || affiliate.phone || affiliate.phoneNumber || '—'
  const code = affiliate.affiliateCode || affiliate.affiliateId || 'Not assigned'
  const status = affiliate.status || 'PENDING'
  const statusUpper = status.toUpperCase()
  const salesGenerated = Number(affiliate.totalSalesGenerated ?? affiliate.totalSalesAmount ?? 0)

  // Actions
  const handleApprove = () => {
    if (!ussdCode.trim() || !id) return
    updateStatus(
      { id, status: 'APPROVED', ussdCode: ussdCode.trim() },
      {
        onSuccess: () => {
          showToast(`Affiliate approved successfully with USSD ${ussdCode}`)
          setApproveModalOpen(false)
          setUssdCode('')
        },
      }
    )
  }

  const handleReject = () => {
    if (!rejectionReason.trim() || !id) return
    updateStatus(
      { id, status: 'REJECTED', rejectionReason: rejectionReason.trim() },
      {
        onSuccess: () => {
          showToast(`Application rejected.`)
          setRejectModalOpen(false)
          setRejectionReason('')
        },
      }
    )
  }

  const handleUpdateUssd = () => {
    if (!ussdCode.trim() || !id) return
    updateUssd(
      { id, ussdCode: ussdCode.trim() },
      {
        onSuccess: () => {
          showToast(`USSD extension code updated to ${ussdCode}`)
          setUssdModalOpen(false)
          setUssdCode('')
        },
      }
    )
  }

  const handleStatusChange = (newStatus: string) => {
    if (!id) return
    updateStatus(
      { id, status: newStatus },
      {
        onSuccess: () => {
          showToast(`Status updated to ${newStatus}`)
          setConfirmModal(null)
        },
      }
    )
  }

  const handleSuspend = () => {
    if (!suspensionReason.trim() || !id) return
    updateStatus(
      { id, status: 'SUSPENDED', suspensionReason: suspensionReason.trim() },
      {
        onSuccess: () => {
          showToast('Affiliate account has been suspended.')
          setSuspendModalOpen(false)
          setSuspensionReason('')
        },
      }
    )
  }

  const handleDelete = () => {
    if (!id) return
    deleteAffiliate(id, {
      onSuccess: () => {
        navigate('/admin/affiliates')
      },
    })
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <Helmet><title>{fullName} — Affiliate Profile | Admin</title></Helmet>

      {/* Success Toast */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/affiliates')}
          className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-[#1a5c18] transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
          <span>Back to Affiliates Management</span>
        </button>

        <div className="flex items-center space-x-2">
          {statusUpper === 'PENDING' && (
            <>
              <button
                onClick={() => setApproveModalOpen(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Approve Application
              </button>
              <button
                onClick={() => setRejectModalOpen(true)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Reject Application
              </button>
            </>
          )}

          {(statusUpper === 'APPROVED' || statusUpper === 'ACTIVE') && (
            <>
              <button
                onClick={() => setSuspendModalOpen(true)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Suspend Account
              </button>
              <button
                onClick={() => setConfirmModal({ status: 'DEACTIVATED', label: 'Deactivate' })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Deactivate Account
              </button>
            </>
          )}

          {statusUpper === 'SUSPENDED' && (
            <>
              <button
                onClick={() => setConfirmModal({ status: 'APPROVED', label: 'Reactivate' })}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Reactivate Account
              </button>
              <button
                onClick={() => setConfirmModal({ status: 'DEACTIVATED', label: 'Deactivate' })}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Deactivate Account
              </button>
            </>
          )}

          {statusUpper === 'REJECTED' && (
            <button
              onClick={() => setApproveModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
            >
              Re-Approve Application
            </button>
          )}

          {statusUpper === 'DEACTIVATED' && (
            <span className="px-4 py-2 bg-gray-100 text-gray-400 text-xs font-bold rounded-xl border border-gray-200 cursor-not-allowed">
              Account Deactivated — No Actions Available
            </span>
          )}

          <button
            onClick={() => setDeleteModalOpen(true)}
            className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Delete Profile
          </button>
        </div>
      </div>

      {/* Header Profile Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="flex items-center space-x-5 z-10">
          <div className="w-20 h-20 rounded-2xl bg-[#1a5c18] text-white text-2xl font-bold flex items-center justify-center shadow-lg shadow-[#1a5c18]/20 shrink-0">
            {fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div>
            <div className="flex items-center space-x-3 flex-wrap gap-y-1">
              <h1 className="text-2xl font-bold text-gray-900 font-serif">{fullName}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${STATUS_COLORS[status] || STATUS_COLORS[statusUpper] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                {status}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1 font-mono">{code}</p>
            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-3 flex-wrap gap-y-2">
              <span className="flex items-center space-x-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span>{email}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                <span>{phone}</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>
                <span>{affiliate.location || '—'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* USSD Extension Code Banner */}
        <div className="bg-[#f0faf0] border border-[#1a5c18]/20 rounded-2xl p-4 min-w-[200px] text-center shrink-0 w-full md:w-auto">
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#1a5c18] mb-1">Assigned USSD Code</p>
          <p className="text-xl font-mono font-bold text-gray-900">{affiliate.ussdCode || 'Not Assigned'}</p>
          <button
            onClick={() => setUssdModalOpen(true)}
            className="text-xs font-semibold text-[#1a5c18] hover:underline mt-2 inline-block cursor-pointer"
          >
            Edit USSD Code →
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Vouchers Sold</p>
          <p className="text-3xl font-bold text-gray-900 mt-2 font-heading">{(affiliate.totalVouchersSold ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Total vouchers completed</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Sales Generated</p>
          <p className="text-3xl font-bold text-[#1a5c18] mt-2 font-heading">GHS {salesGenerated.toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Revenue via USSD channel</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Available Balance</p>
          <p className="text-3xl font-bold text-amber-600 mt-2 font-heading">GHS {(affiliate.availableBalance ?? 0).toLocaleString()}</p>
          <p className="text-xs text-gray-400 mt-1">Commission available for payout</p>
        </div>
      </div>

      {/* Detailed Info Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Business & Profile Details */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-6">
          <h2 className="text-lg font-bold text-gray-900 font-serif border-b border-gray-100 pb-4">Personal & Business Details</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Full Name</p>
              <p className="font-semibold text-gray-800 mt-1">{fullName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Business Name</p>
              <p className="font-semibold text-gray-800 mt-1">{affiliate.businessName || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Email Address</p>
              <p className="font-semibold text-gray-800 mt-1">{email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Phone Number</p>
              <p className="font-semibold text-gray-800 mt-1">{phone}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Location / Region</p>
              <p className="font-semibold text-gray-800 mt-1">{affiliate.location || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase">Account Created</p>
              <p className="font-semibold text-gray-800 mt-1">
                {affiliate.createdAt ? new Date(affiliate.createdAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          {affiliate.rejectionReason && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-xs text-red-700">
              <p className="font-bold mb-1">Rejection Reason</p>
              <p>{affiliate.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Payout Account Box — shows both MoMo and Bank */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 space-y-5">
          <h2 className="text-lg font-bold text-gray-900 font-serif border-b border-gray-100 pb-4">Payout Accounts</h2>

          {/* Mobile Money */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">📱 Mobile Money</span>
            </div>
            {affiliate.momoNumber || (affiliate.paymentDetails as StoredPaymentDetails)?.phoneNumber ? (
              <div className="space-y-2.5 bg-gray-50 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-gray-400 block">Network</span>
                  <span className="font-bold text-gray-800 text-sm">{affiliate.momoNetwork || (affiliate.paymentDetails as StoredPaymentDetails)?.network || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Phone Number</span>
                  <span className="font-bold text-gray-800 text-sm font-mono">{affiliate.momoNumber || (affiliate.paymentDetails as StoredPaymentDetails)?.phoneNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Account Name</span>
                  <span className="font-bold text-gray-800 text-sm">{affiliate.momoAccountName || (affiliate.paymentDetails as StoredPaymentDetails)?.accountName || '—'}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-400 italic">No Mobile Money account saved.</div>
            )}
          </div>

          {/* Bank Account */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">🏦 Bank Account</span>
            </div>
            {affiliate.bankAccountNumber || (affiliate.paymentDetails as StoredPaymentDetails)?.accountNumber ? (
              <div className="space-y-2.5 bg-gray-50 rounded-2xl p-4 text-xs">
                <div>
                  <span className="text-gray-400 block">Bank Name</span>
                  <span className="font-bold text-gray-800 text-sm">{affiliate.bankName || (affiliate.paymentDetails as StoredPaymentDetails)?.bankName || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Account Number</span>
                  <span className="font-bold text-gray-800 text-sm font-mono">{affiliate.bankAccountNumber || (affiliate.paymentDetails as StoredPaymentDetails)?.accountNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400 block">Account Name</span>
                  <span className="font-bold text-gray-800 text-sm">{affiliate.bankAccountName || (affiliate.paymentDetails as StoredPaymentDetails)?.accountName || '—'}</span>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-2xl p-4 text-xs text-gray-400 italic">No Bank Account saved.</div>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800">
            Payout details are used automatically when processing commission withdrawal requests.
          </div>
        </div>
      </div>

      {/* ─── Approve Modal ─────────────────────────────────────── */}
      {approveModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-serif">Approve Application</h3>
            <p className="text-xs text-gray-500 mb-5">Assign a USSD extension code to activate <span className="font-semibold text-gray-800">{fullName}</span>.</p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">USSD Extension Code *</label>
              <input
                value={ussdCode}
                onChange={e => setUssdCode(e.target.value)}
                placeholder="e.g. *713*001#"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setApproveModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer">Cancel</button>
              <button onClick={handleApprove} disabled={!ussdCode.trim() || isUpdatingStatus} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center">
                {isUpdatingStatus ? 'Approving...' : 'Approve Account'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Reject Modal ──────────────────────────────────────── */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-serif">Reject Application</h3>
            <p className="text-xs text-gray-500 mb-5">Provide a reason for rejecting <span className="font-semibold">{fullName}</span>'s application.</p>

            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Incomplete documentation provided."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all resize-none"
            />

            <div className="flex space-x-3 mt-5">
              <button onClick={() => setRejectModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer">Cancel</button>
              <button onClick={handleReject} disabled={!rejectionReason.trim() || isUpdatingStatus} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center">
                {isUpdatingStatus ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Edit USSD Modal ────────────────────────────────────── */}
      {ussdModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-serif">Edit USSD Code</h3>
            <p className="text-xs text-gray-500 mb-5">Update the USSD extension code assigned to <span className="font-semibold">{fullName}</span>.</p>

            <input
              value={ussdCode}
              onChange={e => setUssdCode(e.target.value)}
              placeholder="e.g. *713*002#"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#1a5c18] transition-all"
            />

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setUssdModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer">Cancel</button>
              <button onClick={handleUpdateUssd} disabled={!ussdCode.trim() || isUpdatingUssd} className="flex-1 bg-[#1a5c18] hover:bg-[#154a14] disabled:opacity-40 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center">
                {isUpdatingUssd ? 'Saving...' : 'Save USSD Code'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Suspend Modal ─────────────────────────────────────── */}
      {suspendModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-serif">Suspend Account</h3>
            <p className="text-xs text-gray-500 mb-4">Provide a reason for suspending <span className="font-semibold">{fullName}</span>'s account.</p>

            {/* Notification Banner */}
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-xl px-4 py-3 text-xs mb-4 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>The affiliate will be automatically notified via <strong>SMS and email</strong> with the reason provided.</span>
            </div>

            <textarea
              value={suspensionReason}
              onChange={e => setSuspensionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Violation of affiliate terms — suspicious activity detected."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-400/10 transition-all resize-none"
            />
            {suspensionReason.trim().length > 0 && suspensionReason.trim().length < 10 && (
              <p className="text-xs text-red-500 mt-1">Reason must be at least 10 characters.</p>
            )}

            <div className="flex space-x-3 mt-5">
              <button onClick={() => { setSuspendModalOpen(false); setSuspensionReason('') }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer">Cancel</button>
              <button
                onClick={handleSuspend}
                disabled={suspensionReason.trim().length < 10 || isUpdatingStatus}
                className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center"
              >
                {isUpdatingStatus ? 'Suspending...' : 'Confirm Suspension'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Confirmation Modal ─────────────────────────────────── */}
      {confirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl ${
              confirmModal.status === 'DEACTIVATED' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
            }`}>
              {confirmModal.status === 'DEACTIVATED' ? '!' : '✓'}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">{confirmModal.label} Account?</h3>
            <p className="text-xs text-gray-500 mb-2">
              Are you sure you want to set <span className="font-semibold text-gray-800">{fullName}</span>'s status to{' '}
              <span className="font-bold">{confirmModal.status}</span>?
            </p>
            {confirmModal.status === 'DEACTIVATED' && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 mb-4">
                ⚠️ Deactivation is a strong action. The affiliate will lose all access and be notified.
              </p>
            )}

            <div className="flex space-x-3 mt-4">
              <button onClick={() => setConfirmModal(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer">Cancel</button>
              <button
                onClick={() => handleStatusChange(confirmModal.status)}
                disabled={isUpdatingStatus}
                className={`flex-1 disabled:opacity-40 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center ${
                  confirmModal.status === 'DEACTIVATED' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isUpdatingStatus ? 'Updating...' : `Confirm ${confirmModal.label}`}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Delete Modal ───────────────────────────────────────── */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 font-bold text-xl">!</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">Delete Affiliate Profile</h3>
            <p className="text-xs text-gray-500 mb-6">Are you sure you want to delete <span className="font-semibold text-gray-800">{fullName}</span>? This action is permanent and cannot be undone.</p>

            <div className="flex space-x-3">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer">Cancel</button>
              <button onClick={handleDelete} disabled={isDeleting} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center">
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
