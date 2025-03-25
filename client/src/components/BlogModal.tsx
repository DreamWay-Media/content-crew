import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { BlogArticle, DownloadRequest } from "@shared/types";
import { Image, Download, Upload, Loader2 } from "lucide-react";
import DownloadModal from "./DownloadModal";
import SignupModal from "./SignupModal";
import PublishModal from "./PublishModal";
import SaveCreationModal from "./SaveCreationModal";
import AIResearchTooltip from "@/components/AIResearchTooltip";
import ImageGenerationAnimation from "./ImageGenerationAnimation";
import { AI_RESEARCH_TOOLTIPS } from "@/lib/tooltipContent";
import { useToast } from "@/hooks/use-toast";

interface BlogModalProps {
  article: BlogArticle;
  isOpen: boolean;
  onClose: () => void;
  onGenerateImage: () => void;
  generatedImages: string[];
  isGeneratingImages: boolean;
  onSelectImage: (imageUrl: string) => void;
  onDownload: (data: DownloadRequest) => Promise<void>;
}

export default function BlogModal({ 
  article, 
  isOpen, 
  onClose, 
  onGenerateImage, 
  generatedImages = [], 
  isGeneratingImages = false,
  onSelectImage = () => {},
  onDownload
}: BlogModalProps) {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [showSaveCreationModal, setShowSaveCreationModal] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const hasScrolledToBottom = useRef(false);
  const { toast } = useToast();
  
  // Add copy protection and scroll detection
  useEffect(() => {
    if (!isOpen) return; // Only add protection when modal is open
    
    // Prevent context menu on images
    const preventImageContextMenu = (e: MouseEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
        toast({
          title: "Copy Protection",
          description: "Copying images is not permitted.",
          variant: "destructive"
        });
        return false;
      }
    };
    
    // Prevent copy events
    const preventCopy = (e: ClipboardEvent) => {
      if (e.target && (e.target as HTMLElement).closest('.blog-modal-content')) {
        e.preventDefault();
        toast({
          title: "Copy Protection",
          description: "Copying content is not permitted.",
          variant: "destructive"
        });
        return false;
      }
    };
    
    // Prevent text selection in article content
    const preventSelection = () => {
      const selection = window.getSelection();
      if (selection && document.querySelector('.blog-modal-content')?.contains(selection.anchorNode as Node)) {
        selection.removeAllRanges();
      }
    };
    
    // Add event listeners
    document.addEventListener('contextmenu', preventImageContextMenu);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('mouseup', preventSelection);
    document.addEventListener('keyup', preventSelection);
    
    // Clean up
    return () => {
      document.removeEventListener('contextmenu', preventImageContextMenu);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('mouseup', preventSelection);
      document.removeEventListener('keyup', preventSelection);
    };
  }, [isOpen, toast]);
  
  // Detect scroll to the bottom of content
  useEffect(() => {
    if (!isOpen) return;
    
    const dialogContent = document.querySelector('.blog-modal-content')?.closest('.max-h-\\[90vh\\]');
    
    if (!dialogContent) return;
    
    const handleScroll = () => {
      if (hasScrolledToBottom.current) return; // Only trigger once
      
      const { scrollTop, scrollHeight, clientHeight } = dialogContent as HTMLElement;
      const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 50; // 50px threshold
      
      if (scrolledToBottom) {
        hasScrolledToBottom.current = true;
        if (article.featureImage) {
          setShowSaveCreationModal(true);
        }
      }
    };
    
    dialogContent.addEventListener('scroll', handleScroll);
    
    return () => {
      dialogContent.removeEventListener('scroll', handleScroll);
    };
  }, [isOpen, article.featureImage]);
  
  // Show save modal when an image is selected if already scrolled to bottom
  useEffect(() => {
    if (article.featureImage && hasScrolledToBottom.current) {
      setShowSaveCreationModal(true);
    }
  }, [article.featureImage]);
  
  // Function to format the blog content with proper HTML paragraphs
  const formatContent = (content: string) => {
    // Check if the content has HTML tags
    if (content.includes('<h1>') || content.includes('<p>')) {
      // If it already has HTML, render it safely
      return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }
    
    // Otherwise split by paragraphs
    return content.split('\n\n').map((paragraph, index) => (
      <p key={index} className="mb-4">{paragraph}</p>
    ));
  };
  
  const handleOpenSignupModal = () => {
    setIsSignupModalOpen(true);
  };
  
  const handleCloseSignupModal = () => {
    setIsSignupModalOpen(false);
  };
  
  const handleOpenPublishModal = () => {
    setIsPublishModalOpen(true);
  };
  
  const handleClosePublishModal = () => {
    setIsPublishModalOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              {article.title}
              <AIResearchTooltip 
                content={AI_RESEARCH_TOOLTIPS.contentGeneration.content}
                title={AI_RESEARCH_TOOLTIPS.contentGeneration.title}
                className="ml-2"
              />
            </DialogTitle>
            <DialogDescription className="text-sm opacity-70 flex items-center">
              Generated article based on your selected research
              <AIResearchTooltip 
                content={AI_RESEARCH_TOOLTIPS.seoOptimization.content}
                title={AI_RESEARCH_TOOLTIPS.seoOptimization.title}
                className="ml-1"
                iconSize={14}
              />
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 blog-modal-content" style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>
            {article.featureImage ? (
              <div className="mb-6 rounded-lg overflow-hidden">
                <img 
                  src={article.featureImage} 
                  alt={article.title} 
                  className="w-full h-auto object-cover"
                />
              </div>
            ) : generatedImages.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  Select an image for your article:
                  <AIResearchTooltip 
                    content={AI_RESEARCH_TOOLTIPS.imageGeneration.content}
                    title={AI_RESEARCH_TOOLTIPS.imageGeneration.title}
                    className="ml-2"
                    iconSize={16}
                  />
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {generatedImages.map((imageUrl, index) => (
                    <div 
                      key={index} 
                      className="relative rounded-lg overflow-hidden border-2 hover:border-primary cursor-pointer transition-all"
                      onClick={() => onSelectImage(imageUrl)}
                    >
                      <img 
                        src={imageUrl} 
                        alt={`Option ${index + 1} for ${article.title}`} 
                        className="w-full h-auto object-cover aspect-video"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Button variant="secondary" className="bg-white">
                          Select This Image
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-6 bg-slate-100 rounded-lg h-[400px] flex items-center justify-center">
                <div className="w-full h-full">
                  {isGeneratingImages ? (
                    <ImageGenerationAnimation articleTitle={article.title} />
                  ) : (
                    <div className="text-center p-6 h-full flex flex-col items-center justify-center">
                      <div className="mx-auto bg-slate-200 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <Image className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 mb-4 flex items-center justify-center">
                        Add images to enhance your article
                        <AIResearchTooltip 
                          content={AI_RESEARCH_TOOLTIPS.imageGeneration.content}
                          title={AI_RESEARCH_TOOLTIPS.imageGeneration.title}
                          className="ml-1"
                          iconSize={14}
                        />
                      </p>
                      <Button 
                        onClick={onGenerateImage}
                        className="flex items-center gap-2"
                        disabled={isGeneratingImages}
                      >
                        <Image className="h-4 w-4" />
                        Generate Contextual Images
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="prose prose-slate max-w-none">
              {formatContent(article.content)}
            </div>
            
            {article.footnotes && article.footnotes.length > 0 && (
              <div className="mt-8 pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  References
                  <AIResearchTooltip 
                    content="Academic-style citations generated for your article based on the research sources. These enhance credibility and allow readers to verify information."
                    title="Intelligent Footnote Generator"
                    className="ml-2"
                    iconSize={16}
                  />
                </h3>
                <ol className="text-sm text-gray-700 space-y-2">
                  {article.footnotes.map((footnote) => (
                    <li key={footnote.id} className="text-sm">
                      <span className="font-medium">[{footnote.id}]</span> {footnote.text} <span className="italic">{footnote.source}</span>, {footnote.date}
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-6">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={onClose}
            >
              Close
            </Button>
            <div className="flex items-center">
              <Button 
                className="flex items-center gap-2"
                onClick={handleOpenPublishModal}
              >
                <Upload className="h-4 w-4" />
                Publish Article
              </Button>
              <AIResearchTooltip 
                content={AI_RESEARCH_TOOLTIPS.publishOption.content}
                title={AI_RESEARCH_TOOLTIPS.publishOption.title}
                className="ml-1"
                iconSize={14}
              />
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <SignupModal 
        isOpen={isSignupModalOpen}
        onClose={handleCloseSignupModal}
        articleTitle={article.title}
      />

      <PublishModal
        isOpen={isPublishModalOpen}
        onClose={handleClosePublishModal}
        articleTitle={article.title}
      />
      
      {/* Save Creation Modal - This modal won't close until the user takes a specific action */}
      <SaveCreationModal
        isOpen={showSaveCreationModal}
        articleTitle={article.title}
      />
    </>
  );
}