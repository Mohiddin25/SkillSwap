import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../api/services';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchProfile = async () => {
    try {
      const res = await authService.getMe();
      if (res.data && res.data.data) {
        setUser(res.data.data);
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authService.login({ email, password });
      if (res.data && res.data.data) {
        const { token, user: userData } = res.data.data;
        if (token) {
          localStorage.setItem('token', token);
        }
        setUser(userData);
        await fetchProfile();
        showToast(`Welcome back, ${userData.name}!`, 'success');
        return true;
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Login failed. Invalid credentials.';
      showToast(errMsg, 'error');
      return false;
    }
  };

  const register = async (formData) => {
    try {
      const res = await authService.register(formData);
      if (res.data && res.data.data) {
        const { token, user: userData } = res.data.data;
        if (token) {
          localStorage.setItem('token', token);
        }
        setUser(userData);
        await fetchProfile();
        showToast('Registration successful! Welcome to Skill Swap!', 'success');
        return true;
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Registration failed.';
      showToast(errMsg, 'error');
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      showToast('Logged out successfully', 'info');
    }
  };

  const quickDemoLogin = async (demoEmail, demoPassword) => {
    return await login(demoEmail, demoPassword);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      quickDemoLogin,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
