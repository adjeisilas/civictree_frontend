import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../../services/authStore'

export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login page but save the current location they tried to go to
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return <Outlet />
}
