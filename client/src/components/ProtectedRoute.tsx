import React from 'react';
import { Redirect } from 'wouter';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  component: React.FC;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Log authentication state for debugging
  console.log("ProtectedRoute - Auth state:", { isAuthenticated, isLoading, user });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    console.log("User not authenticated, redirecting to home page");
    return <Redirect to="/" />;
  }
  
  console.log("User authenticated, rendering protected component");
  return <Component />;
}