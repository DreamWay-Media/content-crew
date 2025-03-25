import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { BlogArticle, BlogGenerationRequest, BlogImagesResponse, DownloadRequest, DownloadResponse, ResearchSummary, ResearchRequest, ResearchResponse } from "@shared/types";
import ResearchForm from "@/components/ResearchForm";
import LoadingState from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import ResultsSection from "@/components/ResultsSection";
import BlogModal from "@/components/BlogModal";
import CuriosityMeter from "@/components/CuriosityMeter";
import { 
  downloadArticle, 
  generateBlogArticle, 
  generateBlogImages, 
  performResearch, 
  getSessionId, 
  saveTemporaryContent, 
  getTemporaryContent 
} from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import AppLayout from "@/components/AppLayout";
import BlogGenerationAnimation from "@/components/BlogGenerationAnimation";
import { SiShopify, SiWordpress, SiWebflow, SiNotion, SiAirtable, 
         SiSlack, SiTrello, SiAsana, SiHubspot, SiSalesforce } from "react-icons/si";

export default function Home() {
  const [results, setResults] = useState<ResearchSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [blogArticle, setBlogArticle] = useState<BlogArticle | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedSummaries, setSelectedSummaries] = useState<ResearchSummary[]>([]);
  const [searchId, setSearchId] = useState<number | undefined>(undefined);
  const [isLoadingSession, setIsLoadingSession] = useState(false);
  const { toast } = useToast();
  
  // Load any existing temporary content when the page loads
  useEffect(() => {
    const sessionId = getSessionId();
    
    const loadTemporaryContent = async () => {
      setIsLoadingSession(true);
      
      try {
        const tempContent = await getTemporaryContent(sessionId);
        
        if (tempContent) {
          console.log("Loaded temporary content:", tempContent);
          
          // If we have a search ID and it has associated summaries, load them
          if (tempContent.searchId && tempContent.summaries?.length > 0) {
            setSearchId(tempContent.searchId);
            setSearchTerm(tempContent.searchTerm || "");
            setResults(tempContent.summaries || []);
          }
          
          // If we have a blog article, load it
          if (tempContent.articleTitle && tempContent.articleContent) {
            setBlogArticle({
              title: tempContent.articleTitle,
              content: tempContent.articleContent,
              featureImage: tempContent.featuredImageUrl,
              footnotes: tempContent.footnotes ? JSON.parse(tempContent.footnotes) : []
            });
          }
          
          // If we have images, load them
          if (tempContent.images && tempContent.images.length > 0) {
            setGeneratedImages(tempContent.images);
          }
        }
      } catch (error) {
        console.error("Error loading temporary content:", error);
      } finally {
        setIsLoadingSession(false);
      }
    };
    
    loadTemporaryContent();
  }, []);

  // Research mutation
  const { mutate: performResearchMutation, isPending: isResearchPending, isError: isResearchError, error: researchError, reset: resetResearch } = useMutation({
    mutationFn: performResearch,
    onSuccess: async (data: ResearchResponse) => {
      setResults(data.summaries);
      setSearchTerm(data.searchTerm);
      
      // Save the search ID from the response
      if (data.searchId) {
        setSearchId(data.searchId);
        
        // Save to temporary storage
        await saveTemporaryContent({
          searchId: data.searchId,
          articleTitle: blogArticle?.title,
          articleContent: blogArticle?.content,
          featuredImageUrl: blogArticle?.featureImage,
          footnotes: blogArticle?.footnotes ? JSON.stringify(blogArticle.footnotes) : undefined,
          images: generatedImages
        });
      }
      
      toast({
        title: "Research complete",
        description: `Found ${data.summaries.length} summaries for "${data.searchTerm}"`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Research failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Blog generation mutation
  const { mutate: generateBlogMutation, isPending: isBlogGenerating } = useMutation({
    mutationFn: generateBlogArticle,
    onSuccess: async (data: BlogArticle) => {
      setBlogArticle(data);
      setBlogModalOpen(true);
      // Reset generated images when a new blog is created
      setGeneratedImages([]);
      
      // Save to temporary storage
      await saveTemporaryContent({
        searchId,
        articleTitle: data.title,
        articleContent: data.content,
        featuredImageUrl: data.featureImage,
        footnotes: data.footnotes ? JSON.stringify(data.footnotes) : undefined,
        images: []
      });
      
      toast({
        title: "Blog article generated",
        description: "Your blog article has been successfully created",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Blog generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Image generation mutation
  const { mutate: generateImagesMutation, isPending: isGeneratingImages } = useMutation({
    mutationFn: (article: BlogArticle) => generateBlogImages(article.title, article.content),
    onSuccess: async (data: BlogImagesResponse) => {
      setGeneratedImages(data.images);
      
      // Save to temporary storage
      if (blogArticle) {
        await saveTemporaryContent({
          searchId,
          articleTitle: blogArticle.title,
          articleContent: blogArticle.content,
          featuredImageUrl: blogArticle.featureImage,
          footnotes: blogArticle.footnotes ? JSON.stringify(blogArticle.footnotes) : undefined,
          images: data.images
        });
      }
      
      toast({
        title: "Images generated",
        description: "Select an image to use for your blog article",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Image generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Download article mutation
  const { mutate: downloadArticleMutation, isPending: isDownloading } = useMutation({
    mutationFn: downloadArticle,
    onSuccess: (data: DownloadResponse) => {
      toast({
        title: "Download request submitted",
        description: "Your article will be sent to your email shortly",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ResearchRequest) => {
    setResults([]);
    resetResearch();
    performResearchMutation(data);
  };

  const handleNextStep = (summaries: ResearchSummary[]) => {
    if (summaries.length === 0) {
      toast({
        title: "No summaries selected",
        description: "Please select at least one summary to generate a blog article",
        variant: "destructive",
      });
      return;
    }

    // Store the selected summaries to use in the animation
    setSelectedSummaries(summaries);

    const blogRequest: BlogGenerationRequest = {
      searchTerm,
      selectedSummaries: summaries
    };

    generateBlogMutation(blogRequest);
  };

  const handleRetry = () => {
    resetResearch();
  };
  
  const handleGenerateImage = () => {
    if (!blogArticle) return;
    
    // Call the image generation mutation
    generateImagesMutation(blogArticle);
  };
  
  const handleSelectImage = async (imageUrl: string) => {
    if (!blogArticle) return;
    
    // Update the blog article with the selected image
    const updatedArticle = {
      ...blogArticle,
      featureImage: imageUrl
    };
    
    setBlogArticle(updatedArticle);
    
    // Save to temporary storage with the selected featured image
    await saveTemporaryContent({
      searchId,
      articleTitle: updatedArticle.title,
      articleContent: updatedArticle.content,
      featuredImageUrl: imageUrl,
      footnotes: updatedArticle.footnotes ? JSON.stringify(updatedArticle.footnotes) : undefined,
      images: generatedImages
    });
    
    toast({
      title: "Image selected",
      description: "The selected image has been added to your blog article",
    });
  };
  
  const handleCloseModal = () => {
    setBlogModalOpen(false);
  };
  
  const handleDownload = async (data: DownloadRequest) => {
    await downloadArticleMutation(data);
  };

  return (
    <AppLayout activePage="home">
      <div className="container mx-auto px-4 pt-16 pb-12 lg:pt-24 flex-grow">

        {/* Show the search form if there are no results or error */}
        {!isResearchPending && results.length === 0 && !isResearchError && (
          <ResearchForm onSubmit={handleSubmit} isLoading={isResearchPending} />
        )}

        {/* Show the Curiosity Meter when researching or when results are displayed */}
        {(isResearchPending || results.length > 0) && (
          <CuriosityMeter 
            isResearching={isResearchPending} 
            searchTerm={searchTerm}
            completionPercentage={results.length > 0 ? 100 : undefined}
          />
        )}

        {/* Show the loading state during API calls */}
        {isResearchPending && <LoadingState />}

        {/* Show error state if there's an error */}
        {isResearchError && <ErrorState message={researchError.message} onRetry={handleRetry} />}

        {/* Show results if available */}
        {!isResearchPending && !isResearchError && results.length > 0 && (
          <ResultsSection 
            searchTerm={searchTerm} 
            results={results} 
            onNextStep={handleNextStep}
          />
        )}
        
        {/* Blog generation loading state */}
        {isBlogGenerating && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-2xl w-full">
              <BlogGenerationAnimation 
                selectedSummaries={selectedSummaries} 
                searchTerm={searchTerm} 
              />
            </div>
          </div>
        )}
        
        {/* Blog Modal */}
        {blogArticle && (
          <BlogModal 
            article={blogArticle} 
            isOpen={blogModalOpen}
            onClose={handleCloseModal}
            onGenerateImage={handleGenerateImage}
            generatedImages={generatedImages}
            isGeneratingImages={isGeneratingImages}
            onSelectImage={handleSelectImage}
            onDownload={handleDownload}
          />
        )}
        
        {/* Supported Platform Integrations */}
        {!isResearchPending && results.length === 0 && !isResearchError && (
          <div className="max-w-4xl mx-auto mt-20 mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Supported Platform Integrations</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <SiShopify className="w-12 h-12 text-[#96bf48] mb-2" />
                <span className="text-sm font-medium">Shopify</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <SiWordpress className="w-12 h-12 text-[#21759b] mb-2" />
                <span className="text-sm font-medium">WordPress</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <SiWebflow className="w-12 h-12 text-[#4353ff] mb-2" />
                <span className="text-sm font-medium">Webflow</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <SiNotion className="w-12 h-12 text-black mb-2" />
                <span className="text-sm font-medium">Notion</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <SiAirtable className="w-12 h-12 text-[#18bfff] mb-2" />
                <span className="text-sm font-medium">Airtable</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <SiSlack className="w-12 h-12 text-[#4A154B] mb-2" />
                <span className="text-sm font-medium">Slack</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <SiTrello className="w-12 h-12 text-[#0079bf] mb-2" />
                <span className="text-sm font-medium">Trello</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <SiAsana className="w-12 h-12 text-[#fc636b] mb-2" />
                <span className="text-sm font-medium">Asana</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <SiHubspot className="w-12 h-12 text-[#ff7a59] mb-2" />
                <span className="text-sm font-medium">HubSpot</span>
              </div>
              <div className="flex flex-col items-center justify-center bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <SiSalesforce className="w-12 h-12 text-[#00a1e0] mb-2" />
                <span className="text-sm font-medium">Salesforce</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
