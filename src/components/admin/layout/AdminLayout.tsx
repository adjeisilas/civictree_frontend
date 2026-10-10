import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../../services/authStore'
import { useLogout } from '../../../hooks/useAuth'
import { useNotifications, useMarkAllRead, useSubscribePush } from '../../../hooks/useNotifications'

// Helper to convert base64 VAPID to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [notifMenuOpen, setNotifMenuOpen] = useState(false)

  const { data } = useNotifications(1, 10)
  const notifications = data?.notifications || []
  const unreadNotifications = notifications.filter(n => !n.isRead)
  const { mutate: markAllRead } = useMarkAllRead()
  const { mutate: subscribePush } = useSubscribePush()
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleSubscribePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert('Push notifications are not supported in this browser.')
      return
    }

    try {
      setIsSubscribing(true)
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        alert('Permission for notifications was denied')
        return
      }

      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY
      if (!vapidPublicKey || vapidPublicKey === 'replace_with_your_backend_vapid_public_key') {
        console.error('VAPID public key is missing or invalid')
        alert('Failed to subscribe: VAPID public key missing')
        return
      }

      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      })

      subscribePush(subscription, {
        onSuccess: () => {
          alert('Successfully subscribed to push notifications!')
        },
        onError: (err) => {
          console.error('Failed to send subscription to server', err)
          alert('Failed to subscribe on the server.')
        }
      })
    } catch (error) {
      console.error('Failed to subscribe:', error)
      alert('An error occurred while subscribing.')
    } finally {
      setIsSubscribing(false)
    }
  }

  const location = useLocation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { mutate: logoutMutate } = useLogout()

  const handleLogout = () => {
    logoutMutate()
  }

  // Dynamic Page Section breadcrumb
  const getPageSection = () => {
    const path = location.pathname
    if (path.includes('/admin/vouchers')) return 'Vouchers'
    if (path.includes('/admin/orders')) return 'Orders'
    if (path.includes('/admin/customers')) return 'Customers'
    if (path.includes('/admin/sms')) return 'SMS'
    if (path.includes('/admin/reports')) return 'Reports'
    if (path.includes('/admin/settings')) return 'Settings'
    if (path.includes('/admin/profile')) return 'Profile'
    if (path.includes('/admin/notifications')) return 'Notifications'
    if (path.includes('/admin/users')) return 'Users'
    return 'Overview'
  }

  // Dynamic Page Title mapping
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/admin/dashboard')) return 'Dashboard Overview'
    if (path.includes('/admin/vouchers')) return 'Voucher Inventory'
    if (path.includes('/admin/orders')) return 'Order History'
    if (path.includes('/admin/customers')) return 'Customers Directory'
    if (path.includes('/admin/sms')) return 'Bulk SMS Portal'
    if (path.includes('/admin/reports')) return 'Sales & Stock Reports'
    if (path.includes('/admin/settings')) return 'Platform Configuration'
    if (path.includes('/admin/profile')) return 'My Profile & Security'
    if (path.includes('/admin/notifications')) return 'System Alerts & Logs'
    if (path.includes('/admin/users')) return 'Administrators Management'
    return 'Admin Panel'
  }

  return (
    <div className="flex h-screen bg-[#F8FAF8] overflow-hidden font-sans">
      {/* Sidebar navigation */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Sticky Header */}
        <header className="h-14 shrink-0 bg-[#eee] backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 z-30">
          <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 md:hidden focus:outline-none transition-colors shrink-0"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Breadcrumb Title */}
            <div className="flex items-center space-x-1.5 sm:space-x-2 text-[11.5px] font-bold text-gray-400 select-none min-w-0">
              <span className="hidden sm:inline shrink-0">{getPageSection()}</span>
              <span className="text-gray-300 font-normal hidden sm:inline shrink-0">/</span>
              <span className="text-gray-700 font-semibold truncate max-w-[130px] sm:max-w-none">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-4 text-xs shrink-0">
            
           

            {/* Notifications Bell Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-text-primary transition-all flex items-center justify-center cursor-pointer relative select-none"
                title="Notifications"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 border border-white text-white font-bold text-[8px] rounded-full flex items-center justify-center">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <>
                  <div
                    onClick={() => setNotifMenuOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2.5 text-xs font-semibold text-gray-600 animate-fadeIn">
                    <div className="px-4 py-2 border-b border-gray-50 mb-1 flex justify-between items-center">
                      <span className="text-text-primary text-[10px] font-bold">Recent Alerts ({unreadNotifications.length})</span>
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={() => {
                            markAllRead()
                            setNotifMenuOpen(false)
                          }}
                          className="text-[9px] text-primary hover:text-secondary font-bold cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                      {unreadNotifications.length > 0 ? (
                        unreadNotifications.map((n) => (
                          <div key={n.id} className="p-3 hover:bg-gray-50 flex items-start gap-2.5 transition-colors">
                            <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                              n.type === 'critical' ? 'bg-red-500' : n.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                            }`} />
                            <div className="space-y-0.5">
                              <p className="text-text-primary text-[10px] font-bold leading-tight">{n.title}</p>
                              <p className="text-gray-400 text-[9px] font-medium leading-normal">{n.message}</p>
                              <p className="text-[8px] text-gray-400 font-mono mt-0.5">{n.time}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-6 text-center text-gray-400 font-medium">
                          No new notifications
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-50 mt-1.5 pt-2 px-3 text-center">
                      <button
                        onClick={() => {
                          setNotifMenuOpen(false)
                          navigate('/admin/notifications')
                        }}
                        className="w-full py-1.5 bg-primary/5 hover:bg-primary/10 text-primary hover:text-secondary text-[9px] font-bold rounded-xl transition-all cursor-pointer"
                      >
                        View All Notifications
                      </button>
                      
                      {('Notification' in window) && Notification.permission !== 'granted' && (
                        <button
                          onClick={handleSubscribePush}
                          disabled={isSubscribing}
                          className="w-full mt-1.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 text-[9px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                        >
                          {isSubscribing ? (
                            <span>Enabling...</span>
                          ) : (
                            <>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                              </svg>
                              <span>Enable Push Notifications</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile trigger */}
            <div className="relative pl-2 border-l border-gray-100">
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary font-bold text-[10px] hover:bg-primary/20 transition-all cursor-pointer select-none"
                title="Admin Menu"
              >
                {user?.name?.charAt(0) || 'A'}
              </button>

              {profileMenuOpen && (
                <>
                  {/* Backdrop overlay to close dropdown */}
                  <div 
                    onClick={() => setProfileMenuOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  
                  {/* Dropdown Menu Box */}
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2 text-xs font-semibold text-gray-600 animate-fadeIn">
                    {/* User Info Header */}
                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                      <p className="text-text-primary text-[10px] font-bold truncate leading-tight">{user?.name || 'Admin User'}</p>
                      <p className="text-gray-400 text-[8px] mt-0.5 truncate">{user?.email || 'admin@civictree.com'}</p>
                    </div>

                    {/* Menu links */}
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        navigate('/admin/profile')
                      }}
                      className="w-full text-left px-4 py-1.5 hover:bg-gray-50 hover:text-text-primary transition-colors flex items-center space-x-2 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile & Security</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        navigate('/admin/settings')
                      }}
                      className="w-full text-left px-4 py-1.5 hover:bg-gray-50 hover:text-text-primary transition-colors flex items-center space-x-2 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>System Settings</span>
                    </button>

                    {/* Divider */}
                    <div className="border-b border-gray-100 my-1" />

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-4 py-1.5 text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center space-x-2 cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Inner Page Viewer */}
        <main className="flex-1 overflow-y-auto p-6 scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
