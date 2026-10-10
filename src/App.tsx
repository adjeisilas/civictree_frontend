import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import {
  HomePage,
  BuyVoucherPage,
  PricingPage,
  TimetablePage,
  ContactPage,
  DisclaimerPage,
  HelpPage,
  VerifyPaymentPage,
  CancelPaymentPage,
  PortalsPage,
} from "./pages/website";
import AffiliateRegisterPage from "./pages/website/AffiliateRegisterPage";
import AffiliateLoginPage from "./pages/website/AffiliateLoginPage";
import Login from "./pages/admin/Login";
import ForgotPassword from "./pages/admin/ForgotPassword";
import VerifyOtp from "./pages/admin/VerifyOtp";
import TwoFactorChallenge from "./pages/admin/TwoFactorChallenge";
import ResetPassword from "./pages/admin/ResetPassword";
import Dashboard from "./pages/admin/Dashboard";
import Vouchers from "./pages/admin/Vouchers";
import Orders from "./pages/admin/Orders";
import Customers from "./pages/admin/Customers";
import SMS from "./pages/admin/SMS";
import Reports from "./pages/admin/Reports";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/admin/Profile";
import Notifications from "./pages/admin/Notifications";
import Users from "./pages/admin/Users";
import Timetables from "./pages/admin/Timetables";
import Affiliates from "./pages/admin/Affiliates";
import AffiliateDetailsPage from "./pages/admin/AffiliateDetailsPage";
import AdminLayout from "./components/admin/layout/AdminLayout";
import ProtectedRoute from "./components/admin/layout/ProtectedRoute";
import AffiliateLayout from "./components/affiliate/layout/AffiliateLayout";
import AffiliateProtectedRoute from "./components/affiliate/layout/AffiliateProtectedRoute";
import AffiliateDashboard from "./pages/affiliate/AffiliateDashboard";
import AffiliateSalesPage from "./pages/affiliate/AffiliateSalesPage";
import AffiliateEarningsPage from "./pages/affiliate/AffiliateEarningsPage";
import AffiliateWithdrawalsPage from "./pages/affiliate/AffiliateWithdrawalsPage";
import AffiliateProfilePage from "./pages/affiliate/AffiliateProfilePage";

// Partner & Stakeholder Pages (Commented out)
// import PartnerLoginPage from "./pages/partner/PartnerLoginPage";
// import PartnerLayout from "./components/partner/layout/PartnerLayout";
// import PartnerProtectedRoute from "./components/partner/layout/PartnerProtectedRoute";
// import PartnerDashboard from "./pages/partner/PartnerDashboard";
// import PartnerTransactionsPage from "./pages/partner/PartnerTransactionsPage";
// import PartnerReportsPage from "./pages/partner/PartnerReportsPage";
// import PartnerSettlementsPage from "./pages/partner/PartnerSettlementsPage";
// import PartnerNotificationsPage from "./pages/partner/PartnerNotificationsPage";
// import PartnerProfilePage from "./pages/partner/PartnerProfilePage";
// import PartnerSettingsPage from "./pages/partner/PartnerSettingsPage";

function ScrollToTop({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return children;
}

function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop>
          <AnimatePresence mode="wait">
            <Routes>
              {/* Website Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/buy-voucher" element={<BuyVoucherPage />} />
              <Route path="/purchase/verify" element={<VerifyPaymentPage />} />
              <Route path="/purchase/cancel" element={<CancelPaymentPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/timetable" element={<TimetablePage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/disclaimer" element={<DisclaimerPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/portals" element={<PortalsPage />} />

              {/* Affiliate Public Routes */}
              <Route path="/become-affiliate" element={<AffiliateRegisterPage />} />
              <Route path="/affiliate/login" element={<AffiliateLoginPage />} />

              {/* Affiliate Portal — Protected */}
              <Route path="/affiliate" element={<AffiliateProtectedRoute />}>
                <Route element={<AffiliateLayout />}>
                  <Route index element={<Navigate to="/affiliate/dashboard" replace />} />
                  <Route path="dashboard" element={<AffiliateDashboard />} />
                  <Route path="sales" element={<AffiliateSalesPage />} />
                  <Route path="earnings" element={<AffiliateEarningsPage />} />
                  <Route path="withdrawals" element={<AffiliateWithdrawalsPage />} />
                  <Route path="profile" element={<AffiliateProfilePage />} />
                </Route>
              </Route>

              {/* Revenue Partner Portal (Commented out) */}
              {/* <Route path="/partner/login" element={<PartnerLoginPage />} />
              <Route path="/partner" element={<PartnerProtectedRoute />}>
                <Route element={<PartnerLayout />}>
                  <Route index element={<Navigate to="/partner/dashboard" replace />} />
                  <Route path="dashboard" element={<PartnerDashboard />} />
                  <Route path="transactions" element={<PartnerTransactionsPage />} />
                  <Route path="reports" element={<PartnerReportsPage />} />
                  <Route path="settlements" element={<PartnerSettlementsPage />} />
                  <Route path="notifications" element={<PartnerNotificationsPage />} />
                  <Route path="profile" element={<PartnerProfilePage />} />
                  <Route path="settings" element={<PartnerSettingsPage />} />
                </Route>
              </Route> */}

              <Route path="/admin/login" element={<Login />} />
              <Route
                path="/admin/forgot-password"
                element={<ForgotPassword />}
              />
              <Route path="/admin/verify-otp" element={<VerifyOtp />} />
              <Route path="/admin/two-factor" element={<TwoFactorChallenge />} />
              <Route path="/admin/reset-password" element={<ResetPassword />} />

              {/* Protected Administrative Routes */}
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route
                    index
                    element={<Navigate to="/admin/dashboard" replace />}
                  />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="vouchers" element={<Vouchers />} />
                  <Route path="orders" element={<Orders />} />
                  <Route path="customers" element={<Customers />} />
                  <Route path="timetables" element={<Timetables />} />
                  <Route path="sms" element={<SMS />} />
                  <Route path="reports" element={<Reports />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="notifications" element={<Notifications />} />
                  <Route path="users" element={<Users />} />
                  <Route path="affiliates" element={<Affiliates />} />
                  <Route path="affiliates/:id" element={<AffiliateDetailsPage />} />
                </Route>
              </Route>

              {/* Fallback Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
        </ScrollToTop>
      </Router>
    </HelmetProvider>
  );
}


export default App;
