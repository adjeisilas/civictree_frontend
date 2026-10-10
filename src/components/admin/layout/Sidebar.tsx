import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../services/authStore'
import { useLogout } from '../../../hooks/useAuth'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
}

export default function Sidebar({ isOpen, onClose, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { mutate: logoutUser } = useLogout()

  const handleLogout = () => {
    logoutUser()
  }

  const menuGroups = [
    {
      title: 'General',
      items: [
        {
          name: 'Dashboard',
          path: '/admin/dashboard',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
            </svg>
          ),
        },
      ]
    },
    {
      title: 'Management',
      items: [
        {
          name: 'Voucher Stock',
          path: '/admin/vouchers',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          ),
        },
        {
          name: 'Orders',
          path: '/admin/orders',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          ),
        },
        {
          name: 'Customers',
          path: '/admin/customers',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
        {
          name: 'Timetables',
          path: '/admin/timetables',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          name: 'Users',
          path: '/admin/users',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          name: 'Affiliates',
          path: '/admin/affiliates',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
      ]
    },
    {
      title: 'Tools & Reports',
      items: [
        {
          name: 'SMS Module',
          path: '/admin/sms',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
        },
        {
          name: 'Reports',
          path: '/admin/reports',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          name: 'Settings',
          path: '/admin/settings',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
        },
        {
          name: 'Notifications',
          path: '/admin/notifications',
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
        },
      ]
    }
  ]

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#0c180b]/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 bg-primary text-white border-r border-[#ffffff]/10 flex flex-col z-50 transition-all duration-300 ease-in-out md:translate-x-0 md:relative ${
          isCollapsed ? 'w-[76px]' : 'w-64'
        } ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Desktop Collapse Toggle handle */}
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex absolute top-7 right-[-12px] w-6 h-6 rounded-full bg-[#294f26] border border-white/10 text-[#dfba60] items-center justify-center hover:bg-primary hover:text-white shadow-md cursor-pointer transition-all z-50 hover:scale-115 active:scale-95"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <svg className={`w-3.5 h-3.5 transform transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Top Branding Section — pinned */}
        <div className={`shrink-0 p-6 bg-[#ffffff] flex items-center border-b border-white/5 transition-all duration-300 ${isCollapsed ? 'justify-center px-4' : 'justify-between'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm border border-gray-100">
              <img src="/logo.png" alt="CivicTree Logo" className="w-7 h-7 object-contain" />
            </div>
            {!isCollapsed && (
              <span className="font-serif font-bold text-lg tracking-wider text-primary">CivicTree</span>
            )}
          </div>
          
          {/* Close button for mobile screen */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 text-white/80 hover:bg-white/20 hover:text-white md:hidden transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Links — scrollable */}
        <nav className={`flex-1 min-h-0 overflow-y-auto p-4 space-y-4 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {isCollapsed ? (
                <div className="border-b border-white/5 my-2 mx-2" />
              ) : (
                <span className="text-[10px] uppercase font-bold text-white/40 tracking-wider px-4 select-none">
                  {group.title}
                </span>
              )}
              <div className="space-y-1 pt-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    title={isCollapsed ? item.name : undefined}
                    className={({ isActive }) =>
                      `flex items-center rounded-xl text-sm font-sans font-medium transition-all duration-200 group border-l-4 ${
                        isCollapsed ? 'justify-center p-2.5' : 'space-x-3.5 px-4 py-2.5'
                      } ${
                        isActive
                          ? 'bg-white/10 text-[#dfba60] border-[#dfba60] font-semibold shadow-inner'
                          : 'text-white/70 border-transparent hover:bg-white/5 hover:text-white'
                      }`
                    }
                  >
                    <span className="text-current transition-colors duration-200">
                      {item.icon}
                    </span>
                    {!isCollapsed && <span>{item.name}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile & Logout Section */}
        <div className={`p-4 border-t border-[#ffffff]/10 transition-all duration-300 ${isCollapsed ? 'px-2' : ''}`}>
          <div 
            onClick={() => navigate('/admin/settings')}
            title="View Profile Settings"
            className={`flex items-center rounded-xl bg-white/5 hover:bg-white/10 mb-3 cursor-pointer transition-all duration-200 ${isCollapsed ? 'justify-center p-1.5' : 'space-x-3 px-3 py-2.5'}`}
          >
            <div className="w-9 h-9 rounded-full bg-light-green/20 flex items-center justify-center border border-light-green/30 text-[#dfba60] font-bold text-sm shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate leading-tight">{user?.name || 'Admin User'}</p>
                <p className="text-[10px] text-white/50 truncate mt-0.5">{user?.role || 'Administrator'}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Log Out" : undefined}
            className={`w-full flex items-center rounded-xl text-sm font-sans font-medium text-red-200 hover:bg-red-500/10 hover:text-red-100 transition-all duration-200 cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'space-x-3 px-4 py-2.5'
            }`}
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
