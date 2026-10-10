import React, { useState, useRef } from 'react'
import { readSpreadsheetRows } from '../../../utils/spreadsheet'
import type { VoucherKey } from './VoucherKeysTable'
import { useCheckBulkDuplicates } from '../../../hooks/useVouchers'
import type { CheckBulkDuplicatesResponse } from '../../../hooks/useVouchers'
import type { ExamType } from '../../../types/admin'

interface VoucherUploadModalProps {
  isOpen: boolean
  onClose: () => void
  existingKeys: VoucherKey[]
  onUpload: (
    defaultType: ExamType,
    keys: Omit<VoucherKey, 'importDate'>[],
    summary: { fileName: string; total: number; success: number; failed: number },
    file: File | null
  ) => void
}

/** What the optional third column may say, and the category each spelling means. */
const CSV_TYPE_ALIASES: Record<string, ExamType> = {
  WASSCE: 'WASSCE_NOVDEC',
  NOVDEC: 'WASSCE_NOVDEC',
  WASSCE_NOVDEC: 'WASSCE_NOVDEC',
  BECE: 'BECE',
}

interface ValidationError {
  line: number
  rawContent: string
  reason: string
}

export default function VoucherUploadModal({ isOpen, onClose, existingKeys, onUpload }: VoucherUploadModalProps) {
  const [activeTab, setActiveTab] = useState<'csv' | 'manual'>('csv')
  const [voucherType, setVoucherType] = useState<ExamType>('WASSCE_NOVDEC')
  
  const { mutateAsync: checkDuplicates, isPending: isChecking } = useCheckBulkDuplicates()

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Manual entry state
  const [manualSerial, setManualSerial] = useState('')
  const [manualPin, setManualPin] = useState('')

  // Parsing result state
  const [uniqueKeyCount, setUniqueKeyCount] = useState(0)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [totalRowsChecked, setTotalRowsChecked] = useState(0)
  const [showResultsSummary, setShowResultsSummary] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  if (!isOpen) return null

  // Helper: Reset all states
  const handleReset = () => {
    setSelectedFile(null)
    setUniqueKeyCount(0)
    setValidationErrors([])
    setTotalRowsChecked(0)
    setShowResultsSummary(false)
    setFileError(null)
    setManualSerial('')
    setManualPin('')
  }

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true)
    } else if (e.type === 'dragleave') {
      setIsDragActive(false)
    }
  }

  // Handle Drop Event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)
    setFileError(null)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0])
    }
  }

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0])
    }
  }

  // Verify and read file
  const processSelectedFile = async (file: File) => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    
    // Explicit block for unsupported formats
    if (fileExtension === 'pdf' || fileExtension === 'doc' || fileExtension === 'docx') {
      setFileError('PDF and Word documents are not supported due to inconsistent formatting. Please upload a CSV or Excel file.')
      return
    }
    
    if (fileExtension !== 'csv' && fileExtension !== 'xlsx') {
      setFileError('Invalid file format. Only .csv and .xlsx files are supported. Save older .xls files as .xlsx first.')
      return
    }

    setSelectedFile(file)
    await parseAndCheckFile(file)
  }

  // File Parsing & Validation logic
  const parseAndCheckFile = async (file: File) => {
    // 1. Call API to get database duplicates
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', voucherType)

    let duplicateData: CheckBulkDuplicatesResponse
    try {
      const res = await checkDuplicates(formData)
      duplicateData = res.data
    } catch {
      setFileError('Failed to verify duplicates with the server. Please try again.')
      return
    }

    {
      try {
        const rows = await readSpreadsheetRows(file)

        if (rows.length === 0) {
          setFileError('The uploaded file is empty.')
          return
        }

        const validImportedKeys: Omit<VoucherKey, 'importDate'>[] = []
        const errors: ValidationError[] = []
        
        let rowsProcessed = 0
        const seenSerialsInBatch = new Set<string>()
        const seenPinsInBatch = new Set<string>()

        // Create sets for fast lookup from API response
        const dbDuplicateSerials = new Set(duplicateData.duplicates?.database?.map((d) => d.serialNumber.toLowerCase()) || [])
        const dbDuplicatePins = new Set(duplicateData.duplicates?.database?.map((d) => d.pin.toLowerCase()) || [])

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i]
          
          // Skip completely empty rows
          if (!row || row.every((cell) => cell === '')) continue

          rowsProcessed++

          // Extract columns as strings
          const cols = row.map((cell) => String(cell).trim())

          // Skip header row if it contains names of the fields
          const isHeader = cols.some((c: string) => {
            const lower = c.toLowerCase()
            return lower === 'serial' || lower === 'serial_number' || lower === 'pin' || lower === 'pin_code' || lower === 'checker_type'
          })
          
          if (isHeader && i === 0) {
            // It's the first line and looks like a header, skip it
            rowsProcessed-- // Don't count header in final rows check
            continue
          }

          const serial = cols[0] || ''
          const pin = cols[1] || ''
          
          // Determine type: use 3rd column if available, else fallback to modal select type
          let rowType = voucherType
          if (cols[2]) {
            const alias = CSV_TYPE_ALIASES[cols[2].toUpperCase().trim()]
            if (alias) rowType = alias
          }

          const rawLine = cols.join(',')

          // --- VALIDATION RULES ---
          
          // 1. Check for empty values
          if (!serial) {
            errors.push({
              line: i + 1,
              rawContent: rawLine,
              reason: 'Empty Serial Number'
            })
            continue
          }

          if (!pin) {
            errors.push({
              line: i + 1,
              rawContent: rawLine,
              reason: 'Empty PIN Code'
            })
            continue
          }

          // 2. Check for malformed rows (needs at least 2 columns)
          if (cols.length < 2) {
            errors.push({
              line: i + 1,
              rawContent: rawLine,
              reason: 'Malformed row (missing delimiter or PIN)'
            })
            continue
          }

          const serialLower = serial.toLowerCase()
          const pinLower = pin.toLowerCase()

          // 3. Batch duplicate checks (checking within the uploaded file itself)
          if (seenSerialsInBatch.has(serialLower)) {
            errors.push({
              line: i + 1,
              rawContent: rawLine,
              reason: `Duplicate Serial Number in this upload file`
            })
            continue
          }

          if (seenPinsInBatch.has(pinLower)) {
            errors.push({
              line: i + 1,
              rawContent: rawLine,
              reason: `Duplicate PIN Code in this upload file`
            })
            continue
          }

          // 4. Database duplicate checks (checking against API server response)
          const serialExistsDb = dbDuplicateSerials.has(serialLower)
          const pinExistsDb = dbDuplicatePins.has(pinLower)

          if (serialExistsDb) {
            errors.push({
              line: i + 1,
              rawContent: rawLine,
              reason: `Serial Number already exists in database inventory`
            })
            continue
          }

          if (pinExistsDb) {
            errors.push({
              line: i + 1,
              rawContent: rawLine,
              reason: `PIN Code already exists in database inventory`
            })
            continue
          }

          // Passed validation
          seenSerialsInBatch.add(serialLower)
          seenPinsInBatch.add(pinLower)

          validImportedKeys.push({
            id: Math.random().toString(36).substring(2, 9).toUpperCase(),
            serial,
            pin,
            examType: rowType,
            status: 'Available'
          })
        }

        // Combine local errors with backend duplicate errors
        const allErrors = [...errors]
        
        if (duplicateData?.duplicates?.database) {
          duplicateData.duplicates.database.forEach((d) => {
            allErrors.push({
              line: -1, // Unknown line from backend
              rawContent: `Serial: ${d.serialNumber} | PIN: ${d.pin}`,
              reason: 'Already exists in database'
            })
          })
        }
        if (duplicateData?.duplicates?.local) {
          duplicateData.duplicates.local.forEach((d) => {
            allErrors.push({
              line: -1,
              rawContent: `Serial: ${d.serialNumber} | PIN: ${d.pin}`,
              reason: 'Duplicate within this file'
            })
          })
        }

        // Use backend numbers if available, otherwise fallback to local parsing stats
        const finalTotalParsed = duplicateData?.totalParsed ?? rowsProcessed;
        const finalTotalUnique = duplicateData?.totalUnique ?? validImportedKeys.length;

        // Store the final counts in state for the UI
        setTotalRowsChecked(finalTotalParsed)
        setUniqueKeyCount(finalTotalUnique)
        setValidationErrors(allErrors)
        setShowResultsSummary(true)
      } catch (err) {
        setFileError(err instanceof Error && err.message ? err.message : 'Failed to read the file. Please ensure it is a valid .csv or .xlsx file.')
      }
    }
  }

  // Handle Manual Form Submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFileError(null)

    const serial = manualSerial.trim()
    const pin = manualPin.trim()

    if (!serial || !pin) {
      setFileError('Please fill out both Serial Number and PIN Code.')
      return
    }

    const serialLower = serial.toLowerCase()
    const pinLower = pin.toLowerCase()

    // Duplicates check
    if (existingKeys.some(k => k.serial.toLowerCase() === serialLower)) {
      setFileError('Serial Number already exists in database inventory.')
      return
    }

    if (existingKeys.some(k => k.pin.toLowerCase() === pinLower)) {
      setFileError('PIN Code already exists in database inventory.')
      return
    }

    const singleKey: Omit<VoucherKey, 'importDate'> = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      serial,
      pin,
      examType: voucherType,
      status: 'Available'
    }

    onUpload(
      voucherType, 
      [singleKey], 
      {
        fileName: 'Manual Entry',
        total: 1,
        success: 1,
        failed: 0
      },
      null
    )
    handleReset()
    onClose()
  }

  // Commit Parsed Keys from CSV to Inventory
  const handleCommitCSVImport = () => {
    if (uniqueKeyCount === 0) return

    // The keys list stays empty here: the server re-parses the file it is handed
    onUpload(
      voucherType,
      [],
      {
        fileName: selectedFile?.name || 'Uploaded Stock',
        total: totalRowsChecked,
        success: uniqueKeyCount,
        failed: validationErrors.length
      },
      selectedFile
    )
    handleReset()
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 px-4">
      {/* Backdrop */}
      <div 
        onClick={() => { handleReset(); onClose(); }}
        className="absolute inset-0 bg-[#0c180b]/50 backdrop-blur-sm transition-opacity" 
      />

      {/* Modal Container */}
      <div className="bg-white rounded-xl border border-gray-150 shadow-xl max-w-lg w-full z-10 overflow-hidden transform transition-all flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-6 bg-primary text-white flex justify-between items-center shrink-0">
          <div>
            <h3 className="font-serif font-bold text-lg text-white">Import Checker Keys</h3>
            <p className="text-xs text-white/80">Ingest bulk stock or enter single keys into database</p>
          </div>
          <button 
            onClick={() => { handleReset(); onClose(); }}
            className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Selection */}
        {!showResultsSummary && (
          <div className="flex border-b border-gray-100 text-sm font-semibold text-gray-500 bg-gray-50/50 shrink-0">
            <button
              onClick={() => { setActiveTab('csv'); setFileError(null); }}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
                activeTab === 'csv' 
                  ? 'border-primary text-primary bg-white' 
                  : 'border-transparent hover:text-text-primary'
              }`}
            >
              File Upload
            </button>
            <button
              onClick={() => { setActiveTab('manual'); setFileError(null); }}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer border-b-2 ${
                activeTab === 'manual' 
                  ? 'border-primary text-primary bg-white' 
                  : 'border-transparent hover:text-text-primary'
              }`}
            >
              Single Key Entry
            </button>
          </div>
        )}

        {/* Form / Content area */}
        <div className="p-6 overflow-y-auto flex-1 text-sm space-y-4">
          {fileError && (
            <div className="p-3.5 bg-red-50 border border-red-150 rounded-xl text-red-800 text-xs flex items-start space-x-2 font-semibold">
              <svg className="w-4 h-4 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{fileError}</span>
            </div>
          )}

          {showResultsSummary ? (
            /* Verification Results Summary View */
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-3">
                <h4 className="font-serif font-bold text-primary text-sm">Upload Status Audit</h4>
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono font-bold">
                  <div className="bg-white p-2 rounded border border-gray-150">
                    <p className="text-gray-400 uppercase text-[9px]">Total Parsed</p>
                    <p className="text-base text-text-primary mt-0.5">{totalRowsChecked}</p>
                  </div>
                  <div className="bg-emerald-50/50 p-2 rounded border border-emerald-100 text-emerald-800">
                    <p className="text-emerald-600/80 uppercase text-[9px]">Total Unique</p>
                    <p className="text-base mt-0.5">{uniqueKeyCount}</p>
                  </div>
                  <div className="bg-red-50/50 p-2 rounded border border-red-100 text-red-800">
                    <p className="text-red-600/80 uppercase text-[9px]">Duplicates</p>
                    <p className="text-base mt-0.5">{validationErrors.length}</p>
                  </div>
                </div>
              </div>

              {validationErrors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-400">
                    <span>REJECTION LOG ({validationErrors.length})</span>
                    <span>Malformed or duplicate entries</span>
                  </div>
                  <div className="max-h-40 overflow-y-auto border border-red-150 rounded-xl divide-y divide-red-100/50 text-[11px] font-medium bg-red-50/10">
                    {validationErrors.map((err, idx) => (
                      <div key={idx} className="p-2.5 flex items-start gap-3">
                        <span className="bg-red-100 text-red-800 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0">
                          {err.line === -1 ? 'API' : `Line ${err.line}`}
                        </span>
                        <div className="space-y-0.5 overflow-hidden">
                          <p className="text-red-700 font-bold">{err.reason}</p>
                          <p className="text-gray-400 font-mono truncate">{err.rawContent}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uniqueKeyCount > 0 ? (
                <p className="text-xs text-gray-500 font-medium leading-normal">
                  Vouchers marked as <strong className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.5 rounded">Available</strong> will be saved to inventory when you click confirm. Rejections will be ignored.
                </p>
              ) : (
                <p className="text-xs text-red-700 font-semibold bg-red-50 p-3 rounded-xl">
                  No valid keys can be imported from this file. Please fix the validation issues in your file and try uploading again.
                </p>
              )}

              {/* Action Buttons for Summary */}
              <div className="flex space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 py-2.5 text-center font-semibold text-gray-500 bg-gray-50 border border-gray-250 rounded-xl hover:text-text-primary hover:bg-gray-100 transition-all cursor-pointer"
                >
                  Upload New File
                </button>
                <button
                  type="button"
                  onClick={handleCommitCSVImport}
                  disabled={uniqueKeyCount === 0}
                  className="flex-1 py-2.5 text-center font-semibold text-white bg-primary hover:bg-secondary rounded-xl active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all shadow-md cursor-pointer"
                >
                  Commit Import ({uniqueKeyCount})
                </button>
              </div>
            </div>
          ) : (
            /* Ingestion Setup View */
            <div className="space-y-4">
              {/* Common Category Selector */}
              <div className="space-y-1.5">
                <label className="font-bold text-gray-700">Fallback Exam Category</label>
                <p className="text-[10px] text-gray-400 font-medium">Default category if not defined row-by-row in the CSV</p>
                <select
                  value={voucherType}
                  onChange={(e) => setVoucherType(e.target.value as ExamType)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white font-semibold text-text-primary"
                >
                  <option value="WASSCE_NOVDEC">WASSCE / NOVDEC Checker Key</option>
                  <option value="BECE">BECE Checker Key</option>
                </select>
              </div>

              {activeTab === 'csv' ? (
                /* CSV/Excel Drag & Drop Upload Zone */
                <div className="space-y-4">
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={isChecking ? undefined : handleDrop}
                    onClick={() => isChecking ? undefined : fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                      isDragActive 
                        ? 'border-[#dfba60] bg-[#dfba60]/5 scale-102' 
                        : isChecking ? 'border-primary/50 bg-gray-50 opacity-70 cursor-not-allowed' : 'border-gray-200 hover:border-primary hover:bg-gray-50/50'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv, .xlsx, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={isChecking}
                    />
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-3">
                      {isChecking ? (
                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      )}
                    </div>
                    <p className="font-bold text-gray-700 text-xs">{isChecking ? 'Checking for duplicates on server...' : 'Drag & drop your file here'}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{isChecking ? 'Please wait' : 'Or click to browse from system explorer'}</p>
                    <span className="inline-block mt-4 px-2 py-0.5 bg-gray-100 text-gray-500 font-mono text-[9px] rounded font-bold uppercase tracking-wider">
                      Required: .CSV, .XLSX, .XLS format
                    </span>
                  </div>

                  {/* Format Specifications info alert */}
                  <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl space-y-1.5 text-xs text-gray-500 font-medium font-sans">
                    <p className="font-bold text-text-primary font-serif">Supported Configurations:</p>
                    <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
                      <li>
                        <strong>Option A:</strong> <code>serial_number,pin_code</code> (Default category applies)
                      </li>
                      <li>
                        <strong>Option B:</strong> <code>serial_number,pin_code,checker_type</code> (Auto-detects WASSCE/BECE/NOVDEC per row)
                      </li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Manual key entry form */
                <form onSubmit={handleManualSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-bold text-gray-700">Serial Number</label>
                      <input
                        type="text"
                        placeholder="e.g. W2026112"
                        value={manualSerial}
                        onChange={(e) => setManualSerial(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-text-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-bold text-gray-700">PIN Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 192837465012"
                        value={manualPin}
                        onChange={(e) => setManualPin(e.target.value)}
                        className="w-full px-3.5 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors font-medium text-text-primary"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => { handleReset(); onClose(); }}
                      className="flex-1 py-2.5 text-center font-semibold text-gray-500 bg-gray-50 border border-gray-200 rounded-xl hover:text-text-primary hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 text-center font-semibold text-white bg-primary hover:bg-secondary rounded-xl active:scale-[0.98] transition-all shadow-md cursor-pointer"
                    >
                      Add Single Key
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
