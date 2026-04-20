import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { AuthProvider, useSession, useUser } from '@descope/react-sdk';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Billing from './pages/Billing';
import Products from './pages/Products';
import AllBills from './pages/AllBills';
import Profile from './pages/Profile';
import Help from './pages/Help';
import Staff from './pages/Staff';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';

// --- Business Context ---
const BusinessContext = createContext();

export const BusinessProvider = ({ children }) => {
  const [activeBusiness, setActiveBusiness] = useState(() => {
    const saved = localStorage.getItem('activeBusiness');
    return saved ? JSON.parse(saved) : null;
  });

  const selectBusiness = (business) => {
    setActiveBusiness(business);
    localStorage.setItem('activeBusiness', JSON.stringify(business));
  };

  const logoutBusiness = () => {
    setActiveBusiness(null);
    localStorage.removeItem('activeBusiness');
  };

  return (
    <BusinessContext.Provider value={{ activeBusiness, selectBusiness, logoutBusiness }}>
      {children}
    </BusinessContext.Provider>
  );
};

export const useBusiness = () => useContext(BusinessContext);

// --- Auth Guard ---
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isSessionLoading } = useSession();
  if (isSessionLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" />;
  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useSession();
  const { activeBusiness } = useBusiness();

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/onboarding" /> : <Login />} />
        
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute>
            {activeBusiness ? <Dashboard /> : <Navigate to="/onboarding" />}
          </ProtectedRoute>
        } />

        <Route path="/billing" element={
          <ProtectedRoute>
            {activeBusiness ? <Billing /> : <Navigate to="/onboarding" />}
          </ProtectedRoute>
        } />

        <Route path="/all-bills" element={
          <ProtectedRoute>
            {activeBusiness ? <AllBills /> : <Navigate to="/onboarding" />}
          </ProtectedRoute>
        } />

        <Route path="/reports" element={
          <ProtectedRoute>
            {activeBusiness ? <Reports /> : <Navigate to="/onboarding" />}
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            {activeBusiness ? <Profile /> : <Navigate to="/onboarding" />}
          </ProtectedRoute>
        } />

        <Route path="/products" element={
          <ProtectedRoute>
            {activeBusiness ? <Products /> : <Navigate to="/onboarding" />}
          </ProtectedRoute>
        } />

        <Route path="/help" element={
          <ProtectedRoute>
            <Help />
          </ProtectedRoute>
        } />

        <Route path="/staff" element={
          <ProtectedRoute>
            {activeBusiness ? <Staff /> : <Navigate to="/onboarding" />}
          </ProtectedRoute>
        } />

        <Route path="/expenses" element={
          <ProtectedRoute>
            {activeBusiness ? <Expenses /> : <Navigate to="/onboarding" />}
          </ProtectedRoute>
        } />
      </Routes>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider projectId="P3Ca8orb0GbLKNu5UFAXtYOxWaeS">
      <BusinessProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </BusinessProvider>
    </AuthProvider>
  );
};

export default App;
