import React, { useRef, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  title: string;
  isLoading: boolean;
  onDownload: () => void;
}

export default function ImageGalleryModal({ 
  isOpen, 
  onClose, 
  images, 
  title,
  isLoading,
  onDownload
}: ImageGalleryModalProps) {
  const [carouselApi, setCarouselApi] = React.useState<CarouselApi>();
  const [processedImages, setProcessedImages] = React.useState<string[]>([]);
  const { toast } = useToast();
  
  // Add copy protection for images
  useEffect(() => {
    if (!isOpen) return;
    
    // Prevent right-clicking on images
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
    
    // Prevent drag operations on images
    const preventImageDrag = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };
    
    // Add event listeners
    document.addEventListener('contextmenu', preventImageContextMenu);
    document.addEventListener('dragstart', preventImageDrag);
    
    // Clean up
    return () => {
      document.removeEventListener('contextmenu', preventImageContextMenu);
      document.removeEventListener('dragstart', preventImageDrag);
    };
  }, [isOpen, toast]);
  
  // Log when component updates with images
  useEffect(() => {
    if (images && images.length > 0) {
      console.log(`ImageGalleryModal: Received ${images.length} images`);
      // Filter out any invalid or empty image URLs
      const filtered = images.filter(url => url && url.trim() !== '');
      console.log(`ImageGalleryModal: After filtering, ${filtered.length} valid image URLs remain`);
      setProcessedImages(filtered);
    } else {
      setProcessedImages([]);
    }
  }, [images]);

  const onThumbnailClick = React.useCallback((index: number) => {
    if (carouselApi) {
      carouselApi.scrollTo(index);
    }
  }, [carouselApi]);
  
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    console.log(`Image ${index + 1} loaded successfully`);
  };
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    console.warn(`Failed to load image ${index + 1} - URL: ${processedImages[index].substring(0, 50)}...`);
    // Replace with placeholder
    e.currentTarget.src = "https://via.placeholder.com/800x400?text=Image+Unavailable";
    e.currentTarget.alt = "Image unavailable";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Images for "{title}"</DialogTitle>
          <DialogDescription>
            {isLoading 
              ? <span className="block text-gray-500"><Skeleton className="h-4 w-3/4 mt-1" /></span>
              : <span className="text-gray-500">Browse all {processedImages?.length || 0} images generated for this article</span>
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="my-6">
          {isLoading ? (
            <Skeleton className="h-[400px] w-full rounded-md" />
          ) : processedImages && processedImages.length > 0 ? (
            <Carousel className="w-full" setApi={setCarouselApi}>
              <CarouselContent>
                {processedImages.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative h-[400px] p-1" style={{ pointerEvents: 'auto' }}>
                      <img 
                        src={image} 
                        alt={`Image ${index + 1} for ${title}`}
                        className="w-full h-full object-contain rounded-md copy-protected"
                        style={{ 
                          WebkitUserSelect: 'none', 
                          MozUserSelect: 'none', 
                          msUserSelect: 'none', 
                          userSelect: 'none',
                          pointerEvents: 'none'
                        }}
                        onLoad={(e) => handleImageLoad(e, index)}
                        onError={(e) => handleImageError(e, index)}
                      />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                        {index + 1} / {processedImages.length}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-2" />
              <CarouselNext className="right-2" />
            </Carousel>
          ) : (
            <div className="text-center py-12 text-gray-500 border border-dashed rounded-md">
              No images available
            </div>
          )}
        </div>
        
        {!isLoading && processedImages?.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
            {processedImages.map((image, index) => (
              <div 
                key={index} 
                className="border rounded overflow-hidden cursor-pointer hover:border-primary transition-colors h-20"
                onClick={() => onThumbnailClick(index)}
              >
                <img 
                  src={image} 
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-cover copy-protected"
                  style={{ 
                    WebkitUserSelect: 'none', 
                    MozUserSelect: 'none', 
                    msUserSelect: 'none', 
                    userSelect: 'none'
                  }}
                  onError={(e) => {
                    console.warn(`Failed to load thumbnail ${index + 1}`);
                    e.currentTarget.src = "https://via.placeholder.com/100x100?text=Unavailable";
                    e.currentTarget.alt = "Thumbnail unavailable";
                  }}
                />
              </div>
            ))}
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button 
            onClick={onDownload} 
            className="gap-1"
            disabled={isLoading || !processedImages || processedImages.length === 0}
          >
            <Download className="h-4 w-4" />
            Download All Images
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}