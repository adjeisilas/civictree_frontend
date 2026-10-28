import { useState, useMemo } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import VoucherTypeConfigCard from '../../components/admin/vouchers/VoucherTypeConfigCard'
import VoucherKeysTable from '../../components/admin/vouchers/VoucherKeysTable'
import type { VoucherKey } from '../../components/admin/vouchers/VoucherKeysTable'
import VoucherUploadModal from '../../components/admin/vouchers/VoucherUploadModal'
import VoucherConfigSetup from '../../components/admin/vouchers/VoucherConfigSetup'
import { useVoucherKeys, useVoucherConfigs, useUploadHistory, useDeleteVoucher, useUpdateVoucherConfig, useUploadBulkVouchers, useUploadSingleVoucher, useVoucherOverview, useSoldVouchers } from '../../hooks/useVouchers'
import type { ExamType } from '../../types/admin'
import { Check, Dot, TriangleAlert, X } from 'lucide-react'
import { VOUCHER_TYPES, VOUCHER_TYPE_CODES, voucherTypeLabel } from '../../config/voucherTypes'
type TabType = 'overview' | 'upload' | 'inventory' | 'sold' | 'history' | 'alerts' | 'setup'

export default function Vouchers() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [isUploadOpen, setIsUploadOpen] = useState(false)

  const { data: configs = [], isLoading: loadingConfigs, error: errorConfigs } = useVoucherConfigs()
  const { data: voucherKeys = [], isLoading: loadingKeys, error: errorKeys } = useVoucherKeys()
  const { data: soldVouchers = [], isLoading: loadingSold, error: errorSold } = useSoldVouchers()
  const { data: uploadHistory = [], isLoading: loadingHistory, error: errorHistory } = useUploadHistory()
  const { data: overviewStats, isLoading: loadingOverview, error: errorOverview } = useVoucherOverview()

  const { mutate: deleteVoucher } = useDeleteVoucher()
  const { mutate: updateConfig } = useUpdateVoucherConfig()
  const { mutate: uploadBulkVouchers, isPending: isUploadingBulk } = useUploadBulkVouchers()
  const { mutate: uploadSingleVoucher, isPending: isUploadingSingle } = useUploadSingleVoucher()

  const loading = loadingConfigs || loadingKeys || loadingSold || loadingHistory || loadingOverview || isUploadingBulk || isUploadingSingle
  const error = errorConfigs || errorKeys || errorSold || errorHistory || errorOverview ? 'Failed to fetch voucher database.' : null

  // Fulfillment Simulator state
  const [simulationType, setSimulationType] = useState<ExamType>('WASSCE_NOVDEC')
  const [simulationAction, setSimulationAction] = useState<'Sold' | 'Delivered'>('Delivered')
  const [simLog, setSimLog] = useState<{ step: number; message: string; status: 'pending' | 'success' | 'failed' }[]>([])
  const [simRunning, setSimRunning] = useState(false)
  const [simResultKey, setSimResultKey] = useState<VoucherKey | null>(null)

  // Calculations for stats
  // One row per voucher type, zeroed until the overview arrives
  const stats = useMemo(
    () =>
      VOUCHER_TYPE_CODES.map((type) => ({
        type,
        available: overviewStats?.[type]?.available ?? 0,
        sold: overviewStats?.[type]?.sold ?? 0,
        total: overviewStats?.[type]?.total ?? 0,
      })),
    [overviewStats]
  )

  // Low stock alarms computation
  const activeAlerts = useMemo(() => {
    const alerts: { type: ExamType; remaining: number; limit: number }[] = []
    if (!overviewStats) return alerts

    configs.forEach(c => {
      const stat = overviewStats[c.type as ExamType]
      const remaining = stat ? stat.available : 0
      if (remaining <= c.minLimit) {
        alerts.push({ type: c.type as ExamType, remaining, limit: c.minLimit })
      }
    })
    return alerts
  }, [overviewStats, configs])

  // Handle uploading keys (from bulk CSV modal or manual entry)
  const handleUpload = (
    defaultType: ExamType,
    keys: Omit<VoucherKey, 'importDate'>[],
    _summary: { fileName: string; total: number; success: number; failed: number },
    file: File | null
  ) => {
    if (file) {
      // Bulk CSV upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', defaultType)
      uploadBulkVouchers(formData)
    } else if (keys.length === 1) {
      // Single manual entry
      const { examType, serial, pin } = keys[0]
      uploadSingleVoucher({ type: examType, serialNumber: serial, pin })
    }
  }

  // Handle configuration settings threshold update
  const handleUpdateConfig = (type: ExamType, price: number, minLimit: number) => {
    updateConfig({ type, price, minLimit })
  }

  // Handle key deletion
  const handleDeleteKey = (serial: string) => {
    // Ideally the API deletes by ID, using serial for this mockup if ID isn't available
    const keyToDelete = voucherKeys.find(k => k.serial === serial)
    if (keyToDelete) {
      deleteVoucher(keyToDelete.id)
    }
  }

  // Simulating Fulfillment Logic workflow
  const startSimulation = () => {
    if (simRunning) return
    setSimRunning(true)
    setSimResultKey(null)
    setSimLog([])

    const steps = [
      { step: 1, message: `Locating next available ${voucherTypeLabel(simulationType)} voucher...`, status: 'pending' as const },
      { step: 2, message: `Reserving selected voucher key...`, status: 'pending' as const },
      { step: 3, message: `Delivering serial and PIN details to customer...`, status: 'pending' as const },
      { step: 4, message: `Updating database status: Available to ${simulationAction}...`, status: 'pending' as const }
    ]

    setSimLog([steps[0]])

    // Step 1: Locate
    setTimeout(() => {
      const availableKey = voucherKeys.find(k => k.examType === simulationType && k.status === 'Available')
      
      if (!availableKey) {
        setSimLog(prev => [
          { step: 1, message: `Locating failed: No Available keys in stock for ${voucherTypeLabel(simulationType)}!`, status: 'failed' },
          ...prev.slice(1)
        ])
        setSimRunning(false)
        return
      }

      setSimLog([
        { step: 1, message: `Located key: Serial ${availableKey.serial}`, status: 'success' },
        steps[1]
      ])

      // Step 2: Reserve
      setTimeout(() => {
        // Temporarily set to Reserved
        queryClient.setQueryData<VoucherKey[]>(['voucherKeys'], (prev = []) => prev.map(k => k.serial === availableKey.serial ? { ...k, status: 'Reserved', updatedAt: new Date().toISOString() } : k))
        
        setSimLog(prev => [
          { step: 2, message: `Reserved key: Serial ${availableKey.serial}`, status: 'success' },
          ...prev.slice(0, 1),
          steps[2]
        ])

        // Step 3: Deliver details
        setTimeout(() => {
          setSimLog(prev => [
            { step: 3, message: `Delivered: PIN ${availableKey.pin.slice(0, 4)}XXXX sent successfully.`, status: 'success' },
            ...prev.slice(0, 2),
            steps[3]
          ])

          // Step 4: Finalize
          setTimeout(() => {
            queryClient.setQueryData<VoucherKey[]>(['voucherKeys'], (prev = []) => prev.map(k => k.serial === availableKey.serial ? { ...k, status: simulationAction, updatedAt: new Date().toISOString() } : k))
            
            const updatedKey = { ...availableKey, status: simulationAction }
            setSimResultKey(updatedKey)
            setSimLog(prev => [
              { step: 4, message: `Database update complete: Status is now ${simulationAction}.`, status: 'success' },
              ...prev.slice(0, 3)
            ])
            setSimRunning(false)
          }, 1000)

        }, 1000)

      }, 1000)

    }, 1000)
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-3">
        <svg className="w-10 h-10 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-bold text-gray-400 animate-pulse">Loading voucher inventory...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-lg flex items-center space-x-3">
        <TriangleAlert className="w-5 h-5 shrink-0" strokeWidth={1.75} />
        <p className="text-xs font-semibold">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Upper header action banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-1">
        <div >
          <h2 className="font-heading text-[26px] leading-tight text-text-primary">Voucher Management</h2>
          <p className="text-[13px] text-gray-600 mt-1">
            Oversee exam checker inventory, configure pricing levels, import files, and review logs.
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="mt-4 sm:mt-0 flex items-center space-x-1.5 px-4 py-2 bg-[#dfba60] hover:bg-[#dfba60] active:scale-[0.98] text-primary text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Upload Vouchers</span>
        </button>
      </div>

      {/* Sub-navigation bar tabs */}
      <div className="flex flex-wrap border-b border-gray-200 text-xs font-bold text-gray-400 select-none bg-white rounded-xl p-1 border border-gray-200 gap-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'overview' ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50 hover:text-text-primary'
          }`}
        >
          Overview & Stats
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'upload' ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50 hover:text-text-primary'
          }`}
        >
          Upload Stock
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'inventory' ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50 hover:text-text-primary'
          }`}
        >
          Inventory Registry
        </button>
        <button
          onClick={() => setActiveTab('sold')}
          className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'sold' ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50 hover:text-text-primary'
          }`}
        >
          Sold Vouchers
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'history' ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50 hover:text-text-primary'
          }`}
        >
          Upload History Log
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'alerts' ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50 hover:text-text-primary'
          }`}
        >
          Stock Alerts ({activeAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('setup')}
          className={`px-4 py-2.5 rounded-lg transition-all cursor-pointer ${
            activeTab === 'setup' ? 'bg-primary text-white shadow-sm' : 'hover:bg-gray-50 hover:text-text-primary'
          }`}
        >
          Setup Config
        </button>
      </div>

      {/* --- TAB VIEWS --- */}

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Active alarms banner list */}
          {activeAlerts.length > 0 && (
            <div className="space-y-2">
              {activeAlerts.map(alert => (
                <div 
                  key={alert.type} 
                  className="bg-red-50 border border-red-150 p-4 rounded-xl flex items-center justify-between text-red-800 text-xs font-semibold animate-pulse"
                >
                  <div className="flex items-center space-x-2.5">
                    <TriangleAlert className="w-4 h-4 shrink-0" strokeWidth={1.75} />
                    <span>
                      <strong>{alert.type} Stock Running Low:</strong> Remaining Stock is <strong>{alert.remaining}</strong> (Alarm Threshold configured: &lt; {alert.limit})
                    </span>
                  </div>
                  <button 
                    onClick={() => setActiveTab('alerts')}
                    className="underline text-red-950 font-bold hover:text-red-800 cursor-pointer"
                  >
                    Adjust Threshold
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Table (2/3 width) */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-gray-200 space-y-4">
              <div>
                <h3 className="font-serif font-bold text-primary text-lg">Inventory Statistics Summary</h3>
                <p className="text-xs text-gray-400">Total imported voucher stock counts grouped by category status</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse font-sans font-semibold">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase font-bold">
                      <th className="px-4 py-3.5">Voucher Type</th>
                      <th className="px-4 py-3.5">Available (Total Uploaded)</th>
                      <th className="px-4 py-3.5">Sold (Allocated)</th>
                      <th className="px-4 py-3.5">Remaining (Ready to Sell)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-text-primary">
                    {stats.map(row => (
                      <tr key={row.type} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3.5 font-bold font-serif text-sm text-primary">{voucherTypeLabel(row.type)}</td>
                        <td className="px-4 py-3.5 text-gray-500 font-mono text-sm">{row.total}</td>
                        <td className="px-4 py-3.5 text-gray-500 font-mono text-sm">{row.sold}</td>
                        <td className="px-4 py-3.5">
                          <span className={`font-mono text-sm px-2 py-0.5 rounded ${
                            row.available <= (configs.find(c => c.type === row.type)?.minLimit ?? -1)
                              ? 'bg-red-100 text-red-700 font-bold' 
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {row.available}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Simulated Checkout Fulfillment logic block */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-primary text-lg">Fulfillment Simulator</h3>
                <p className="text-xs text-gray-400">
                  Simulate the 4-step voucher purchase transaction workflow:
                </p>
                <div className="space-y-3 pt-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Exam Voucher Type</label>
                    <select
                      value={simulationType}
                      onChange={(e) => setSimulationType(e.target.value as typeof simulationType)}
                      disabled={simRunning}
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-text-primary bg-white focus:outline-none"
                    >
                      {VOUCHER_TYPES.map((v) => (
                        <option key={v.type} value={v.type}>{v.displayName} Checker</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase">Success Status</label>
                    <select
                      value={simulationAction}
                      onChange={(e) => setSimulationAction(e.target.value as typeof simulationAction)}
                      disabled={simRunning}
                      className="w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-text-primary bg-white focus:outline-none"
                    >
                      <option value="Delivered">Delivered Directly</option>
                      <option value="Sold">Mark Sold</option>
                    </select>
                  </div>
                  <button
                    onClick={startSimulation}
                    disabled={simRunning}
                    className="w-full py-2 bg-[#dfba60] hover:bg-[#cfa54f] text-primary text-xs font-bold rounded-xl active:scale-[0.98] transition-all cursor-pointer shadow disabled:opacity-50"
                  >
                    {simRunning ? 'Running Simulation...' : 'Simulate Purchase'}
                  </button>
                </div>
              </div>

              {/* Simulation Logging logs view */}
              <div className="mt-4 pt-3 border-t border-gray-200 flex-1 flex flex-col justify-end min-h-[140px]">
                {simLog.length > 0 ? (
                  <div className="space-y-2 text-xs font-mono leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-200 flex-1">
                    {simLog.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className={
                          log.status === 'success' ? 'text-emerald-600' :
                          log.status === 'failed' ? 'text-red-500' : 'text-amber-500 animate-pulse'
                        }>
                          {log.status === 'success' ? <Check className="w-3.5 h-3.5" strokeWidth={2.5} /> : log.status === 'failed' ? <X className="w-3.5 h-3.5" strokeWidth={2.5} /> : <Dot className="w-3.5 h-3.5" strokeWidth={2.5} />}
                        </span>
                        <span className="text-gray-600">{log.message}</span>
                      </div>
                    ))}
                    {simResultKey && (
                      <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-100 rounded text-emerald-800 text-[11px] space-y-0.5">
                        <p className="font-semibold">Delivered checker details</p>
                        <p><strong>Serial:</strong> {simResultKey.serial}</p>
                        <p><strong>PIN:</strong> {simResultKey.pin}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 text-center italic py-10 select-none">
                    Log will appear here during simulated checkout
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-6">
          <div>
            <h3 className="font-serif font-bold text-primary text-lg">Upload Stock Directory</h3>
            <p className="text-xs text-gray-400">Import CSV bulk stock or enter single keys into database inventory</p>
          </div>
          
          <div className="p-8 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-center hover:bg-gray-50/50 transition-colors">
            <svg className="w-12 h-12 text-primary/40 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V4a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            </svg>
            <p className="font-bold text-gray-700 text-sm">Ingest Bulk CSV Stock</p>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Press the import button below to select your comma-separated text file (.csv).
            </p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="mt-5 px-6 py-2.5 bg-[#dfba60] hover:bg-[#cfa54f] text-primary font-bold rounded-xl text-xs transition-all active:scale-[0.98] cursor-pointer shadow-sm"
            >
              Launch Upload Wizard
            </button>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <VoucherKeysTable keys={voucherKeys} onDeleteKey={handleDeleteKey} />
      )}

      {activeTab === 'sold' && (
        <VoucherKeysTable keys={soldVouchers} onDeleteKey={handleDeleteKey} showOnlyAllocated={true} />
      )}

      {activeTab === 'history' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-4">
          <div>
            <h3 className="font-serif font-bold text-primary text-lg">Voucher Upload Logs History</h3>
            <p className="text-xs text-gray-400">Chronological archive of all imported files and bulk entries</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse font-sans font-semibold">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-400 uppercase font-bold select-none">
                  <th className="px-4 py-3.5">File Name</th>
                  <th className="px-4 py-3.5">Voucher Type</th>
                  <th className="px-4 py-3.5">Uploaded By</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-4 py-3.5 font-mono text-right">Total rows</th>
                  <th className="px-4 py-3.5 font-mono text-right text-emerald-700">Successful</th>
                  <th className="px-4 py-3.5 font-mono text-right text-red-700">Failed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-text-primary">
                {uploadHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 uppercase">
                      No logs recorded yet
                    </td>
                  </tr>
                ) : (
                  uploadHistory.map(log => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3.5 font-bold font-mono text-primary">{log.fileName}</td>
                      <td className="px-4 py-3.5 text-gray-500">{log.voucherType}</td>
                      <td className="px-4 py-3.5 text-gray-400">
                        {typeof log.uploadedBy === 'object' && log.uploadedBy 
                          ? log.uploadedBy.fullName || log.uploadedBy.email 
                          : log.uploadedBy}
                      </td>
                      <td className="px-4 py-3.5 text-gray-400">{log.uploadDate}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-gray-600">{(log.totalRecords || 0).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-emerald-600">{(log.successfulImports || 0).toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-right font-mono text-red-500">{(log.failedImports || 0).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 space-y-2">
            <h3 className="font-serif font-bold text-primary text-lg">Configurable Alarm Thresholds</h3>
            <p className="text-xs text-gray-400">
              Configure system alerts settings. Adjust the unit prices and low stock alert thresholds for WASSCE/NOVDEC and BECE checker categories.
            </p>
          </div>
          {/* Config Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {configs.map((c) => (
              <VoucherTypeConfigCard
                key={c.type}
                type={c.type}
                price={c.price}
                minLimit={c.minLimit}
                count={overviewStats ? (overviewStats[c.type as ExamType]?.available || 0) : 0}
                onUpdateConfig={handleUpdateConfig}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'setup' && (
        <VoucherConfigSetup />
      )}

      {/* Upload Wizard Dialog Modal */}
      <VoucherUploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        existingKeys={voucherKeys}
        onUpload={handleUpload}
      />
    </div>
  )
}
