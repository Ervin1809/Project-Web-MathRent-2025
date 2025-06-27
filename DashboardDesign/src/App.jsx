import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import StaffDashboard from './components/DashboardStaff/StaffDashboard';
import StaffLayout from './components/DashboardStaff/StaffLayout';
import StaffRiwayat from './components/DashboardStaff/StaffRiwayat';
import StaffDataBarang from './components/DashboardStaff/StaffDataBarang';
import ProductDetail from './components/DashboardMahasiswa/ItemComponent/ItemDetail'; // Add this import
import MahasiswaDashboard from './components/DashboardMahasiswa/MahasiswaDashboard';
import MahasiswaLayout from './components/DashboardMahasiswa/MahasiswaLayout';
import MahasiswaSettings from './components/DashboardMahasiswa/MahasiswaSettings';
import MahasiswaHistory from './components/DashboardMahasiswa/MahasiswaHistory';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Temporary Staff Dashboard Component
// const StaffDashboard = () => <div><h1>Staff Dashboard</h1></div>;

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />

      {/* Auth Routes */}
      <Route path="/login" element={
        isAuthenticated ?
          <Navigate to={user?.role === 'staff' ? '/staff/dashboard' : '/mahasiswa/dashboard'} replace /> :
          <Login />
      } />

      <Route path="/register" element={
        isAuthenticated ?
          <Navigate to={user?.role === 'staff' ? '/staff/dashboard' : '/mahasiswa/dashboard'} replace /> :
          <Register />
      } />



      {/* Dashboard Routes */}
      <Route path="/staff" element={
        <ProtectedRoute requiredRole="staff">
          <StaffLayout>
            <StaffDashboard />
          </StaffLayout>
        </ProtectedRoute>
      } />
      <Route path="/staff/dashboard" element={
        <ProtectedRoute requiredRole="staff">
          <StaffLayout>
            <StaffDashboard />
          </StaffLayout>
        </ProtectedRoute>
      } />
      <Route path="/staff/riwayat" element={
        <ProtectedRoute requiredRole="staff">
          <StaffLayout>
            <StaffRiwayat />
          </StaffLayout>
        </ProtectedRoute>
      } />
      <Route path="/staff/databarang" element={
        <ProtectedRoute requiredRole="staff">
          <StaffLayout>
            <StaffDataBarang />
          </StaffLayout>
        </ProtectedRoute>
      } />


      {/* Mahasiswa Rutes */}
      <Route path="/mahasiswa/dashboard" element={
        <ProtectedRoute requiredRole="mahasiswa">
          <MahasiswaLayout>
            <MahasiswaDashboard />
          </MahasiswaLayout>
        </ProtectedRoute>
      } />

      <Route path="/mahasiswa/settings" element={
        <ProtectedRoute requiredRole="mahasiswa">
          <MahasiswaLayout>
            <MahasiswaSettings />
          </MahasiswaLayout>
        </ProtectedRoute>
      } />

      {/* Product Detail Routes - Add these */}
      <Route path="/mahasiswa/detail/:type/:id" element={
        <ProtectedRoute requiredRole="mahasiswa">
          <ProductDetail />
        </ProtectedRoute>
      } />

      <Route path="/mahasiswa/history" element={
        <ProtectedRoute requiredRole="mahasiswa">
          <MahasiswaHistory />
        </ProtectedRoute>
      } />

      <Route path="/unauthorized" element={<div>Unauthorized Access</div>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppContent />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;