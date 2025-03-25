import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ImageGenerationAnimationProps {
  articleTitle: string;
}

export default function ImageGenerationAnimation({ articleTitle }: ImageGenerationAnimationProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);
  
  // Simulate the image generation process with steps
  useEffect(() => {
    const totalDuration = 25000; // 25 seconds total animation time
    const interval = 5000; // 5 seconds per step
    const progressInterval = 100; // Update progress every 100ms
    
    // Update the step every 5 seconds
    const stepTimer = setInterval(() => {
      setStep((prevStep) => (prevStep + 1) % 5);
    }, interval);
    
    // Update the progress bar more frequently for a smooth animation
    const progressTimer = setInterval(() => {
      setProgress((prevProgress) => {
        const increment = (100 / (totalDuration / progressInterval));
        return Math.min(prevProgress + increment, 100);
      });
    }, progressInterval);
    
    return () => {
      clearInterval(stepTimer);
      clearInterval(progressTimer);
    };
  }, []);
  
  // Phrases that describe what's happening during image generation
  const phrases = [
    "Analyzing article content...",
    "Identifying key visual elements...",
    "Creating composition...",
    "Refining details and lighting...",
    "Adding final touches..."
  ];
  
  // Create a title that's safe for animation purposes
  const safeTitle = articleTitle || "your article";
  const shortTitle = safeTitle.length > 40 ? safeTitle.substring(0, 40) + "..." : safeTitle;
  
  return (
    <div className="flex flex-col items-center justify-center p-6 h-full">
      {/* Progress bar */}
      <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5 mb-6">
        <motion.div
          className="bg-primary h-2.5 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      
      {/* Revolving animation */}
      <div className="relative w-48 h-48 mb-6">
        {/* Outer circle with dots */}
        <div className="absolute inset-0 flex items-center justify-center">
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-primary rounded-full"
              initial={{ opacity: 0.3 }}
              animate={{ 
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1
              }}
              style={{
                top: `${50 - 40 * Math.cos(i * (Math.PI / 6))}%`,
                left: `${50 + 40 * Math.sin(i * (Math.PI / 6))}%`
              }}
            />
          ))}
        </div>
        
        {/* Inner revolving elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="absolute w-32 h-32 rounded-lg border-2 border-primary opacity-30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-20 h-20 rounded-lg border-2 border-primary opacity-50"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className="absolute w-10 h-10 rounded-lg bg-primary opacity-70"
            animate={{ rotate: 360, scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
        </div>
      </div>
      
      {/* Current action text with fade in/out effect */}
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-2"
      >
        <p className="font-medium text-gray-700">{phrases[step]}</p>
      </motion.div>
      
      {/* Information text */}
      <p className="text-gray-500 text-sm text-center">
        Creating beautiful visuals for "<span className="italic">{shortTitle}</span>"
      </p>
      <p className="text-gray-400 text-xs mt-4 text-center">
        Our AI is designing custom images that perfectly complement your content.
        <br />
        This typically takes about 20-30 seconds.
      </p>
    </div>
  );
}