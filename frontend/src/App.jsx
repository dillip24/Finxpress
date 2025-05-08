import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate
} from 'react-router-dom';
import './App.css';
import Register from './pages/register';
import Login from './pages/login';
import { AuthProvider, useAuth } from './context/AuthContext';



import History from './pages/History';
import Navbar from './components/navbar';
import Sidebar from './components/sidebar';
import Overview from './pages/Overview';
import Budget from './pages/Budget';
import Categories from './pages/Category';
import	Settings from './pages/Settings';
import Report from './pages/report';
import Bills from './pages/Bills';

function ProtectedApp() {
  const { user, loading, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        Loading...
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (
    !user &&
    location.pathname !== '/login' &&
    location.pathname !== '/register'
  ) {
    return <Navigate to="/login" replace />;
  }

  // If logged in and on /login or /register, redirect to home
  if (
    user &&
    (location.pathname === '/login' || location.pathname === '/register')
  ) {
    return <Navigate to="/" replace />;
  }

  // If logged in, show home page with components
  if (user) {
    return (
      <div className="flex h-screen">
        <Sidebar user={user} />
        <div className="flex-1 flex flex-col">
          <Navbar user={user} />
          <main className="flex-1 p-6 bg-gray-100 overflow-auto">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/history" element={<History />} />

              <Route path="/budget" element={<Budget />} />
              <Route path="/category" element={<Categories />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/report" element={<Report />} />
              <Route path="/bills" element={<Bills />} />

              {/* Add more protected routes here if needed */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    );
  }

  // Otherwise show login/register routes
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ProtectedApp />
    </AuthProvider>
  );
}