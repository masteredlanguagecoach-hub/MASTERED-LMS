// ============================================================
// context/AuthContext.tsx — Authentication context
// Mastered Skill Academy LMS
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { authApi } from '../api/client';

interface AuthContextType extends AuthState {
  login: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User };

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  isLoading: true
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        token: action.payload.token,
        user: action.payload.user,
        isLoading: false
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false };
    case 'SET_USER':
      return { ...state, user: action.payload, isLoading: false };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('lms_token');
    if (token) {
      authApi.getCurrentUser().then(res => {
        if (res.success && res.data) {
          const userData = res.data as { userId: string; admissionNumber: string; fullName: string; email: string; mobile: string; role: string; profileImageUrl?: string };
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              token,
              user: {
                userId: userData.userId,
                admissionNumber: userData.admissionNumber,
                fullName: userData.fullName,
                email: userData.email,
                mobile: userData.mobile,
                role: userData.role as User['role'],
                profileImageUrl: userData.profileImageUrl
              }
            }
          });
        } else {
          localStorage.removeItem('lms_token');
          dispatch({ type: 'LOGOUT' });
        }
      }).catch(() => {
        localStorage.removeItem('lms_token');
        dispatch({ type: 'LOGOUT' });
      });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    const res = await authApi.login(identifier, password);
    if (res.success && res.data) {
      const loginData = res.data as { token: string; user: User };
      localStorage.setItem('lms_token', loginData.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: { token: loginData.token, user: loginData.user } });
      return { success: true };
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
      return { success: false, error: res.error || 'Login failed' };
    }
  };

  const logout = async () => {
    await authApi.logout();
    localStorage.removeItem('lms_token');
    dispatch({ type: 'LOGOUT' });
  };

  const refreshUser = async () => {
    const res = await authApi.getCurrentUser();
    if (res.success && res.data) {
      const userData = res.data as User;
      dispatch({ type: 'SET_USER', payload: userData });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
