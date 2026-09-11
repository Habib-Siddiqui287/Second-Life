import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('secondlife_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('secondlife_token');
    if (token) {
      authService.getCurrentUser()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('secondlife_user', JSON.stringify(userData));
        })
        .catch(() => {
          localStorage.removeItem('secondlife_token');
          localStorage.removeItem('secondlife_refresh_token');
          localStorage.removeItem('secondlife_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    localStorage.setItem('secondlife_token', data.tokens.access);
    localStorage.setItem('secondlife_refresh_token', data.tokens.refresh);
    localStorage.setItem('secondlife_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    localStorage.setItem('secondlife_token', data.tokens.access);
    localStorage.setItem('secondlife_refresh_token', data.tokens.refresh);
    localStorage.setItem('secondlife_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('secondlife_token');
    localStorage.removeItem('secondlife_refresh_token');
    localStorage.removeItem('secondlife_user');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('secondlife_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        role: user?.role || null,
        accountType: user?.account_type || null,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
