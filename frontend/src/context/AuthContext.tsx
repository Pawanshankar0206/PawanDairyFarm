import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface SignupData {
  full_name: string;
  username: string;
  email: string;
  mobile_number?: string;
  password: string;
  role?: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  canManageUsers: boolean;
  canEditLivestock: boolean;
  canManageFinances: boolean;
  canRecordHealth: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('dairyflow_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await api.get<User>('/auth/me');
        setUser(profile);
      } catch (err) {
        console.error('Session expired or invalid:', err);
        localStorage.removeItem('dairyflow_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, [token]);

  const login = async (username: string, password: string) => {
    const data = await api.post<{ token: string; user: User }>('/auth/login', { username, password });
    localStorage.setItem('dairyflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const signup = async (userData: SignupData) => {
    const data = await api.post<{ token: string; user: User }>('/auth/signup', userData);
    localStorage.setItem('dairyflow_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('dairyflow_token');
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role === 'Owner / Super Admin') return true;
    return roles.includes(user.role);
  };

  const canManageUsers = user?.role === 'Owner / Super Admin';
  const canEditLivestock = hasRole('Owner / Super Admin', 'Farm Manager', 'Veterinary Staff');
  const canManageFinances = hasRole('Owner / Super Admin', 'Accountant', 'Farm Manager');
  const canRecordHealth = hasRole('Owner / Super Admin', 'Veterinary Staff', 'Farm Manager');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        hasRole,
        canManageUsers,
        canEditLivestock,
        canManageFinances,
        canRecordHealth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
