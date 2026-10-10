import { useState } from 'react'
import { Eye, Loader2 } from 'lucide-react'
import type { ExamType } from '../../../types/admin'
import { apiClient } from '../../../lib/apiClient'
import { ENDPOINTS } from '../../../services/endpoints'

export interface VoucherKey {
  id?: string
  serial: string
  pin: string
  examType: ExamType
  status: 'Available' | 'Reserved' | 'Sold' | 'Delivered'
  importDate: string
  createdAt?: string
  updatedAt?: string
}

interface VoucherKeysTableProps {
  keys: VoucherKey[]
  onDeleteKey: (serial: string) => void
  showOnlyAllocated?: boolean // If true, hides 'Available' keys
}

export default function VoucherKeysTable({ keys, onDeleteKey, showOnlyAllocated = false }: VoucherKeysTableProps) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'ALL' | 'WASSCE_NOVDEC' | 'BECE'>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'Available' | 'Reserved' | 'Sold' | 'Delivered'>('ALL')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Deletion confirmation
  const [confirmDeleteSerial, setConfirmDeleteSerial] = useState<string | null>(null)

  // PINs are masked until an admin asks for one. Each reveal is recorded in the activity log.
  const [revealedPins, setRevealedPins] = useState<Record<string, string>>({})
  const [revealingId, setRevealingId] = useState<string | null>(null)

  const revealPin = async (id?: string) => {
    if (!id || revealedPins[id]) return
    setRevealingId(id)
    try {
      const res = await apiClient.get<{ success: boolean; data: { pin: string } }>(ENDPOINTS.VOUCHERS.REVEAL_PIN(id))
      setRevealedPins((prev) => ({ ...prev, [id]: res.data.data.pin }))
    } catch {
      // Leave it masked if the request fails
    } finally {
      setRevealingId(null)
    }
  }

  // Filter keys
  const filteredKeys = keys.filter((key) => {
    const matchesSearch = key.serial.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === 'ALL' || key.examType === filterType
    
    // Status filter: "allocated only" additionally hides keys still Available
    const matchesStatusValue = filterStatus === 'ALL' || key.status === filterStatus
    const matchesStatus = showOnlyAllocated
      ? matchesStatusValue && key.status !== 'Available'
      : matchesStatusValue
    
    return matchesSearch && matchesType && matchesStatus
  })

  // Paginated calculations
  const totalPages = Math.max(1, Math.ceil(filteredKeys.length / itemsPerPage))
  const paginatedKeys = filteredKeys.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const handleDeleteClick = (serial: string) => {
    setConfirmDeleteSerial(serial)
  }

  const handleConfirmDelete = () => {
    if (confirmDeleteSerial) {
      onDeleteKey(confirmDeleteSerial)
      setConfirmDeleteSerial(null)
      // Adjust page if it exceeds total pages after deleting
      const remainingItemsCount = filteredKeys.length - 1
      const newTotalPages = Math.max(1, Math.ceil(remainingItemsCount / itemsPerPage))
      if (currentPage > newTotalPages) {
        setCurrentPage(newTotalPages)
      }
    }
  }

  const renderStatusBadge = (status: 'Available' | 'Reserved' | 'Sold' | 'Delivered') => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
            Available
          </span>
        )
      case 'Reserved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
            Reserved
          </span>
        )
      case 'Sold':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
            Sold
          </span>
        )
      case 'Delivered':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-100 animate-pulse">
            Delivered
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-50 text-gray-500 border border-gray-200">
            {status}
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-150 shadow-sm overflow-hidden flex flex-col justify-between">
      {/* Filtering Header Toolbar */}
      <div className="p-6 border-b border-gray-50 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
          <div>
            <h3 className="font-serif font-bold text-primary text-lg">
              {showOnlyAllocated ? 'Allocated Vouchers' : 'Checker Keys Registry'}
            </h3>
            <p className="text-xs text-gray-400">
              {showOnlyAllocated 
                ? 'Reserved, sold, and delivered keys matching checkout records' 
                : 'Search by serial number; PINs are hidden until revealed'}
            </p>
          </div>
          <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
            {filteredKeys.length} matching keys
          </span>
        </div>

        {/* Filter Selection Panel */}
        <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-2 sm:space-y-0 text-xs">
          {/* Search Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search serial number..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-8 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary font-medium text-text-primary text-xs"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value as typeof filterType)
              setCurrentPage(1)
            }}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white font-semibold text-gray-600 text-xs cursor-pointer"
          >
            <option value="ALL">All Categories</option>
            <option value="WASSCE_NOVDEC">WASSCE / NOVDEC</option>
            <option value="BECE">BECE Only</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as typeof filterStatus)
              setCurrentPage(1)
            }}
            className="px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-primary bg-white font-semibold text-gray-600 text-xs cursor-pointer"
          >
            {showOnlyAllocated ? (
              <>
                <option value="ALL">All Allocated Statuses</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
                <option value="Delivered">Delivered</option>
              </>
            ) : (
              <>
                <option value="ALL">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Reserved">Reserved</option>
                <option value="Sold">Sold</option>
                <option value="Delivered">Delivered</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Table grid layout */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm font-sans text-text-primary">
          <thead>
            <tr className="bg-gray-50/50 text-gray-400 text-xs font-semibold uppercase border-b border-gray-50 select-none">
              <th className="px-6 py-4">Serial Number</th>
              <th className="px-6 py-4">PIN Code</th>
              <th className="px-6 py-4">Exam Type</th>
              <th className="px-6 py-4">Import Date</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs font-medium">
            {paginatedKeys.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400 font-semibold uppercase tracking-wider">
                  No matching checker keys found
                </td>
              </tr>
            ) : (
              paginatedKeys.map((item) => (
                <tr key={item.serial} className="hover:bg-gray-50/40 transition-colors">
                  <td className="px-6 py-4 font-bold text-primary font-mono">{item.serial}</td>
                  <td className="px-6 py-4 font-semibold font-mono tracking-wider">
                    {item.id && revealedPins[item.id] ? (
                      <span>{revealedPins[item.id]}</span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <span className="text-gray-500">{item.pin}</span>
                        {item.id && (
                          <button
                            type="button"
                            onClick={() => revealPin(item.id)}
                            title="Show the full PIN (recorded in the activity log)"
                            className="text-gray-400 hover:text-primary transition-colors cursor-pointer"
                          >
                            {revealingId === item.id ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />}
                          </button>
                        )}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-500 font-bold">{item.examType}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 font-semibold">{item.importDate}</td>
                  <td className="px-6 py-4">{renderStatusBadge(item.status)}</td>
                  <td className="px-6 py-4 text-right">
                    {confirmDeleteSerial === item.serial ? (
                      <div className="flex justify-end space-x-1.5">
                        <button
                          onClick={handleConfirmDelete}
                          className="bg-red-500 hover:bg-red-600 text-white font-bold px-2.5 py-1 rounded text-[10px] shadow cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setConfirmDeleteSerial(null)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleDeleteClick(item.serial)}
                        className="text-red-500 hover:text-red-700 font-semibold p-1 hover:bg-red-50 rounded transition-colors cursor-pointer inline-flex items-center"
                        title="Delete key"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control panel */}
      {totalPages > 1 && (
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between text-xs font-semibold select-none">
          <span className="text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer bg-white"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:hover:bg-transparent transition-colors cursor-pointer bg-white"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
