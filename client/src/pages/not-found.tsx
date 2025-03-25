import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import AppLayout from "@/components/AppLayout";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <AppLayout>
      <div className="min-h-screen w-full flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 pb-6">
            <div className="flex mb-4 gap-2">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <h1 className="text-2xl font-bold text-gray-900">404 Page Not Found</h1>
            </div>

            <p className="mt-4 mb-6 text-sm text-gray-600">
              The page you are looking for doesn't exist or has been moved.
            </p>
            
            <Link href="/" className="text-primary hover:text-primary/80 transition-colors">
              Return to Home
            </Link>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
