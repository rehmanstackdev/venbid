import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import VendorLayout from "@/pages/vendor/Layout";
import VendorLayoutWithSidebar from "@/pages/vendor/LayoutWithSidebar";
import VendorDashboard from "@/pages/vendor/Dashboard";
import VendorMessages from "@/pages/vendor/Messages";
import VendorProfile from "@/pages/vendor/Profile";
import VendorFavorites from "@/pages/vendor/Favorites";

export function VendorRoutes() {
  return (
    <>
      <Route path="/vendor/dashboard" element={
        <ProtectedRoute requireRole="vendor">
          <VendorLayout />
        </ProtectedRoute>
      }>
        <Route index element={<VendorDashboard />} />
      </Route>
      <Route path="/vendor" element={
        <ProtectedRoute requireRole="vendor">
          <VendorLayoutWithSidebar />
        </ProtectedRoute>
      }>
        <Route path="profile" element={<VendorProfile />} />
        <Route path="favorites" element={<VendorFavorites />} />
      </Route>
      <Route path="/vendor/messages" element={
        <ProtectedRoute requireRole="vendor">
          <VendorMessages />
        </ProtectedRoute>
      } />
      <Route path="/vendor/messages/:id" element={
        <ProtectedRoute requireRole="vendor">
          <VendorMessages />
        </ProtectedRoute>
      } />
    </>
  );
}
