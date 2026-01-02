import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import About from "./pages/About";
import ListingDetail from "./pages/ListingDetail";
import NotFound from "./pages/NotFound";
import RoleSelection from "./pages/RoleSelection";
import CustomerAuth from "./pages/auth/CustomerAuth";
import VendorAuth from "./pages/auth/VendorAuth";
import AdminAuth from "./pages/auth/AdminAuth";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyReset from "./pages/auth/VerifyReset";
import ResetPassword from "./pages/auth/ResetPassword";
import VendorOnboarding from "./pages/onboarding/VendorOnboarding";
import CustomerOnboarding from "./pages/onboarding/CustomerOnboarding";
import VendorLayout from "./pages/vendor/Layout";
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorMessages from "./pages/vendor/Messages";
import VendorProfile from "./pages/vendor/Profile";
import VendorFavorites from "./pages/vendor/Favorites";
import CustomerDashboard from "./pages/customer/Dashboard";
import CustomerMyPosts from "./pages/customer/MyPosts";
import CustomerMessages from "./pages/customer/Messages";
import CustomerProfile from "./pages/customer/Profile";
import CustomerPostJob from "./pages/customer/PostJob";
import CustomerEditJob from "./pages/customer/EditJob";
import AdminLayout from "./pages/admin/Layout";
import AdminUsers from "./pages/admin/Users";
import AdminVendors from "./pages/admin/Vendors";
import AdminListings from "./pages/admin/Listings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<VendorLayout />}>
              <Route index element={<VendorDashboard />} />
            </Route>
            <Route path="/about" element={<About />} />
            <Route path="/listing/:id" element={<ListingDetail />} />
            <Route path="/auth" element={<RoleSelection />} />
            <Route path="/auth/customer" element={<CustomerAuth />} />
            <Route path="/auth/vendor" element={<VendorAuth />} />
            <Route path="/auth/admin" element={<AdminAuth />} />
            <Route path="/auth/verify-email" element={<VerifyEmail />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/verify-reset" element={<VerifyReset />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding/customer" element={<CustomerOnboarding />} />
            <Route path="/onboarding/vendor" element={<VendorOnboarding />} />
            <Route path="/vendor" element={
              <ProtectedRoute requireRole="vendor">
                <VendorLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<VendorDashboard />} />
              <Route path="messages" element={<VendorMessages />} />
              <Route path="messages/:id" element={<VendorMessages />} />
              <Route path="profile" element={<VendorProfile />} />
              <Route path="favorites" element={<VendorFavorites />} />
            </Route>
            <Route path="/admin" element={
              <ProtectedRoute requireRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route path="users" element={<AdminUsers />} />
              <Route path="vendors" element={<AdminVendors />} />
              <Route path="listings" element={<AdminListings />} />
            </Route>
            <Route path="/customer" element={
              <ProtectedRoute requireRole="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }>
              <Route path="my-posts" element={<CustomerMyPosts />} />
              <Route path="messages" element={<CustomerMessages />} />
              <Route path="messages/:id" element={<CustomerMessages />} />
              <Route path="profile" element={<CustomerProfile />} />
              <Route path="post-job" element={<CustomerPostJob />} />
              <Route path="edit-job/:id" element={<CustomerEditJob />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
