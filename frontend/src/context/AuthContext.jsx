import React, { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  
  // Set default header if token is in storage
  useEffect(() => {
    const storedUser = localStorage.getItem('theft_protect_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
        fetchNotifications(parsed.token);
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('theft_protect_user');
      }
    }
    setLoading(false);
  }, []);

  // Set up periodic notification polling for dynamic citizen alerts
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      fetchNotifications(user.token);
    }, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [user]);

  const fetchNotifications = async (token) => {
    try {
      const res = await axiosInstance.get(`${API_URL}/users/me/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err.message);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!user) return;
    try {
      await axiosInstance.put(`${API_URL}/users/me/notifications/read`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axiosInstance.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('theft_protect_user', JSON.stringify(userData));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        fetchNotifications(userData.token);
        return { success: true, user: userData };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    }
  };

  const register = async (signUpData) => {
    try {
      const res = await axiosInstance.post(`${API_URL}/auth/register`, signUpData);
      if (res.data.success) {
        if (res.data.pendingApproval) {
          return { success: true, pendingApproval: true, message: res.data.message };
        }
        const userData = res.data.data;
        setUser(userData);
        localStorage.setItem('theft_protect_user', JSON.stringify(userData));
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        setNotifications([]);
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Try again.';
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setNotifications([]);
    localStorage.removeItem('theft_protect_user');
    delete axiosInstance.defaults.headers.common['Authorization'];
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await axiosInstance.put(`${API_URL}/auth/profile`, profileData);
      if (res.data.success) {
        const updated = { ...user, ...res.data.data };
        setUser(updated);
        localStorage.setItem('theft_protect_user', JSON.stringify(updated));
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile.';
      return { success: false, message: msg };
    }
  };

  const value = {
    user,
    loading,
    notifications,
    login,
    register,
    logout,
    updateProfile,
    markNotificationsAsRead,
    apiUrl: API_URL
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};