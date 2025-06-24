import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './components/LandingPage';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MahasiswaDashboard from './components/Dashboard/MahasiswaDashboard'; // Add this import
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
const StaffDashboard = () => <div><h1>Staff Dashboard</h1></div>;

const AppContent = () => {
  const { isAuthenticated, user } = useAuth();
  
  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<LandingPage />} />

      {/* About Page */}
      <Route path="/about" element={<About/>} />

      {/* Contact Page */}
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
      <Route path="/staff/dashboard" element={
        <ProtectedRoute requiredRole="staff">
          <StaffDashboard />
        </ProtectedRoute>
      } />
      
      <Route path="/mahasiswa/dashboard" element={
        <ProtectedRoute requiredRole="mahasiswa">
          <MahasiswaDashboard /> {/* Use the actual component */}
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