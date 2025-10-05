import { authAPI } from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

// Auth state management
class AuthManager {
  private listeners: ((state: AuthState) => void)[] = [];
  private state: AuthState = {
    user: null,
    token: localStorage.getItem('authToken'),
    isAuthenticated: false,
  };

  constructor() {
    // Initialize auth state on startup
    this.initializeAuth();
  }

  private async initializeAuth() {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await authAPI.getCurrentUser();
        this.setState({
          user: response.user,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        // Token is invalid, clear it
        this.logout();
      }
    }
  }

  private setState(newState: Partial<AuthState>) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.push(listener);
    // Immediately call with current state
    listener(this.state);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState() {
    return this.state;
  }

  async login(usernameOrEmail: string, password: string) {
    try {
      const response = await authAPI.login({ 
        username: usernameOrEmail, 
        email: usernameOrEmail, 
        password 
      });
      
      localStorage.setItem('authToken', response.token);
      
      this.setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  async register(username: string, email: string, password: string) {
    try {
      const response = await authAPI.register({ username, email, password });
      
      localStorage.setItem('authToken', response.token);
      
      this.setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
      });

      return response;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('authToken');
    
    this.setState({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  }

  async refreshToken() {
    try {
      const response = await authAPI.refreshToken();
      localStorage.setItem('authToken', response.token);
      
      this.setState({
        token: response.token,
      });

      return response;
    } catch (error) {
      this.logout();
      throw error;
    }
  }
}

// Create singleton instance
export const authManager = new AuthManager();

// React hook for using auth state
import { useState, useEffect } from 'react';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(authManager.getState());

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return unsubscribe;
  }, []);

  return {
    ...authState,
    login: authManager.login.bind(authManager),
    register: authManager.register.bind(authManager),
    logout: authManager.logout.bind(authManager),
    refreshToken: authManager.refreshToken.bind(authManager),
  };
}

// Legacy functions for backward compatibility
export const getCurrentRegularUser = () => {
  const state = authManager.getState();
  return state.user;
};

export const getCurrentUser = () => {
  const state = authManager.getState();
  return state.user;
};

export const isUserAuthenticated = () => {
  const state = authManager.getState();
  return state.isAuthenticated;
};

export const isAuthenticated = () => {
  const state = authManager.getState();
  return state.isAuthenticated;
};

export const userLogout = () => {
  authManager.logout();
};

export const logout = () => {
  authManager.logout();
};

export const hasPermission = (permission: string) => {
  const state = authManager.getState();
  if (!state.user) return false;
  
  // For now, return true for admin users, false for others
  // You can implement more sophisticated permission logic here
  return state.user.role === 'admin' || state.user.role === 'super_admin';
};

export const userLogin = async (credentials: LoginCredentials) => {
  try {
    await authManager.login(credentials.username, credentials.password);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const userSignup = async (credentials: SignupCredentials) => {
  try {
    await authManager.register(credentials.username, credentials.email, credentials.password);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

export const login = async (credentials: LoginCredentials) => {
  try {
    await authManager.login(credentials.username, credentials.password);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};