import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import apiService from '../services/api';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (username: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初始化时检查token
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // 验证token是否有效
      apiService.getUserInfo()
        .then((res) => {
          if (res.code === 0) {
            setUser(res.data);
            localStorage.setItem('user', JSON.stringify(res.data));
          } else {
            logout();
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await apiService.login(username, password);
      if (response.code === 0) {
        const userData: User = {
          id: response.data.user_id,
          username: response.data.username,
          balance: response.data.balance,
          frozen_balance: response.data.frozen_balance || 0,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, message: '登录成功' };
      }
      return { success: false, message: response.message || '登录失败' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '登录失败' };
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const response = await apiService.register(username, password);
      if (response.code === 0) {
        const userData: User = {
          id: response.data.user_id,
          username: response.data.username,
          balance: response.data.balance,
          frozen_balance: 0,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return { success: true, message: '注册成功' };
      }
      return { success: false, message: response.message || '注册失败' };
    } catch (error: any) {
      return { success: false, message: error.response?.data?.message || '注册失败' };
    }
  };

  const logout = () => {
    apiService.clearToken();
    setUser(null);
    localStorage.removeItem('user');
  };

  const refreshUser = async () => {
    try {
      const response = await apiService.getUserInfo();
      if (response.code === 0) {
        setUser(response.data);
        localStorage.setItem('user', JSON.stringify(response.data));
      }
    } catch (error) {
      console.error('Failed to refresh user info:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
