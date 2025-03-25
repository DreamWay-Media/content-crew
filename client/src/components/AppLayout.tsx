import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { Edit3, User, LayoutDashboard, LogOut } from 'lucide-react';
import dreamwayLogo from '../assets/dreamway-media-logo.png';
import { useAuth } from '@/contexts/AuthContext';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: React.ReactNode;
  activePage?: 'home' | 'how-it-works' | 'pricing' | 'dashboard';
}

export default function AppLayout({ children, activePage = 'home' }: AppLayoutProps) {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout, login } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  
  const handleLogout = () => {
    // Use our auth context logout function
    logout();
    setLocation('/');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="w-full bg-black shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div 
              onClick={() => {
                // Navigate to homepage (we now allow returning to homepage even when logged in)
                setLocation('/');
              }} 
              className="cursor-pointer"
            >
              <img src={dreamwayLogo} alt="Dreamway Media" className="h-12" />
            </div>
            <div className="flex items-center">
              <Edit3 className="text-white h-5 w-5 mr-2" />
              <h1 className="text-sm font-medium text-primary">AI Content Crew</h1>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-3">
            <Link href="/how-it-works" className={`px-4 py-2 rounded-md text-xs text-white hover:text-primary transition duration-300 ${activePage === 'how-it-works' ? 'border-b-2 border-primary' : ''}`}>
              How It Works
            </Link>
            <Link href="/pricing" className={`px-4 py-2 rounded-md text-xs text-white hover:text-primary transition duration-300 ${activePage === 'pricing' ? 'border-b-2 border-primary' : ''}`}>
              Pricing
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" className={`px-4 py-2 rounded-md text-xs text-white hover:text-primary transition duration-300 ${activePage === 'dashboard' ? 'border-b-2 border-primary' : ''}`}>
                Dashboard
              </Link>
            ) : null}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer">
                  <User className="h-4 w-4 text-black" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuLabel>
                      {user?.email ? user.email : 'My Account'}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="cursor-pointer flex items-center"
                      onClick={() => setLocation('/dashboard')}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="cursor-pointer text-red-600 flex items-center"
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem
                      className="cursor-pointer bg-green-50 text-green-700 hover:bg-green-100 m-1"
                      onClick={() => {
                        // Toggle AuthModal that we will create
                        setShowAuthModal(true);
                      }}
                    >
                      Login / Sign Up
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="mt-auto w-full bg-black py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <div className="text-center sm:text-left mb-4 sm:mb-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-start mb-2">
                <div 
                  onClick={() => {
                    // Navigate to homepage (we now allow returning to homepage even when logged in)
                    setLocation('/');
                  }} 
                  className="cursor-pointer"
                >
                  <img src={dreamwayLogo} alt="Dreamway Media" className="h-6 mb-2 sm:mb-0 sm:mr-4" />
                </div>
              </div>
              <p className="text-xs text-white opacity-80">
                &copy; {new Date().getFullYear()} AI Content Crew. All content is powered by OpenAI.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/how-it-works" className="text-xs text-white hover:text-primary transition-colors duration-300">
                How It Works
              </Link>
              <Link href="/pricing" className="text-xs text-white hover:text-primary transition-colors duration-300">
                Pricing
              </Link>
              <a href="#" className="text-xs text-white hover:text-primary transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="text-xs text-white hover:text-primary transition-colors duration-300">Terms of Service</a>
              <a href="#" className="text-xs text-white hover:text-primary transition-colors duration-300">Help</a>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <button 
                onClick={() => {
                  setShowAuthModal(false);
                  setIsSignUp(false); // Reset to login view when closing
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>
            
            <div className="flex flex-col space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="your@email.com" 
                />
              </div>
              
              <div>
                <label className="block mb-2 text-sm font-medium">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  className="w-full px-3 py-2 border rounded-md" 
                  placeholder="●●●●●●●●"
                />
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="h-4 w-4 text-primary border-gray-300 rounded" 
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              
              <button 
                onClick={() => {
                  // Get email value
                  const email = (document.getElementById('email') as HTMLInputElement).value;
                  if (email) {
                    // Handle login with the email from our form
                    logout(); // First logout any existing session
                    // Use the login function from our auth context
                    login(email);
                    setShowAuthModal(false);
                    setLocation('/dashboard');
                  }
                }}
                className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary/90"
              >
                {isSignUp ? 'Sign Up' : 'Login'}
              </button>
              
              <div className="text-center text-sm text-gray-500">
                {isSignUp ? (
                  <p>Already have an account? <button 
                     onClick={() => setIsSignUp(false)}
                     className="text-primary hover:underline">
                     Login
                    </button>
                  </p>
                ) : (
                  <p>Don't have an account? <button 
                     onClick={() => setIsSignUp(true)}
                     className="text-primary hover:underline">
                     Sign Up
                    </button>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}