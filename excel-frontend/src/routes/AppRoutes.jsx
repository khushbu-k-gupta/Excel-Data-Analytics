import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Landing from "../pages/Landing";
import Dashboard from "../pages/dashboard/Dashboard";
import Analytics from "../pages/analytics/page";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={<ProtectedRoute>{<Dashboard />}</ProtectedRoute>}
      />
      {/* <Route
        path="/charts"
        element={<ProtectedRoute>{<Charts />}</ProtectedRoute>}
      /> */}
      <Route
        path="/analytics/:fileId"
        element={<ProtectedRoute>{<Analytics/>}</ProtectedRoute>}
      />
    </Routes>
  );
};

export default AppRoutes;
