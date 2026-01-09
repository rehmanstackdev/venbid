import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import AdminLayout from "@/pages/admin/Layout";
import AdminUsers from "@/pages/admin/Users";
import AdminVendors from "@/pages/admin/Vendors";
import AdminListings from "@/pages/admin/Listings";

export function AdminRoutes() {
  return (
    <Route path="/admin" element={
      <ProtectedRoute requireRole="admin">
        <AdminLayout />
      </ProtectedRoute>
    }>
      <Route path="users" element={<AdminUsers />} />
      <Route path="vendors" element={<AdminVendors />} />
      <Route path="listings" element={<AdminListings />} />
    </Route>
  );
}
