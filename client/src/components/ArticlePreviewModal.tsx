import React, { useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogArticle } from "@shared/types";
import { useToast } from "@/hooks/use-toast";

interface ArticlePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: BlogArticle | null;
  isLoading: boolean;
  onDownload: () => void;
}

export default function ArticlePreviewModal({ 
  isOpen, 
  onClose, 
  article, 
  isLoading, 
  onDownload 
}: ArticlePreviewModalProps) {
  const { toast } = useToast();
  
  // Add copy protection
  useEffect(() => {
    if (!isOpen) return;
    
    // Prevent context menu on images and text
    const preventContextMenu = (e: MouseEvent) => {
      if (e.target && (e.target as HTMLElement).closest('.article-preview-content')) {
        e.preventDefault();
        if ((e.target as HTMLElement).tagName === 'IMG') {
          toast({
            title: "Copy Protection",
            description: "Copying images is not permitted.",
            variant: "destructive"
          });
        }
        return false;
      }
    };
    
    // Prevent copy events
    const preventCopy = (e: ClipboardEvent) => {
      if (e.target && (e.target as HTMLElement).closest('.article-preview-content')) {
        e.preventDefault();
        toast({
          title: "Copy Protection",
          description: "Copying content is not permitted.",
          variant: "destructive"
        });
        return false;
      }
    };
    
    // Prevent selection
    const preventSelection = () => {
      const selection = window.getSelection();
      if (selection && document.querySelector('.article-preview-content')?.contains(selection.anchorNode as Node)) {
        selection.removeAllRanges();
      }
    };
    
    // Add event listeners
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('copy', preventCopy);
    document.addEventListener('mouseup', preventSelection);
    document.addEventListener('keyup', preventSelection);
    
    // Clean up
    return () => {
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('copy', preventCopy);
      document.removeEventListener('mouseup', preventSelection);
      document.removeEventListener('keyup', preventSelection);
    };
  }, [isOpen, toast]);
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {isLoading ? (
              <Skeleton className="h-8 w-2/3" />
            ) : (
              article?.title
            )}
          </DialogTitle>
          <DialogDescription>
            {isLoading ? (
              <span className="block text-gray-500"><Skeleton className="h-4 w-1/2 mt-2" /></span>
            ) : (
              <span className="text-gray-500">Article Preview</span>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 article-preview-content" style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none', userSelect: 'none' }}>
          {isLoading ? (
            <>
              <Skeleton className="h-64 w-full rounded-md mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4 mb-2" />
            </>
          ) : article ? (
            <>
              {article.featureImage && (
                <div className="mb-6">
                  <img 
                    src={article.featureImage} 
                    alt={article.title} 
                    className="w-full h-auto rounded-md object-cover"
                    onError={(e) => {
                      // If the image fails to load, replace with placeholder
                      e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Unavailable";
                      e.currentTarget.alt = "Image unavailable";
                    }}
                  />
                </div>
              )}
              <div 
                className="prose prose-sm md:prose-base lg:prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
              
              {article.footnotes && article.footnotes.length > 0 && (
                <div className="mt-8 pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold mb-2">References</h3>
                  <ol className="text-sm text-gray-700 space-y-2">
                    {article.footnotes.map((footnote) => (
                      <li key={footnote.id} className="text-sm">
                        <span className="font-medium">[{footnote.id}]</span> {footnote.text} <span className="italic">{footnote.source}</span>, {footnote.date}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-gray-500">
              No article content available
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button 
            onClick={onDownload} 
            className="gap-1"
            disabled={isLoading || !article}
          >
            <Download className="h-4 w-4" />
            Download Content
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}