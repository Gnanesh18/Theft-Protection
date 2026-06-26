import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import CitizenLogin from './pages/CitizenLogin';
import OfficerLogin from './pages/OfficerLogin';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import CitizenRegister from './pages/CitizenRegister';
import OfficerRegister from './pages/OfficerRegister';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportTheft from './pages/ReportTheft';
import CaseTracking from './pages/CaseTracking';
import OfficerDashboard from './pages/OfficerDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Route Protection Gates
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-mono text-xs text-slate-light">
        VERIFYING PORTAL ACCREDITATION STATUS...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect unauthorized users to their dashboard
    if (user.role === 'citizen') return <Navigate to="/citizen" replace />;
    if (user.role === 'officer') return <Navigate to="/officer" replace />;
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          {/* Public Views */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/citizen" element={<CitizenLogin />} />
          <Route path="/login/officer" element={<OfficerLogin />} />
          <Route path="/login/admin" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/register/citizen" element={<CitizenRegister />} />
          <Route path="/register/officer" element={<OfficerRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:id" element={<ResetPassword />} />
          <Route path="/track-case" element={<CaseTracking />} />

          {/* Secure Citizen Views */}
          <Route
            path="/citizen"
            element={
              <PrivateRoute allowedRoles={['citizen']}>
                <CitizenDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/citizen/report"
            element={
              <PrivateRoute allowedRoles={['citizen']}>
                <ReportTheft />
              </PrivateRoute>
            }
          />
          <Route
            path="/citizen/track/:caseId"
            element={
              <PrivateRoute allowedRoles={['citizen']}>
                <CaseTracking />
              </PrivateRoute>
            }
          />

          {/* Secure Officer Views */}
          <Route
            path="/officer"
            element={
              <PrivateRoute allowedRoles={['officer', 'admin']}>
                <OfficerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/officer/case/:caseId"
            element={
              <PrivateRoute allowedRoles={['officer', 'admin']}>
                <CaseTracking />
              </PrivateRoute>
            }
          />

          {/* Secure Admin Views */}
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          {/* Secure Shared Views */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Redirect gate */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;