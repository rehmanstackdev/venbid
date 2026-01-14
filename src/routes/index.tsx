import { Routes, Route } from "react-router-dom";
import About from "@/pages/About";
import ListingDetail from "@/pages/ListingDetail";
import NotFound from "@/pages/NotFound";
import RoleSelection from "@/pages/RoleSelection";
import CustomerAuth from "@/pages/auth/CustomerAuth";
import VendorAuth from "@/pages/auth/VendorAuth";
import AdminAuth from "@/pages/auth/AdminAuth";
import VerifyEmail from "@/pages/auth/VerifyEmail";
import RequestEmailVerification from "@/pages/auth/RequestEmailVerification";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import VerifyReset from "@/pages/auth/VerifyReset";
import ResetPassword from "@/pages/auth/ResetPassword";
import VendorOnboarding from "@/pages/onboarding/VendorOnboarding";
import CustomerOnboarding from "@/pages/onboarding/CustomerOnboarding";
import PublicLayout from "@/pages/public/Layout";
import PublicDashboard from "@/pages/public/Dashboard";
import CustomerPostJob from "@/pages/customer/PostJob";
import { AdminRoutes } from "./adminRoutes";
import { VendorRoutes } from "./vendorRoutes";
import { CustomerRoutes } from "./customerRoutes";

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<PublicDashboard />} />
      </Route>
      <Route path="/about" element={<About />} />
      <Route path="/listing/:id" element={<ListingDetail />} />
      <Route path="/post-job" element={<CustomerPostJob />} />

      {/* Auth Routes */}
      <Route path="/auth" element={<RoleSelection />} />
      <Route path="/auth/customer" element={<CustomerAuth />} />
      <Route path="/auth/vendor" element={<VendorAuth />} />
      <Route path="/auth/admin" element={<AdminAuth />} />
      <Route path="/auth/request-verification" element={<RequestEmailVerification />} />
      <Route path="/auth/verify-email" element={<VerifyEmail />} />
      <Route path="/auth/verify-otp" element={<VerifyEmail />} />
      <Route path="/auth/forgot-password" element={<ForgotPassword />} />
      <Route path="/auth/verify-reset" element={<VerifyReset />} />
      <Route path="/auth/reset-password" element={<ResetPassword />} />

      {/* Onboarding Routes */}
      <Route path="/onboarding/customer" element={<CustomerOnboarding />} />
      <Route path="/onboarding/vendor" element={<VendorOnboarding />} />

      {/* Vendor Routes */}
      {VendorRoutes()}

      {/* Customer Routes */}
      {CustomerRoutes()}

      {/* Admin Routes */}
      {AdminRoutes()}

      {/* 404 Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
