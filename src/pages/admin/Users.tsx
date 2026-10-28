import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import UserDetailsPage from '../../components/admin/users/UserDetailsPage'
import type { AdminUser } from '../../types/admin'
import { useAdminUsers, useActivityLogs, useCreateUser, useUpdateUser, useUpdateUserStatus, useDeleteUser } from '../../hooks/useUsers'

export default function Users() {
  const [usersPage, setUsersPage] = useState(1)
  const [logsPage, setLogsPage] = useState(1)
  const USERS_PER_PAGE = 10

  // Selection states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  
  const { data, isLoading: loading, error } = useAdminUsers(usersPage, USERS_PER_PAGE)
  const { data: logsData, isLoading: loadingLogs } = useActivityLogs(logsPage, 10, selectedUser?.id)
  const users = data?.users || []
  const usersPagination = data?.pagination || { page: 1, limit: USERS_PER_PAGE, totalResults: 0, totalPages: 1 }
  const logs = logsData?.logs || []
  const pagination = logsData?.pagination || { page: 1, limit: 10, totalResults: 0, totalPages: 1 }

  const [activeTab, setActiveTab] = useState<'admins' | 'audit'>('admins')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Search & filter states for Admins tab
  const [adminSearch, setAdminSearch] = useState('')
  const [adminRoleFilter, setAdminRoleFilter] = useState('ALL')
  const [adminStatusFilter, setAdminStatusFilter] = useState('ALL')

  // Search & filter states for Audit Logs tab
  const [logSearch, setLogSearch] = useState('')
  const [logCategoryFilter, setLogCategoryFilter] = useState('ALL')
  const [logStatusFilter, setLogStatusFilter] = useState('ALL')

  // Add user modal state
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPhone, setNewUserPhone] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState('ADMIN')
  const [newUserStatus, setNewUserStatus] = useState('Active')
  const [newUserAvatarColor, setNewUserAvatarColor] = useState('Forest Green')
  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUser()
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateUserStatus()
  const { mutate: createUser, isPending: isCreatingUser } = useCreateUser()
  const { mutate: deleteUser } = useDeleteUser()

  // Action simulators
  const triggerToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }


  const closeModal = () => {
    setShowAddUserModal(false)
    setEditingUser(null)
    setNewUserName('')
    setNewUserEmail('')
    setNewUserPhone('')
    setNewUserPassword('')
    setNewUserRole('ADMIN')
    setNewUserStatus('Active')
    setNewUserAvatarColor('Forest Green')
  }

  const openEditModal = (usr: AdminUser) => {
    setEditingUser(usr)
    setNewUserName(usr.name || '')
    setNewUserEmail(usr.email || '')
    setNewUserPhone(usr.phone || '')
    setNewUserRole(usr.role || 'ADMIN')
    setNewUserStatus(usr.status || 'Active')
    setNewUserAvatarColor(usr.avatarColor || 'Forest Green')
    setNewUserPassword('') // Empty password for edit mode
    setShowAddUserModal(true)
  }

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim() || !newUserEmail.trim()) return

    if (editingUser) {
      updateUser(
        {
          id: editingUser.id,
          payload: {
            fullName: newUserName,
            email: newUserEmail,
            phoneNumber: newUserPhone,
            role: newUserRole,
            ...(newUserPassword.trim() ? { password: newUserPassword } : {}),
          }
        },
        {
          onSuccess: () => {
            if (newUserStatus !== editingUser.status) {
              updateStatus({ id: editingUser.id, isActive: newUserStatus === 'Active' })
            }
            if (selectedUser && selectedUser.id === editingUser.id) {
              setSelectedUser({ ...selectedUser, name: newUserName, email: newUserEmail, phone: newUserPhone, role: newUserRole, status: newUserStatus })
            }
            closeModal()
            triggerToast(`Successfully updated account for ${newUserName}`)
          },
          onError: () => {
            triggerToast(`Failed to update account for ${newUserName}`)
          }
        }
      )
    } else {
      if (!newUserPassword.trim()) return
      createUser(
        {
          fullName: newUserName,
          email: newUserEmail,
          phoneNumber: newUserPhone,
          role: newUserRole,
          password: newUserPassword,
        },
        {
          onSuccess: () => {
            closeModal()
            triggerToast(`Account created successfully for ${newUserName}`)
          },
          onError: () => {
            triggerToast(`Failed to create account for ${newUserName}`)
          }
        }
      )
    }
  }

  // Filter processors
  const filteredUsers = users.filter(usr => {
    const matchesSearch = usr.name.toLowerCase().includes(adminSearch.toLowerCase()) || 
                          usr.email.toLowerCase().includes(adminSearch.toLowerCase())
    const matchesRole = adminRoleFilter === 'ALL' || usr.role === adminRoleFilter
    const matchesStatus = adminStatusFilter === 'ALL' || usr.status === adminStatusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(logSearch.toLowerCase()) ||
                          log.userName.toLowerCase().includes(logSearch.toLowerCase())
    const matchesCategory = logCategoryFilter === 'ALL' || log.category === logCategoryFilter
    const matchesStatus = logStatusFilter === 'ALL' || log.status === logStatusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

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

  // Move selected user check down into render

  if (loading || loadingLogs) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <svg className="w-10 h-10 text-primary animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="text-xs font-bold text-gray-400 animate-pulse">Loading administration directories...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-lg flex items-center space-x-3">
        <TriangleAlert className="w-5 h-5 shrink-0" strokeWidth={1.75} />
        <p className="text-xs font-semibold">{error.message}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Messages */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-primary border border-accent text-white px-4 py-3 rounded-xl shadow-lg z-50 animate-bounce flex items-center space-x-2 text-xs font-semibold">
          <svg className="w-4 h-4 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Page or Details View */}
      {selectedUser ? (
        <UserDetailsPage
          user={selectedUser}
          activities={logs}
          pagination={pagination}
          onPageChange={setLogsPage}
          onBack={() => { setSelectedUser(null); setLogsPage(1); }}
          onOpenEditModal={() => openEditModal(selectedUser)}
        />
      ) : (
        <>
          {/* Main Page Title Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-1">
        <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-heading text-[26px] leading-tight text-text-primary">Administrators Directory & Audit Logs</h2>
            <p className="text-[13px] text-gray-600 mt-1 max-w-3xl">
              Manage internal administrative accounts, roles, access permissions, and monitor the global system audit log.
            </p>
          </div>
          
          {activeTab === 'admins' && (
            <button
              onClick={() => { closeModal(); setShowAddUserModal(true); }}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-[#dfba60] active:scale-[0.98] text-primary text-xs font-bold rounded-xl transition-all shadow cursor-pointer self-start sm:self-center hover:bg-[#cfa54f]"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span>Add Administrator</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-gray-200 gap-6 text-xs font-bold uppercase select-none">
        <button
          onClick={() => setActiveTab('admins')}
          className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
            activeTab === 'admins' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Administrators Directory
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
            activeTab === 'audit' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          Global System Activity Logs
        </button>
      </div>

      {/* Tab Panels */}
      <div className="animate-fadeIn">
        {activeTab === 'admins' ? (
          <div className="space-y-6">
            {/* Toolbar Filters */}
            <div className="bg-white p-5 rounded-lg border border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search administrators by name or email..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder-gray-400 transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={adminRoleFilter}
                  onChange={(e) => setAdminRoleFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-600 cursor-pointer"
                >
                  <option value="ALL">Role: All</option>
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                </select>

                <select
                  value={adminStatusFilter}
                  onChange={(e) => setAdminStatusFilter(e.target.value)}
                  className="px-3.5 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-gray-600 cursor-pointer"
                >
                  <option value="ALL">Status: All</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Administrators Directory Table */}
            {filteredUsers.length === 0 ? (
              <div className="bg-white p-12 rounded-lg border border-gray-200 text-center">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm font-semibold uppercase text-gray-400 tracking-wider">No administrators matching search criteria</p>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
                <table className="w-full border-collapse text-left text-xs text-text-primary font-sans">
                  <thead>
                    <tr className="bg-gray-50/70 text-gray-400 text-xs font-bold uppercase border-b border-gray-200">
                      <th className="px-5 py-4">Operator</th>
                      <th className="px-5 py-4">Contact Details</th>
                      <th className="px-5 py-4">Joined</th>
                      <th className="px-5 py-4">Status</th>
                      <th className="px-5 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {filteredUsers.map((usr) => (
                      <tr key={usr.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center space-x-3.5">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 select-none ${getAvatarClasses(usr.avatarColor || 'Forest Green')}`}>
                              {usr?.name?.charAt(0) || 'A'}
                            </div>
                            <div>
                              <h4 className="font-serif font-bold text-primary text-sm">{usr.name}</h4>
                              <p className="text-xs text-gray-400 font-bold mt-0.5">{usr.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-600 truncate max-w-[170px]" title={usr.email}>{usr.email}</p>
                          <p className="text-gray-400 font-mono mt-0.5">{usr.phone || 'N/A'}</p>
                        </td>
                        <td className="px-5 py-4 text-gray-500 font-semibold">
                          {usr.createdAt ? new Date(usr.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            usr.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                          }`}>
                            {usr.status}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end space-x-3 text-gray-400">
                            {/* View Action */}
                            <button
                              onClick={() => setSelectedUser(usr)}
                              className="p-1.5 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                              title="View Details"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            {/* Edit Action */}
                            <button
                              onClick={() => openEditModal(usr)}
                              className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit User"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {/* Delete Action */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if(window.confirm(`Are you sure you want to delete ${usr.name}?`)) {
                                  deleteUser(usr.id, {
                                    onSuccess: () => triggerToast(`Successfully deleted ${usr.name}`),
                                    onError: () => triggerToast(`Failed to delete ${usr.name}`)
                                  })
                                }
                              }}
                              className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete User"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Users Table Pagination */}
            {usersPagination.totalPages > 1 && (
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mt-4">
                <div className="text-xs font-semibold text-gray-400">
                  Showing <span className="font-bold text-primary">{(usersPagination.page - 1) * usersPagination.limit + 1}</span> to <span className="font-bold text-primary">{Math.min(usersPagination.page * usersPagination.limit, usersPagination.totalResults)}</span> of <span className="font-bold text-primary">{usersPagination.totalResults}</span> administrators
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                    disabled={usersPage === 1}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold">
                    {usersPage} / {usersPagination.totalPages}
                  </span>
                  <button
                    onClick={() => setUsersPage(Math.min(usersPagination.totalPages, usersPage + 1))}
                    disabled={usersPage >= usersPagination.totalPages}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* System Activity Logs Tab Panel */
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-50 pb-4">
              <div>
                <h4 className="font-serif font-bold text-primary text-base">Global Audit Trail</h4>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Centralized logs of all system configurations, security audits, and inventory uploads</p>
              </div>

              <button
                onClick={() => triggerToast('Generating full audit log report... Download started.')}
                className="flex items-center space-x-1.5 text-xs font-bold text-secondary bg-white border border-gray-200 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer select-none"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Export Audit Logs</span>
              </button>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search logs by action details or admin user name..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-250 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary placeholder-gray-400"
                />
              </div>

              <div className="flex flex-wrap gap-2.5">
                <select
                  value={logCategoryFilter}
                  onChange={(e) => setLogCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-gray-600 cursor-pointer"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Security">Security</option>
                  <option value="Inventory">Inventory</option>
                  <option value="System">System</option>
                  <option value="Billing">Billing</option>
                  <option value="Customers">Customers</option>
                </select>

                <select
                  value={logStatusFilter}
                  onChange={(e) => setLogStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-gray-600 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Success">Success</option>
                  <option value="Warning">Warning</option>
                  <option value="Failed">Failed</option>
                  <option value="Info">Info</option>
                </select>
              </div>
            </div>

            {/* Global Logs Table */}
            {filteredLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 border border-dashed border-gray-200 rounded-lg">
                <svg className="w-10 h-10 mx-auto text-gray-300 mb-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-semibold text-gray-400">No global system logs match the parameters</p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl">
                <table className="w-full border-collapse text-left text-xs text-text-primary font-sans">
                  <thead>
                    <tr className="bg-gray-50/70 text-gray-400 text-[11px] font-bold uppercase border-b border-gray-200">
                      <th className="px-4 py-3.5">Timestamp</th>
                      <th className="px-4 py-3.5">Operator</th>
                      <th className="px-4 py-3.5">Category</th>
                      <th className="px-4 py-3.5">Operation Action</th>
                      <th className="px-4 py-3.5">IP Address</th>
                      <th className="px-4 py-3.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 font-medium">
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50/30 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-gray-400 font-semibold">{log.timestamp}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex flex-col">
                            <span className="font-bold text-primary">{log.userName}</span>
                            <span className="text-[11px] text-gray-400 font-mono mt-0.5">{log.role}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${
                            log.category === 'Security' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                            log.category === 'Inventory' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {log.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-gray-600 leading-normal max-w-sm">{log.action}</td>
                        <td className="px-4 py-3.5">
                          <div className="text-xs text-gray-400 leading-tight font-mono select-all">
                            <p>{log.ipAddress}</p>
                            <p className="text-[11px] truncate max-w-[120px]" title={log.device}>{log.device}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-bold uppercase ${
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
            <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl mt-4">
              <div className="text-xs font-semibold text-gray-400">
                Showing <span className="font-bold text-primary">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-bold text-primary">{Math.min(pagination.page * pagination.limit, pagination.totalResults)}</span> of <span className="font-bold text-primary">{pagination.totalResults}</span> logs
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setLogsPage(Math.max(1, pagination.page - 1))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <button
                  onClick={() => setLogsPage(Math.min(pagination.totalPages, pagination.page + 1))}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
            
          </div>
        )}
      </div>
      </>
      )}

      {/* Add User Drawer Overlay Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-lg w-full max-w-lg border border-gray-200 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto m-4 text-xs font-semibold text-gray-600">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <h3 className="text-base font-serif font-bold text-primary">{editingUser ? 'Edit Dashboard Operator' : 'Add New Dashboard Operator'}</h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1 rounded-lg bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Full Operator Name</label>
                  <input
                    type="text"
                    required
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Ama Serwaa"
                    className="w-full px-3 py-2 border border-gray-255 rounded-xl bg-gray-50/50 focus:outline-none focus:border-primary font-semibold text-text-primary text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. ama@civictree.com"
                    className="w-full px-3 py-2 border border-gray-255 rounded-xl bg-gray-50/50 focus:outline-none focus:border-primary font-semibold text-text-primary text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Acquisition Phone Number</label>
                  <input
                    type="text"
                    required
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="e.g. 0244 555 123"
                    className="w-full px-3 py-2 border border-gray-255 rounded-xl bg-gray-50/50 focus:outline-none focus:border-primary font-semibold text-text-primary text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">System Authority Role</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-255 rounded-xl bg-white focus:outline-none focus:border-primary text-text-primary cursor-pointer font-semibold text-xs"
                  >
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {editingUser && (
                  <div className="space-y-1.5">
                    <label className="text-gray-400 text-[11px]">Account Status</label>
                    <select
                      value={newUserStatus}
                      onChange={(e) => setNewUserStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-255 rounded-xl bg-white focus:outline-none focus:border-primary text-text-primary cursor-pointer font-semibold text-xs"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-gray-400 text-[11px]">Account Password {editingUser && '(Leave blank to keep)'}</label>
                  <input
                    type="password"
                    required={!editingUser}
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder={editingUser ? "Enter new password..." : "Enter secure password..."}
                    className="w-full px-3 py-2 border border-gray-255 rounded-xl bg-gray-50/50 focus:outline-none focus:border-primary font-semibold text-text-primary text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-gray-400 text-[11px]">Avatar Color Palette</label>
                <div className="flex gap-2">
                  {['Forest Green', 'Ocean Blue', 'Sunset Amber', 'Teal Lagoon', 'Grape Purple'].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewUserAvatarColor(color)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        newUserAvatarColor === color 
                          ? 'bg-primary text-white border-primary shadow' 
                          : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {color.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-gray-700 text-xs font-bold rounded-xl active:scale-98 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser || isUpdatingUser || isUpdatingStatus}
                  className="px-5 py-2 bg-primary text-white text-xs font-bold rounded-xl active:scale-98 hover:bg-primary-hover disabled:opacity-50 transition-all cursor-pointer inline-flex items-center space-x-1.5"
                >
                  {isCreatingUser || isUpdatingUser ? (
                    <>
                      <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>{editingUser ? 'Saving...' : 'Creating...'}</span>
                    </>
                  ) : (
                    <span>{editingUser ? 'Save Changes' : 'Create Account'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
