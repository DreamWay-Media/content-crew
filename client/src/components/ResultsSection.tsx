import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ResearchSummary } from "@shared/types";
import { Calendar, BookOpen, CheckCheck, ArrowRight, Download, FileDown } from "lucide-react";
import AIResearchTooltip from "@/components/AIResearchTooltip";
import { AI_RESEARCH_TOOLTIPS } from "@/lib/tooltipContent";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface ResultsSectionProps {
  searchTerm: string;
  results: ResearchSummary[];
  onNextStep: (selectedSummaries: ResearchSummary[]) => void;
}

export default function ResultsSection({ searchTerm, results, onNextStep }: ResultsSectionProps) {
  const [selectedResults, setSelectedResults] = useState<number[]>([]);
  const { toast } = useToast();

  const MAX_SELECTIONS = 5;
  
  // Add copy protection
  useEffect(() => {
    // Prevent copy operations
    const handleCopy = (e: ClipboardEvent) => {
      const target = e.target as HTMLElement;
      // Check if the target or its parents have the research-results class
      if (target && target.closest('.research-results')) {
        e.preventDefault();
        toast({
          title: "Copy Protection",
          description: "Copying content from research summaries is not permitted.",
          variant: "destructive"
        });
      }
    };
    
    // Prevent selection
    const handleSelection = () => {
      const selection = window.getSelection();
      if (selection && document.querySelector('.research-results')?.contains(selection.anchorNode as Node)) {
        selection.removeAllRanges();
      }
    };
    
    // Add event listeners
    document.addEventListener('copy', handleCopy);
    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('keyup', handleSelection);
    
    // Clean up event listeners on component unmount
    return () => {
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('keyup', handleSelection);
    };
  }, [toast]);

  const handleResultSelection = (id: number, checked: boolean) => {
    if (checked) {
      if (selectedResults.length >= MAX_SELECTIONS) {
        // Prevent selecting more than the limit
        return;
      }
      setSelectedResults(prev => [...prev, id]);
    } else {
      setSelectedResults(prev => prev.filter(resultId => resultId !== id));
    }
  };

  const handleSelectAll = () => {
    if (selectedResults.length > 0) {
      // If any are selected, deselect all
      setSelectedResults([]);
    } else {
      // Otherwise, select up to MAX_SELECTIONS
      setSelectedResults(results.slice(0, MAX_SELECTIONS).map(result => result.id));
    }
  };

  const handlePerformAction = () => {
    const selected = results.filter(result => selectedResults.includes(result.id));
    onNextStep(selected);
  };

  // Export functions
  const getExportData = () => {
    // Get either selected results or all results if nothing is selected
    const dataToExport = selectedResults.length > 0
      ? results.filter(result => selectedResults.includes(result.id))
      : results;
    
    return {
      searchTerm,
      date: new Date().toLocaleDateString(),
      results: dataToExport
    };
  };

  const exportAsJSON = () => {
    const data = getExportData();
    const jsonString = JSON.stringify(data, null, 2);
    downloadFile(jsonString, `${searchTerm.toLowerCase().replace(/\s+/g, '-')}-research.json`, 'application/json');
  };

  const exportAsCSV = () => {
    const data = getExportData();
    
    // Create CSV header
    let csvContent = "Title,Date,Sources Count,Summary\n";
    
    // Add each result as a row
    data.results.forEach(result => {
      // Properly escape fields that might contain commas
      const escapedSummary = `"${result.summary.replace(/"/g, '""')}"`;
      csvContent += `"${result.title}",${result.date},${result.sourcesCount},${escapedSummary}\n`;
    });
    
    downloadFile(csvContent, `${searchTerm.toLowerCase().replace(/\s+/g, '-')}-research.csv`, 'text/csv');
  };

  const exportAsTXT = () => {
    const data = getExportData();
    
    let txtContent = `Research Results for: ${data.searchTerm}\n`;
    txtContent += `Exported on: ${data.date}\n\n`;
    
    data.results.forEach((result, index) => {
      txtContent += `${index + 1}. ${result.title}\n`;
      txtContent += `   Date: ${result.date}\n`;
      txtContent += `   Sources: ${result.sourcesCount}\n`;
      txtContent += `   Summary: ${result.summary}\n\n`;
    });
    
    downloadFile(txtContent, `${searchTerm.toLowerCase().replace(/\s+/g, '-')}-research.txt`, 'text/plain');
  };

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    
    URL.revokeObjectURL(url);
  };

  return (
    <section className="max-w-4xl mx-auto mt-16 research-results">
      <div className="mb-8">
        <h3 className="text-2xl font-semibold text-neutral-800 mb-2">
          {searchTerm}
          <AIResearchTooltip 
            content={AI_RESEARCH_TOOLTIPS.searchProcess.content}
            title={AI_RESEARCH_TOOLTIPS.searchProcess.title}
            className="ml-2 align-middle"
          />
        </h3>
        <p className="text-neutral-700 opacity-70">
          <span className="text-primary font-medium">{results.length} research summaries</span> from the past 90 days
          <AIResearchTooltip 
            content={AI_RESEARCH_TOOLTIPS.recentInformation.content}
            title={AI_RESEARCH_TOOLTIPS.recentInformation.title}
            className="ml-1 align-middle"
            iconSize={14}
          />
        </p>
        <p className="text-neutral-600 text-sm mt-1 flex items-center">
          Select up to {MAX_SELECTIONS} summaries to generate a blog article ({selectedResults.length}/{MAX_SELECTIONS} selected)
          <AIResearchTooltip 
            content={AI_RESEARCH_TOOLTIPS.summarization.content}
            title={AI_RESEARCH_TOOLTIPS.summarization.title}
            className="ml-1 align-middle"
            iconSize={14}
          />
        </p>
        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleSelectAll}
            >
              <CheckCheck className="h-4 w-4" />
              {selectedResults.length > 0 ? "Deselect All" : `Select ${Math.min(results.length, MAX_SELECTIONS)}`}
            </Button>
            
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={results.length === 0}
                  >
                    <FileDown className="h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={exportAsJSON} className="cursor-pointer">
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsCSV} className="cursor-pointer">
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsTXT} className="cursor-pointer">
                    Export as Text
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <AIResearchTooltip 
                content={AI_RESEARCH_TOOLTIPS.exportResearch.content}
                title={AI_RESEARCH_TOOLTIPS.exportResearch.title}
                className="ml-1"
                iconSize={14}
              />
            </div>
          </div>
          
          <div className="flex items-center">
            <Button 
              className="flex items-center gap-2"
              disabled={selectedResults.length === 0}
              onClick={handlePerformAction}
            >
              Generate Blog <ArrowRight className="h-4 w-4" />
            </Button>
            <AIResearchTooltip 
              content={AI_RESEARCH_TOOLTIPS.contentGeneration.content}
              title={AI_RESEARCH_TOOLTIPS.contentGeneration.title}
              className="ml-2"
              iconSize={18}
            />
          </div>
        </div>
      </div>

      <div 
        className="space-y-6" 
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
      >
        {results.map((result) => (
          <Card 
            key={result.id} 
            className="transition-all duration-300 hover:shadow-md user-select-none"
            style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}
          >
            <CardContent className="p-6">
              <div className="flex items-start">
                <div className="flex items-center h-6 mr-4 mt-1">
                  <Checkbox 
                    id={`result-${result.id}`}
                    checked={selectedResults.includes(result.id)}
                    onCheckedChange={(checked) => 
                      handleResultSelection(result.id, checked === true)
                    }
                  />
                </div>
                <div className="flex-grow">
                  <h4 className="text-lg font-medium text-neutral-800 mb-2">{result.title}</h4>
                  <p className="text-neutral-700 opacity-80 mb-4">
                    {result.summary}
                  </p>
                  <div className="flex flex-wrap items-center text-sm gap-4">
                    <span className="flex items-center text-gray-500">
                      <Calendar className="text-primary h-4 w-4 mr-1" />
                      {result.date}
                    </span>
                    <span className="flex items-center text-gray-500">
                      <BookOpen className="text-primary h-4 w-4 mr-1" />
                      {result.sourcesCount} source{result.sourcesCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination omitted as it's not needed for the initial implementation */}
    </section>
  );
}
