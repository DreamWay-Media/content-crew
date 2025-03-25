import React from "react";
import { Link } from "wouter";
import { ArrowLeft, Search, Edit3, Download, Share2, CheckSquare, Palette } from "lucide-react";
import AppLayout from "@/components/AppLayout";

export default function HowItWorks() {
  return (
    <AppLayout activePage="how-it-works">
      <div className="container mx-auto px-4 py-12 flex-grow">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">How AI Content Crew Works</h1>
          <p className="text-lg text-gray-700 mb-10 text-center">
            Discover how our AI-powered platform transforms your topics into polished, professional content in minutes.
          </p>

          <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-primary/10 rounded-full p-6 flex-shrink-0">
                <Search className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  1. Enter Your Research Topic
                </h2>
                <p className="text-gray-600">
                  Begin by entering any topic you're interested in researching. Our AI will analyze your query 
                  and prepare to gather the most relevant and recent information available.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-primary/10 rounded-full p-6 flex-shrink-0">
                <CheckSquare className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  2. Select Your Research Summaries
                </h2>
                <p className="text-gray-600">
                  Review the 10 comprehensive research summaries our AI has generated. Each summary 
                  represents a unique angle on your topic. Select up to 5 summaries that you find most 
                  relevant for your content.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-primary/10 rounded-full p-6 flex-shrink-0">
                <Edit3 className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  3. Generate Your Blog Article
                </h2>
                <p className="text-gray-600">
                  With your selected summaries, our AI crafts a cohesive, engaging, and SEO-friendly 
                  blog article. The content seamlessly integrates the research findings into a natural, 
                  conversational narrative that resonates with your audience.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-primary/10 rounded-full p-6 flex-shrink-0">
                <Palette className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  4. Add Visual Appeal
                </h2>
                <p className="text-gray-600">
                  Enhance your article with AI-generated images that perfectly complement your content. 
                  Choose from three contextually relevant, professional-quality images to make your 
                  article visually engaging.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-primary/10 rounded-full p-6 flex-shrink-0">
                <Download className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  5. Download Your Complete Package
                </h2>
                <p className="text-gray-600">
                  When you're satisfied with your article and chosen image, enter your contact information 
                  to receive the complete package delivered to your email. Your content is packaged as a 
                  convenient zip file containing both your article and selected images.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="bg-primary/10 rounded-full p-6 flex-shrink-0">
                <Share2 className="w-12 h-12 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-3">
                  6. Publish to Your Platforms (Premium)
                </h2>
                <p className="text-gray-600">
                  With our premium subscription, you can publish your content directly to your favorite 
                  platforms with a single click. Save time and streamline your content workflow by 
                  connecting your accounts.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 bg-gray-100 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-3">The Technology Behind AI Content Crew</h3>
            <p className="text-gray-600 mb-4">
              Our platform leverages state-of-the-art artificial intelligence from OpenAI to deliver 
              exceptional results:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>
                Advanced research capabilities with focus on recent information
              </li>
              <li>
                Natural language processing for human-quality writing
              </li>
              <li>
                Sophisticated image generation for professional visuals
              </li>
              <li>
                SEO optimization to ensure your content ranks well
              </li>
              <li>
                Cohesive narrative structure that engages readers
              </li>
            </ul>
          </div>

          <div className="mt-10 text-center">
            <Link href="/" className="inline-flex items-center justify-center h-10 px-6 font-medium tracking-wide text-white transition duration-200 bg-primary rounded-lg hover:bg-primary/90 focus:shadow-outline focus:outline-none">
              Start Creating Content Now
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}