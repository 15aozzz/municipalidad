import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TramitesProvider } from './contexts/TramitesContext';

import AppLayout from './components/layout/AppLayout';
import LoginForm from './components/auth/LoginForm';
import CitizenDashboard from './components/citizen/CitizenDashboard';
import StaffDashboard from './components/staff/StaffDashboard';
import PrivateRoute from './components/common/PrivateRoute';

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
                  <Route index element={<Navigate to="/login" replace />} />
                  <Route path="login" element={<LoginForm />} />

                  {/* Rutas Protegidas - Ciudadano */}
                  <Route element={<PrivateRoute allowedRoles={['ciudadano', 'staff', 'admin']} />}>
                    <Route path="dashboard" element={<CitizenDashboard />} />
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
