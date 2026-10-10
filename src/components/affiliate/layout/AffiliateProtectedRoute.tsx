import { Navigate, Outlet } from 'react-router-dom'
import { useAffiliateAuthStore } from '../../../stores/affiliateStore'

export default function AffiliateProtectedRoute() {
  const { isAuthenticated, affiliateUser } = useAffiliateAuthStore()

  if (!isAuthenticated || !affiliateUser) {
    return <Navigate to="/affiliate/login" replace />
  }

  return <Outlet />
}
