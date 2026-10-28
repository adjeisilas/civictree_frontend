import { useState } from 'react'
import axios from 'axios'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  useAdminAffiliates, 
  useAdminWithdrawals, 
  useUpdateAdminAffiliateStatus, 
  useProcessAdminWithdrawal,
  useAdminAffiliateConfig,
  useUpdateAdminAffiliateConfig
} from '../../hooks/useAffiliates'
import { useTwoFactorStatus } from '../../hooks/useTwoFactor'
import type { Affiliate, WithdrawalRequest, StoredPaymentDetails } from '../../types/affiliate'
import AdminCreateAffiliateModal from '../../components/admin/dashboard/AdminCreateAffiliateModal'


type ActiveTab = 'All' | 'Pending' | 'Active' | 'Suspended' | 'Withdrawals' | 'Config'

const STATUS_COLORS: Record<string, string> = {
  Pending:   'bg-amber-100 text-amber-700',
  PENDING:   'bg-amber-100 text-amber-700',
  Approved:  'bg-emerald-100 text-emerald-700',
  APPROVED:  'bg-emerald-100 text-emerald-700',
  Active:    'bg-emerald-100 text-emerald-700',
  ACTIVE:    'bg-emerald-100 text-emerald-700',
  Suspended: 'bg-red-100 text-red-700',
  SUSPENDED: 'bg-red-100 text-red-700',
  Inactive:  'bg-gray-100 text-gray-500',
  INACTIVE:  'bg-gray-100 text-gray-500',
  Rejected:  'bg-red-100 text-red-700',
  REJECTED:  'bg-red-100 text-red-700',
}

const WITHDRAWAL_STATUS_COLORS: Record<string, string> = {
  Pending:  'bg-amber-100 text-amber-700',
  PENDING:  'bg-amber-100 text-amber-700',
  Approved: 'bg-teal-100 text-teal-700',
  APPROVED: 'bg-teal-100 text-teal-700',
  Rejected: 'bg-red-100 text-red-700',
  REJECTED: 'bg-red-100 text-red-700',
  Paid:     'bg-emerald-100 text-emerald-700',
  PAID:     'bg-emerald-100 text-emerald-700',
}

export default function AdminAffiliates() {
  const navigate = useNavigate()

  const { data: affiliates = [], isLoading: isLoadingAffiliates } = useAdminAffiliates()
  const { data: allWithdrawals = [], isLoading: isLoadingWithdrawals } = useAdminWithdrawals()
  const { data: systemConfig, isLoading: isLoadingConfig } = useAdminAffiliateConfig()

  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateAdminAffiliateStatus()
  const { mutate: processWithdrawal, isPending: isProcessingWithdrawal } = useProcessAdminWithdrawal()
  const { data: twoFactorStatus } = useTwoFactorStatus()
  const { mutate: updateConfig, isPending: isUpdatingConfig } = useUpdateAdminAffiliateConfig()

  const [activeTab, setActiveTab] = useState<ActiveTab>('All')
  const [search, setSearch] = useState('')
  
  // Modals
  const [approveModal, setApproveModal] = useState<Affiliate | null>(null)
  const [rejectModal, setRejectModal] = useState<Affiliate | null>(null)
  const [withdrawalModal, setWithdrawalModal] = useState<WithdrawalRequest | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  const [ussdCode, setUssdCode] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNote, setAdminNote] = useState('')
  const [withdrawalCode, setWithdrawalCode] = useState('')
  const [withdrawalError, setWithdrawalError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [unsuspendModal, setUnsuspendModal] = useState<Affiliate | null>(null)

  // What the server currently holds, with the defaults used before it answers
  const savedConfig = {
    wassceNovdecCommission: Number(systemConfig?.wassceNovdecCommission) || 2.5,
    beceCommission: Number(systemConfig?.beceCommission) || 1.75,
    minWithdrawalAmount: Number(systemConfig?.minWithdrawalAmount) || 10,
    dailyWithdrawalCap: Number(systemConfig?.dailyWithdrawalCap) || 2000,
  }

  // The form follows the server until the admin types, then keeps their edits
  const [configEdits, setConfigForm] = useState<typeof savedConfig | null>(null)
  const configForm = configEdits ?? savedConfig

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 2500)
  }

  // Helpers
  const getName = (a: Affiliate) => a.user?.fullName || a.fullName || 'Affiliate'
  const getEmail = (a: Affiliate) => a.user?.email || a.email || '—'
  const getPhone = (a: Affiliate) => a.user?.phoneNumber || a.phone || a.phoneNumber || '—'
  const getCode = (a: Affiliate) => a.affiliateCode || a.affiliateId || 'Not assigned'
  const getSales = (a: Affiliate) => Number(a.totalSalesGenerated ?? a.totalSalesAmount ?? 0)

  // Filter affiliates
  const filteredAffiliates = affiliates.filter(a => {
    const statusUpper = (a.status || '').toUpperCase()
    const matchesTab = activeTab === 'All' || statusUpper === activeTab.toUpperCase()
    
    const searchLower = search.toLowerCase()
    const name = getName(a).toLowerCase()
    const email = getEmail(a).toLowerCase()
    const phone = getPhone(a)
    const code = getCode(a).toLowerCase()

    const matchesSearch = !search ||
      name.includes(searchLower) ||
      email.includes(searchLower) ||
      phone.includes(search) ||
      code.includes(searchLower)

    return matchesTab && matchesSearch
  })

  const pendingCount = affiliates.filter(a => (a.status || '').toUpperCase() === 'PENDING').length
  const pendingWithdrawals = allWithdrawals.filter(w => (w.status || '').toUpperCase() === 'PENDING')

  const tabs: ActiveTab[] = ['All', 'Pending', 'Active', 'Suspended', 'Withdrawals', 'Config']

  const handleApprove = () => {
    if (!approveModal || !ussdCode.trim()) return
    updateStatus(
      { id: approveModal.id, status: 'APPROVED', ussdCode: ussdCode.trim() },
      {
        onSuccess: () => {
          showSuccess(`${getName(approveModal)} approved and assigned USSD ${ussdCode}`)
          setApproveModal(null)
          setUssdCode('')
        }
      }
    )
  }

  const handleReject = () => {
    if (!rejectModal || !rejectionReason.trim()) return
    updateStatus(
      { id: rejectModal.id, status: 'REJECTED', rejectionReason: rejectionReason.trim() },
      {
        onSuccess: () => {
          showSuccess(`${getName(rejectModal)}'s application has been rejected.`)
          setRejectModal(null)
          setRejectionReason('')
        }
      }
    )
  }

  const handleWithdrawalProcess = (status: 'APPROVED' | 'REJECTED') => {
    if (!withdrawalModal) return
    setWithdrawalError('')

    // Approving sends real money, so admins with two-step verification confirm with a code
    if (status === 'APPROVED' && twoFactorStatus?.enabled && withdrawalCode.trim().length < 6) {
      setWithdrawalError('Enter the code from your authenticator app to approve this payout.')
      return
    }

    processWithdrawal(
      {
        id: withdrawalModal.id,
        status,
        adminNote: adminNote.trim() || undefined,
        twoFactorCode: status === 'APPROVED' && twoFactorStatus?.enabled ? withdrawalCode.trim() : undefined
      },
      {
        onSuccess: () => {
          showSuccess(status === 'APPROVED'
            ? 'Payout sent to Hubtel. It shows as approved once Hubtel confirms the transfer.'
            : 'Withdrawal request rejected.')
          setWithdrawalModal(null)
          setAdminNote('')
          setWithdrawalCode('')
        },
        onError: (err: unknown) => {
          const serverMessage = axios.isAxiosError<{ message?: string }>(err)
            ? err.response?.data?.message
            : undefined
          setWithdrawalError(serverMessage || 'Could not process this payout request.')
        }
      }
    )
  }

  const handleUnsuspend = () => {
    if (!unsuspendModal) return
    updateStatus(
      { id: unsuspendModal.id, status: 'APPROVED' },
      {
        onSuccess: () => {
          showSuccess(`${getName(unsuspendModal)}'s account has been reactivated.`)
          setUnsuspendModal(null)
        }
      }
    )
  }

  const handleSaveConfig = () => {
    updateConfig(configForm, {
      onSuccess: () => {
        // Drop the local edits so the form tracks the saved values again
        setConfigForm(null)
        showSuccess('Affiliate system configuration updated successfully!')
      }
    })
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <Helmet><title>Affiliate Management — Admin</title></Helmet>

      {/* Success Toast */}
      <AnimatePresence>
        {successMsg && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[100] bg-emerald-600 text-white text-sm font-semibold px-5 py-3 rounded-xl shadow-lg flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            <span>{successMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#1a5c18] p-6 sm:p-8 rounded-xl text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(223,186,96,0.15),transparent_60%)]" />
        <div className="z-10">
          <h1 className="text-2xl sm:text-3xl font-heading font-bold tracking-tight">Affiliate Management</h1>
          <p className="text-white/80 text-xs sm:text-sm mt-1.5 font-sans">Review applications, assign USSD codes, manage withdrawals, and set commission rules.</p>
        </div>
        <div className="mt-4 sm:mt-0 flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            <span>Add Affiliate</span>
          </button>
          {pendingCount > 0 && (
            <div className="flex items-center space-x-2 bg-amber-500 px-4 py-2 rounded-xl text-xs font-bold">
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span>{pendingCount} Pending Application{pendingCount > 1 ? 's' : ''}</span>
            </div>
          )}
          {pendingWithdrawals.length > 0 && (
            <div className="flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-xl text-xs font-bold">
              <span>{pendingWithdrawals.length} Pending Withdrawal{pendingWithdrawals.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="flex space-x-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer relative ${
                  activeTab === tab ? 'bg-[#1a5c18] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {tab === 'Config' ? 'System config' : tab}
                {tab === 'Pending' && pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full text-xs font-bold text-white flex items-center justify-center">{pendingCount}</span>
                )}
                {tab === 'Withdrawals' && pendingWithdrawals.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs font-bold text-white flex items-center justify-center">{pendingWithdrawals.length}</span>
                )}
              </button>
            ))}
          </div>
          {activeTab !== 'Withdrawals' && activeTab !== 'Config' && (
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, email, phone, code..."
              className="w-full sm:w-72 border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#1a5c18] transition-all"
            />
          )}
        </div>
      </div>

      {/* ─── Affiliates Table ────────────────────────────────── */}
      {activeTab !== 'Withdrawals' && activeTab !== 'Config' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Affiliate', 'Contact', 'USSD Code', 'Sales Generated', 'Available Balance', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoadingAffiliates ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-[#1a5c18]">
                      <svg className="w-8 h-8 animate-spin mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </td>
                  </tr>
                ) : filteredAffiliates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                      No affiliates found.
                    </td>
                  </tr>
                ) : filteredAffiliates.map(a => {
                  const fullName = getName(a)
                  const email = getEmail(a)
                  const phone = getPhone(a)
                  const code = getCode(a)
                  const status = a.status || 'PENDING'
                  const statusUpper = status.toUpperCase()

                  return (
                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-[#1a5c18] text-white flex items-center justify-center text-xs font-bold shrink-0">
                            {fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{fullName}</p>
                            <p className="text-[11px] text-gray-400 font-mono">{code}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-700">{email}</p>
                        <p className="text-xs text-gray-400">{phone}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold text-[#1a5c18]">
                        {a.ussdCode ?? <span className="text-gray-300 font-sans font-normal">—</span>}
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-xs font-semibold text-gray-800">{a.totalVouchersSold ?? 0} vouchers</p>
                        <p className="text-[11px] text-gray-400">GHS {getSales(a).toLocaleString()}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold text-gray-900">GHS {a.availableBalance ?? 0}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_COLORS[status] || STATUS_COLORS[statusUpper] || 'bg-gray-100 text-gray-600'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => navigate(`/admin/affiliates/${a.id}`)}
                            title="View Profile"
                            className="p-2 rounded-xl text-gray-500 hover:text-[#1a5c18] hover:bg-[#1a5c18]/10 transition-colors cursor-pointer"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {statusUpper === 'PENDING' && (
                            <>
                              <button
                                onClick={() => setApproveModal(a)}
                                title="Approve Application"
                                className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setRejectModal(a)}
                                title="Reject Application"
                                className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </>
                          )}

                          {(statusUpper === 'APPROVED' || statusUpper === 'ACTIVE') && (
                            <button
                              onClick={() => navigate(`/admin/affiliates/${a.id}`)}
                              title="Suspend Account"
                              className="p-2 rounded-xl text-amber-500 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                              </svg>
                            </button>
                          )}

                          {statusUpper === 'SUSPENDED' && (
                            <button
                              onClick={() => setUnsuspendModal(a)}
                              title="Reactivate (Unsuspend) Account"
                              className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}

                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Withdrawals Table ────────────────────────────────── */}
      {activeTab === 'Withdrawals' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Affiliate', 'Amount', 'Payment Method', 'Requested', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoadingWithdrawals ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#1a5c18]">
                      <svg className="w-8 h-8 animate-spin mx-auto" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    </td>
                  </tr>
                ) : allWithdrawals.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No withdrawal requests found.</td></tr>
                ) : allWithdrawals.map(w => {
                  const payInfo = w.paymentDetails?.type === 'Mobile Money'
                    ? `${(w.paymentDetails as StoredPaymentDetails).network} · ${(w.paymentDetails as StoredPaymentDetails).phoneNumber}`
                    : `${(w.paymentDetails as StoredPaymentDetails)?.bankName || ''}`
                  return (
                    <tr key={w.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4 font-semibold text-gray-800 text-sm">{w.affiliateName || 'Affiliate'}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">GHS {w.amount.toLocaleString()}</td>
                      <td className="px-5 py-4 text-xs text-gray-600">{payInfo || '—'}</td>
                      <td className="px-5 py-4 text-xs text-gray-500">
                        {w.requestedAt ? new Date(w.requestedAt).toLocaleDateString('en-GH', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${WITHDRAWAL_STATUS_COLORS[w.status] || 'bg-gray-100 text-gray-600'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setWithdrawalModal(w)}
                          title="Process Payout Request"
                          className="p-2 rounded-xl text-[#1a5c18] hover:bg-[#1a5c18]/10 transition-colors cursor-pointer inline-flex items-center justify-center"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── System Config Tab ────────────────────────────────── */}
      {activeTab === 'Config' && (
        <div className="space-y-6">
          {/* Commission Rates Card */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-[#1a5c18]/5 to-transparent">
              <div className="w-10 h-10 rounded-lg bg-[#1a5c18]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#1a5c18]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Commission Rate Settings</h2>
                <p className="text-xs text-gray-400 mt-0.5">Set how much affiliates earn per voucher sold (in GHS).</p>
              </div>
            </div>

            {isLoadingConfig ? (
              <div className="py-16 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-8 h-8 animate-spin mb-3 text-[#1a5c18]" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                <p className="text-sm font-medium">Loading system configuration...</p>
              </div>
            ) : (
              <div className="p-6 space-y-8">

                {/* Commission Rate Preview Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-[#1a5c18] to-[#2d7a2a] p-5 text-white">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <p className="text-xs font-semibold text-white/70 mb-1">WASSCE / NOVDEC Commission</p>
                    <p className="text-3xl font-black">
                      GHS {(configForm.wassceNovdecCommission).toFixed(2)}
                    </p>
                    <p className="text-xs text-white/60 mt-1">Per voucher sold via USSD extension</p>
                  </div>
                  <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                    <p className="text-xs font-semibold text-white/70 mb-1">BECE Commission</p>
                    <p className="text-3xl font-black">
                      GHS {(configForm.beceCommission).toFixed(2)}
                    </p>
                    <p className="text-xs text-white/60 mt-1">Per voucher sold via USSD extension</p>
                  </div>
                </div>

                {/* Edit Fields */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 mb-4">Edit Commission Values</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">WASSCE / NOVDEC Commission (GHS)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">GHS</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={configForm.wassceNovdecCommission}
                          onChange={e => setConfigForm({ ...configForm, wassceNovdecCommission: parseFloat(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">Paid per WASSCE / NOVDEC voucher sold</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">BECE Commission (GHS)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">GHS</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={configForm.beceCommission}
                          onChange={e => setConfigForm({ ...configForm, beceCommission: parseFloat(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">Paid per BECE voucher sold</p>
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Withdrawal Limits */}
                <div>
                  <h3 className="text-xs font-bold text-gray-500 mb-4">Withdrawal Limits</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Minimum Withdrawal Amount (GHS)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">GHS</span>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={configForm.minWithdrawalAmount}
                          onChange={e => setConfigForm({ ...configForm, minWithdrawalAmount: parseFloat(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">Affiliates cannot withdraw below this amount</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Daily Withdrawal Cap (GHS)</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">GHS</span>
                        <input
                          type="number"
                          step="100"
                          min="0"
                          value={configForm.dailyWithdrawalCap}
                          onChange={e => setConfigForm({ ...configForm, dailyWithdrawalCap: parseFloat(e.target.value) || 0 })}
                          className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold focus:outline-none focus:border-[#1a5c18] focus:ring-2 focus:ring-[#1a5c18]/10 transition-all"
                        />
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1.5">Max total withdrawals per affiliate per day</p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <p className="text-xs text-gray-400">Changes apply immediately to all affiliate accounts.</p>
                  <button
                    onClick={handleSaveConfig}
                    disabled={isUpdatingConfig}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#1a5c18] hover:bg-[#154a14] disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    {isUpdatingConfig ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        Save Configuration
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Unsuspend Confirmation Modal ───────────────────────── */}
      {unsuspendModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 font-serif">Reactivate Account?</h3>
            <p className="text-xs text-gray-500 mb-6">
              Are you sure you want to reactivate{' '}
              <span className="font-semibold text-gray-800">{getName(unsuspendModal)}</span>'s account?
              Their USSD code and earnings will become active again.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={() => setUnsuspendModal(null)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleUnsuspend}
                disabled={isUpdatingStatus}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center gap-2"
              >
                {isUpdatingStatus ? (
                  <>
                    <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
                    Reactivating...
                  </>
                ) : 'Confirm Reactivation'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Approve Modal ─────────────────────────────────────── */}
      {approveModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-serif">Approve Application</h3>
            <p className="text-xs text-gray-500 mb-5">Approving <span className="font-semibold text-gray-700">{getName(approveModal)}</span>. Assign a USSD code below.</p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Assign USSD Code *</label>
              <input
                value={ussdCode}
                onChange={e => setUssdCode(e.target.value)}
                placeholder="e.g. *713*001#"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>

            <div className="flex space-x-3 mt-6">
              <button onClick={() => setApproveModal(null)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer">Cancel</button>
              <button onClick={handleApprove} disabled={!ussdCode.trim() || isUpdatingStatus} className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center">
                {isUpdatingStatus ? 'Approving...' : 'Approve Application'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Reject Modal ──────────────────────────────────────── */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-serif">Reject Application</h3>
            <p className="text-xs text-gray-500 mb-5">Provide a reason for rejecting <span className="font-semibold">{getName(rejectModal)}</span>'s application.</p>

            <textarea
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              rows={3}
              placeholder="e.g. Incomplete documentation provided."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/10 transition-all resize-none"
            />

            <div className="flex space-x-3 mt-5">
              <button onClick={() => { setRejectModal(null); setRejectionReason('') }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer">Cancel</button>
              <button onClick={handleReject} disabled={!rejectionReason.trim() || isUpdatingStatus} className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-40 text-white text-xs font-bold py-3 rounded-xl transition-all cursor-pointer flex justify-center items-center">
                {isUpdatingStatus ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* ─── Withdrawal Process Modal ──────────────────────────── */}
      {withdrawalModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-1 font-serif">Process Payout Request</h3>
            <p className="text-xs text-gray-500 mb-4">Payout request of <span className="font-bold text-gray-900">GHS {withdrawalModal.amount}</span></p>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Admin Note (e.g. Transaction Ref ID)</label>
              <input
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="e.g. Paid via MoMo ID 987654321"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-[#1a5c18]"
              />
            </div>

            {twoFactorStatus?.enabled && (
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Code from your authenticator app</label>
                <input
                  value={withdrawalCode}
                  onChange={e => { setWithdrawalCode(e.target.value); setWithdrawalError('') }}
                  inputMode="numeric"
                  maxLength={11}
                  autoComplete="one-time-code"
                  placeholder="123456"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono tracking-widest focus:outline-none focus:border-[#1a5c18]"
                />
                <p className="text-[11px] text-gray-500 mt-1.5">Required to approve a payout, because this sends money.</p>
              </div>
            )}

            {withdrawalError && (
              <p className="mt-3 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg p-2.5">{withdrawalError}</p>
            )}

            <div className="space-y-2 mt-4">
              <button onClick={() => handleWithdrawalProcess('APPROVED')} disabled={isProcessingWithdrawal} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-all cursor-pointer">
                {isProcessingWithdrawal ? 'Sending payout...' : 'Approve & send payout'}
              </button>
              <button onClick={() => handleWithdrawalProcess('REJECTED')} disabled={isProcessingWithdrawal} className="w-full py-3 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-bold rounded-xl transition-all cursor-pointer">
                Reject Request
              </button>
            </div>

            <button onClick={() => { setWithdrawalModal(null); setAdminNote(''); setWithdrawalCode(''); setWithdrawalError('') }} className="w-full mt-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer">
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* ─── Direct Affiliate Onboarding Modal ────────────────────── */}
      <AdminCreateAffiliateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={(name) => showSuccess(`Affiliate account for ${name} created successfully!`)}
      />
    </div>
  )
}
