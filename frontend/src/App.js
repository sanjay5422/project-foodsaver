import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProviderDashboard from './pages/ProviderDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import AnalyticsPage from './pages/AnalyticsPage';
import GoogleAuthSuccess from './pages/GoogleAuthSuccess';
import './css/App.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const localRole = localStorage.getItem('foodsaver_role');
  const localToken = localStorage.getItem('foodsaver_token');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated && !localToken) {
    return <Navigate to="/login" />;
  }

  const userRole = (user?.role || localRole || '')
    .toString()
    .toLowerCase();

  if (requiredRole && userRole !== requiredRole.toLowerCase()) {
    console.log('Role mismatch:', userRole, requiredRole);
    return <Navigate to="/" />;
  }

  return children;
};

const AppRoutes = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route
          path="/provider"
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipient"
          element={
            <ProtectedRoute requiredRole="recipient">
              <RecipientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/provider/dashboard"
          element={
            <ProtectedRoute requiredRole="provider">
              <ProviderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipient/dashboard"
          element={
            <ProtectedRoute requiredRole="recipient">
              <RecipientDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/auth/google/success" element={<GoogleAuthSuccess />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredRole="provider">
              <AnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};


function App() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your_google_client_id_placeholder'}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
