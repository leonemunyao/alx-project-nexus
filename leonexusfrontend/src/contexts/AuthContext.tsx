import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, authUtils, User, AuthResponse, LoginCredentials } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  isDealer: () => boolean;
  isBuyer: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state on app load
  useEffect(() => {
    const initializeAuth = async () => {
      if (authUtils.isAuthenticated()) {
        try {
          const storedUser = authUtils.getStoredUser();
          if (storedUser) {
            setUser(storedUser);
          } else {
            // Try to fetch current user from API
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            authUtils.storeUser(currentUser, localStorage.getItem('authToken') || '');
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          authUtils.clearUser();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authApi.login(credentials);

      const userData: User = {
        id: response.user_id,
        username: response.username,
        email: response.email,
        first_name: response.first_name,
        last_name: response.last_name,
        role: response.role,
      };


      authUtils.storeUser(userData, response.token);
      setUser(userData);

    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      authUtils.clearUser();
      setUser(null);
    }
  };

  const isDealer = () => {
    return user?.role === 'DEALER';
  };

  const isBuyer = () => {
    return user?.role === 'BUYER';
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    isDealer,
    isBuyer,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
