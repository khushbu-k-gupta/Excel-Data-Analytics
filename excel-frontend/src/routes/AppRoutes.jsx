import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Landing from "../pages/Landing";
import Dashboard from "../pages/dashboard/Dashboard";
import Analytics from "../pages/analytics/page";
import AdminLayout from "../components/layout/AdminLayout";
import AdminOverview from "../pages/admin/AdminOverview";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminFiles from "../pages/admin/AdminFiles";
import AdminRoute from "./AdminRoute";
import Charts from "../pages/charts/Charts";
import NotFound from "../pages/NotFound";
import UserLayout from "../components/layout/UserLayout";
import AdminUserDetail from "../pages/admin/AdminUserDetail";
import Profile from "../pages/profile/Profile";

const AppRoutes = () => {
  return (
    <Routes>
      
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<UserLayout />}>
        <Route path="/" element={<Landing />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/charts"
          element={
            <ProtectedRoute>
              <Charts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics/:fileId"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminOverview />} /> 
        <Route path="users" element={<AdminUsers />} /> 
        <Route path="files" element={<AdminFiles />} />
        <Route path="users/:id" element={<AdminUserDetail />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
export default AppRoutes;
