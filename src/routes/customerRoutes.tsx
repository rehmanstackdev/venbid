import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import CustomerDashboard from "@/pages/customer/Dashboard";
import CustomerMyPosts from "@/pages/customer/MyPosts";
import CustomerMessages from "@/pages/customer/Messages";
import CustomerProfile from "@/pages/customer/Profile";
import CustomerEditJob from "@/pages/customer/EditJob";
import CustomerFavorites from "@/pages/customer/Favorites";

export function CustomerRoutes() {
  return (
    <>
      <Route path="/customer" element={
        <ProtectedRoute requireRole="customer">
          <CustomerDashboard />
        </ProtectedRoute>
      }>
        <Route path="my-posts" element={<CustomerMyPosts />} />
        <Route path="profile" element={<CustomerProfile />} />
        <Route path="favorites" element={<CustomerFavorites />} />
        <Route path="edit-job/:id" element={<CustomerEditJob />} />
      </Route>
      <Route path="/customer/messages" element={
        <ProtectedRoute requireRole="customer">
          <CustomerMessages />
        </ProtectedRoute>
      } />
      <Route path="/customer/messages/:id" element={
        <ProtectedRoute requireRole="customer">
          <CustomerMessages />
        </ProtectedRoute>
      } />
    </>
  );
}
