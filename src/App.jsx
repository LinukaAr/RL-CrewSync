import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLogin from "./components/MainLogin";
import AdminLogin from "./components/AdminLogin";
import RequestForm from "./components/RequestForm";
import StatusDashboard from "./components/StatusDashboard";
import AdminDashboard from "./components/AdminDashboard";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Main Login Page */}
          <Route path="/" element={<MainLogin />} />

          {/* Admin Login Page */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Camera Crew Request Form */}
          <Route path="/request-form" element={<RequestForm />} />

          {/* Camera Crew Status Dashboard */}
          <Route path="/camera-status" element={<StatusDashboard />} />

          {/* Admin Dashboard */}
          <Route
            path="/admin-dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;