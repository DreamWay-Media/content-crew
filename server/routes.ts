import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  blogGenerationRequestSchema, 
  downloadRequestSchema, 
  downloads, 
  researchRequestSchema, 
  searches, 
  summaries, 
  insertTemporaryContentSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { generateBlogArticle, generateImages, performResearch } from "./openai";
import { z } from "zod";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { setupAdminRoutes } from "./admin";

// Mock user contents for the dashboard demo
const getMockUserContents = () => {
  return [
    {
      id: 1,
      title: "Tackling River Pollution in Hawaii",
      searchTerm: "river pollution in hawaii",
      createdAt: new Date(Date.now() - 4200000).toISOString(), // 1 hour 10 minutes ago
      downloadUrl: "/api/user/content/1/download",
      previewUrl: "/api/user/content/1/preview",
      thumbnailUrl: "https://images.unsplash.com/photo-1621017373962-56e6736fb644?q=80&w=1000&auto=format&fit=crop",
      imageCount: 3
    },
    {
      id: 2,
      title: "Revolutionizing Apple Orchards: New Advances in Combating Tree Diseases",
      searchTerm: "apple tree diseases",
      createdAt: new Date(Date.now() - 9000000).toISOString(), // 2 hours 30 minutes ago
      downloadUrl: "/api/user/content/2/download",
      previewUrl: "/api/user/content/2/preview",
      thumbnailUrl: "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=1000&auto=format&fit=crop",
      imageCount: 3
    },
    {
      id: 3,
      title: "Exploring California's Cutting-Edge House Design Trends",
      searchTerm: "california house design trends",
      createdAt: new Date(Date.now() - 18000000).toISOString(), // 5 hours ago
      downloadUrl: "/api/user/content/3/download",
      previewUrl: "/api/user/content/3/preview",
      thumbnailUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
      imageCount: 3
    }
  ];
};

export async function registerRoutes(app: Express): Promise<Server> {
  // API endpoint to perform research
  app.post("/api/research", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validatedData = researchRequestSchema.parse(req.body);
      
      // Perform the research using OpenAI (using API key from environment variables)
      const summaries = await performResearch(validatedData.searchTerm);
      
      // Save the search
      const search = await storage.createSearch({
        searchTerm: validatedData.searchTerm
      });
      
      // Save the summaries
      const savedSummaries = await Promise.all(
        summaries.map(summary => 
          storage.createSummary({
            searchId: search.id,
            title: summary.title,
            summary: summary.summary,
            date: summary.date,
            sourcesCount: summary.sourcesCount
          })
        )
      );
      
      // Return the research results
      return res.status(200).json({
        searchTerm: validatedData.searchTerm,
        summaries: savedSummaries.map((summary, index) => ({
          id: summary.id,
          searchTerm: validatedData.searchTerm,
          title: summary.title,
          summary: summary.summary,
          date: summary.date,
          sourcesCount: summary.sourcesCount
        }))
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  });

  // API endpoint to get recent searches
  app.get("/api/recent-searches", async (_req: Request, res: Response) => {
    try {
      const searches = await storage.getRecentSearches(10);
      return res.status(200).json({ searches });
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch recent searches" });
    }
  });
  
  // API endpoint to generate a blog article from selected summaries
  app.post("/api/generate-blog", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validatedData = blogGenerationRequestSchema.parse(req.body);
      
      // Check that we have at least one but not more than 5 summaries
      if (validatedData.selectedSummaries.length === 0) {
        return res.status(400).json({ message: "At least one summary must be selected" });
      }
      
      if (validatedData.selectedSummaries.length > 5) {
        return res.status(400).json({ message: "Maximum of 5 summaries can be selected" });
      }
      
      // Generate the blog article
      const blogArticle = await generateBlogArticle(
        validatedData.searchTerm, 
        validatedData.selectedSummaries
      );
      
      return res.status(200).json(blogArticle);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  });
  
  // API endpoint to generate blog images
  app.post("/api/generate-images", async (req: Request, res: Response) => {
    try {
      // Define and validate the request schema
      const generateImagesSchema = z.object({
        title: z.string().min(1, "Title is required"),
        content: z.string().min(1, "Content is required")
      });
      
      // Validate the request body
      const validatedData = generateImagesSchema.parse(req.body);
      
      // Generate images
      const imageUrls = await generateImages(validatedData.title, validatedData.content);
      
      return res.status(200).json({ images: imageUrls });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  });

  // API endpoint to handle article downloads
  app.post("/api/download", async (req: Request, res: Response) => {
    try {
      // Validate the request body
      const validatedData = downloadRequestSchema.parse(req.body);
      
      // Save the download request to the database
      const download = await storage.createDownload({
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        articleTitle: validatedData.articleTitle,
        content: validatedData.content,
        featuredImageUrl: validatedData.featuredImageUrl,
        footnotes: validatedData.footnotes,
        images: validatedData.images,
        downloadSent: false // Initially not sent
      });
      
      // In a real implementation, we would:
      // 1. Create a zip file with the article and images
      // 2. Send an email to the user with the zip file attached
      // 3. Update the download record to mark it as sent
      
      // For now, we'll just return success
      return res.status(200).json({ 
        success: true, 
        message: "Your article will be sent to your email shortly" 
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      
      if (error instanceof Error) {
        return res.status(500).json({ message: error.message });
      }
      
      return res.status(500).json({ message: "An unknown error occurred" });
    }
  });
  
  // User content API endpoints
  
  // Get user content
  app.get("/api/user/content", async (req: Request, res: Response) => {
    try {
      // First check if we have a user email in the query
      const userEmail = req.query.email as string;
      
      if (!userEmail) {
        // No user identified, return empty content
        return res.status(401).json({ 
          message: "User not authenticated",
          contents: [] 
        });
      }
      
      // Get all content for this specific user
      const userContent = await storage.getAllUserContent(userEmail);
      
      // Build the response with downloads (these are completed articles that users have downloaded)
      const downloadContents = userContent.downloads.map(download => {
        return {
          id: download.id,
          contentType: 'download',
          title: download.articleTitle,
          searchTerm: download.email.split('@')[0], // Using email part as a fallback search term
          createdAt: download.createdAt ? download.createdAt.toISOString() : new Date().toISOString(),
          downloadUrl: `/api/user/content/${download.id}/download`,
          previewUrl: `/api/user/content/${download.id}/preview`,
          thumbnailUrl: download.featuredImageUrl || '',
          imageCount: Array.isArray(download.images) ? download.images.length : 0,
          downloaded: true
        };
      });
      
      // Include all generated blog articles with associated images
      // This will show ALL generated blog content, regardless of download status
      // For demonstration, we'll include 3-4 articles
      const generatedContents = getMockUserContents().map(content => ({
        ...content,
        contentType: 'generated',
        downloaded: false
      }));
      
      // Combine both downloads and generated blogs
      const allContents = [...downloadContents, ...generatedContents];
      
      // If there are no previously downloaded articles in the database,
      // and the allContents array only contains the generated ones from mockUserContents,
      // we'll adjust the contentTypes to make them more representative of real usage
      
      // We'll add different content types for demonstration purposes
      if (downloadContents.length === 0) {
        // Create a sample with different states: one pending download, 
        // one with images generated, and one completely finished
        const sampleContents = [
          {
            id: 101,
            contentType: 'generated', // Blog article has been generated
            title: "The Future of Quantum Computing in Business Applications",
            searchTerm: "quantum computing business applications",
            createdAt: new Date().toISOString(), // Just now
            downloadUrl: "/api/user/content/101/download",
            previewUrl: "/api/user/content/101/preview", 
            thumbnailUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop",
            imageCount: 3,
            downloaded: false
          },
          {
            id: 102,
            contentType: 'generated',
            title: "Sustainable Urban Farming: Vertical Agriculture Solutions",
            searchTerm: "vertical farming urban agriculture",
            createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
            downloadUrl: "/api/user/content/102/download",
            previewUrl: "/api/user/content/102/preview",
            thumbnailUrl: "https://images.unsplash.com/photo-1585168758008-8055c959783d?q=80&w=2000&auto=format&fit=crop",
            imageCount: 3,
            downloaded: false
          },
          {
            id: 103,
            contentType: 'generated',
            title: "Unlocking the Hidden Powers of Branch Chain Amino Acids",
            searchTerm: "branch chain amino acid benefits",
            createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
            downloadUrl: "/api/user/content/103/download",
            previewUrl: "/api/user/content/103/preview",
            thumbnailUrl: "https://oaidalleapiprodscus.blob.core.windows.net/private/org-oMr22hluT6aVPhhixSeMClTx/user-AIInDR6bvh0nlc4ESvx9fsad/img-hdVygUGKeR36gCFqb8Bc2NuY.png",
            imageCount: 3,
            downloaded: false
          }
        ];
        
        // Replace the generated contents with our more varied sample
        return res.status(200).json({ 
          contents: [...downloadContents, ...sampleContents]
        });
      }
      
      res.status(200).json({ contents: allContents });
    } catch (error) {
      console.error("Error fetching user content:", error);
      res.status(500).json({ 
        message: "Error fetching content",
        contents: [] 
      });
    }
  });
  
  // Get content preview
  app.get("/api/user/content/:id/preview", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      console.warn(`Invalid content ID requested: ${req.params.id}`);
      return res.status(400).json({ message: "Invalid content ID" });
    }
    
    // Check for user email in query parameters
    const userEmail = req.query.email as string;
    console.log(`Content preview requested for ID: ${id}, with email: ${userEmail ? 'provided' : 'not provided'}`);
    
    try {
      // First check if this is a download record ID
      console.log(`Querying database for download record with ID: ${id}`);
      const downloadRecord = await db.select().from(downloads).where(eq(downloads.id, id)).limit(1);
      
      if (downloadRecord && downloadRecord.length > 0) {
        // We found the download record
        const download = downloadRecord[0];
        console.log(`Found download record for ID ${id}, article title: "${download.articleTitle}"`);
        
        // If user email is provided, verify ownership
        if (userEmail && download.email !== userEmail) {
          console.warn(`Permission denied: User ${userEmail} tried to access content owned by ${download.email}`);
          return res.status(403).json({ 
            message: "You don't have permission to access this content" 
          });
        }
        
        console.log(`Successfully returning download content for ID ${id}`);
        return res.status(200).json({
          title: download.articleTitle,
          content: download.content,
          featureImage: download.featuredImageUrl,
          footnotes: download.footnotes ? JSON.parse(download.footnotes) : undefined
        });
      }
      
      console.log(`No download record found for ID: ${id}, using fallback content`);
      
      // If we're here, we didn't find a download record, so use fallback content
      let title, content, featureImage;
      
      // Handle the old demo IDs (1, 2, 3)
      if (id === 1) {
        title = "Tackling River Pollution in Hawaii";
        content = `
          <h2>The Growing Crisis of River Pollution in Hawaii</h2>
          <p>Hawaii's pristine rivers face unprecedented pollution threats that impact both the environment and local communities. Recent studies show alarming increases in contamination levels across the island chain's major waterways.</p>
          
          <h2>Key Findings from Recent Research</h2>
          <p>According to the Environmental Protection Agency's latest data, microplastic contamination in Hawaiian rivers has increased by 32% over the past five years. This coincides with a significant decline in native aquatic species populations.</p>
          <p>The Hawaii Department of Land and Natural Resources identified agricultural runoff as the primary pollution source, contributing 45% of total contaminants in freshwater systems.</p>
          
          <h2>Community Impact and Response</h2>
          <ul>
            <li>Local communities report diminished fishing harvests and recreational water quality</li>
            <li>Traditional cultural practices connected to rivers have been disrupted</li>
            <li>Grassroots organizations have established 27 new river monitoring stations</li>
          </ul>
          
          <h2>Solutions and Future Outlook</h2>
          <p>Innovative filtration systems deployed by the University of Hawaii have shown promise, reducing contaminant levels by up to 60% in controlled environments. Meanwhile, new legislation aims to strengthen penalties for industrial dumping and establish more comprehensive monitoring networks.</p>
          
          <h2>Conclusion</h2>
          <p>While Hawaii's rivers face serious challenges from pollution, the combined efforts of scientists, community organizations, and policymakers provide hope for restoration and protection. Continued education and engagement will be critical to preserving these vital ecosystems for future generations.</p>
        `;
        featureImage = "https://images.unsplash.com/photo-1621017373962-56e6736fb644?q=80&w=1000&auto=format&fit=crop";
      } else if (id === 2) {
        title = "Revolutionizing Apple Orchards: New Advances in Combating Tree Diseases";
        content = `
          <h2>The Fight Against Apple Tree Diseases</h2>
          <p>Apple orchards worldwide are benefiting from groundbreaking research in disease prevention and treatment. These advances come at a crucial time as climate change intensifies pathogen pressures on commercial fruit production.</p>
          
          <h2>Latest Scientific Breakthroughs</h2>
          <p>Cornell University researchers have developed a novel biocontrol method that reduces fire blight infection rates by 78% without chemical fungicides. This environmentally friendly approach uses beneficial bacteria that naturally compete with pathogens.</p>
          <p>Meanwhile, genetic sequencing has identified apple varieties with enhanced resistance to apple scab, potentially reducing fungicide applications by up to 60% in commercial orchards.</p>
          
          <h2>Implementation and Results</h2>
          <ul>
            <li>Test orchards implementing integrated pest management show 45% reduced disease incidence</li>
            <li>Drone-based early detection systems can identify infections 7-10 days before visible symptoms appear</li>
            <li>Precision spray technologies have reduced chemical applications by 30% while maintaining efficacy</li>
          </ul>
          
          <h2>Economic and Environmental Impact</h2>
          <p>A five-year study across Washington state orchards demonstrates that these new disease management approaches have increased net profits by $2,400 per acre while reducing environmental impact. Water quality in surrounding areas has shown measurable improvement.</p>
          
          <h2>Conclusion</h2>
          <p>The revolution in apple orchard disease management represents a win-win for producers and the environment. As these technologies become more accessible, the global apple industry is positioned for more sustainable practices while maintaining productivity in changing climate conditions.</p>
        `;
        featureImage = "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=1000&auto=format&fit=crop";
      } else if (id === 3) {
        title = "Exploring California's Cutting-Edge House Design Trends";
        content = `
          <h2>California's Architectural Renaissance</h2>
          <p>California continues to lead the nation in innovative residential architecture, blending sustainability, technology, and aesthetic vision. The state's unique climate and cultural landscape foster design approaches that increasingly influence global trends.</p>
          
          <h2>Sustainability at the Forefront</h2>
          <p>Recent data shows 72% of new California home designs incorporate passive solar elements, reducing energy consumption by an average of 38%. Living walls and rooftop gardens have become standard features in urban areas, with Los Angeles reporting a 65% increase in green roof installations over the past two years.</p>
          <p>The use of recycled and locally sourced materials has transformed from niche to mainstream, with award-winning homes achieving up to 85% recycled material composition while maintaining luxury aesthetics.</p>
          
          <h2>Technology Integration</h2>
          <ul>
            <li>Smart home technology appears in 92% of new California luxury homes</li>
            <li>Integrated battery systems and solar panels create net-positive energy homes in 28% of new constructions</li>
            <li>3D-printed structural components have reduced construction waste by up to 60% in pilot projects</li>
          </ul>
          
          <h2>Aesthetic Directions</h2>
          <p>California's residential design aesthetic has evolved toward what architects term "organic minimalism" – clean lines and open spaces that incorporate natural elements and textures. Indoor-outdoor living spaces have expanded in scope, with disappearing glass walls and climate-controlled outdoor rooms becoming signature elements in coastal and valley properties.</p>
          
          <h2>Conclusion</h2>
          <p>California's residential architecture continues to redefine how homes function as both private sanctuaries and environmental participants. As these innovations prove their worth in both livability and sustainability, their influence on global housing design will only increase.</p>
        `;
        featureImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop";
      } 
      // Handle the new generated content IDs (101, 102, 103)
      else if (id === 101) {
        title = "The Future of Quantum Computing in Business Applications";
        content = `
          <h2>Quantum Computing: From Theory to Business Reality</h2>
          <p>Quantum computing has rapidly evolved from a theoretical concept to a practical tool with transformative potential for businesses across industries. Recent breakthroughs in quantum hardware stability and error correction are accelerating the timeline for commercial applications.</p>
          
          <h2>Key Business Applications Emerging in 2025</h2>
          <p>Financial institutions are among the early adopters, with JPMorgan Chase and Goldman Sachs deploying quantum algorithms for portfolio optimization that deliver a 37% improvement in computational efficiency compared to classical methods.</p>
          <p>In the pharmaceutical sector, companies like Merck and Pfizer have reduced drug discovery timelines by up to 60% using quantum simulations for molecular interactions, potentially saving billions in development costs.</p>
          
          <h2>Implementation Challenges and Solutions</h2>
          <ul>
            <li>Quantum talent acquisition remains competitive, with specialized roles commanding 40% salary premiums</li>
            <li>Hybrid quantum-classical approaches offer the most practical near-term implementation strategy</li>
            <li>Cloud-based quantum services from Amazon Braket, Microsoft Azure Quantum, and IBM Quantum have democratized access</li>
          </ul>
          
          <h2>ROI and Competitive Advantage</h2>
          <p>Early adopters report significant competitive advantages. Supply chain optimizations using quantum algorithms have reduced logistics costs by 18-23% in pilot programs, while manufacturing companies have accelerated materials science research cycles by 45% through quantum simulation.</p>
          
          <h2>Strategic Implications</h2>
          <p>As quantum computing transitions from experimental technology to practical business tool, organizations that develop quantum literacy now will be positioned to capture significant value in the next wave of digital transformation. The gap between quantum leaders and laggards is expected to widen substantially by 2027.</p>
        `;
        featureImage = "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop";
      } else if (id === 102) {
        title = "Sustainable Urban Farming: Vertical Agriculture Solutions";
        content = `
          <h2>The Vertical Farming Revolution</h2>
          <p>Urban vertical farming is experiencing unprecedented growth as cities worldwide embrace sustainable local food production. These high-efficiency systems are redefining agriculture by producing crops in stacked layers, often using controlled environment agriculture (CEA) technology.</p>
          
          <h2>Latest Technological Advances</h2>
          <p>Modern vertical farms have achieved remarkable efficiency gains through AI-driven climate control systems that reduce energy consumption by up to 35% while optimizing plant growth cycles. LED lighting specifically calibrated for plant photosynthesis has increased yield efficiency by 28% compared to earlier systems.</p>
          <p>Water recirculation systems have reduced consumption by up to 98% compared to conventional agriculture, with the most advanced facilities using less than 2% of the water required for field farming.</p>
          
          <h2>Economic and Environmental Impact</h2>
          <ul>
            <li>Vertical farms reduce food miles by an average of 1,500 miles in major urban centers</li>
            <li>Year-round production eliminates seasonal supply chain disruptions and price volatility</li>
            <li>Carbon footprint reductions of 60-70% compared to conventional farming and distribution</li>
          </ul>
          
          <h2>Urban Integration Models</h2>
          <p>Cities like Singapore, Rotterdam, and Chicago have pioneered diverse integration models, from rooftop systems to repurposed industrial buildings and purpose-built structures. Community-based vertical farms have created over 3,500 new urban agriculture jobs while providing access to fresh produce in former food deserts.</p>
          
          <h2>Future Trajectory</h2>
          <p>As technology costs continue to decrease and resource pressures increase, vertical farming is projected to supply over 15% of global leafy greens production by 2030. The integration of these systems into urban planning represents a fundamental shift in how cities approach food security, sustainability, and community health.</p>
        `;
        featureImage = "https://images.unsplash.com/photo-1585168758008-8055c959783d?q=80&w=2000&auto=format&fit=crop";
      } else if (id === 103) {
        title = "Unlocking the Hidden Powers of Branch Chain Amino Acids";
        content = `
          <h1>Unlocking the Hidden Powers of Branch Chain Amino Acids: Beyond Muscle Building</h1>
          <p>For many fitness enthusiasts and health-conscious individuals, branch chain amino acids (BCAAs) have long been a staple for muscle recovery and growth. However, recent research is revealing a much broader spectrum of benefits that these amino acids offer, transforming our understanding of their role in overall health.</p>
          
          <h2>The Immune-Boosting Benefits of BCAAs</h2>
          <p>In the world of wellness, a strong immune system is a cornerstone of good health. According to a recent study published just last month, BCAAs have been found to significantly enhance immune function. Researchers discovered that these amino acids promote the production of lymphocytes and other immune cells, effectively bolstering the body's defense mechanisms, particularly in individuals experiencing physical stress. This finding is a game-changer for athletes and those recovering from illnesses, as it suggests that BCAAs could help reduce the incidence and duration of infections, offering a new perspective on their nutritional value.</p>
          
          <h2>Boosting Brainpower with BCAAs</h2>
          <p>While the physical benefits of BCAAs are well-documented, their impact on cognitive function is an exciting frontier. A very recent study conducted just two weeks ago found that BCAA supplementation led to improvements in attention and memory tasks among young adults. The secret to this cognitive boost lies in the modulation of neurotransmitter levels, particularly serotonin and dopamine, which are crucial for cognitive processes. This discovery hints at the potential for BCAAs to enhance mental performance, especially in situations demanding sustained concentration. While more research is needed to confirm these findings across diverse populations, the initial results are promising for those seeking dietary means to support cognitive health.</p>
          
          <h2>A New Era for BCAAs</h2>
          <p>The newfound understanding of BCAAs opens up exciting possibilities. Beyond their traditional role in muscle maintenance, these amino acids are emerging as powerful allies in supporting immune function and cognitive health. For athletes, individuals recovering from illness, and anyone looking to boost their mental acuity, BCAAs could be a valuable addition to their dietary regimen.</p>
          
          <h2>Concluding Thoughts</h2>
          <p>As research continues to unfold, the potential applications for BCAAs seem boundless. Whether you're looking to enhance your immune defenses or sharpen your cognitive edge, BCAAs might just be the versatile nutrient you've been looking for. Remember to consult with a healthcare professional before making any significant changes to your supplement routine, and keep an eye on emerging research that could further illuminate the multifaceted benefits of BCAAs.</p>
          
          <p>In a world where health and wellness trends come and go, BCAAs are proving to be more than just a fleeting fad. They are a testament to the power of scientific discovery and nutrition's evolving role in our lives.</p>
        `;
        featureImage = "https://oaidalleapiprodscus.blob.core.windows.net/private/org-oMr22hluT6aVPhhixSeMClTx/user-AIInDR6bvh0nlc4ESvx9fsad/img-hdVygUGKeR36gCFqb8Bc2NuY.png";
      }
      
      console.log(`Successfully sending preview content for ID ${id}, title: "${title}"`);
      res.status(200).json({
        title,
        content,
        featureImage
      });
    } catch (error) {
      console.error(`Error fetching article preview for ID ${id}:`, error);
      
      // Provide more detailed error responses
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error details: ${errorMessage}`);
      
      res.status(500).json({ 
        message: "Failed to retrieve article preview",
        error: errorMessage,
        contentId: id
      });
    }
  });
  
  // Get content images
  app.get("/api/user/content/:id/images", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid content ID" });
    }
    
    // Check for user email in query parameters
    const userEmail = req.query.email as string;
    
    try {
      // First check if this is a download record ID
      const downloadRecord = await db.select().from(downloads).where(eq(downloads.id, id)).limit(1);
      
      if (downloadRecord && downloadRecord.length > 0) {
        // We found the download record
        const download = downloadRecord[0];
        
        // If user email is provided, verify ownership
        if (userEmail && download.email !== userEmail) {
          return res.status(403).json({ 
            message: "You don't have permission to access this content" 
          });
        }
        
        return res.status(200).json({
          images: download.images || []
        });
      }
      
      // If no download record found, return fallback images
      const images = [];
      
      // Return a set of images based on the content ID
      // Handle original demo content IDs (1, 2, 3)
      if (id === 1) {
        images.push(
          "https://images.unsplash.com/photo-1621017373962-56e6736fb644?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1576856497337-4f2be24683a4?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1517458047551-6766fa5a9362?q=80&w=1000&auto=format&fit=crop"
        );
      } else if (id === 2) {
        images.push(
          "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1586093728715-2a2b66706dfc?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1504387432042-8aca549e4729?q=80&w=1000&auto=format&fit=crop"
        );
      } else if (id === 3) {
        images.push(
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1600210492493-0946911123ea?q=80&w=1000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1600607687644-c7171b47e9cf?q=80&w=1000&auto=format&fit=crop"
        );
      }
      // Handle new generated content IDs (101, 102, 103)
      else if (id === 101) {
        images.push(
          "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?q=80&w=2000&auto=format&fit=crop"
        );
      } else if (id === 102) {
        images.push(
          "https://images.unsplash.com/photo-1585168758008-8055c959783d?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=2000&auto=format&fit=crop"
        );
      } else if (id === 103) {
        images.push(
          "https://oaidalleapiprodscus.blob.core.windows.net/private/org-oMr22hluT6aVPhhixSeMClTx/user-AIInDR6bvh0nlc4ESvx9fsad/img-hdVygUGKeR36gCFqb8Bc2NuY.png",
          "https://oaidalleapiprodscus.blob.core.windows.net/private/org-oMr22hluT6aVPhhixSeMClTx/user-AIInDR6bvh0nlc4ESvx9fsad/img-UhUBj0qcIxc1ZLjAn5tsDIJA.png",
          "https://oaidalleapiprodscus.blob.core.windows.net/private/org-oMr22hluT6aVPhhixSeMClTx/user-AIInDR6bvh0nlc4ESvx9fsad/img-3OuZ5KmLnmLchzIJGvDXKGr0.png"
        );
      } else {
        // Default images for any other ID
        images.push(
          "https://images.unsplash.com/photo-1568585105565-e8e8f74183de?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2000&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2000&auto=format&fit=crop"
        );
      }
      
      console.log(`Successfully sending ${images.length} images for content ID ${id}`);
      res.status(200).json({ images });
    } catch (error) {
      console.error(`Error fetching content images for ID ${id}:`, error);
      
      // Provide more detailed error responses
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error(`Error details: ${errorMessage}`);
      
      res.status(500).json({ 
        message: "Failed to retrieve content images",
        error: errorMessage,
        contentId: id
      });
    }
  });
  
  // Get summary preview from search
  app.get("/api/search/:searchId/summary/:summaryId", async (req: Request, res: Response) => {
    const searchId = parseInt(req.params.searchId);
    const summaryId = parseInt(req.params.summaryId);
    
    if (isNaN(searchId) || isNaN(summaryId)) {
      return res.status(400).json({ message: "Invalid ID parameters" });
    }
    
    try {
      // Get the search
      const [searchRecord] = await db.select().from(searches).where(eq(searches.id, searchId)).limit(1);
      
      if (!searchRecord) {
        return res.status(404).json({ message: "Search not found" });
      }
      
      // Get the specific summary
      const [summaryRecord] = await db.select().from(summaries).where(eq(summaries.id, summaryId)).limit(1);
      
      if (!summaryRecord) {
        return res.status(404).json({ message: "Summary not found" });
      }
      
      // Return the formatted article preview
      return res.status(200).json({
        title: summaryRecord.title,
        content: `<div class="research-summary">
          <h2>${summaryRecord.title}</h2>
          <p>${summaryRecord.summary}</p>
          <div class="meta-info">
            <p class="date">Date: ${summaryRecord.date}</p>
            <p class="sources">Sources: ${summaryRecord.sourcesCount}</p>
          </div>
          <div class="search-info">
            <p>Based on research for: "${searchRecord.searchTerm}"</p>
          </div>
        </div>`,
        featureImage: null
      });
    } catch (error) {
      console.error("Error fetching summary preview:", error);
      res.status(500).json({ message: "Failed to retrieve summary preview" });
    }
  });
  
  // Download content
  app.get("/api/user/content/:id/download", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid content ID" });
    }
    
    // Check for user email in query parameters
    const userEmail = req.query.email as string;
    
    try {
      // First check if this is a download record ID
      const downloadRecord = await db.select().from(downloads).where(eq(downloads.id, id)).limit(1);
      
      if (!downloadRecord || downloadRecord.length === 0) {
        return res.status(404).json({ message: "Content not found" });
      }
      
      const download = downloadRecord[0];
      
      // If user email is provided, verify ownership
      if (userEmail && download.email !== userEmail) {
        return res.status(403).json({ 
          message: "You don't have permission to access this content" 
        });
      }
      
      // In a real app, this would generate a ZIP file with the article HTML and images
      res.status(200).send("Download content would be here");
    } catch (error) {
      console.error("Error downloading content:", error);
      res.status(500).json({ message: "Failed to download content" });
    }
  });

  // API endpoint to save temporary content for anonymous users
  app.post("/api/session/content", async (req: Request, res: Response) => {
    try {
      const { sessionId, searchTerm, searchId, articleTitle, articleContent, featuredImageUrl, footnotes, images } = req.body;
      
      // Basic validation
      if (!sessionId || !searchTerm) {
        return res.status(400).json({ message: "Session ID and search term are required" });
      }
      
      // Calculate expiry time (2 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 2);
      
      // Check if there's existing content for this session
      const existingContent = await storage.getTemporaryContentBySessionId(sessionId);
      
      if (existingContent) {
        // Update the existing content
        const updatedContent = await storage.updateTemporaryContent(existingContent.id, {
          searchId,
          articleTitle,
          articleContent,
          featuredImageUrl,
          footnotes,
          images,
          expiresAt,
        });
        
        return res.status(200).json(updatedContent);
      } else {
        // Create new temporary content
        const newContent = await storage.saveTemporaryContent({
          sessionId,
          searchTerm,
          searchId,
          articleTitle,
          articleContent,
          featuredImageUrl,
          footnotes,
          images,
          expiresAt,
        });
        
        return res.status(201).json(newContent);
      }
    } catch (error) {
      console.error("Error saving temporary content:", error);
      return res.status(500).json({ message: "Failed to save temporary content" });
    }
  });
  
  // API endpoint to get temporary content for a session
  app.get("/api/session/:sessionId/content", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      
      // Get the temporary content for this session
      const content = await storage.getTemporaryContentBySessionId(sessionId);
      
      if (!content) {
        return res.status(404).json({ message: "No content found for this session" });
      }
      
      return res.status(200).json(content);
    } catch (error) {
      console.error("Error fetching temporary content:", error);
      return res.status(500).json({ message: "Failed to fetch temporary content" });
    }
  });
  
  // API endpoint to associate temporary content with a user (when they sign up)
  app.post("/api/session/:sessionId/associate", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const { email, firstName, lastName } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      // Move the temporary content to permanent storage for this user
      const success = await storage.moveTemporaryContentToUser(
        sessionId, 
        email, 
        firstName || "Anonymous", 
        lastName || "User"
      );
      
      if (success) {
        return res.status(200).json({ message: "Content successfully associated with user" });
      } else {
        return res.status(404).json({ message: "No content found for this session or transfer failed" });
      }
    } catch (error) {
      console.error("Error associating temporary content with user:", error);
      return res.status(500).json({ message: "Failed to associate content with user" });
    }
  });
  
  // Create a cleanup job for expired content that runs every hour
  setInterval(async () => {
    try {
      const cleanedCount = await storage.cleanupExpiredContent();
      console.log(`Cleaned up ${cleanedCount} expired temporary content items`);
    } catch (error) {
      console.error("Error cleaning up expired content:", error);
    }
  }, 60 * 60 * 1000); // 1 hour

  // Setup admin routes
  setupAdminRoutes(app);
  
  const httpServer = createServer(app);
  return httpServer;
}
