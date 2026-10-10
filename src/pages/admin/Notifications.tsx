import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications, useMarkNotificationRead, useMarkAllRead, useNotificationTypes } from '../../hooks/useNotifications'
import type { Notification } from '../../types/admin'

export default function Notifications() {
  const navigate = useNavigate()
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [notifsPage, setNotifsPage] = useState(1)

  const { data: typesData } = useNotificationTypes()
  const notificationTypes = typesData?.data || []
  const totalUnread = typesData?.totalUnread || 0

  const { data } = useNotifications(notifsPage, 10, activeCategory)
  const notifications = data?.notifications || []
  const pagination = data?.pagination || { page: 1, limit: 10, totalResults: 0, totalPages: 1 }

  const { mutate: markAsRead } = useMarkNotificationRead()
  const { mutate: markAllRead } = useMarkAllRead()

  // Mark single item as read
  const handleMarkAsRead = (id: string) => {
    markAsRead(id, {
      onSuccess: () => {
        setToastMessage('Notification marked as read')
        setTimeout(() => setToastMessage(null), 2500)
      }
    })
  }

  // Mark all as read
  const handleMarkAllRead = () => {
    markAllRead(undefined, {
      onSuccess: () => {
        setToastMessage('All notifications marked as read')
        setTimeout(() => setToastMessage(null), 2500)
      }
    })
  }

  // Filter logic (only search, category is handled server-side now)
  const filteredNotifications = notifications.filter(n => {
    // Search query match
    const searchMatch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase())

    return searchMatch
  })

  // Global counts
  const counts = {
    all: pagination.totalResults,
    unread: totalUnread, // Using totalUnread from types API for exact unread count
  }

  const getSeverityStyles = (type: Notification['type']) => {
    switch (type) {
      case 'critical':
        return {
          border: 'border-l-4 border-red-500 bg-red-50/40 hover:bg-red-50',
          badge: 'bg-red-100 text-red-700 border-red-200',
          iconColor: 'text-red-500',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        }
      case 'warning':
        return {
          border: 'border-l-4 border-amber-500 bg-amber-50/40 hover:bg-amber-50',
          badge: 'bg-amber-100 text-amber-700 border-amber-200',
          iconColor: 'text-amber-500',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )
        }
      case 'success':
        return {
          border: 'border-l-4 border-emerald-500 bg-emerald-50/30 hover:bg-emerald-50/60',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          iconColor: 'text-emerald-500',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
      default:
        return {
          border: 'border-l-4 border-blue-500 bg-blue-50/20 hover:bg-blue-50/50',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          iconColor: 'text-blue-500',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-primary border border-accent text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-bounce flex items-center space-x-2 text-xs font-semibold">
          <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Title Header */}
      <div className="bg-primary p-6 sm:p-8 rounded-2xl text-white shadow-md relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(235,197,107,0.15),transparent_60%)]" />
        <div className="z-10 relative flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">Notifications Center</h2>
            <p className="text-white/80 text-xs sm:text-sm font-sans max-w-2xl">
              Monitor systems alerts, outbound gateway warnings, customer checkout actions, and critical voucher inventory thresholds.
            </p>
          </div>
          
          {counts.unread > 0 && (
            <span className="text-[10px] font-bold text-primary bg-[#dfba60] px-3 py-1 rounded-full uppercase tracking-wider shadow-md animate-pulse">
              {counts.unread} Action required
            </span>
          )}
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Filter Sidebar */}
        <div className="space-y-4 lg:col-span-1">
          <div className="bg-white p-5 rounded-2xl border border-gray-150 shadow-sm space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
              Categories & Filters
            </h3>

            <div className="flex flex-col space-y-1.5 text-xs font-semibold text-gray-600">
              <button
                onClick={() => { setActiveCategory('all'); setNotifsPage(1); }}
                className={`flex justify-between items-center px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                  activeCategory === 'all' ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-gray-50 hover:text-text-primary'
                }`}
              >
                <span>All Notifications</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded-full text-[9px] font-bold">{counts.all}</span>
              </button>

              {notificationTypes.map((typeObj) => {
                const isActive = activeCategory === typeObj.type
                return (
                  <button
                    key={typeObj.type}
                    onClick={() => { setActiveCategory(typeObj.type); setNotifsPage(1); }}
                    className={`flex justify-between items-center px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                      isActive ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-gray-50 hover:text-text-primary'
                    }`}
                  >
                    <span>{typeObj.name}</span>
                    {typeObj.unreadCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${isActive ? 'bg-primary/20 text-primary' : 'bg-amber-100 text-amber-700'}`}>
                        {typeObj.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Side: Notification list display */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Action Header bar */}
          <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            
            {/* Search Input bar */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                placeholder="Search alerts or messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:border-primary text-xs font-semibold"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Clear/Mark actions */}
            <div className="flex gap-3 text-[10px] font-bold uppercase select-none">
              {counts.unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-xl transition-all cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

          </div>

          {/* List display panel */}
          <div className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => {
                const style = getSeverityStyles(notif.type)
                return (
                  <div
                    key={notif.id}
                    onClick={() => {
                      if (notif.actionPath) navigate(notif.actionPath)
                    }}
                    className={`p-4 rounded-xl border border-gray-150 transition-all shadow-sm flex items-start gap-4 ${notif.actionPath ? 'cursor-pointer' : ''} ${style.border} ${
                      !notif.isRead ? 'bg-white font-semibold' : 'opacity-85'
                    }`}
                  >
                    {/* Severity Icon */}
                    <div className={`p-1.5 rounded-lg bg-white shrink-0 shadow-sm border border-gray-100 ${style.iconColor}`}>
                      {style.icon}
                    </div>

                    {/* Content Detail info */}
                    <div className="flex-1 space-y-1.5 overflow-hidden">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4 className={`text-xs font-bold leading-tight ${!notif.isRead ? 'text-text-primary' : 'text-gray-600'}`}>
                          {notif.title}
                        </h4>
                        
                        <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded-full border tracking-wide select-none ${style.badge}`}>
                          {notif.category}
                        </span>

                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 leading-normal font-medium">
                        {notif.message}
                      </p>

                      <div className="flex items-center gap-4 pt-1 flex-wrap">
                        <span className="text-[10px] text-gray-400 font-mono">{notif.time}</span>
                        
                        {notif.actionLabel && notif.actionPath && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              navigate(notif.actionPath!)
                            }}
                            className="text-[10px] font-bold text-primary hover:text-secondary flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>{notif.actionLabel}</span>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Actions tools (Mark as read) */}
                    <div className="flex gap-1.5 shrink-0 self-center">
                      {!notif.isRead && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleMarkAsRead(notif.id)
                          }}
                          className="p-1 rounded-lg text-gray-400 hover:text-primary hover:bg-gray-50 border border-transparent hover:border-gray-150 transition-all cursor-pointer"
                          title="Mark as read"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                    </div>

                  </div>
                )
              })
            ) : (
              <div className="bg-white py-12 rounded-2xl border border-gray-150 text-center space-y-3">
                <div className="w-12 h-12 bg-gray-50 text-gray-400 border border-gray-100 flex items-center justify-center rounded-full mx-auto shadow-sm">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 15H4" />
                  </svg>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-text-primary">No notifications found</h4>
                  <p className="text-[10px] text-gray-400 font-medium">There are no warnings or events matching your criteria.</p>
                </div>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-150 rounded-xl mt-4">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Showing <span className="font-bold text-primary">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-bold text-primary">{Math.min(pagination.page * pagination.limit, pagination.totalResults)}</span> of <span className="font-bold text-primary">{pagination.totalResults}</span> notifications
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setNotifsPage(Math.max(1, pagination.page - 1))}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setNotifsPage(Math.min(pagination.totalPages, pagination.page + 1))}
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
  )
}
