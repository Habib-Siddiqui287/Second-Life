import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import AppRoutes from './routes/AppRoutes';
import ScrollToTop from './components/ScrollToTop';
import api from './services/api';

export default function App() {
  useEffect(() => {
    // Eager background warmup ping to keep Render backend warm and snappy
    api.get('/stats/public/').catch(() => {});
  }, []);

  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ScrollToTop />
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
