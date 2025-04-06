import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';

// Layout components
import Dashboard from './components/layout/Dashboard';
import PrivateRoute from './components/routing/PrivateRoute';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// Dashboard pages
import Overview from './pages/dashboard/Overview';
import Resources from './pages/dashboard/Resources';
import ResourceDetail from './pages/dashboard/ResourceDetail';
import Recommendations from './pages/dashboard/Recommendations';
import MigrationPlans from './pages/dashboard/MigrationPlans';
import MigrationPlanDetail from './pages/dashboard/MigrationPlanDetail';
import Monitoring from './pages/dashboard/Monitoring';
import Settings from './pages/dashboard/Settings';
import Profile from './pages/dashboard/Profile';

// Admin pages
import AdminUsers from './pages/admin/Users';
import AdminSettings from './pages/admin/Settings';

// Other
import NotFound from './pages/NotFound';
import Alert from './components/ui/Alert';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <AlertProvider>
          <Alert />
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            
            {/* Dashboard Routes */}
            <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>}>
              <Route index element={<Navigate to="/overview" replace />} />
              <Route path="overview" element={<Overview />} />
              <Route path="resources" element={<Resources />} />
              <Route path="resources/:resourceId" element={<ResourceDetail />} />
              <Route path="recommendations" element={<Recommendations />} />
              <Route path="migrations" element={<MigrationPlans />} />
              <Route path="migrations/:planId" element={<MigrationPlanDetail />} />
              <Route path="monitoring" element={<Monitoring />} />
              <Route path="settings" element={<Settings />} />
              <Route path="profile" element={<Profile />} />
              
              {/* Admin Routes */}
              <Route path="admin/users" element={<AdminUsers />} />
              <Route path="admin/settings" element={<AdminSettings />} />
            </Route>
            
            {/* Not Found */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AlertProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;