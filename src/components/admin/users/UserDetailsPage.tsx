import { useState } from 'react'

export interface UserLog {
  id: string
  userId: string
  userName: string
  role: string
  action: string
  category: 'Security' | 'Inventory' | 'System' | 'Billing' | 'Customers' | string
  timestamp: string
  ipAddress: string
  device: string
  status: 'Success' | 'Warning' | 'Failed' | 'Info' | string
}

import type { AdminUser } from '../../../types/admin'
import type { PaginationInfo } from '../../../hooks/useUsers'

interface UserDetailsPageProps {
  user: AdminUser
  activities: UserLog[]
  pagination: PaginationInfo
  onPageChange: (page: number) => void
  onBack: () => void
  onOpenEditModal: () => void
}

const getAvatarClasses = (colorName: string) => {
  switch (colorName) {
    case 'Forest Green': return 'bg-primary/20 border-primary/30 text-primary'
    case 'Ocean Blue': return 'bg-blue-100 border-blue-200 text-blue-700'
    case 'Sunset Amber': return 'bg-amber-100 border-amber-200 text-amber-700'
    case 'Teal Lagoon': return 'bg-teal-100 border-teal-200 text-teal-700'
    case 'Grape Purple': return 'bg-purple-100 border-purple-200 text-purple-700'
    default: return 'bg-primary/20 border-primary/30 text-primary'
  }
}

export default function UserDetailsPage({ user, activities, pagination, onPageChange, onBack, onOpenEditModal }: UserDetailsPageProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('ALL')
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc')

  // Filter logs for this user
  const filteredLogs = activities
    .filter(log => {
      const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            log.category.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'ALL' || log.category === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB
    })

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer select-none"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Administrators Directory</span>
        </button>
        <span className="text-xs font-medium text-gray-400 font-mono">User ID: {user.id}</span>
      </div>

      {/* Profile Info Header Banner */}
      <div className="bg-primary p-6 sm:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,197,107,0.15),transparent_60%)]" />
        <div className="z-10 relative flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-white/20 font-serif font-bold text-3xl shadow-lg ${getAvatarClasses(user.avatarColor || 'Forest Green')}`}>
              {user?.name?.charAt(0) || 'A'}
            </div>
            
            <div className="space-y-1">
              <div className="flex flex-col md:flex-row items-center gap-2 justify-center md:justify-start">
                <h3 className="text-2xl font-serif font-bold tracking-tight">{user.name}</h3>
                <span className="text-[10px] font-bold text-[#a1781b] bg-[#dfba60]/25 border border-[#dfba60]/30 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <p className="text-white/80 text-xs font-sans font-medium">{user.professionalTitle}</p>
              <p className="text-white/60 text-[10px] font-mono">First login: {user.firstLogin}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 shrink-0 self-center md:self-start">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
              user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-100 border border-emerald-500/30' : 'bg-red-500/20 text-red-100 border border-red-500/30'
            }`}>
              {user.status}
            </span>
            <button
              onClick={onOpenEditModal}
              className="flex items-center space-x-1.5 px-4 py-2 bg-white text-primary text-xs font-bold rounded-xl transition-all shadow cursor-pointer hover:bg-gray-50 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit Operator</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Settings Panel */}
        <div className="space-y-6">
          {/* Core Info & Management */}
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2.5">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Operator Settings</h4>
            </div>

            <div className="space-y-4 text-xs font-sans">
              <div>
                <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Email Address</span>
                <p className="font-bold text-gray-700 mt-0.5">{user.email}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Primary Phone</span>
                <p className="font-mono font-bold text-gray-600 mt-0.5">{user.phone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-400 font-semibold uppercase tracking-wide text-[9px]">Last Online Active</span>
                <p className="font-bold text-primary mt-0.5">{user.lastActive || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Operator Specific Activity logs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-150 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-50 pb-4">
              <div>
                <h4 className="font-serif font-bold text-primary text-base">Operator Audit Logs</h4>
                <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Chronological system operations performed by this account</p>
              </div>

              {/* Sort toggle */}
              <button
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-lg transition-colors cursor-pointer select-none"
              >
                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <span>Date: {sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}</span>
              </button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Filter logs by keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-gray-400"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-1.5 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-gray-600 cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                <option value="Security">Security</option>
                <option value="Inventory">Inventory</option>
                <option value="System">System</option>
                <option value="Billing">Billing</option>
                <option value="Customers">Customers</option>
              </select>
            </div>

            {/* Logs Table / List */}
            {filteredLogs.length === 0 ? (
              <div className="text-center py-10 text-gray-400 border border-dashed border-gray-150 rounded-xl">
                <svg className="w-8 h-8 mx-auto text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">No activity logs match the criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-100 rounded-xl">
                <table className="w-full border-collapse text-left text-xs text-text-primary font-sans">
                  <thead>
                    <tr className="bg-gray-50/70 text-gray-400 text-[9px] font-bold uppercase border-b border-gray-100">
                      <th className="px-4 py-3">Timestamp</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Action Description</th>
                      <th className="px-4 py-3">Audit Code</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 py-3 font-mono text-gray-400 font-semibold">{log.timestamp}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                            log.category === 'Security' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            log.category === 'Inventory' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600 leading-normal max-w-xs">{log.action}</td>
                        <td className="px-4 py-3">
                          <div className="text-[10px] text-gray-400 leading-tight font-mono select-all">
                            <p>{log.ipAddress}</p>
                            <p className="text-[8px] truncate max-w-[100px]" title={log.device}>{log.device}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                            log.status === 'Success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                            log.status === 'Failed' ? 'bg-red-50 text-red-700 border border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl mt-4">
              <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Showing <span className="font-bold text-primary">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-bold text-primary">{Math.min(pagination.page * pagination.limit, pagination.totalResults)}</span> of <span className="font-bold text-primary">{pagination.totalResults}</span> logs
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onPageChange(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => onPageChange(Math.min(pagination.totalPages, pagination.page + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  )
}
