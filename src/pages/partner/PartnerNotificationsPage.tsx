import { useState } from 'react'
import { motion } from 'framer-motion'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { usePartnerNotifications, useMarkPartnerNotificationRead } from '../../hooks/usePartner'

type NotificationFilter = 'ALL' | 'UNREAD' | 'SURGES' | 'PAYOUTS'

export default function PartnerNotificationsPage() {
  const { data: notifications, isLoading } = usePartnerNotifications()
  const { mutate: markRead } = useMarkPartnerNotificationRead()
  const [filter, setFilter] = useState<NotificationFilter>('ALL')

  const items = notifications || []

  const filteredItems = items.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead
    if (filter === 'SURGES') return n.type === 'TRANSACTION_SURGE'
    if (filter === 'PAYOUTS') return n.type === 'PAYOUT_STATUS'
    return true
  })

  const unreadCount = items.filter((n) => !n.isRead).length

  const handleMarkAllRead = () => {
    items.filter((n) => !n.isRead).forEach((n) => markRead(n.id))
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION_SURGE':
        return (
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        )
      case 'PAYOUT_STATUS':
        return (
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )
      case 'DAILY_DIGEST':
        return (
          <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <Helmet>
        <title>Notifications & Surge Alerts — Partner Portal</title>
      </Helmet>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Notifications & Alerts</h1>
          <p className="text-xs text-gray-500 mt-1">
            Stay updated with real-time sales volume surges, daily revenue summaries, and payout disbursements.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
          >
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-2xs w-fit">
        {([
          { id: 'ALL', label: 'All Alerts' },
          { id: 'UNREAD', label: `Unread (${unreadCount})` },
          { id: 'SURGES', label: 'High Volume Surges' },
          { id: 'PAYOUTS', label: 'Payout Updates' },
        ] satisfies { id: NotificationFilter; label: string }[]).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-[#153e14] text-[#dfba60] shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="py-20 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-100">
            Loading notifications...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-xs text-gray-400 bg-white rounded-3xl border border-gray-100">
            No notifications in this category.
          </div>
        ) : (
          filteredItems.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                n.isRead
                  ? 'bg-white border-gray-100 shadow-2xs'
                  : 'bg-emerald-50/40 border-emerald-200 shadow-xs'
              }`}
            >
              <div className="flex items-start space-x-4">
                {getIcon(n.type)}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-gray-900">{n.title}</h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-2xl">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-2">
                    {new Date(n.createdAt).toLocaleDateString()} at{' '}
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                {n.link && (
                  <Link
                    to={n.link}
                    className="px-3 py-1.5 bg-[#153e14] text-[#dfba60] text-xs font-bold rounded-lg hover:bg-[#1a4f19] transition-colors"
                  >
                    View Details →
                  </Link>
                )}
                {!n.isRead && (
                  <button
                    onClick={() => markRead(n.id)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    title="Mark as read"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
