import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Brain } from "lucide-react";

interface CuriosityMeterProps {
  isResearching: boolean;
  searchTerm?: string;
  completionPercentage?: number;
}

export default function CuriosityMeter({ 
  isResearching, 
  searchTerm, 
  completionPercentage 
}: CuriosityMeterProps) {
  const [progress, setProgress] = useState(0);
  const [curiosityLevel, setCuriosityLevel] = useState("");
  
  // Handle auto-incrementing progress when researching
  useEffect(() => {
    if (isResearching) {
      // Reset progress when starting a new search
      setProgress(0);
      
      // Simulate progress increasing in steps
      const interval = setInterval(() => {
        setProgress(prev => {
          // Progress should increase more slowly as it gets higher
          const increment = Math.max(1, Math.floor((100 - prev) / 10));
          const newValue = Math.min(95, prev + increment); // Cap at 95% until complete
          
          // Update curiosity level based on progress
          if (newValue < 20) setCuriosityLevel("Getting curious...");
          else if (newValue < 40) setCuriosityLevel("Brain warming up!");
          else if (newValue < 60) setCuriosityLevel("Digging deeper!");
          else if (newValue < 80) setCuriosityLevel("Curiosity intensifying!");
          else setCuriosityLevel("Maximum curiosity!");
          
          return newValue;
        });
      }, 500);
      
      return () => clearInterval(interval);
    } else if (completionPercentage !== undefined) {
      // If we have a completion percentage, use that value directly
      setProgress(completionPercentage);
      setCuriosityLevel("Research complete!");
    }
  }, [isResearching, completionPercentage]);
  
  if (!isResearching && !completionPercentage) {
    return null; // Don't show meter until research begins
  }
  
  return (
    <div className="w-full max-w-md mx-auto bg-white p-4 rounded-lg shadow-md mb-8">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Brain className="text-primary h-5 w-5 mr-2" />
          <h3 className="font-medium text-neutral-800">Curiosity Meter</h3>
        </div>
        <div className="flex items-center">
          <Sparkles className={`h-4 w-4 mr-1 ${progress > 50 ? 'text-primary animate-pulse' : 'text-neutral-400'}`} />
          <Sparkles className={`h-5 w-5 mr-1 ${progress > 75 ? 'text-primary animate-pulse' : 'text-neutral-400'}`} />
          <Sparkles className={`h-6 w-6 ${progress > 90 ? 'text-primary animate-pulse' : 'text-neutral-400'}`} />
        </div>
      </div>
      
      <Progress value={progress} className="h-3 mb-2" />
      
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-primary">{curiosityLevel}</span>
        <span className="text-sm text-neutral-500">{`${Math.round(progress)}%`}</span>
      </div>
      
      {searchTerm && (
        <p className="text-xs text-neutral-500 mt-2">
          Researching: <span className="font-medium">{searchTerm}</span>
        </p>
      )}
    </div>
  );
}