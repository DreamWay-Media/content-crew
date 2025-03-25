import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AppLayout from "@/components/AppLayout";
import { Download, File, FileImage, FileArchive, Clock, CalendarIcon, LogOut, Eye, Image, Search } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { 
  getUserContent, 
  downloadContentZip, 
  UserContent, 
  previewContent, 
  getContentImages, 
  performResearch,
  generateBlogArticle,
  generateBlogImages,
  downloadArticle
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import ArticlePreviewModal from "@/components/ArticlePreviewModal";
import ImageGalleryModal from "@/components/ImageGalleryModal";
import BlogModal from "@/components/BlogModal";
import { BlogArticle, ResearchSummary, BlogGenerationRequest, ResearchRequest, ResearchResponse, BlogImagesResponse, DownloadRequest } from "@shared/types";

// Fallback data in case API fails - this ensures we always have content to display
// This represents content from the user's complete flow - research → article → images → download
const getMockUserContents = (): UserContent[] => {
  return [
    {
      id: 1,
      title: "Tackling River Pollution in Hawaii",
      searchTerm: "river pollution in hawaii",
      createdAt: new Date(Date.now() - 4200000).toISOString(), // 1 hour 10 minutes ago
      downloadUrl: "#",
      previewUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1621017373962-56e6736fb644?q=80&w=1000&auto=format&fit=crop",
      imageCount: 3
    },
    {
      id: 2,
      title: "Revolutionizing Apple Orchards: New Advances in Combating Tree Diseases",
      searchTerm: "apple tree diseases",
      createdAt: new Date(Date.now() - 9000000).toISOString(), // 2 hours 30 minutes ago
      downloadUrl: "#",
      previewUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=1000&auto=format&fit=crop",
      imageCount: 3
    },
    {
      id: 3,
      title: "Exploring California's Cutting-Edge House Design Trends",
      searchTerm: "House design trends in California",
      createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
      downloadUrl: "#",
      previewUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
      imageCount: 3
    },
    {
      id: 4,
      title: "Unveiling Earth's Secrets: The Dynamic World of Tectonic Plates",
      searchTerm: "tectonic plates",
      createdAt: new Date(Date.now() - 21600000).toISOString(), // 6 hours ago
      downloadUrl: "#",
      previewUrl: "#",
      thumbnailUrl: "https://images.unsplash.com/photo-1581290885338-8a3a8886e26b?q=80&w=1000&auto=format&fit=crop",
      imageCount: 3
    }
  ];
};

// Group contents by month
function groupContentByMonth(contents: UserContent[]) {
  const grouped: Record<string, UserContent[]> = {};
  
  contents.forEach(content => {
    const date = new Date(content.createdAt);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('default', { month: 'long', year: 'numeric' });
    
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    
    grouped[monthKey].push(content);
  });
  
  // Convert to array of { month, contents } objects and sort by date (newest first)
  return Object.entries(grouped)
    .map(([key, contents]) => {
      const date = new Date(contents[0].createdAt);
      return { 
        key, 
        month: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
        contents
      };
    })
    .sort((a, b) => b.key.localeCompare(a.key));
}

export default function Dashboard() {
  // Content management state
  const [activeTab, setActiveTab] = useState("all");
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [selectedContentTitle, setSelectedContentTitle] = useState("");
  const [selectedContentType, setSelectedContentType] = useState<string | undefined>();
  const [previewArticle, setPreviewArticle] = useState<BlogArticle | null>(null);
  const [contentImages, setContentImages] = useState<string[]>([]);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  
  // Research flow state (similar to home page)
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<ResearchSummary[]>([]);
  const [selectedSummaries, setSelectedSummaries] = useState<ResearchSummary[]>([]);
  const [blogArticle, setBlogArticle] = useState<BlogArticle | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [blogModalOpen, setBlogModalOpen] = useState(false);
  const [searchId, setSearchId] = useState<number | undefined>(undefined);
  const [resultsModalOpen, setResultsModalOpen] = useState(false);

  const { toast } = useToast();
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  
  // Query user content from API, fallback to mock data if API fails
  const { data: userContents, isLoading } = useQuery({ 
    queryKey: ['userContents', user?.email],
    queryFn: async () => {
      try {
        // Try to fetch from API first with the user's email
        if (!user?.email) {
          throw new Error("User not authenticated");
        }
        const response = await getUserContent(user.email);
        return response.contents;
      } catch (error) {
        console.warn("API fetch failed, using mock data:", error);
        // Return mock data as fallback
        return getMockUserContents();
      }
    },
    enabled: !!user?.email // Only run query when we have a user email
  });

  const groupedContents = userContents ? groupContentByMonth(userContents) : [];
  const contentCount = userContents?.length || 0;
  const thisMonthCount = groupedContents[0]?.contents.length || 0;
  
  // Research mutation (similar to home page)
  const { mutate: performResearchMutation, isPending: isResearching } = useMutation({
    mutationFn: (data: ResearchRequest) => performResearch(data),
    onSuccess: async (data: ResearchResponse) => {
      setResults(data.summaries);
      setSearchTerm(data.searchTerm);
      setSearchId(data.searchId);
      setResultsModalOpen(true);
      
      toast({
        title: "Research complete",
        description: `Found ${data.summaries.length} summaries about "${data.searchTerm}"`,
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
  const { mutate: generateBlogMutation, isPending: isGeneratingBlog } = useMutation({
    mutationFn: (data: BlogGenerationRequest) => generateBlogArticle(data),
    onSuccess: async (data: BlogArticle) => {
      setBlogArticle(data);
      setBlogModalOpen(true);
      setResultsModalOpen(false);
      
      toast({
        title: "Blog article generated",
        description: "Your article is ready to preview",
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
  
  // Download mutation
  const { mutate: downloadMutation, isPending: isDownloading } = useMutation({
    mutationFn: (data: DownloadRequest) => downloadArticle(data),
    onSuccess: (data) => {
      setBlogModalOpen(false);
      
      toast({
        title: "Download request received",
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
  
  // Function to handle research submission
  const handleResearch = () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Please enter a search term",
        description: "Enter a topic you'd like to research",
        variant: "destructive",
      });
      return;
    }
    
    performResearchMutation({ searchTerm });
  };
  
  // Function to handle next step after research results
  const handleNextStep = (selectedSummaries: ResearchSummary[]) => {
    if (selectedSummaries.length === 0) {
      toast({
        title: "No summaries selected",
        description: "Please select at least one summary to generate a blog article",
        variant: "destructive",
      });
      return;
    }
    
    // Store the selected summaries
    setSelectedSummaries(selectedSummaries);
    
    // Generate blog from selected summaries
    const blogRequest: BlogGenerationRequest = {
      searchTerm,
      selectedSummaries: selectedSummaries
    };
    
    generateBlogMutation(blogRequest);
  };
  
  // Function to handle generating images for a blog
  const handleGenerateImages = () => {
    if (blogArticle) {
      generateImagesMutation(blogArticle);
    }
  };
  
  // Function to handle selecting an image
  const handleSelectImage = (imageUrl: string) => {
    setSelectedImageUrl(imageUrl);
    
    if (blogArticle) {
      setBlogArticle({
        ...blogArticle,
        featureImage: imageUrl
      });
    }
  };
  
  // Function to handle download request
  const handleArticleDownload = async (data: DownloadRequest) => {
    await downloadMutation(data);
  };
  
  // Function to reset the research process
  const resetResearch = () => {
    setResults([]);
    setSelectedSummaries([]);
    setBlogArticle(null);
    setGeneratedImages([]);
    setSelectedImageUrl("");
    setBlogModalOpen(false);
    setResultsModalOpen(false);
  };
  
  // Function to handle logout
  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
      variant: "default",
    });
    setLocation("/");
  };
  
  // Function to handle preview article
  const handlePreview = async (contentId: string | number, title: string, contentType?: string, searchId?: number, summaryId?: number) => {
    setSelectedContentId(typeof contentId === 'number' ? contentId : 0);
    setSelectedContentTitle(title);
    setSelectedContentType(contentType);
    setIsLoadingPreview(true);
    setPreviewModalOpen(true);
    
    try {
      let article;
      
      // If this is a search content type with searchId and summaryId
      if (contentType === 'search' && searchId && summaryId) {
        // Get the summary directly from the API
        const response = await fetch(`/api/search/${searchId}/summary/${summaryId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch summary content');
        }
        article = await response.json();
      } else {
        // Otherwise treat as a download content
        const numericId = typeof contentId === 'number' ? contentId : parseInt(contentId.toString());
        if (isNaN(numericId)) {
          throw new Error('Invalid content ID');
        }
        
        console.log(`Requesting preview for content ID: ${numericId}`);
        
        // Pass user email for authentication
        article = user?.email 
          ? await previewContent(numericId, user.email)
          : await previewContent(numericId);
      }
      
      if (article) {
        console.log(`Preview loaded for: ${article.title}`);
        setPreviewArticle(article);
      } else {
        throw new Error('Failed to load article content');
      }
    } catch (error) {
      console.error("Failed to load article preview:", error);
      toast({
        title: "Preview failed",
        description: "There was an error loading the article preview. Please try again.",
        variant: "destructive",
      });
      
      // Close the modal on error
      setPreviewModalOpen(false);
    } finally {
      setIsLoadingPreview(false);
    }
  };
  
  // Function to handle viewing images
  const handleViewImages = async (contentId: string | number, title: string, contentType?: string) => {
    setSelectedContentId(typeof contentId === 'number' ? contentId : 0);
    setSelectedContentTitle(title);
    setSelectedContentType(contentType);
    setIsLoadingImages(true);
    setImageGalleryOpen(true);
    
    try {
      // If this is a search-based content, it won't have images
      if (contentType === 'search') {
        // For search-based content, we don't have images yet, so return an empty array
        setContentImages([]);
        toast({
          title: "No images available",
          description: "This research summary doesn't have associated images yet.",
          variant: "default",
        });
      } else {
        // For download content, get images from API
        const numericId = typeof contentId === 'number' ? contentId : parseInt(contentId.toString());
        if (isNaN(numericId)) {
          throw new Error('Invalid content ID');
        }
        
        // Pass user email for authentication
        const images = user?.email 
          ? await getContentImages(numericId, user.email)
          : await getContentImages(numericId);
        setContentImages(images);
      }
    } catch (error) {
      console.error("Failed to load images:", error);
      toast({
        title: "Image loading failed",
        description: "There was an error loading the images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingImages(false);
    }
  };
  
  // Function to handle content download
  const handleDownload = async (contentId: string | number, title: string, contentType?: string) => {
    try {
      // If this is a search-based content, show sign-up modal instead
      if (contentType === 'search') {
        // Show a message about needing to download research summaries
        toast({
          title: "Content needs processing",
          description: "Research summaries need to be converted to articles before downloading.",
          variant: "default",
        });
        
        // Redirect to the home page to start the full workflow
        setLocation("/");
        return;
      }
      
      // For normal content, proceed with download
      toast({
        title: "Downloading...",
        description: "Preparing your content package",
      });
      
      // Convert string ID to number if needed
      const numericId = typeof contentId === 'number' ? contentId : parseInt(contentId.toString());
      if (isNaN(numericId)) {
        throw new Error('Invalid content ID');
      }
      
      // Get the ZIP file blob
      const blob = user?.email 
        ? await downloadContentZip(numericId, user.email)
        : await downloadContentZip(numericId);
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.zip`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      a.remove();
      
      toast({
        title: "Download complete!",
        description: "Your content package has been downloaded.",
        variant: "default",
      });
    } catch (error) {
      console.error("Download failed:", error);
      toast({
        title: "Download failed",
        description: "There was an error downloading your content. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6 bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl shadow-sm">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary/80 text-transparent bg-clip-text">Your Content Dashboard</h1>
            <p className="text-gray-600">
              Access and download your generated content
            </p>
            {user && (
              <p className="text-xs text-gray-500 mt-1">
                Logged in as: {user.email}
              </p>
            )}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
        
        {/* Research Form */}
        <div className="mb-10 bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Create New Content</h2>
            <div className="flex items-center gap-4">
              <div className="relative flex-grow">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary">
                  <Search className="h-5 w-5" />
                </div>
                <Input 
                  className="pl-12 py-6 pr-4 border-2 rounded-xl focus-visible:ring-primary bg-white" 
                  placeholder="What would you like to research today?" 
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  value={searchTerm}
                />
              </div>
              <Button 
                className="bg-lime-500 hover:bg-lime-600 py-6 px-8 text-white rounded-xl"
                onClick={handleResearch}
                disabled={isResearching || !searchTerm.trim()}
              >
                {isResearching ? "Researching..." : "Start Your Research Agent"}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="border-t-4 border-t-blue-500 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                <FileArchive className="h-4 w-4 mr-2 text-blue-500" />
                Total Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{contentCount}</div>
              <p className="text-sm text-gray-500 mt-1">
                Articles with images
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-green-500 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-2 text-green-500" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">{thisMonthCount}</div>
              <p className="text-sm text-gray-500 mt-1">
                New articles created
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-t-4 border-t-purple-500 shadow-sm hover:shadow-md transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center">
                <Download className="h-4 w-4 mr-2 text-purple-500" />
                Plan Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="text-3xl font-bold text-purple-700">
                {thisMonthCount} <span className="text-sm text-gray-500">/ 5</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-1">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ width: `${Math.min((thisMonthCount / 5) * 100, 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Monthly downloads (Basic Plan)
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-gray-100">
              <TabsTrigger value="all" className="data-[state=active]:bg-white">All Content</TabsTrigger>
              <TabsTrigger value="recent" className="data-[state=active]:bg-white">Recent</TabsTrigger>
              <TabsTrigger value="favorites" className="data-[state=active]:bg-white">Favorites</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-1 bg-white border-gray-200 text-gray-700 hover:bg-gray-50">
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                    <span>Filter by Date</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem className="cursor-pointer">
                    Last 7 days
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Last 30 days
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Last 90 days
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    This year
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    All time
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="ghost" className="h-9 w-9 p-0" title="Refresh content">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                  <path d="M3 3v5h5" />
                  <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                  <path d="M16 21h5v-5" />
                </svg>
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="space-y-8">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : groupedContents.length === 0 ? (
              <div className="p-12 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
                <div className="max-w-md mx-auto">
                  <div className="mb-4 text-gray-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-50">
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-700 mb-2 text-lg">No content yet</h3>
                  <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                    Start creating content by using the research tool on the home page to generate articles and images.
                  </p>
                  <Button 
                    variant="default" 
                    onClick={() => setLocation("/")} 
                    className="bg-primary hover:bg-primary/90"
                  >
                    Start researching
                  </Button>
                </div>
              </div>
            ) : (
              groupedContents.map(({ key, month, contents }) => (
                <div key={key}>
                  <div className="mb-6 flex items-center">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <CalendarIcon className="h-4 w-4 text-primary" />
                      </div>
                      <h2 className="text-xl font-semibold text-gray-800">{month}</h2>
                    </div>
                    <Separator className="ml-4 flex-grow" />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contents.map(content => (
                      <Card key={content.id} className="overflow-hidden group hover:shadow-lg transition-all border-gray-200">
                        <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                          {content.thumbnailUrl ? (
                            <img 
                              src={content.thumbnailUrl} 
                              alt={content.title}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                              onError={(e) => {
                                // On error, replace with a gradient background and title
                                e.currentTarget.style.display = 'none';
                                // Get the parent element
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  // Add classes for layout
                                  parent.classList.add('flex', 'items-center', 'justify-center', 'p-4');
                                  
                                  // Create a text div for the title if it doesn't exist
                                  if (!parent.querySelector('.fallback-title')) {
                                    const titleDiv = document.createElement('div');
                                    titleDiv.className = 'fallback-title text-lg font-semibold text-gray-600 text-center px-4';
                                    titleDiv.innerText = content.title;
                                    parent.appendChild(titleDiv);
                                  }
                                }
                              }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
                              <div className="text-lg font-semibold text-gray-600 text-center px-4">
                                {content.title}
                              </div>
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Badge variant="secondary" className="bg-white/90 text-gray-800 font-medium shadow-sm">
                              {content.imageCount} images
                            </Badge>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                onClick={() => handlePreview(content.id, content.title, content.contentType, content.searchId, content.summaryId)}
                              >
                                <File className="h-4 w-4" />
                                <span className="sr-only">Preview</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="secondary" 
                                className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                                onClick={() => handleViewImages(content.id, content.title, content.contentType)}
                              >
                                <FileImage className="h-4 w-4" />
                                <span className="sr-only">View Images</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <CardContent className="p-4">
                          <h3 className="font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">{content.title}</h3>
                          <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                            <span className="text-gray-400">Search:</span> {content.searchTerm}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })}
                            </div>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-8 px-3 flex items-center gap-1 text-xs bg-gray-50 border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/5"
                              onClick={() => handleDownload(content.id, content.title, content.contentType)}
                            >
                              <FileArchive className="h-3.5 w-3.5" />
                              Download
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="recent">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="flex justify-center py-12 col-span-full">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : (!userContents || userContents.length === 0) ? (
                <div className="p-12 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50 col-span-full">
                  <div className="max-w-md mx-auto">
                    <div className="mb-4 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-50">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    </div>
                    <h3 className="font-medium text-gray-700 mb-2 text-lg">No recent content</h3>
                    <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                      Generate new content to see it appear in your recent items.
                    </p>
                    <Button 
                      variant="default" 
                      onClick={() => setLocation("/")} 
                      className="bg-primary hover:bg-primary/90"
                    >
                      Create new content
                    </Button>
                  </div>
                </div>
              ) : (
                userContents.slice(0, 3).map(content => (
                  <Card key={content.id} className="overflow-hidden group hover:shadow-lg transition-all border-gray-200">
                    <div className="relative h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                      {content.thumbnailUrl ? (
                        <img 
                          src={content.thumbnailUrl} 
                          alt={content.title}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                          onError={(e) => {
                            // On error, replace with a gradient background and title
                            e.currentTarget.style.display = 'none';
                            // Get the parent element
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              // Add classes for layout
                              parent.classList.add('flex', 'items-center', 'justify-center', 'p-4');
                              
                              // Create a text div for the title if it doesn't exist
                              if (!parent.querySelector('.fallback-title')) {
                                const titleDiv = document.createElement('div');
                                titleDiv.className = 'fallback-title text-lg font-semibold text-gray-600 text-center px-4';
                                titleDiv.innerText = content.title;
                                parent.appendChild(titleDiv);
                              }
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-blue-50">
                          <div className="text-lg font-semibold text-gray-600 text-center px-4">
                            {content.title}
                          </div>
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-white/90 text-gray-800 font-medium shadow-sm">
                          {content.imageCount} images
                        </Badge>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                            onClick={() => handlePreview(content.id, content.title, content.contentType, content.searchId, content.summaryId)}
                          >
                            <File className="h-4 w-4" />
                            <span className="sr-only">Preview</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-8 w-8 p-0 bg-white/90 hover:bg-white"
                            onClick={() => handleViewImages(content.id, content.title, content.contentType)}
                          >
                            <FileImage className="h-4 w-4" />
                            <span className="sr-only">View Images</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1 line-clamp-1 group-hover:text-primary transition-colors">{content.title}</h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-1">
                        <span className="text-gray-400">Search:</span> {content.searchTerm}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(content.createdAt), { addSuffix: true })}
                        </div>
                        
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-3 flex items-center gap-1 text-xs bg-gray-50 border-gray-200 hover:border-primary hover:text-primary hover:bg-primary/5"
                          onClick={() => handleDownload(content.id, content.title, content.contentType)}
                        >
                          <FileArchive className="h-3.5 w-3.5" />
                          Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="favorites">
            <div className="p-12 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="max-w-sm mx-auto">
                <div className="mb-4 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 opacity-50">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-700 mb-2 text-lg">No favorites yet</h3>
                <p className="text-sm text-gray-500 mb-6 max-w-xs mx-auto">
                  Save your most-used content for quick access. Star items to add them to your favorites.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveTab("all")} 
                  className="bg-white hover:bg-gray-50 border-gray-300"
                >
                  Browse all content
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Preview Modal */}
      <ArticlePreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        article={previewArticle}
        isLoading={isLoadingPreview}
        onDownload={() => {
          if (selectedContentId) {
            handleDownload(selectedContentId, selectedContentTitle, selectedContentType);
          }
        }}
      />
      
      {/* Image Gallery Modal */}
      <ImageGalleryModal
        isOpen={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
        images={contentImages}
        title={selectedContentTitle}
        isLoading={isLoadingImages}
        onDownload={() => {
          if (selectedContentId) {
            handleDownload(selectedContentId, selectedContentTitle, selectedContentType);
          }
        }}
      />
      
      {/* Research Flow Components */}
      
      {/* Results Modal */}
      {resultsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-auto">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-bold">Research Results: {searchTerm}</h2>
              <p className="text-gray-600 mt-1">Select up to 5 summaries to include in your article</p>
            </div>
            <div className="p-6">
              {results.length > 0 ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    {results.map((result, index) => (
                      <div 
                        key={index} 
                        className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          // Toggle selection
                          const isSelected = selectedSummaries.some(s => s.id === result.id);
                          if (isSelected) {
                            setSelectedSummaries(selectedSummaries.filter(s => s.id !== result.id));
                          } else {
                            if (selectedSummaries.length < 5) {
                              setSelectedSummaries([...selectedSummaries, result]);
                            } else {
                              toast({
                                title: "Maximum selections reached",
                                description: "You can only select up to 5 summaries",
                                variant: "destructive",
                              });
                            }
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-6 h-6 border rounded-md flex items-center justify-center mt-1 ${
                            selectedSummaries.some(s => s.id === result.id) 
                              ? 'bg-primary border-primary text-white' 
                              : 'border-gray-300'
                          }`}>
                            {selectedSummaries.some(s => s.id === result.id) && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2">{result.title}</h3>
                            <div className="text-gray-600 text-sm mb-2 user-select-none">
                              {result.summary}
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                              <span>{result.date}</span>
                              <span>Sources: {result.sourcesCount}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setResultsModalOpen(false);
                        resetResearch();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={() => handleNextStep(selectedSummaries)}
                      disabled={selectedSummaries.length === 0 || isGeneratingBlog}
                      className="bg-primary"
                    >
                      {isGeneratingBlog ? "Generating..." : "Generate Blog Article"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <div className="animate-spin mb-4 mx-auto h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
                  <p>Loading research results...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Blog Article Modal */}
      <BlogModal
        article={blogArticle || { title: "", content: "" }}
        isOpen={blogModalOpen}
        onClose={() => {
          setBlogModalOpen(false);
          resetResearch();
        }}
        onGenerateImage={handleGenerateImages}
        generatedImages={generatedImages}
        isGeneratingImages={isGeneratingImages}
        onSelectImage={handleSelectImage}
        onDownload={handleArticleDownload}
      />
    </AppLayout>
  );
}