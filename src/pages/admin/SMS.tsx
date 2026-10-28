import React, { useState, useMemo } from 'react'
import { useSendBulkSms, useSendVoucherTypeBulkSms, useSendSingleSms, useSmsHistory, useSmsTemplates, useSmsRecipientCount } from '../../hooks/useSms'
import type { SmsResponse } from '../../hooks/useSms'
import { apiErrorMessage } from '../../utils/apiError'

import { useAuthStore } from '../../services/authStore'
import {
  MessageSquare,
  Send,
  Users,
  Filter,
  History,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Layers,
  Phone,
  FileText,
  X
} from 'lucide-react'
import { VOUCHER_TYPES, VOUCHER_TYPE_CODES } from '../../config/voucherTypes'
import ClearContactsPanel from '../../components/admin/sms/ClearContactsPanel'
import { ENDPOINTS } from '../../services/endpoints'
import type { ExamType } from '../../types/admin'

/** Shown in the campaign receipt so an admin can see which endpoint ran. */
const BULK_ENDPOINT_LABELS: Record<ExamType, string> = {
  BECE: ENDPOINTS.SMS.SEND_BULK_BECE,
  WASSCE_NOVDEC: ENDPOINTS.SMS.SEND_BULK_WASSCE,
  CTVET_NABTEX: ENDPOINTS.SMS.SEND_BULK_CTVET_NABTEX,
}

const presetTemplates = {
  Promotional: 'Discount alert! Get 10% off WASSCE & BECE checkers this weekend on CivicTree. Dial *713*5912# or visit civictree.com.',
  Announcements: 'WASSCE & BECE results are available! Use your PIN and serial number at results.waec.org.gh. Contact us: 0556069880',
  ServiceAlerts: 'Notice: Payment gateway maintenance scheduled for tonight 12AM-2AM. Web checkout may experience temporary delays.',
}

export default function SMS() {
  const { user } = useAuthStore()
  const { data: smsHistory, isLoading: isHistoryLoading, refetch: refetchHistory } = useSmsHistory()
  const { data: serverTemplates } = useSmsTemplates()

  // Dispatch mode state
  const [dispatchMode, setDispatchMode] = useState<'Bulk' | 'Single'>('Bulk')
  const [singlePhoneNumber, setSinglePhoneNumber] = useState('')
  const senderId = 'CivicTree'
  
  // Unified Bulk Audience Division state matching API specifications
  const [campaignCategory, setCampaignCategory] = useState<'GENERAL' | ExamType>('GENERAL')
  const [recipientType, setRecipientType] = useState<'ALL' | 'SUCCESSFUL' | 'FAILED_ONLY' | ExamType>('ALL')

  // Message content
  const [messageType, setMessageType] = useState<string>('Announcements')
  const [messageBody, setMessageBody] = useState(presetTemplates.Announcements)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Interactive Response Alert State
  const [campaignAlert, setCampaignAlert] = useState<{
    status: 'success' | 'error' | 'partial_success'
    mode: 'Bulk' | 'Single'
    title: string
    message: string
    time: string
    targetDescription?: string
    endpoint?: string
    stats?: {
      totalRecipients?: number
      successCount?: number
      failedCount?: number
    }
  } | null>(null)

  // History table filter state
  const [historySearch, setHistorySearch] = useState('')
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'ALL' | 'Sent' | 'Failed' | 'Processing'>('ALL')

  const { mutate: sendBulkSms, isPending: isSendingBulk } = useSendBulkSms()
  const { mutate: sendVoucherTypeSms, isPending: isSendingVoucherType } = useSendVoucherTypeBulkSms()
  const { mutate: sendSingleSms, isPending: isSendingSingle } = useSendSingleSms()
  const isSending = isSendingBulk || isSendingVoucherType || isSendingSingle

  // Character and unit calculation
  const charLimit = 160
  const characterCount = messageBody.length
  const smsUnits = Math.ceil(characterCount / charLimit) || 1

  // The legacy division options mean "everyone who touched that product"
  const countScope = useMemo<{
    segment: 'ALL' | 'SUCCESSFUL' | 'FAILED_ONLY'
    voucherType?: ExamType
  }>(() => {
    // The legacy division options name a product rather than a payment status
    const legacyProduct = VOUCHER_TYPE_CODES.find((code) => code === recipientType)
    if (legacyProduct) return { segment: 'ALL', voucherType: legacyProduct }

    return {
      segment: recipientType as 'ALL' | 'SUCCESSFUL' | 'FAILED_ONLY',
      voucherType: campaignCategory === 'GENERAL' ? undefined : campaignCategory,
    }
  }, [recipientType, campaignCategory])

  // Counted by the server with the same query the send uses, so what is shown
  // here is who will actually be messaged — and what it will actually cost
  const {
    data: recipientCount,
    isLoading: isCountLoading,
    isError: isCountError,
  } = useSmsRecipientCount(countScope.segment, countScope.voucherType, dispatchMode === 'Bulk')

  const estimatedRecipients = dispatchMode === 'Single' ? 1 : recipientCount?.totalRecipients ?? 0
  const isRecipientCountKnown = dispatchMode === 'Single' || (!isCountLoading && !isCountError)

  const estimatedTotalCredits = estimatedRecipients * smsUnits

  // Handle template selection change
  const handleMessageTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setMessageType(val)
    if (val === 'Promotional') setMessageBody(presetTemplates.Promotional)
    else if (val === 'Announcements') setMessageBody(presetTemplates.Announcements)
    else if (val === 'ServiceAlerts') setMessageBody(presetTemplates.ServiceAlerts)
    else {
      // Check server templates if matching
      const found = serverTemplates?.find(t => t.name === val || t.id === val)
      if (found) setMessageBody(found.body)
    }
  }

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type })
    setTimeout(() => setToastMessage(null), 5000)
  }

  // Handle Campaign Submit
  const handleSendCampaign = (e: React.FormEvent) => {
    e.preventDefault()
    if (!messageBody.trim()) return

    if (dispatchMode === 'Bulk') {
      const commonTitle = senderId.trim() || messageType || 'CivicTree'
      const commonSender = senderId.trim() || 'CivicTree'
      const targetEndpoint =
        campaignCategory === 'GENERAL'
          ? 'POST /api/admin/sms/bulk (General/Legacy)'
          : `POST ${BULK_ENDPOINT_LABELS[campaignCategory]}`

      const handleSuccess = (res: SmsResponse) => {
        const counts = res.data
        const isPartial = counts && counts.failedCount !== undefined ? counts.failedCount > 0 : false
        setCampaignAlert({
          status: isPartial ? 'partial_success' : 'success',
          mode: 'Bulk',
          title: res.success === false ? 'Campaign Processing Warning' : isPartial ? 'Bulk Campaign Sent with Partial Failures' : 'Bulk Campaign Processed Successfully',
          message: res.message || 'The bulk campaign dispatch request was successfully completed by the telecom gateway.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          endpoint: targetEndpoint,
          stats: counts || { totalRecipients: estimatedRecipients, successCount: estimatedRecipients, failedCount: 0 },
          targetDescription: `${campaignCategory} -> ${recipientType}`
        })
        showToast(res.message || 'Bulk SMS Campaign transmitted successfully! Check metrics above.', 'success')
        setMessageBody('')
        refetchHistory()
      }

      const handleError = (err: unknown) => {
        const serverMsg = apiErrorMessage(err, 'Failed to send bulk SMS campaign.')
        setCampaignAlert({
          status: 'error',
          mode: 'Bulk',
          title: 'Bulk Campaign Transmission Failed (Error 500/400)',
          message: serverMsg,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          endpoint: targetEndpoint,
          targetDescription: `${campaignCategory} -> ${recipientType}`
        })
        showToast(serverMsg, 'error')
      }

      if (campaignCategory === 'GENERAL') {
        sendBulkSms({ recipientType, title: commonTitle, body: messageBody, senderId: commonSender, contactsCount: estimatedRecipients }, { onSuccess: handleSuccess, onError: handleError })
      } else {
        sendVoucherTypeSms(
          {
            voucherType: campaignCategory,
            recipientType: recipientType as 'ALL' | 'SUCCESSFUL' | 'FAILED_ONLY',
            title: commonTitle,
            body: messageBody,
            senderId: commonSender,
          },
          { onSuccess: handleSuccess, onError: handleError }
        )
      }
    } else {
      if (!singlePhoneNumber.trim()) {
        showToast('Please enter a target recipient phone number.', 'error')
        return
      }
      sendSingleSms(
        {
          phoneNumber: singlePhoneNumber.trim(),
          title: senderId.trim() || messageType || 'CivicTree',
          body: messageBody,
          senderId: senderId.trim() || 'CivicTree',
        },
        {
          onSuccess: (res) => {
            setCampaignAlert({
              status: 'success',
              mode: 'Single',
              title: 'Direct Single SMS Dispatched Successfully',
              message: res.message || `Custom Direct SMS was successfully dispatched and delivered to ${singlePhoneNumber.trim()}.`,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              endpoint: 'POST /api/admin/sms/single',
              targetDescription: singlePhoneNumber.trim(),
              stats: { totalRecipients: 1, successCount: 1, failedCount: 0 }
            })
            showToast(res.message || `SMS dispatched successfully to ${singlePhoneNumber}!`, 'success')
            setMessageBody('')
            setSinglePhoneNumber('')
            refetchHistory()
          },
          onError: (err: unknown) => {
            const serverMsg = apiErrorMessage(err, 'Failed to dispatch custom direct SMS.')
            setCampaignAlert({
              status: 'error',
              mode: 'Single',
              title: 'Direct SMS Dispatch Failed (Error)',
              message: serverMsg,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              endpoint: 'POST /api/admin/sms/single',
              targetDescription: singlePhoneNumber.trim()
            })
            showToast(serverMsg, 'error')
          }
        }
      )
    }
  }

  // Filter SMS History log
  const filteredHistory = useMemo(() => {
    if (!smsHistory) return []
    return smsHistory.filter(item => {
      const matchesSearch = 
        item.message?.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.recipientsGroup?.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.type?.toLowerCase().includes(historySearch.toLowerCase()) ||
        item.senderId?.toLowerCase().includes(historySearch.toLowerCase())
      
      const matchesStatus = historyStatusFilter === 'ALL' || item.status === historyStatusFilter
      return matchesSearch && matchesStatus
    })
  }, [smsHistory, historySearch, historyStatusFilter])

  // Format dynamic display date
  const currentDateFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date())
  }, [])

  return (
    <div className="space-y-6">
      {/* Toast Notification Popup */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 text-xs font-bold transition-all border ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-900 border-emerald-500 text-white' 
            : 'bg-red-900 border-red-500 text-white'
        }`}>
          {toastMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Page Title Header Banner */}
      <div className="bg-white border border-gray-200 p-6 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-primary">Bulk SMS Module & Communications</h2>
          </div>
          <p className="text-xs text-gray-400 font-bold mt-1 font-mono">
            CivicTree Enterprise Results Checker Platform
          </p>
          <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-3xl mt-2 font-sans">
            Broadcast promotional campaigns, announcement alerts, and result release updates. Segment target audiences by transaction status and examination checker type.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0 self-stretch sm:self-auto border-t md:border-t-0 pt-3 md:pt-0 border-gray-200">
          <span className="text-xs font-semibold text-gray-500 font-mono">{currentDateFormatted}</span>
          <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
            {user?.role || 'Super Admin'}
          </span>
        </div>
      </div>

      {/* Interactive API Response Alert Report Banner */}
      {campaignAlert && (
        <div className={`p-6 rounded-lg border shadow-md transition-all ${
          campaignAlert.status === 'success'
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-900'
            : campaignAlert.status === 'partial_success'
            ? 'bg-amber-50/90 border-amber-300 text-amber-900'
            : 'bg-red-50/90 border-red-300 text-red-900'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-start space-x-3.5">
              <div className={`p-3 rounded-xl shrink-0 mt-0.5 shadow-sm ${
                campaignAlert.status === 'success'
                  ? 'bg-emerald-600 text-white'
                  : campaignAlert.status === 'partial_success'
                  ? 'bg-amber-600 text-white'
                  : 'bg-red-600 text-white'
              }`}>
                {campaignAlert.status === 'success' && <CheckCircle2 className="w-6 h-6" />}
                {campaignAlert.status === 'partial_success' && <Clock className="w-6 h-6" />}
                {campaignAlert.status === 'error' && <AlertCircle className="w-6 h-6" />}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <span className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full font-mono ${
                    campaignAlert.status === 'success'
                      ? 'bg-emerald-200/80 text-emerald-900'
                      : campaignAlert.status === 'partial_success'
                      ? 'bg-amber-200/80 text-amber-900'
                      : 'bg-red-200/80 text-red-900'
                  }`}>
                    {campaignAlert.mode} Dispatch Response &bull; {campaignAlert.status === 'error' ? 'Failed' : 'Status: 200 OK'}
                  </span>
                  <span className="text-xs text-gray-500 font-mono font-medium">{campaignAlert.time}</span>
                </div>
                <h3 className="text-base sm:text-lg font-serif font-bold tracking-tight">
                  {campaignAlert.title}
                </h3>
                <p className="text-xs font-semibold leading-relaxed max-w-2xl text-opacity-90">
                  {campaignAlert.message}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCampaignAlert(null)}
              className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-black/5 transition-colors shrink-0 self-end sm:self-auto cursor-pointer"
              title="Dismiss Alert"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Detailed Metric Cards from Response Data */}
          {campaignAlert.stats && (
            <div className="mt-5 pt-4 border-t border-black/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-xl border border-black/5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase font-mono tracking-wider">Total Recipients</p>
                  <p className="text-xl font-serif font-extrabold text-gray-800 mt-0.5">
                    {campaignAlert.stats.totalRecipients !== undefined ? campaignAlert.stats.totalRecipients.toLocaleString() : '—'}
                  </p>
                </div>
                <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-emerald-700 uppercase font-mono tracking-wider">Success Count</p>
                  <p className="text-xl font-serif font-extrabold text-emerald-700 mt-0.5">
                    {campaignAlert.stats.successCount !== undefined ? campaignAlert.stats.successCount.toLocaleString() : '—'}
                  </p>
                </div>
                <div className="p-2 bg-emerald-100/70 rounded-lg text-emerald-800">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm p-3.5 rounded-xl border border-red-500/20 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase font-mono tracking-wider">Failed / Undelivered</p>
                  <p className={`text-xl font-serif font-extrabold mt-0.5 ${
                    (campaignAlert.stats.failedCount || 0) > 0 ? 'text-red-700' : 'text-gray-600'
                  }`}>
                    {campaignAlert.stats.failedCount !== undefined ? campaignAlert.stats.failedCount.toLocaleString() : '0'}
                  </p>
                </div>
                <div className="p-2 bg-red-100/70 rounded-lg text-red-800">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
            </div>
          )}

          {campaignAlert.targetDescription && (
            <div className="mt-3.5 pt-3 border-t border-black/5 text-[11px] font-semibold text-gray-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span>Target Cohort / Recipient: <strong className="text-gray-900 font-mono bg-white/60 px-2 py-0.5 rounded">{campaignAlert.targetDescription}</strong></span>
              <span>Dispatch Mode: <strong className="text-emerald-800 font-medium bg-emerald-100 px-2 py-0.5 rounded">{campaignAlert.mode === 'Bulk' ? 'Bulk Broadcast' : 'Direct SMS'}</strong></span>
            </div>
          )}
        </div>
      )}

      {/* Main Section Grid: Composer & Live Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 span): SMS Compose & Filtering Interface */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-5">
              <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
                <Send className="w-3.5 h-3.5 text-emerald-700" />
                <span>SMS Campaign Composer</span>
              </h3>
              <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                GSM 160 Char Standard
              </span>
            </div>
            
            <form onSubmit={handleSendCampaign} className="space-y-5 text-xs font-semibold text-gray-700">
              
              {/* Dispatch Mode Toggle */}
              <div>
                <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">
                  Select Dispatch Mode
                </label>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setDispatchMode('Bulk')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      dispatchMode === 'Bulk'
                        ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Bulk Audience Broadcast</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDispatchMode('Single')}
                    className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      dispatchMode === 'Single'
                        ? 'bg-emerald-800 text-white shadow-md ring-2 ring-emerald-600/30'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <Phone className="w-4 h-4" />
                    <span>Direct Single SMS</span>
                  </button>
                </div>
              </div>

              {/* Segmentation Filters (Only available in Bulk mode) */}
              {dispatchMode === 'Bulk' ? (
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
                  <div className="flex items-center space-x-2 text-emerald-800 font-bold border-b border-gray-200 pb-2">
                    <Filter className="w-4 h-4" />
                    <span className="uppercase text-[11px] tracking-wide">Target Audience Segmentation (2-Tier Cohort Selection)</span>
                  </div>
                  
                  {/* Tier 1: Campaign Category */}
                  <div className="space-y-1.5">
                    <label className="text-gray-600 text-xs font-bold block">
                      Step 1: Select Target Exam Cohort
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setCampaignCategory('GENERAL')
                          setRecipientType('ALL')
                        }}
                        className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                          campaignCategory === 'GENERAL'
                            ? 'bg-emerald-100/80 border-emerald-700 text-emerald-950 shadow-sm font-extrabold ring-1 ring-emerald-600'
                            : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 font-bold'
                        }`}
                      >
                        <span className="text-[11px] flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0"></span>
                          <span>General / Global</span>
                        </span>
                        <span className="text-xs text-gray-500 mt-1 font-medium">All platform transactions</span>
                      </button>

                      {VOUCHER_TYPES.map((voucher) => {
                        const isActive = campaignCategory === voucher.type
                        return (
                          <button
                            key={voucher.type}
                            type="button"
                            onClick={() => {
                              setCampaignCategory(voucher.type)
                              setRecipientType('ALL')
                            }}
                            className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                              isActive
                                ? 'bg-gray-50 border-gray-700 text-gray-950 shadow-sm font-extrabold ring-1 ring-gray-500'
                                : 'bg-white border-gray-200 hover:border-gray-300 text-gray-700 font-bold'
                            }`}
                          >
                            <span className="text-[11px] flex items-center gap-1.5">
                              <span
                                className="w-2 h-2 rounded-full shrink-0"
                                style={{ backgroundColor: voucher.accent.chartColor }}
                              />
                              <span>{voucher.displayName}</span>
                            </span>
                            <span className="text-xs text-gray-500 mt-1 font-medium">
                              {voucher.shortName} orders &amp; dialers
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tier 2: Division Option */}
                  <div className="space-y-1.5 pt-2 border-t border-gray-200">
                    <label className="text-gray-600 text-xs font-bold block">
                      Step 2: Select Division / Transaction Status Option
                    </label>
                    <select
                      value={recipientType}
                      onChange={(e) => setRecipientType(e.target.value as typeof recipientType)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/20 text-gray-800 font-bold cursor-pointer text-xs"
                    >
                      <option value="ALL">
                        {campaignCategory === 'BECE'
                          ? 'ALL — All (customers who used tried using option number 1 ( buy BECE checker) and BECE results release date)'
                          : campaignCategory === 'WASSCE_NOVDEC'
                          ? 'ALL — All (customers who used tried using option number 2( buy wassce checker) and Wassce results release date)'
                          : 'ALL — All Unique Order & USSD Dialer Phone Numbers'}
                      </option>
                      <option value="SUCCESSFUL">
                        {campaignCategory === 'GENERAL' ? 'SUCCESSFUL — Customers with Successful Paid Orders Only' : 'SUCCESSFUL — Successful'}
                      </option>
                      <option value="FAILED_ONLY">
                        {campaignCategory === 'GENERAL' ? 'FAILED_ONLY — Customers with Failed or Pending Transactions (Retargeting)' : 'FAILED_ONLY — Failed'}
                      </option>
                      {campaignCategory === 'GENERAL' && (
                        <>
                          {VOUCHER_TYPES.map((v) => (
                            <option key={v.type} value={v.type}>
                              {v.displayName} — Customers who bought {v.displayName} vouchers (Legacy Filter)
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <p className="text-xs text-gray-500 font-medium leading-relaxed pt-1">
                      {campaignCategory === 'GENERAL' && recipientType === 'ALL' && 'Dispatches to all unique platform order and USSD dialer numbers.'}
                      {campaignCategory === 'GENERAL' && recipientType === 'SUCCESSFUL' && 'Dispatches exclusively to confirmed paying customers.'}
                      {campaignCategory === 'GENERAL' && recipientType === 'FAILED_ONLY' && 'Dispatches to customers with failed/incomplete purchase attempts (ideal for transaction recovery).'}
                      {recipientType === 'BECE' && 'Dispatches campaign specifically to customers who purchased BECE checkers.'}
                      {recipientType === 'WASSCE_NOVDEC' && 'Dispatches campaign specifically to customers who purchased WASSCE or NOVDEC checkers.'}
                    </p>
                  </div>
                </div>
              ) : (
                /* Single Recipient Phone Input */
                <div className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="text-gray-500 text-xs font-bold">
                      Recipient Phone Number
                    </label>
                    <input
                      type="tel"
                      value={singlePhoneNumber}
                      onChange={(e) => setSinglePhoneNumber(e.target.value)}
                      placeholder="e.g. 0556069880 or any custom phone number"
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 font-bold text-gray-800 font-mono"
                    />
                  </div>
                  <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-normal flex items-start gap-2 font-medium shadow-2xs">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">Custom Recipient Supported:</strong> The recipient phone number can be any valid telephone number and does <span className="underline decoration-blue-500 font-bold">not</span> need to previously exist in the platform customer database.
                    </div>
                  </div>
                </div>
              )}

              {/* Message Type / Template Selector */}
              <div className="space-y-1.5">
                <label className="text-gray-500 text-xs font-bold">
                  Campaign Category / Preset Template
                </label>
                <select
                  value={messageType}
                  onChange={handleMessageTypeChange}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 text-gray-800 cursor-pointer font-bold"
                >
                  <option value="Announcements">Preset: Result Release Announcement</option>
                  <option value="Promotional">Preset: Weekend Discount Promotional</option>
                  <option value="ServiceAlerts">Preset: Gateway Maintenance Alert</option>
                  {serverTemplates?.map((t) => (
                    <option key={t.id} value={t.name}>
                      Custom: {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message Body Textarea */}
              <div className="space-y-1.5">
                <label className="text-gray-500 text-xs font-bold">
                  Message Copy & Content
                </label>
                <textarea
                  rows={4}
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  placeholder="Type your campaign broadcast message here..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 placeholder-gray-400 resize-none font-medium text-gray-800 leading-relaxed text-xs"
                />
                
                {/* Character Counter & Billing Status */}
                <div className="flex justify-between items-center pt-1 text-[11px]">
                  <span className="text-gray-400 font-medium">
                    Standard basic alphabet (160 characters per SMS credit unit).
                  </span>
                  <span className={`font-bold px-2 py-0.5 rounded-full ${
                    smsUnits > 1 ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {characterCount} / 160 chars &bull; {smsUnits} {smsUnits === 1 ? 'Unit' : 'Units'}
                  </span>
                </div>
              </div>

              {/* Submit Dispatch Button */}
              <div className="pt-3 border-t border-gray-200 flex justify-end">
                <button
                  type="submit"
                  disabled={isSending || !messageBody.trim()}
                  className="flex items-center space-x-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Transmitting via Gateway...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {dispatchMode !== 'Bulk'
                          ? 'Dispatch Direct SMS'
                          : isRecipientCountKnown
                          ? `Broadcast Campaign to ${estimatedRecipients.toLocaleString()} Contacts`
                          : 'Broadcast Campaign'}
                      </span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>

        {/* Right Column (1 span): Live Targeting & Billing Analytics Widget */}
        <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Campaign Analytics</span>
              </h3>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
                Live Preview
              </span>
            </div>

            {/* Targeted Segment Breakdown Box */}
            <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 text-white p-5 rounded-lg shadow-md space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-emerald-300 font-mono">
                    {dispatchMode === 'Bulk' ? 'Target Audience Reach' : 'Single Dispatch Mode'}
                  </p>
                  <h4 className="text-3xl font-serif font-extrabold tracking-tight mt-1">
                    {!isRecipientCountKnown ? (isCountError ? '—' : '...') : estimatedRecipients.toLocaleString()}
                  </h4>
                  <p className="text-xs text-emerald-200 mt-0.5 font-medium">
                    {dispatchMode !== 'Bulk'
                      ? 'Single targeted customer'
                      : isCountError
                      ? 'Could not count recipients'
                      : isCountLoading
                      ? 'Counting recipients...'
                      : 'Recipients, counted from the database'}
                  </p>
                  {dispatchMode === 'Bulk' && recipientCount && recipientCount.duplicatesMerged > 0 && (
                    <p className="text-xs text-emerald-300/90 mt-1 font-medium">
                      {recipientCount.sourceRows.toLocaleString()} records,{' '}
                      {recipientCount.duplicatesMerged.toLocaleString()} merged as the same person
                      {recipientCount.unusable > 0 && `, ${recipientCount.unusable.toLocaleString()} unusable`}
                    </p>
                  )}
                </div>
                <div className="p-2.5 bg-white/10 backdrop-blur-md rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Applied Filter Tags */}
              {dispatchMode === 'Bulk' && (
                <div className="pt-3 border-t border-emerald-700/50 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-200 font-medium">Cohort Category:</span>
                    <span className="font-bold text-white bg-emerald-700/90 px-2.5 py-0.5 rounded text-xs uppercase font-mono shadow-inner">
                      {campaignCategory}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-200 font-medium">Target Division:</span>
                    <span className="font-bold text-white bg-emerald-700/90 px-2.5 py-0.5 rounded text-xs uppercase font-mono shadow-inner">
                      {recipientType}
                    </span>
                  </div>
                  <div className="text-[11px] text-emerald-100/90 font-normal pt-0.5">
                    {campaignCategory !== 'GENERAL' 
                      ? `Broadcasting dedicated ${campaignCategory} campaign targeting ${recipientType.toLowerCase()} records.`
                      : `Broadcasting general platform campaign targeting ${recipientType.toLowerCase()} records.`}
                  </div>
                </div>
              )}
            </div>

            {/* Gateway & Billing Consumption Summary */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-700 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-gray-500" />
                <span>Gateway Billing Calculation</span>
              </h4>
              
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-2.5 text-xs font-medium text-gray-600">
                <div className="flex justify-between">
                  <span>SMS Units per Recipient:</span>
                  <span className="font-bold text-gray-800">{smsUnits} {smsUnits === 1 ? 'Unit' : 'Units'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Contact Audience:</span>
                  <span className="font-bold text-gray-800">
                    {isRecipientCountKnown ? estimatedRecipients.toLocaleString() : '—'}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between items-center font-bold text-gray-900">
                  <span>Total Credits:</span>
                  <span className="text-sm text-emerald-800 font-mono bg-emerald-100 px-2 py-0.5 rounded">
                    {isRecipientCountKnown ? `${estimatedTotalCredits.toLocaleString()} Units` : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Compliance Guidelines */}
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200/60 text-amber-900 space-y-1.5">
              <p className="text-[11px] font-bold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>NCA & Telecom Guidelines</span>
              </p>
              <p className="text-xs leading-relaxed text-amber-800">
                Ensure promotional campaigns clearly indicate an opt-out mechanism (e.g. STOP to 5912). Do not broadcast marketing messages after 8:00 PM GMT.
              </p>
            </div>
          </div>

          {/* Quick Stats Support Text */}
          <div className="text-center pt-2">
            <p className="text-xs text-gray-400 font-mono">
              Powered by CivicTree Omnichannel SMS Gateway
            </p>
          </div>
          </div>

          <ClearContactsPanel />
        </div>

      </div>

      {/* Campaign Transmission History Section */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-gray-800">SMS Transmission & Blast History</h3>
              <p className="text-xs text-gray-400">Complete record of all broadcasted bulk campaigns and direct client notifications.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search history messages..."
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={historyStatusFilter}
              onChange={(e) => setHistoryStatusFilter(e.target.value as typeof historyStatusFilter)}
              className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 cursor-pointer focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="Sent">Sent Successful</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        {isHistoryLoading ? (
          <div className="py-16 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-bold text-gray-500">Loading SMS transmission archives...</p>
          </div>
        ) : filteredHistory && filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-[11px] font-bold text-gray-400 font-mono">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Sender ID</th>
                  <th className="py-3 px-4">Target Segment / Category</th>
                  <th className="py-3 px-4 text-center">Contacts</th>
                  <th className="py-3 px-4 min-w-[280px]">Message Content Preview</th>
                  <th className="py-3 px-4 text-right">Delivery Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                {filteredHistory.map((item) => {
                  const dateObj = item.date ? new Date(item.date) : null
                  const formattedDate = dateObj ? dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
                  const formattedTime = dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''

                  return (
                    <tr key={item.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-bold text-gray-800 font-mono">{formattedDate}</div>
                        <div className="text-xs text-gray-400 font-mono">{formattedTime}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-800 whitespace-nowrap">
                        {item.senderId || 'CivicTree'}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.recipientsGroup || item.type || 'Broadcast'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold font-mono text-gray-900">
                        {item.contactsCount?.toLocaleString() || '1'}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 max-w-md">
                        <p className="line-clamp-2 leading-relaxed" title={item.message}>
                          {item.message || '—'}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          item.status === 'Sent' 
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' 
                            : item.status === 'Processing'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200 animate-pulse'
                            : 'bg-red-100 text-red-800 border border-red-200'
                        }`}>
                          {item.status === 'Sent' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                          {item.status === 'Processing' && <Clock className="w-3 h-3 text-amber-600" />}
                          {item.status === 'Failed' && <AlertCircle className="w-3 h-3 text-red-700" />}
                          <span>{item.status || 'Sent'}</span>
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="py-14 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50 space-y-3">
            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-700">No SMS transmissions found</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                {historySearch || historyStatusFilter !== 'ALL'
                  ? 'No broadcast records match your current filter criteria. Try clearing search filters.'
                  : 'You have not dispatched any bulk SMS campaigns or direct customer notifications yet.'}
              </p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}

