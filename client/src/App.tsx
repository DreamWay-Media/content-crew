import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect } from "react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import HowItWorks from "@/pages/how-it-works";
import Pricing from "@/pages/pricing";
import Dashboard from "@/pages/dashboard";
import AdminDashboard from "@/pages/admin";

function Router() {
  const [location, setLocation] = useLocation();
  
  // Check for auto-login and redirect to dashboard on page load
  useEffect(() => {
    // Check if user is logged in on homepage
    if (location === '/') {
      const currentUser = localStorage.getItem('currentUser');
      
      // Log for debugging
      console.log("Checking user auth on homepage:", currentUser ? "User is logged in" : "User is not logged in");
      
      if (currentUser) {
        // If user is already logged in and on the home page, redirect to dashboard
        console.log("Auto-redirecting logged in user to dashboard");
        setLocation('/dashboard');
      }
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/admin" component={AdminDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
