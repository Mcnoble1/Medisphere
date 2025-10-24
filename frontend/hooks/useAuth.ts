"use client"

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phoneNumber?: string;
  country?: string;
  roleData?: any;
  // did?: string; // Commented out - not used currently
  hederaAccountId?: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');

      if (storedToken) {
        setToken(storedToken);
        apiClient.setToken(storedToken);

        try {
          // Get fresh user data from API instead of localStorage
          const response = await apiClient.getUserProfile();
          setUser(response.user);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Clear invalid token
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          setToken(null);
          setUser(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    apiClient.clearToken();
    window.location.href = '/auth';
  };

  const getRoleDashboardPath = () => {
    if (!user) return '/auth';
    return `/dashboard/${user.role.toLowerCase()}`;
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await apiClient.getUserProfile();
        setUser(response.user);
      } catch (error) {
        console.error('Error refreshing user profile:', error);
      }
    }
  };

  const getDisplayName = () => {
    if (!user) return 'User';
    return `${user.firstName} ${user.lastName}`;
  };

  const getTitleByRole = () => {
    if (!user) return '';

    switch (user.role.toLowerCase()) {
      case 'doctor':
        return `Dr. ${user.firstName} ${user.lastName}`;
      case 'patient':
        return 'Patient';
      case 'ngo':
        return 'NGO Representative';
      case 'government':
        return 'Government Official';
      case 'pharma':
        return 'Pharma Representative';
      default:
        return user.role;
    }
  };

  return {
    user,
    token,
    loading,
    logout,
    refreshUser,
    getDisplayName,
    getTitleByRole,
    getRoleDashboardPath,
    isAuthenticated: !!user && !!token
  };
}