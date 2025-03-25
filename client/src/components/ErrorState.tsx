import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  // Check if the error is related to the OpenAI API key
  const isApiKeyError = message.toLowerCase().includes("api key");
  
  return (
    <div className="max-w-2xl mx-auto mt-16">
      <div className="bg-red-50 border border-red-400 rounded-lg p-6 text-center">
        <AlertCircle className="text-red-500 h-12 w-12 mx-auto mb-2" />
        <h3 className="text-xl font-medium text-red-500 mb-2">Research Error</h3>
        <p className="text-neutral-700 mb-4">{message}</p>
        
        {isApiKeyError && (
          <div className="bg-white p-4 rounded-md mb-4 text-sm text-left">
            <p className="font-medium mb-2">Possible solutions:</p>
            <ul className="list-disc list-inside space-y-1 text-neutral-600">
              <li>The application requires a valid OpenAI API key to function</li>
              <li>Contact the administrator to update the API key</li>
              <li>Check that the environment variable is correctly set</li>
            </ul>
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="border-red-400 text-red-500 hover:bg-red-500 hover:text-white"
          onClick={onRetry}
        >
          Try Again
        </Button>
      </div>
    </div>
  );
}
