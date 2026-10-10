import React, { useState } from 'react'
import type { ExamType } from '../../../types/admin'

interface VoucherTypeConfigCardProps {
  type: ExamType
  price: number
  minLimit: number
  count: number
  onUpdateConfig: (type: ExamType, price: number, minLimit: number) => void
}

const themeMap = {
  WASSCE_NOVDEC: {
    color: '#8B5CF6', // Purple
    bgColor: 'bg-[#8B5CF6]/10',
    borderColor: 'border-[#8B5CF6]/20',
    accentBorder: 'border-t-4 border-t-[#8B5CF6]',
  },
  BECE: {
    color: '#FBBF24', // Gold
    bgColor: 'bg-[#FBBF24]/10',
    borderColor: 'border-[#FBBF24]/20',
    accentBorder: 'border-t-4 border-t-[#FBBF24]',
  },
}

export default function VoucherTypeConfigCard({
  type,
  price,
  minLimit,
  count,
  onUpdateConfig,
}: VoucherTypeConfigCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editPrice, setEditPrice] = useState(price.toString())
  const [editLimit, setEditLimit] = useState(minLimit.toString())
  const [error, setError] = useState<string | null>(null)

  const theme = themeMap[type]
  const isLowStock = count <= minLimit

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const parsedPrice = parseFloat(editPrice)
    const parsedLimit = parseInt(editLimit, 10)

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Price must be a valid positive amount.')
      return
    }

    if (isNaN(parsedLimit) || parsedLimit < 0) {
      setError('Alarm threshold must be a valid number.')
      return
    }

    onUpdateConfig(type, parsedPrice, parsedLimit)
    setIsEditing(false)
  }

  return (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow overflow-hidden ${theme.accentBorder}`}>
      <div className="p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white`} style={{ backgroundColor: theme.color }}>
              {type === 'WASSCE_NOVDEC' ? 'WASSCE / NOVDEC' : type} CATEGORY
            </span>
            <h3 className="text-base font-bold text-text-primary mt-1.5">{type === 'WASSCE_NOVDEC' ? 'WASSCE / NOVDEC' : type} Checker Stock</h3>
          </div>
          <div className={`w-10 h-10 rounded-lg ${theme.bgColor} flex items-center justify-center`} style={{ color: theme.color }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>

        {isEditing ? (
          /* Editing Form */
          <form onSubmit={handleSave} className="space-y-3 text-xs">
            {error && <p className="text-[10px] font-bold text-red-600">{error}</p>}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-gray-400">Unit Price (GHS)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-gray-400">Warning Limit</label>
                <input
                  type="number"
                  value={editLimit}
                  onChange={(e) => setEditLimit(e.target.value)}
                  className="w-full px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:border-primary font-semibold text-text-primary"
                />
              </div>
            </div>
            <div className="flex space-x-2 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setEditPrice(price.toString())
                  setEditLimit(minLimit.toString())
                  setIsEditing(false)
                  setError(null)
                }}
                className="flex-1 py-1 text-center font-bold text-gray-500 bg-gray-50 border border-gray-200 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-1 text-center font-bold text-white bg-primary rounded-lg cursor-pointer"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          /* Values Display */
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Selling Price</p>
                <p className="text-xl font-bold text-text-primary mt-0.5">GHS {Number(price).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Warning Alarm</p>
                <p className="text-lg font-bold text-text-primary mt-0.5">&lt; {minLimit} units</p>
              </div>
            </div>

            {/* Current Stock progress */}
            <div className="pt-1.5 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold text-gray-400">
                <span>Available Keys</span>
                <span className={isLowStock ? 'text-red-500 font-bold animate-pulse' : 'text-primary'}>
                  {count} Keys
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: isLowStock ? '#ef4444' : theme.color,
                    width: `${Math.min(100, (count / Math.max(1, minLimit * 3)) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer controls */}
      {!isEditing && (
        <div className="px-5 py-3.5 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-[10px] font-bold text-gray-400 uppercase">
            {isLowStock ? '⚠️ Low Stock Active' : '🟢 Stock Levels Stable'}
          </span>
          <button
            onClick={() => setIsEditing(true)}
            className="text-xs font-bold text-secondary hover:text-primary transition-colors cursor-pointer"
          >
            Edit Settings
          </button>
        </div>
      )}
    </div>
  )
}
