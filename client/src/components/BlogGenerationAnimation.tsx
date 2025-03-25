import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { ResearchSummary } from "@shared/types";

interface BlogGenerationAnimationProps {
  completionPercentage?: number;
  selectedSummaries?: ResearchSummary[];
  searchTerm?: string;
}

export default function BlogGenerationAnimation({ 
  completionPercentage,
  selectedSummaries = [],
  searchTerm = ""
}: BlogGenerationAnimationProps) {
  const [progress, setProgress] = useState(0);
  const [blocksVisible, setBlocksVisible] = useState<number[]>([]);
  const [wordsVisible, setWordsVisible] = useState<number[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  
  // Total number of blocks and words
  const totalBlocks = 8;
  const totalWords = 16;
  
  // Extract keywords from summaries when available
  useEffect(() => {
    if (selectedSummaries && selectedSummaries.length > 0) {
      // Combine all summaries into one text
      const allText = selectedSummaries
        .map(summary => summary.title + " " + summary.summary)
        .join(" ");
      
      // Extract potential keywords (nouns and important terms)
      const words = allText.split(/\s+/);
      // Filter for words at least 4 characters long
      const filteredWords = words
        .filter(word => word.length >= 4)
        // Remove punctuation
        .map(word => word.replace(/[.,;:?!()'"]/g, ''))
        // Remove common words
        .filter(word => !["this", "that", "with", "have", "from", "their", "they", "these", "were", "been", "more", "such", "most", "which"].includes(word.toLowerCase()));
        
      // Remove duplicates
      const potentialKeywords = Array.from(new Set(filteredWords));
      
      // Randomize and limit to 20 keywords
      const shuffled = potentialKeywords.sort(() => 0.5 - Math.random());
      setKeywords(shuffled.slice(0, 20));
    } else {
      // Fallback keywords for generic content creation
      setKeywords([
        "Content", "Insight", "Analysis", "Research", 
        "Topic", "Discover", "Perspective", "Information", 
        "Facts", "Trends", "Findings", "Data", 
        "Knowledge", "Results", "Evidence", "Context"
      ]);
    }
  }, [selectedSummaries]);
  
  // Block and word positions
  const blockPositions = [
    { top: "30%", left: "20%" }, { top: "60%", left: "25%" },
    { top: "20%", left: "75%" }, { top: "70%", left: "70%" },
    { top: "40%", left: "15%" }, { top: "50%", left: "80%" },
    { top: "25%", left: "45%" }, { top: "65%", left: "55%" }
  ];
  
  const wordPositions = [
    { top: "20%", left: "25%" }, { top: "35%", left: "70%" },
    { top: "50%", left: "20%" }, { top: "65%", left: "75%" },
    { top: "25%", left: "55%" }, { top: "40%", left: "30%" },
    { top: "55%", left: "65%" }, { top: "70%", left: "35%" },
    { top: "30%", left: "85%" }, { top: "45%", left: "15%" },
    { top: "60%", left: "40%" }, { top: "75%", left: "60%" },
    { top: "20%", left: "10%" }, { top: "35%", left: "45%" }, 
    { top: "50%", left: "80%" }, { top: "65%", left: "15%" }
  ];
  
  // Handle progress animation
  useEffect(() => {
    if (completionPercentage !== undefined) {
      setProgress(completionPercentage);
    } else {
      // Simulate progress
      const interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.max(1, Math.floor((100 - prev) / 15));
          return Math.min(95, prev + increment);
        });
      }, 800);
      
      return () => clearInterval(interval);
    }
  }, [completionPercentage]);
  
  // Add blocks and words based on progress
  useEffect(() => {
    // Add blocks
    const blocksToShow = Math.floor((progress / 100) * totalBlocks);
    if (blocksToShow > blocksVisible.length) {
      const newBlocks = Array.from(
        { length: blocksToShow - blocksVisible.length }, 
        (_, i) => blocksVisible.length + i
      );
      setBlocksVisible(prev => [...prev, ...newBlocks]);
    }
    
    // Add words
    const wordsToShow = Math.floor((progress / 100) * totalWords);
    if (wordsToShow > wordsVisible.length) {
      const newWords = Array.from(
        { length: wordsToShow - wordsVisible.length }, 
        (_, i) => wordsVisible.length + i
      );
      setWordsVisible(prev => [...prev, ...newWords]);
    }
  }, [progress, blocksVisible.length, wordsVisible.length]);
  
  return (
    <div className="max-w-lg mx-auto text-center">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Content Building Blocks Animation */}
        <div className="relative h-36 flex-1 bg-gray-50 rounded-lg overflow-hidden">
          {blocksVisible.map((index) => {
            // Add variety to block sizes and colors
            const isImportant = index % 3 === 0; // Every third block is "important"
            const width = isImportant ? "w-14" : index % 2 === 0 ? "w-12" : "w-10";
            const height = isImportant ? "h-9" : index % 2 === 0 ? "h-8" : "h-7";
            const opacity = isImportant ? "bg-primary/30" : "bg-primary/20"; 
            const borderColor = isImportant ? "border-primary" : "border-primary/70";
            
            return (
              <div 
                key={`block-${index}`}
                className={`absolute ${width} ${height} ${opacity} border ${borderColor} rounded-md flex items-center justify-center animate-float`}
                style={{ 
                  top: blockPositions[index].top, 
                  left: blockPositions[index].left,
                  animationDelay: `${index * 0.2}s`
                }}
              >
                <div className={`${isImportant ? "w-10" : "w-8"} h-1 bg-primary/40 rounded`}></div>
              </div>
            );
          })}
          
          {/* Document outline in the center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-28 border-2 border-primary bg-white rounded-md flex flex-col p-2 shadow-md">
            <div className="w-full h-2 bg-primary/20 rounded mb-1"></div>
            <div className="w-full h-2 bg-primary/20 rounded mb-1"></div>
            <div className="w-3/4 h-2 bg-primary/20 rounded mb-1"></div>
            <div className="w-full h-2 bg-primary/20 rounded mb-1"></div>
            <div className="w-5/6 h-2 bg-primary/20 rounded mb-1"></div>
            <div className="w-full h-2 bg-primary/20 rounded"></div>
          </div>
        </div>
        
        {/* Word Cloud Animation */}
        <div className="relative h-36 flex-1 bg-gray-50 rounded-lg overflow-hidden">
          {wordsVisible.map((index) => {
            // Add variety to word sizes, weights and colors
            const word = keywords[index % keywords.length];
            const isImportant = index % 4 === 0; // Every fourth word is highlighted
            const fontSize = isImportant 
              ? `${Math.random() * 0.2 + 0.85}rem` 
              : `${Math.random() * 0.3 + 0.65}rem`;
            const opacity = isImportant ? 1 : 0.7 + Math.random() * 0.3;
            const fontWeight = isImportant ? "font-semibold" : "font-medium";
            const textColor = isImportant ? "text-primary" : "text-primary/80";
            
            return (
              <div 
                key={`word-${index}`}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${textColor} ${fontWeight} animate-pop-in`}
                style={{ 
                  top: wordPositions[index].top, 
                  left: wordPositions[index].left,
                  fontSize: fontSize,
                  opacity: opacity,
                  animationDelay: `${index * 0.15}s`
                }}
              >
                {word}
              </div>
            );
          })}
          
          {/* Document outline in the center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-28 border-2 border-primary bg-white rounded-md shadow-lg z-10">
            <div className="absolute inset-0 flex flex-col p-2">
              <div className="w-full h-2 bg-primary/20 rounded mb-1"></div>
              <div className="w-full h-2 bg-primary/20 rounded mb-1"></div>
              <div className="w-3/4 h-2 bg-primary/20 rounded mb-1"></div>
              <div className="w-full h-2 bg-primary/20 rounded mb-1"></div>
              <div className="w-5/6 h-2 bg-primary/20 rounded mb-1"></div>
              <div className="w-full h-2 bg-primary/20 rounded"></div>
            </div>
          </div>
        </div>
      </div>
      
      <h3 className="text-lg font-medium text-neutral-800 mt-4 mb-2">
        {searchTerm 
          ? `Transforming research on "${searchTerm}" into compelling content...`
          : "Transforming research into compelling content..."}
      </h3>
      
      <div className="w-full max-w-sm h-2 mt-2 mx-auto bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary rounded-full transition-all duration-500 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}