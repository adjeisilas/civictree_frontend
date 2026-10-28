import React, { useState, useEffect } from 'react'
import { 
  Calendar, 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Save, 
  Eye, 
  FileCheck,
  Globe,
  Loader2
} from 'lucide-react'
import { useAdminTimetables, useUpdateTimetable } from '../../hooks/useTimetables'
import { X as XIcon } from 'lucide-react'
import { TimetableConfig, TimetableType } from '../../types/timetable'
import { VOUCHER_TYPE_CODES, voucherTypeChip, voucherTypeLabel } from '../../config/voucherTypes'

/** Default exam year for a category that has nothing saved yet. */
const CURRENT_YEAR = new Date().getFullYear()

export default function Timetables() {
  const { data: timetables, isLoading, isError } = useAdminTimetables()
  const { mutate: updateTimetable, isPending: isUpdating } = useUpdateTimetable()
  
  const [activeTab, setActiveTabValue] = useState<TimetableType>('BECE')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const activeTimetable = timetables?.find((t: TimetableConfig) => t.type === activeTab)

  // What is saved for the category on screen, or a blank form if there is nothing yet
  const savedForm: Partial<TimetableConfig> = activeTimetable ?? {
    type: activeTab,
    title: '',
    examYear: CURRENT_YEAR,
    startDate: '',
    description: '',
    isPublished: false,
  }

  // The admin's unsaved edits sit on top of that
  const [formEdits, setFormEdits] = useState<Partial<TimetableConfig> | null>(null)
  const formData = formEdits ?? savedForm

  // Switching category abandons the half-finished form for the previous one
  const setActiveTab = (tab: TimetableType) => {
    setActiveTabValue(tab)
    setFormEdits(null)
    setSelectedFile(null)
    setSaveSuccess(false)
  }

  // Hide the confirmation a few seconds after a save
  useEffect(() => {
    if (!saveSuccess) return
    const timer = setTimeout(() => setSaveSuccess(false), 4000)
    return () => clearTimeout(timer)
  }, [saveSuccess])

  const handleInputChange = (field: keyof TimetableConfig, value: TimetableConfig[keyof TimetableConfig]) => {
    setFormEdits((prev) => ({
      ...(prev ?? savedForm),
      [field]: value,
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB'

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setFormEdits((prev) => ({
        ...(prev ?? savedForm),
        fileName: file.name,
        fileSize: sizeInMB,
        fileUrl: dataUrl,
      }))
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const payload = new FormData()
    payload.append('title', formData.title || '')
    payload.append('examYear', String(formData.examYear || CURRENT_YEAR))
    if (formData.startDate) payload.append('startDate', formData.startDate)
    payload.append('description', formData.description || '')
    payload.append('isPublished', String(formData.isPublished || false))
    
    if (selectedFile) {
      payload.append('file', selectedFile)
    } else if (formData.fileUrl && !formData.fileUrl.startsWith('data:')) {
      payload.append('fileUrl', formData.fileUrl)
    }

    updateTimetable({ type: activeTab, formData: payload }, {
      onSuccess: () => {
        // Keep showing the saved values, not the edits that produced them
        setFormEdits(null)
        setSelectedFile(null)
        setSaveSuccess(true)
      }
    })
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-gray-500 font-medium">Loading timetables...</p>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-6 bg-red-50 text-red-600 rounded-xl border border-red-200">
        <h3 className="font-bold text-lg mb-2">Error Loading Data</h3>
        <p>Failed to load timetables from the server. Please try again later.</p>
      </div>
    )
  }

  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toISOString().split('T')[0]
    } catch {
      return ''
    }
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-lg border border-gray-200">
        <div>
          <h1 className="text-2xl font-bold font-heading text-text-primary flex items-center gap-2.5">
            <Calendar className="text-primary" size={28} />
            Timetable Management
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Upload and configure the official examination timetables shown on the website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/timetable"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-text-primary hover:bg-gray-50 transition-colors"
          >
            <Globe size={16} className="text-primary" />
            View Live Web Page
            <ExternalLink size={14} className="text-text-secondary" />
          </a>
        </div>
      </div>

      {/* Save Success Alert Banner */}
      {saveSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="text-emerald-600 shrink-0" size={22} />
            <div>
              <p className="font-semibold text-sm">Timetable Configuration Saved Successfully!</p>
              <p className="text-xs text-emerald-700">
                The {formData.type} timetable and download links on the website have been updated instantly.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSaveSuccess(false)}
            className="text-emerald-600 hover:text-emerald-800 font-bold text-sm px-2"
          >
            <XIcon className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>
      )}

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {VOUCHER_TYPE_CODES.map((key) => {
          const item: Partial<TimetableConfig> = timetables?.find((t: TimetableConfig) => t.type === key) || { title: 'Not Configured', type: key, isPublished: false, fileName: '-', fileSize: '' }
          const isSelected = activeTab === key
          return (
            <div
              key={key}
              onClick={() => setActiveTab(key)}
              className={`cursor-pointer transition-all duration-200 p-5 rounded-lg border ${
                isSelected
                  ? 'bg-white border-primary shadow-md ring-2 ring-primary/20'
                  : 'bg-white/80 border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                    voucherTypeChip(key)
                  }`}>
                    <FileText size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-text-primary">{item.title}</h3>
                    <p className="text-xs text-text-secondary">Type: {voucherTypeLabel(item.type)}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                  item.isPublished
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.isPublished ? 'Published' : 'Hidden'}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center gap-1.5">
                  <FileCheck size={14} className="text-primary" />
                  <span className="truncate max-w-[180px] font-mono">{item.fileName || '-'}</span>
                  {item.fileSize && <span className="text-gray-400">({item.fileSize})</span>}
                </div>
                <div>
                  Release: <span className="font-medium text-text-primary">{
                    item.startDate ? new Date(item.startDate).toLocaleDateString() : 'N/A'
                  }</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Edit Panel */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          {VOUCHER_TYPE_CODES.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`flex-1 py-4 px-4 font-semibold text-xs sm:text-sm text-center border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-primary text-primary bg-white'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {voucherTypeLabel(key)} Timetable
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2">
                Card Title (Display on Website)
              </label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                placeholder="e.g. BECE '26 Timetable"
              />
            </div>

            {/* Exam Year */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2">
                Examination Year
              </label>
              <input
                type="number"
                required
                value={formData.examYear || ''}
                onChange={(e) => handleInputChange('examYear', parseInt(e.target.value) || new Date().getFullYear())}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                placeholder="e.g. 2026"
              />
            </div>

            {/* Release Date */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2">
                Expected Release / Exam Start Date
              </label>
              <input
                type="date"
                value={formatDateForInput(formData.startDate)}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            {/* Visibility Toggle */}
            <div>
              <label className="block text-xs font-bold text-text-secondary mb-2">
                Website Visibility
              </label>
              <label className="flex items-center gap-3 p-2.5 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.isPublished || false}
                  onChange={(e) => handleInputChange('isPublished', e.target.checked)}
                  className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                />
                <span className="text-sm font-medium text-text-primary">
                  {formData.isPublished ? 'Published (Visible on Website)' : 'Hidden (Draft Mode)'}
                </span>
              </label>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2">
              Website Card Description
            </label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              placeholder="Short description displayed under the title on the website page..."
            />
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Upload size={22} />
              </div>
              <h4 className="font-semibold text-sm text-text-primary mb-1">
                Upload New {formData.type} Timetable File (PDF / Document)
              </h4>
              <p className="text-xs text-text-secondary mb-4 max-w-md">
                Select a PDF timetable document to replace the current download asset for users.
              </p>

              <label className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm shadow-sm hover:bg-primary/90 cursor-pointer transition-colors">
                <Upload size={16} />
                Browse File
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Current Selected File Details */}
              <div className="mt-4 pt-4 border-t border-gray-200 w-full max-w-lg flex items-center justify-between text-xs bg-white p-3 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2 truncate">
                  <FileText size={16} className="text-primary shrink-0" />
                  <span className="font-mono font-medium truncate">{formData.fileName || 'No file selected'}</span>
                  {formData.fileSize && <span className="text-gray-400">({formData.fileSize})</span>}
                </div>
                {formData.fileUrl && (
                  <button
                    type="button"
                    onClick={() => setPreviewUrl(formData.fileUrl!)}
                    className="inline-flex items-center gap-1 text-primary hover:underline font-semibold shrink-0"
                  >
                    <Eye size={14} />
                    Preview
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Or Manual URL Input */}
          <div>
            <label className="block text-xs font-bold text-text-secondary mb-2">
              Or Specify Direct File URL
            </label>
            <input
              type="text"
              value={formData.fileUrl || ''}
              onChange={(e) => handleInputChange('fileUrl', e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-mono"
              placeholder="/becetimetable2026.pdf or https://..."
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-text-secondary">
              {formData.updatedAt ? `Last updated: ${new Date(formData.updatedAt).toLocaleString()}` : ''}
            </span>

            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-[#284c25] disabled:opacity-50 transition-all transform active:scale-95"
            >
              {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
              {isUpdating ? 'Saving...' : 'Save & Publish Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-bold text-sm text-text-primary flex items-center gap-2">
                <FileText size={18} className="text-primary" />
                Timetable Document Preview: {formData.fileName}
              </h3>
              <button
                onClick={() => setPreviewUrl(null)}
                className="w-8 h-8 rounded-md text-gray-500 hover:bg-gray-100 hover:text-text-primary flex items-center justify-center transition-colors cursor-pointer"
              >
                <XIcon className="w-4 h-4" strokeWidth={2} />
              </button>
            </div>
            <div className="flex-1 p-4 bg-gray-100 overflow-auto min-h-[400px] flex items-center justify-center">
              {previewUrl.startsWith('data:application/pdf') || previewUrl.endsWith('.pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-[600px] rounded-lg border border-gray-300 bg-white"
                  title="PDF Preview"
                />
              ) : previewUrl.startsWith('data:image') ? (
                <img src={previewUrl} alt="Timetable Preview" className="max-w-full max-h-[550px] object-contain rounded-lg shadow-sm" />
              ) : (
                <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md">
                  <AlertCircle size={40} className="mx-auto mb-3 text-amber-500" />
                  <p className="font-semibold text-sm text-text-primary mb-2">Direct URL Document</p>
                  <p className="text-xs text-text-secondary mb-4">{previewUrl}</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold"
                  >
                    <ExternalLink size={14} /> Open Document in New Tab
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
