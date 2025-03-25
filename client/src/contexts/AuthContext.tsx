import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const checkAuth = () => {
      const currentUser = localStorage.getItem('currentUser');
      if (currentUser) {
        setUser({ email: currentUser });
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const login = (email: string) => {
    // Show loading state during login
    setIsLoading(true);
    
    // Store current user in localStorage
    localStorage.setItem('currentUser', email);
    setUser({ email });
    
    console.log("User logged in successfully:", email);
    
    // Short timeout to ensure state updates properly
    setTimeout(() => {
      setIsLoading(false);
    }, 100);
  };

  const logout = () => {
    // Remove current user from localStorage
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}