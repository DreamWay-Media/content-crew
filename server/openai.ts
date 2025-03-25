import OpenAI from "openai";
import { BlogArticle, ResearchSummary } from "@shared/types";

// Helper function to validate API key and create OpenAI client
async function getOpenAIClient(): Promise<OpenAI> {
  // Use the API key from environment variables
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY environment variable is not set");
  }
  
  // Check for basic API key format validity
  if (!apiKey.startsWith('sk-')) {
    throw new Error("Invalid OpenAI API key format. The key should start with 'sk-'");
  }
  
  // Initialize OpenAI with the API key from environment
  return new OpenAI({ apiKey });
}

export async function generateImages(title: string, content: string): Promise<string[]> {
  try {
    const openai = await getOpenAIClient();
    
    // Create a prompt based on the blog title and content using the user's specification
    const prompt = `Create a hyper-realistic, professional-quality photograph depicting ${title}. The scene should have exceptional lighting, sharp focus, and vivid details, closely representing a real-life scenario related to this topic. Do not include any text in the image.`;
    
    // Generate 3 images using DALL-E
    // Note: DALL-E-3 currently only supports n=1, so we'll make 3 separate requests
    const imagePromises = [];
    
    for (let i = 0; i < 3; i++) {
      const imagePromise = openai.images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024", // Using the requested dimensions
        quality: "hd", // Using HD quality for better results
      });
      imagePromises.push(imagePromise);
    }
    
    // Wait for all image generation requests to complete
    const responses = await Promise.all(imagePromises);
    
    // Extract the URLs from the responses
    const imageUrls: string[] = [];
    
    for (const response of responses) {
      const url = response.data[0].url;
      if (!url) {
        throw new Error("Missing image URL in OpenAI response");
      }
      imageUrls.push(url);
    }
    
    return imageUrls;
  } catch (error: any) {
    console.error("Error generating images:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

export async function generateBlogArticle(searchTerm: string, selectedSummaries: ResearchSummary[]): Promise<BlogArticle> {
  try {
    const openai = await getOpenAIClient();
    
    // Create a formatted string of the summaries to include in the prompt
    const summariesText = selectedSummaries.map((summary, index) => 
      `SOURCE ${index + 1}:
Title: ${summary.title}
Summary: ${summary.summary}
Date: ${summary.date}
Sources: ${summary.sourcesCount}`
    ).join('\n\n');

    // Craft the prompt for blog generation
    const prompt = `Write a compelling, engaging blog post utilizing the sources/summaries from the research results about "${searchTerm}" provided below:

${summariesText}

Follow these guidelines:
- Do not just list findings; instead, write a natural, flowing article
- Use a conversational yet informative tone to make the blog engaging
- Introduce the topic with a strong hook and background context
- Weave the information into a narrative, showing how each contributes to our understanding of the topic
- End with a conclusion that highlights key takeaways and future implications
- IT MUST BE SEO FRIENDLY CONTENT
- Add superscript numbers in the content where appropriate to reference the sources (e.g., <sup>[1]</sup>)
- Create academic-style footnotes for each referenced source

Your response should be formatted as a JSON object with the following structure:
{
  "title": "An engaging SEO-friendly title for the blog",
  "content": "The fully formatted blog content with HTML markup for headings, paragraphs, etc. (Use h1, h2, h3, p, etc. tags appropriately). Include superscript footnote references like <sup>[1]</sup> within the content.",
  "footnotes": [
    {
      "id": 1,
      "text": "Brief citation text that explains what information came from this source",
      "source": "The title of the source document or publication",
      "date": "The publication date from the source"
    },
    ...
  ]
}`;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    // Parse the response content
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }
    
    console.log("Raw OpenAI blog response:", content.substring(0, 200) + "...");
    
    try {
      // Try to parse the JSON content
      const parsedContent = JSON.parse(content);
      
      if (!parsedContent.title || !parsedContent.content) {
        throw new Error("Blog response missing required fields");
      }
      
      return {
        title: parsedContent.title,
        content: parsedContent.content,
        footnotes: parsedContent.footnotes || []
      };
    } catch (parseError) {
      console.error("Failed to parse JSON blog response:", parseError);
      throw new Error("Invalid JSON response from OpenAI for blog generation");
    }
  } catch (error: any) {
    console.error("Error generating blog article:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}

export async function performResearch(searchTerm: string): Promise<ResearchSummary[]> {
  try {
    const openai = await getOpenAIClient();

    // Craft the prompt for the research
    const prompt = `You are an AI Researcher tasked with identifying the most recent information about a given topic. Focus on developments, news, and discoveries from the most recent 90 days.

TOPIC: "${searchTerm}"

Your response MUST be in this exact JSON format:
{
  "summaries": [
    {
      "title": "Title of the first finding",
      "summary": "Detailed summary of the finding (100-150 words)",
      "date": "Mar 01, 2025",
      "sourcesCount": 5
    },
    // 9 more summaries...
  ]
}

Create exactly 10 research summaries with these requirements:
1. Each summary must have a clear, descriptive title
2. Include a detailed explanation (100-150 words)
3. Use an approximate date within the last 90 days (format: "MMM DD, YYYY")
4. Include sourcesCount as a number representing estimated sources

CRITICAL: 
- Return ONLY valid JSON
- Always use the "summaries" array as the root property
- Do not include any text before or after the JSON
- Ensure all dates are in the specified format`;

    // Call the OpenAI API
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    // Parse the response content
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }
    
    console.log("Raw OpenAI response:", content);
    
    let parsedContent;
    try {
      // Try to parse the JSON content
      parsedContent = JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      console.log("Raw content:", content);
      throw new Error("Invalid JSON response from OpenAI");
    }
    
    // Extract the summaries array, handling different possible response formats
    let summariesArray = [];
    
    if (Array.isArray(parsedContent)) {
      // Direct array format
      summariesArray = parsedContent;
    } else if (parsedContent.summaries && Array.isArray(parsedContent.summaries)) {
      // Nested under 'summaries' property
      summariesArray = parsedContent.summaries;
    } else if (typeof parsedContent === 'object') {
      // Single summary object or unknown format
      console.log("Unexpected response format:", JSON.stringify(parsedContent, null, 2));
      
      // Check for any array property that might contain our summaries
      for (const key in parsedContent) {
        if (Array.isArray(parsedContent[key])) {
          summariesArray = parsedContent[key];
          break;
        }
      }
      
      // If we still have no array, try to convert the response to an array of summaries
      if (summariesArray.length === 0 && typeof parsedContent === 'object') {
        // As a last resort, check if the response itself has the expected fields
        if (parsedContent.title && parsedContent.summary) {
          summariesArray = [parsedContent];
        }
      }
    }
    
    // Ensure we have valid summary objects and add IDs
    const summaries = summariesArray
      .filter((summary: any) => 
        summary && 
        typeof summary === 'object' && 
        summary.title && 
        summary.summary && 
        summary.date
      )
      .map((summary: any, index: number) => ({
        id: index + 1,
        searchTerm,
        title: summary.title,
        summary: summary.summary,
        date: summary.date,
        // Ensure sourcesCount is a number, default to 1 if not provided
        sourcesCount: typeof summary.sourcesCount === 'number' ? summary.sourcesCount : 1
      }));
    
    // If we didn't get any valid summaries, log the issue
    if (summaries.length === 0) {
      console.error("No valid summaries could be extracted from OpenAI response:", 
        JSON.stringify(parsedContent, null, 2));
      
      // Throw an error to be handled by the caller
      throw new Error("Failed to extract research summaries from the AI response");
    }
    
    // Ensure we have exactly 10 summaries
    return summaries.slice(0, 10);
  } catch (error: any) {
    console.error("Error performing research:", error);
    throw new Error(`OpenAI API error: ${error.message}`);
  }
}
