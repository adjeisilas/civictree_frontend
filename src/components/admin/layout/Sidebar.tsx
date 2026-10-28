import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../services/authStore'
import { useLogout } from '../../../hooks/useAuth'
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  FileBarChart,
  Handshake,
  LayoutGrid,
  LogOut,
  MessageSquare,
  Settings,
  ShoppingBag,
  Ticket,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'

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

  const menuGroups: { title: string; items: { name: string; path: string; icon: LucideIcon }[] }[] = [
    {
      title: 'General',
      items: [{ name: 'Dashboard', path: '/admin/dashboard', icon: LayoutGrid }],
    },
    {
      title: 'Management',
      items: [
        { name: 'Voucher stock', path: '/admin/vouchers', icon: Ticket },
        { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
        { name: 'Customers', path: '/admin/customers', icon: Users },
        { name: 'Timetables', path: '/admin/timetables', icon: CalendarDays },
        { name: 'Administrators', path: '/admin/users', icon: UserCog },
        { name: 'Affiliates', path: '/admin/affiliates', icon: Handshake },
      ],
    },
    {
      title: 'Tools & reports',
      items: [
        { name: 'SMS', path: '/admin/sms', icon: MessageSquare },
        { name: 'Reports', path: '/admin/reports', icon: FileBarChart },
        { name: 'Settings', path: '/admin/settings', icon: Settings },
        { name: 'Notifications', path: '/admin/notifications', icon: Bell },
      ],
    },
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
            className="hidden md:flex absolute top-[22px] right-[-11px] w-[22px] h-[22px] rounded-full bg-white border border-gray-200 text-gray-500 items-center justify-center hover:text-text-primary hover:border-gray-300 cursor-pointer transition-colors z-50"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <ChevronLeft
              className={`w-3.5 h-3.5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`}
              strokeWidth={2}
            />
          </button>
        )}

        {/* Top Branding Section — pinned */}
        <div className={`shrink-0 h-15 flex items-center border-b border-white/10 transition-all duration-300 ${isCollapsed ? 'justify-center px-3' : 'justify-between px-5'}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-md bg-white flex items-center justify-center overflow-hidden shrink-0">
              <img src="/logo.png" alt="" className="w-6 h-6 object-contain" />
            </div>
            {!isCollapsed && (
              <span className="font-heading text-[17px] tracking-wide text-white truncate">CivicTree</span>
            )}
          </div>
          
          {/* Close button for mobile screen */}
          <button
            onClick={onClose}
            className="p-2 -mr-2 rounded-md text-white/70 hover:bg-white/10 hover:text-white md:hidden transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Navigation Links — scrollable */}
        <nav className={`flex-1 min-h-0 overflow-y-auto py-4 space-y-5 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          {menuGroups.map((group) => (
            <div key={group.title} className="space-y-0.5">
              {isCollapsed ? (
                <div className="border-b border-white/5 my-2 mx-2" />
              ) : (
                <span className="block text-[11px] font-medium text-white/40 px-3 pb-1 select-none">
                  {group.title}
                </span>
              )}
              <div className="space-y-1 pt-1">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={onClose}
                      title={isCollapsed ? item.name : undefined}
                      className={({ isActive }) =>
                        `flex items-center rounded-md text-sm font-sans transition-colors ${
                          isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
                        } ${
                          isActive
                            ? 'bg-white/12 text-white font-medium'
                            : 'text-white/65 hover:bg-white/6 hover:text-white'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-[#dfba60]' : ''}`}
                            strokeWidth={1.75}
                          />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </>
                      )}
                    </NavLink>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile & Logout Section */}
        <div className={`py-3 border-t border-white/10 transition-all duration-300 ${isCollapsed ? 'px-2' : 'px-3'}`}>
          <div 
            onClick={() => navigate('/admin/settings')}
            title="View Profile Settings"
            className={`flex items-center rounded-md hover:bg-white/8 mb-1 cursor-pointer transition-colors ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'}`}
          >
            <div className="w-8 h-8 rounded-full bg-white/12 flex items-center justify-center text-[#dfba60] font-semibold text-xs shrink-0">
              {user?.name?.charAt(0) || 'A'}
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate leading-tight">{user?.name || 'Admin user'}</p>
                <p className="text-[11px] text-white/50 truncate mt-0.5">{user?.role || 'Administrator'}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            title={isCollapsed ? "Log Out" : undefined}
            className={`w-full flex items-center rounded-md text-sm font-sans text-white/65 hover:bg-white/8 hover:text-white transition-colors cursor-pointer ${
              isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'
            }`}
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" strokeWidth={1.75} />
            {!isCollapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
