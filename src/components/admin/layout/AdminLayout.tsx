import { useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar'
import { useAuthStore } from '../../../services/authStore'
import { useLogout } from '../../../hooks/useAuth'
import { useNotifications, useMarkAllRead, useSubscribePush } from '../../../hooks/useNotifications'
import { Bell, ChevronRight, LogOut, Menu, Settings, User } from 'lucide-react'

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
        <header className="h-15 shrink-0 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 z-30">
          <div className="flex items-center space-x-2.5 sm:space-x-4 min-w-0">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-text-primary md:hidden transition-colors shrink-0"
            >
              <Menu className="w-5 h-5" strokeWidth={1.75} />
            </button>
            
            {/* Breadcrumb Title */}
            <div className="flex items-center gap-2 text-[13px] text-gray-500 select-none min-w-0">
              <span className="hidden sm:inline shrink-0">{getPageSection()}</span>
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:inline shrink-0" strokeWidth={2} />
              <span className="font-medium text-text-primary truncate max-w-[160px] sm:max-w-none">{getPageTitle()}</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-4 text-xs shrink-0">
            
           

            {/* Notifications Bell Popover Trigger */}
            <div className="relative">
              <button
                onClick={() => setNotifMenuOpen(!notifMenuOpen)}
                className="w-9 h-9 rounded-md text-gray-500 hover:bg-gray-100 hover:text-text-primary transition-colors flex items-center justify-center cursor-pointer relative select-none"
                title="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" strokeWidth={1.75} />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-600 text-white font-semibold text-xs leading-4 rounded-full flex items-center justify-center tabular-nums">
                    {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                  </span>
                )}
              </button>

              {notifMenuOpen && (
                <>
                  <div
                    onClick={() => setNotifMenuOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1.5 text-gray-600 animate-fadeIn">
                    <div className="px-4 py-2.5 border-b border-gray-200 flex justify-between items-center gap-3">
                      <span className="text-text-primary text-[13px] font-semibold">Unread alerts ({unreadNotifications.length})</span>
                      {unreadNotifications.length > 0 && (
                        <button
                          onClick={() => {
                            markAllRead()
                            setNotifMenuOpen(false)
                          }}
                          className="text-xs text-primary hover:underline font-medium cursor-pointer shrink-0"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                      {unreadNotifications.length > 0 ? (
                        unreadNotifications.map((n) => (
                          <div key={n.id} className="px-4 py-3 hover:bg-gray-50 flex items-start gap-3 transition-colors">
                            <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                              n.type === 'critical' ? 'bg-red-600' : n.type === 'warning' ? 'bg-amber-500' : 'bg-gray-300'
                            }`} />
                            <div className="min-w-0">
                              <p className="text-text-primary text-[13px] font-medium leading-snug">{n.title}</p>
                              <p className="text-gray-600 text-xs leading-relaxed mt-0.5">{n.message}</p>
                              <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="py-8 text-center text-[13px] text-gray-500">
                          Nothing unread
                        </div>
                      )}
                    </div>

                    <div className="border-t border-gray-200 mt-1 pt-2 px-3 space-y-1.5">
                      <button
                        onClick={() => {
                          setNotifMenuOpen(false)
                          navigate('/admin/notifications')
                        }}
                        className="w-full py-2 text-primary hover:bg-primary/5 text-[13px] font-medium rounded-md transition-colors cursor-pointer"
                      >
                        View all notifications
                      </button>
                      
                      {('Notification' in window) && Notification.permission !== 'granted' && (
                        <button
                          onClick={handleSubscribePush}
                          disabled={isSubscribing}
                          className="w-full py-2 text-gray-600 hover:bg-gray-50 hover:text-text-primary text-[13px] font-medium rounded-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Bell className="w-3.5 h-3.5" strokeWidth={1.75} />
                          <span>{isSubscribing ? 'Enabling...' : 'Enable push notifications'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile trigger */}
            <div className="relative pl-2 ml-1 border-l border-gray-200">
              <button 
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold hover:bg-primary-hover transition-colors cursor-pointer select-none"
                title="Admin menu"
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
                  <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1.5 text-gray-600 animate-fadeIn">
                    {/* Who is signed in */}
                    <div className="px-4 py-2.5 border-b border-gray-200">
                      <p className="text-text-primary text-[13px] font-semibold truncate">{user?.name || 'Admin user'}</p>
                      <p className="text-gray-500 text-xs mt-0.5 truncate">{user?.email || 'admin@civictree.com'}</p>
                    </div>

                    {/* Menu links */}
                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        navigate('/admin/profile')
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-text-primary transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <User className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                      <span>Profile &amp; security</span>
                    </button>

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        navigate('/admin/settings')
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] hover:bg-gray-50 hover:text-text-primary transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-gray-400" strokeWidth={1.75} />
                      <span>System settings</span>
                    </button>

                    {/* Divider */}
                    <div className="border-t border-gray-200 my-1" />

                    <button
                      onClick={() => {
                        setProfileMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full text-left px-4 py-2 text-[13px] text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2.5 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" strokeWidth={1.75} />
                      <span>Sign out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Inner Page Viewer */}
        <main className="flex-1 overflow-y-auto scrollbar">
          <div className="max-w-[1600px] mx-auto p-5 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
