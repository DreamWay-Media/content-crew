import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DownloadForm from "./DownloadForm";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import AIResearchTooltip from "@/components/AIResearchTooltip";
import { AI_RESEARCH_TOOLTIPS } from "@/lib/tooltipContent";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (data: { firstName: string; lastName: string; email: string }) => Promise<void>;
}

export default function DownloadModal({ isOpen, onClose, onDownload }: DownloadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (data: { firstName: string; lastName: string; email: string }) => {
    try {
      setIsLoading(true);
      await onDownload(data);
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting download request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setIsSuccess(false);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold mb-2 flex items-center justify-center">
            {isSuccess ? "Success!" : "Download Your Article"}
            {!isSuccess && (
              <AIResearchTooltip 
                content={AI_RESEARCH_TOOLTIPS.downloadOption.content}
                title={AI_RESEARCH_TOOLTIPS.downloadOption.title}
                className="ml-2"
              />
            )}
          </DialogTitle>
          <DialogDescription className="text-center flex items-center justify-center">
            {isSuccess 
              ? "Your article has been sent to your email. Please check your inbox."
              : (
                <>
                  Fill in your details to receive the article with images
                  <AIResearchTooltip 
                    content={AI_RESEARCH_TOOLTIPS.ethicalSourcing.content}
                    title={AI_RESEARCH_TOOLTIPS.ethicalSourcing.title}
                    className="ml-1"
                    iconSize={14}
                  />
                </>
              )
            }
          </DialogDescription>
        </DialogHeader>
        
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center p-6">
            <div className="bg-green-100 p-3 rounded-full mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center mb-4">
              <p className="text-center text-gray-700">
                Thank you! Your article package has been sent to your email.
              </p>
              <AIResearchTooltip 
                content={AI_RESEARCH_TOOLTIPS.factChecking.content}
                title={AI_RESEARCH_TOOLTIPS.factChecking.title}
                className="ml-1"
                iconSize={14}
              />
            </div>
            <p className="text-center text-sm text-gray-500">
              If you don't see it in your inbox, please check your spam folder.
            </p>
          </div>
        ) : (
          <DownloadForm onSubmit={handleSubmit} isLoading={isLoading} />
        )}
      </DialogContent>
    </Dialog>
  );
}