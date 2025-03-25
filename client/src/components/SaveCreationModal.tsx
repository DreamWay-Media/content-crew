import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Save, LogIn, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { associateContentWithUser, getSessionId } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface SaveCreationModalProps {
  isOpen: boolean;
  articleTitle: string;
}

export default function SaveCreationModal({ 
  isOpen, 
  articleTitle
}: SaveCreationModalProps) {
  // States for the form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("sign-in");
  
  const { login } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Function to handle user registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Store user information in localStorage for registration
      localStorage.setItem('userFirstName', firstName);
      localStorage.setItem('userLastName', lastName);

      // In a real implementation, this would call an API endpoint to register the user
      // For now, we'll simulate registration by calling login directly
      login(email);
      
      // Associate the temporary content with the newly registered user
      const sessionId = getSessionId();
      await associateContentWithUser(sessionId, email, firstName, lastName);
      
      toast({
        title: "Registration successful!",
        description: "Your content has been saved to your account.",
        variant: "default",
      });
      
      // Redirect to dashboard
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: typeof error.message === 'string' ? error.message : "An error occurred during registration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to handle user login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Log the user in
      login(loginEmail);
      
      // Associate the temporary content with the logged-in user
      const sessionId = getSessionId();
      await associateContentWithUser(sessionId, loginEmail);
      
      toast({
        title: "Login successful!",
        description: "Your content has been saved to your account.",
        variant: "default",
      });
      
      // Redirect to dashboard
      setLocation("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: typeof error.message === 'string' ? error.message : "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // This modal is non-dismissible by design, as requested
  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center justify-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Save Your Creation
          </DialogTitle>
          <DialogDescription className="text-center">
            Your article "{articleTitle}" is ready to be saved!
          </DialogDescription>
        </DialogHeader>
        
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 my-4">
          <h3 className="font-semibold text-gray-700 mb-2">What happens next:</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                1
              </div>
              <span>Your content will be securely saved</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                2
              </div>
              <span>You'll have permanent access to your article and images</span>
            </li>
            <li className="flex items-start gap-2">
              <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                3
              </div>
              <span>Unlock publishing options for your content</span>
            </li>
          </ul>
        </div>
        
        <Tabs defaultValue="sign-in" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="sign-in" className="flex items-center justify-center gap-1">
              <LogIn className="h-4 w-4" />
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center justify-center gap-1">
              <UserPlus className="h-4 w-4" />
              Register
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sign-in" className="mt-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="login-email">Email</Label>
                <Input 
                  id="login-email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="login-password">Password</Label>
                <Input 
                  id="login-password" 
                  type="password" 
                  placeholder="••••••••" 
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In & Save Content"}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Don't have an account?{" "}
                <button 
                  type="button" 
                  className="text-primary hover:underline"
                  onClick={() => setActiveTab("register")}
                >
                  Register
                </button>
              </p>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="mt-4">
            <form onSubmit={handleRegister} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="John" 
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Doe" 
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-email">Email</Label>
                <Input 
                  id="register-email" 
                  type="email" 
                  placeholder="your@email.com" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="register-password">Password</Label>
                <Input 
                  id="register-password" 
                  type="password" 
                  placeholder="••••••••" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Register & Save Content"}
              </Button>
              <p className="text-xs text-center text-gray-500 mt-2">
                Already have an account?{" "}
                <button 
                  type="button" 
                  className="text-primary hover:underline"
                  onClick={() => setActiveTab("sign-in")}
                >
                  Sign In
                </button>
              </p>
            </form>
          </TabsContent>
        </Tabs>
        
        <p className="text-xs text-center text-gray-500 mt-4">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </DialogContent>
    </Dialog>
  );
}