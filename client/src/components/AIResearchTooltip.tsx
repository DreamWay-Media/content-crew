import React from "react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface AIResearchTooltipProps {
  content: string;
  title?: string;
  className?: string;
  iconSize?: number;
}

export default function AIResearchTooltip({
  content,
  title,
  className = "",
  iconSize = 16,
}: AIResearchTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={`inline-flex text-primary cursor-help ${className}`}>
            <HelpCircle size={iconSize} className="hover:text-primary/80 transition-colors" />
          </span>
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-sm bg-white border border-gray-200 shadow-lg p-3 rounded-lg"
          sideOffset={5}
        >
          {title && <h4 className="font-medium text-gray-900 mb-1">{title}</h4>}
          <p className="text-sm text-gray-700">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}