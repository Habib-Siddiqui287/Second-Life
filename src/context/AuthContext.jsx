import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const saved = localStorage.getItem('secondlife_user');
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error('Failed to read saved user:', error);
    localStorage.removeItem('secondlife_user');
    return null;
  }
};

const saveUser = (userData) => {
  if (userData) {
    localStorage.setItem(
      'secondlife_user',
      JSON.stringify(userData)
    );
  } else {
    localStorage.removeItem('secondlife_user');
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('secondlife_token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    authService
      .getCurrentUser()
      .then((userData) => {
        setUser(userData);
        saveUser(userData);
      })
      .catch((error) => {
        console.error('Session restore failed:', error);

        localStorage.removeItem('secondlife_token');
        localStorage.removeItem('secondlife_refresh_token');
        localStorage.removeItem('secondlife_user');

        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const handlePageShow = (event) => {
      const token = localStorage.getItem('secondlife_token');
      const protectedPath =
        window.location.pathname.startsWith('/donor') ||
        window.location.pathname.startsWith('/receiver') ||
        window.location.pathname.startsWith('/admin');

      if (protectedPath && !token) {
        if (event.persisted) {
          window.location.reload();
        } else {
          window.location.replace('/login');
        }
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({
      email,
      password,
    });

    localStorage.setItem(
      'secondlife_token',
      data.tokens.access
    );

    localStorage.setItem(
      'secondlife_refresh_token',
      data.tokens.refresh
    );

    setUser(data.user);
    saveUser(data.user);

    return data.user;
  };

  /*
   * Registration now ONLY creates the account
   * and sends OTP.
   *
   * It does NOT save JWT tokens yet.
   */
  const register = async (userData) => {
    const data = await authService.register(userData);

    return data;
  };

  /*
   * OTP verification happens here.
   *
   * Backend returns tokens only after OTP is correct.
   */
  const verifyRegistrationOTP = async (email, otp) => {
    const data = await authService.verifyRegistrationOTP(
      email,
      otp
    );

    localStorage.setItem(
      'secondlife_token',
      data.tokens.access
    );

    localStorage.setItem(
      'secondlife_refresh_token',
      data.tokens.refresh
    );

    setUser(data.user);
    saveUser(data.user);

    return data.user;
  };

  const resendRegistrationOTP = async (email) => {
    const data = await authService.resendRegistrationOTP(
      email
    );

    return data;
  };

  const logout = () => {
    // Clear every client-side authentication artifact before navigation.
    localStorage.removeItem('secondlife_token');
    localStorage.removeItem('secondlife_refresh_token');
    localStorage.removeItem('secondlife_user');

    setUser(null);

    // Replace the current history entry so Back cannot restore the
    // authenticated route as a normal navigation target.
    window.location.replace('/login');
  };

  const updateUser = (updatedUser) => {
    if (!updatedUser) return;

    setUser(updatedUser);
    saveUser(updatedUser);
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

        verifyRegistrationOTP,
        resendRegistrationOTP,

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
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};