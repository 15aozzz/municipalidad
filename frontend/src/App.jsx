import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TramitesProvider } from './contexts/TramitesContext';

import AppLayout from './components/layout/AppLayout';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import CitizenDashboard from './components/citizen/CitizenDashboard';
import CitizenHistory from './components/citizen/CitizenHistory';
import StaffDashboard from './components/staff/StaffDashboard';
import PrivateRoute from './components/common/PrivateRoute';
import LandingPage from './components/common/LandingPage';

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <TramitesProvider>
            <BrowserRouter>
              <Routes>
                {/* Rutas Públicas */}
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<LandingPage />} />
                  <Route path="login" element={<LoginForm />} />
                  <Route path="register" element={<RegisterForm />} />

                  {/* Rutas Protegidas - Ciudadano */}
                  <Route element={<PrivateRoute allowedRoles={['ciudadano', 'staff', 'admin']} />}>
                    <Route path="dashboard" element={<CitizenDashboard />} />
                    <Route path="historial" element={<CitizenHistory />} />
                  </Route>

                  {/* Rutas Protegidas - Staff / Admin */}
                  <Route element={<PrivateRoute allowedRoles={['staff', 'admin']} />}>
                    <Route path="staff" element={<StaffDashboard />} />
                  </Route>

                </Route>
                
                {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </BrowserRouter>
          </TramitesProvider>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
