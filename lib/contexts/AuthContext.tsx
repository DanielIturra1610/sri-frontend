'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthService } from '@/services/authService';
import type { AuthUser, LoginCredentials, RegisterData, Tenant, CreateTenantData } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  tenant: Tenant | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<{ message: string }>;
  logout: () => Promise<void>;
  createTenant: (data: CreateTenantData) => Promise<void>;
  updateUser: (user: AuthUser) => void;
  isAuthenticated: boolean;
  hasTenant: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to navigate (avoids useRouter at top level)
  const navigate = useCallback((path: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  }, []);

  // Load user on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const currentUser = AuthService.getCurrentUser();
        const currentTenant = AuthService.getCurrentTenant();
        setUser(currentUser);
        setTenant(currentTenant);
      } catch (error) {
        console.error('Error loading user:', error);
        setUser(null);
        setTenant(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const { user, requires_tenant, tenant: tenantData } = await AuthService.login(credentials);
      setUser(user);

      if (tenantData) {
        setTenant(tenantData);
      }

      // Redirect based on whether user has a tenant
      if (requires_tenant) {
        navigate('/onboarding/create-tenant');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      throw error;
    }
  };

  // Register now returns message instead of auto-login
  const register = async (data: RegisterData): Promise<{ message: string }> => {
    try {
      const result = await AuthService.register(data);
      // Don't set user or navigate - user must verify email first
      return { message: result.message };
    } catch (error) {
      throw error;
    }
  };

  const createTenant = async (data: CreateTenantData) => {
    try {
      const { tenant: newTenant, user: updatedUser } = await AuthService.createTenant(data);
      setUser(updatedUser);
      setTenant(newTenant);
      navigate('/dashboard');
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setTenant(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      setTenant(null);
      navigate('/login');
    }
  };

  const updateUser = (updatedUser: AuthUser) => {
    setUser(updatedUser);
    // Update localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    tenant,
    loading,
    login,
    register,
    logout,
    createTenant,
    updateUser,
    isAuthenticated: !!user,
    hasTenant: !!user?.tenant_id || !!tenant,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
