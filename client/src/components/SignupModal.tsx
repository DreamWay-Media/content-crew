import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { getSessionId, associateContentWithUser } from "@/lib/api";

// Form validation schema
const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters long.",
  }),
  confirmPassword: z.string().optional(),
}).refine(data => {
  if (data.confirmPassword !== undefined) {
    return data.confirmPassword === data.password;
  }
  return true;
}, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  articleTitle: string;
}

export default function SignupModal({ isOpen, onClose, articleTitle }: SignupModalProps) {
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [rememberMe, setRememberMe] = useState(true);
  const [hasAccount] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  // Check if we have registered users
  const registeredEmails = localStorage.getItem('registeredEmails');
  const hasRegisteredUsers = registeredEmails && JSON.parse(registeredEmails).length > 0;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    console.log(mode === 'signup' ? "Signup data:" : "Login data:", data);
    
    // For signup mode
    if (mode === 'signup') {
      // Store email in registered emails list
      const registeredEmails = localStorage.getItem('registeredEmails') || '[]';
      const emails = JSON.parse(registeredEmails);
      if (!emails.includes(data.email)) {
        emails.push(data.email);
        localStorage.setItem('registeredEmails', JSON.stringify(emails));
      }
      
      // Always store user credentials for demo
      localStorage.setItem(`user_${data.email}`, JSON.stringify({
        email: data.email,
        // In a real app, we would never store the password directly
        // This is just for demonstration
        passwordHash: data.password,
      }));
      
      // Show success toast
      toast({
        title: "Account created!",
        description: "Welcome to AI Content Crew. You can now manage your content in the dashboard.",
        variant: "default",
      });
    } else {
      // Login flow - simplified for demo purposes
      // For this demo, we'll allow login with any email if no registered users yet
      const registeredEmails = localStorage.getItem('registeredEmails') || '[]';
      const emails = JSON.parse(registeredEmails);
      
      if (emails.length === 0 || emails.includes(data.email)) {
        // Success - either no registered users or email is registered
        // Show success toast
        toast({
          title: "Login successful!",
          description: "Welcome back to AI Content Crew.",
          variant: "default",
        });
      } else {
        // Fail - email not registered
        toast({
          title: "Login failed",
          description: "We couldn't find an account with that email. Please sign up first.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Login the user with auth context
    console.log("Logging in user:", data.email);
    login(data.email);
    
    // Get current session ID
    const sessionId = getSessionId();
    
    // Associate any temporary content with the user
    if (sessionId) {
      try {
        console.log(`Associating content from session ${sessionId} with user ${data.email}`);
        const success = await associateContentWithUser(sessionId, data.email);
        
        if (success) {
          console.log("Successfully associated temporary content with user");
          toast({
            title: "Content saved!",
            description: "Your content has been saved to your account.",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Error associating content with user:", error);
      }
    }
    
    // Close the modal
    onClose();
    
    // Redirect to dashboard page - immediate redirect
    console.log("Redirecting to dashboard after login");
    setLocation("/dashboard");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm md:max-w-lg bg-gray-50">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {mode === 'signup' ? 'Sign up for free' : 'Welcome back'}
          </DialogTitle>
          <DialogDescription className="text-sm">
            {mode === 'signup' 
              ? `Create a free account to download "${articleTitle}"` 
              : `Sign in to your account to download "${articleTitle}"`}
          </DialogDescription>
          
          {hasAccount && (
            <div className="flex justify-center mt-3">
              <div className="bg-gray-100 rounded-lg p-1 flex w-fit">
                <button
                  type="button"
                  className={`px-4 py-1.5 text-xs font-medium rounded-md ${
                    mode === 'signup' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                  onClick={() => setMode('signup')}
                >
                  Sign Up
                </button>
                <button
                  type="button"
                  className={`px-4 py-1.5 text-xs font-medium rounded-md ${
                    mode === 'login' ? 'bg-white shadow-sm' : 'text-gray-500'
                  }`}
                  onClick={() => setMode('login')}
                >
                  Sign In
                </button>
              </div>
            </div>
          )}
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-3">
          {/* Left column - signup form */}
          <div className="space-y-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="your.email@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {mode === 'signup' && (
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {mode === 'signup' && (
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="text-sm font-medium leading-none"
                      >
                        Remember me
                      </label>
                    </div>
                  </div>
                )}

                <Button type="submit" className="w-full">
                  {mode === 'signup' ? 'Create Account' : 'Sign In'}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 text-gray-500">or</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={async () => {
                // In a real app, this would trigger Google OAuth
                const demoEmail = "demo.user@example.com";
                
                // Login the user via auth context
                login(demoEmail);
                
                // Add to registered emails
                const registeredEmails = localStorage.getItem('registeredEmails') || '[]';
                const emails = JSON.parse(registeredEmails);
                if (!emails.includes(demoEmail)) {
                  emails.push(demoEmail);
                  localStorage.setItem('registeredEmails', JSON.stringify(emails));
                }
                
                // Get current session ID
                const sessionId = getSessionId();
                
                // Associate any temporary content with the user
                if (sessionId) {
                  try {
                    console.log(`Associating content from session ${sessionId} with user ${demoEmail}`);
                    const success = await associateContentWithUser(sessionId, demoEmail);
                    
                    if (success) {
                      console.log("Successfully associated temporary content with user");
                      toast({
                        title: "Content saved!",
                        description: "Your content has been saved to your account.",
                        variant: "default",
                      });
                    }
                  } catch (error) {
                    console.error("Error associating content with user:", error);
                  }
                }
                
                onClose();
                toast({
                  title: "Google Sign In",
                  description: "Authentication successful! Redirecting to dashboard.",
                  variant: "default",
                });
                
                // Redirect to dashboard page immediately
                console.log("Redirecting to dashboard after Google login");
                setLocation("/dashboard");
              }}
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
              Sign up with Google
            </Button>
          </div>

          {/* Right column - Basic plan benefits */}
          <div className="p-4">
            <h3 className="font-semibold text-base mb-3">Basic Plan (Free)</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-primary mr-1.5 flex-shrink-0 mt-0.5" />
                <span>Up to 5 article downloads per month</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-primary mr-1.5 flex-shrink-0 mt-0.5" />
                <span>3 AI-generated images per article</span>
              </li>

              <li className="flex items-start">
                <CheckCircle2 className="h-4 w-4 text-primary mr-1.5 flex-shrink-0 mt-0.5" />
                <span>Basic SEO optimization for all articles</span>
              </li>
            </ul>
            
            <Separator className="my-3" />
            
            <div className="text-xs text-gray-600">
              <p>Need more capabilities? Check out our <a href="/pricing" className="text-primary font-medium hover:underline">Standard and Enterprise plans</a> for publishing integration, custom prompt engineering, and unlimited downloads.</p>
            </div>
          </div>
        </div>


      </DialogContent>
    </Dialog>
  );
}