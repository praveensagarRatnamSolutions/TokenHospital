import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginForm from '../components/LoginForm';
import KioskSelector from '../components/KioskSelector';
import KioskDisplay from '../components/KioskDisplay';
import type { User, Kiosk } from '../types';

interface AppRoutesProps {
  user: User | null;
  selectedKiosk: Kiosk | null;
  theme: 'light' | 'dark';
  onLoginSuccess: (user: User) => void;
  onKioskSelect: (kiosk: Kiosk) => void;
  onToggleTheme: () => void;
}

const AppRoutes: React.FC<AppRoutesProps> = ({ 
  user, 
  selectedKiosk, 
  theme,
  onLoginSuccess,
  onKioskSelect,
  onToggleTheme 
}) => {
  return (
    <Routes>
      <Route path="/" element={
        user ? <Navigate to="/select" replace /> : <LoginForm onLoginSuccess={onLoginSuccess} />
      } />

      <Route element={<ProtectedRoute user={user} selectedKiosk={selectedKiosk} requireKiosk={false} />}>
        <Route path="/select" element={
          <KioskSelector onSelect={onKioskSelect} />
        } />
      </Route>

      <Route element={<ProtectedRoute user={user} selectedKiosk={selectedKiosk} />}>
        <Route path="/display/:code" element={
          <KioskDisplay 
            code={selectedKiosk?.code || ''} 
            theme={theme} 
            onToggleTheme={onToggleTheme} 
          />
        } />
      </Route>

      {/* Fallback */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
