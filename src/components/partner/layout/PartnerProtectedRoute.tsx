import { Navigate, Outlet } from 'react-router-dom'
import { usePartnerStore } from '../../../stores/partnerStore'

export default function PartnerProtectedRoute() {
  const { isAuthenticated } = usePartnerStore()

  if (!isAuthenticated) {
    return <Navigate to="/partner/login" replace />
  }

  return <Outlet />
}
