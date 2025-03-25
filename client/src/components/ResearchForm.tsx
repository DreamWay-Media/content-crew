import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, Edit3, Palette, FileText, Download, CheckSquare, Share2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ResearchRequest } from "@shared/types";
import AIResearchTooltip from "@/components/AIResearchTooltip";
import { AI_RESEARCH_TOOLTIPS } from "@/lib/tooltipContent";

const formSchema = z.object({
  searchTerm: z.string().min(1, "Search term is required"),
});

interface ResearchFormProps {
  onSubmit: (data: ResearchRequest) => void;
  isLoading: boolean;
}

export default function ResearchForm({ onSubmit, isLoading }: ResearchFormProps) {
  const [billingCycle, setBillingCycle] = React.useState<'monthly' | 'yearly'>('monthly');
  
  const handleBillingCycleChange = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };
  
  const standardPrice = billingCycle === 'monthly' ? '$12' : '$10';
  const standardTotal = billingCycle === 'monthly' ? '/month' : '/month, billed yearly';
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchTerm: "",
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    // Call the parent component's onSubmit function
    onSubmit(data);
  };

  return (
    <section className="max-w-5xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="mb-4 bg-gradient-to-r from-neutral-800 to-neutral-600 bg-clip-text text-transparent">
          AI Content Crew
        </h1>
        <p className="text-lg sm:text-xl text-neutral-700 max-w-2xl mx-auto mb-8">
          Create Free, SEO-Friendly Blogs and Articles with novel AI imagery and publish to your favorite platform in minutes
        </p>
        
        <div className="grid grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
          <div className="text-center p-4">
            <div className="flex justify-center mb-3">
              <Search className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1 inline-flex items-center">
              Research
              <AIResearchTooltip 
                content={AI_RESEARCH_TOOLTIPS.searchProcess.content}
                title={AI_RESEARCH_TOOLTIPS.searchProcess.title}
                className="ml-1"
                iconSize={16}
              />
            </h3>
            <p className="text-sm text-neutral-600">Latest information from trusted sources</p>
          </div>
          
          <div className="text-center p-4">
            <div className="flex justify-center mb-3">
              <Edit3 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1 inline-flex items-center">
              Create
              <AIResearchTooltip 
                content={AI_RESEARCH_TOOLTIPS.contentGeneration.content}
                title={AI_RESEARCH_TOOLTIPS.contentGeneration.title}
                className="ml-1"
                iconSize={16}
              />
            </h3>
            <p className="text-sm text-neutral-600">Craft engaging blog articles and content</p>
          </div>
          
          <div className="text-center p-4">
            <div className="flex justify-center mb-3">
              <Palette className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-1 inline-flex items-center">
              Customize
              <AIResearchTooltip 
                content={AI_RESEARCH_TOOLTIPS.imageGeneration.content}
                title={AI_RESEARCH_TOOLTIPS.imageGeneration.title}
                className="ml-1"
                iconSize={16}
              />
            </h3>
            <p className="text-sm text-neutral-600">Generate images and polish your content</p>
          </div>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto shadow-lg border-none">
        <CardContent className="pt-8 pb-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              

              <FormField
                control={form.control}
                name="searchTerm"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative">
                        <Search className="absolute left-4 top-4 text-primary h-6 w-6" />
                        <Input
                          placeholder="What would you like to research today?"
                          className="pl-14 pr-12 py-8 text-lg border-2 rounded-xl focus:border-primary focus:ring-primary bg-white"
                          disabled={isLoading}
                          {...field}
                        />
                        <div className="absolute right-4 top-4">
                          <AIResearchTooltip 
                            content={AI_RESEARCH_TOOLTIPS.factChecking.content + " Our AI focuses on the last 90 days of information to ensure you get the most up-to-date content."}
                            title="Our Research Process"
                            iconSize={20}
                          />
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full py-7 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? "Researching..." : "Start Your Research Agent"}
              </Button>
              
              {/* How It Works section */}
              <div className="mt-10 pt-8 border-t border-gray-100">
                <h2 className="text-lg font-semibold text-center mb-6">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Step 1 */}
                  <div className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Search className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">1. Enter Your Research Topic</h3>
                    <p className="text-sm text-gray-600">Enter any topic you're interested in researching. Our AI will gather the most relevant and recent information available.</p>
                  </div>
                  
                  {/* Step 2 */}
                  <div className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <CheckSquare className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">2. Select Research Summaries</h3>
                    <p className="text-sm text-gray-600">Review the 10 research summaries our AI has generated and select up to 5 that you find most relevant.</p>
                  </div>
                  
                  {/* Step 3 */}
                  <div className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Edit3 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">3. Generate Blog Article</h3>
                    <p className="text-sm text-gray-600">Our AI crafts a cohesive, engaging, and SEO-friendly blog article from your selected summaries.</p>
                  </div>
                  
                  {/* Step 4 */}
                  <div className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Palette className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">4. Add Visual Appeal</h3>
                    <p className="text-sm text-gray-600">Enhance your article with AI-generated images that perfectly complement your content.</p>
                  </div>
                  
                  {/* Step 5 */}
                  <div className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">5. Download Your Package</h3>
                    <p className="text-sm text-gray-600">Receive your complete package with article and images delivered to your email. (Login/Signup Required)</p>
                  </div>
                  
                  {/* Step 6 */}
                  <div className="text-center">
                    <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-3">
                      <Share2 className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-medium mb-2">6. Publish (Premium)</h3>
                    <p className="text-sm text-gray-600">With our premium subscription, publish your content directly to your favorite platforms.</p>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Pricing Section */}
      <div className="max-w-7xl mx-auto mt-24 mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Choose Your Plan</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Select the perfect plan to power your content creation needs. Scale your content strategy with the right tools and capabilities.
          </p>
          
          <div className="flex justify-center items-center mt-10 space-x-3">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>Monthly</span>
            <Switch 
              checked={billingCycle === 'yearly'} 
              onCheckedChange={handleBillingCycleChange}
              className="data-[state=checked]:bg-primary"
            />
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly <Badge variant="outline" className="ml-1 bg-green-50 text-green-600 border-green-100">Save 16%</Badge>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Basic Plan */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/20 hover:shadow-lg transition-all duration-300">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="font-bold text-xl mb-2">Basic</div>
              <div className="flex items-end justify-center">
                <span className="text-3xl font-bold">Free</span>
              </div>
              <p className="text-sm text-gray-500 mt-4">Great for individuals starting with AI content</p>
            </CardHeader>

            <CardContent className="pt-2 pb-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span><strong>5</strong> Articles per month</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span><strong>15</strong> Generated images</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Power Prompt Engineering</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <X className="h-5 w-5 mr-3" />
                  <span>LLM Selection</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <X className="h-5 w-5 mr-3" />
                  <span>Fact Checking</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <X className="h-5 w-5 mr-3" />
                  <span>SEO Scoring</span>
                </div>
                <div className="flex items-center text-gray-400">
                  <X className="h-5 w-5 mr-3" />
                  <span>Publishing Options</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center pb-8 pt-2">
              <Button className="w-full bg-black hover:bg-gray-800 text-white">
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Standard Plan */}
          <Card className="relative overflow-hidden border-2 border-primary shadow-lg transform md:scale-105 bg-white">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-primary"></div>
            <Badge className="absolute top-5 right-5 bg-primary text-white">Most Popular</Badge>
            
            <CardHeader className="text-center pt-8 pb-4">
              <div className="font-bold text-xl mb-2">Standard</div>
              <div className="flex items-end justify-center">
                <span className="text-3xl font-bold">{standardPrice}</span>
                <span className="text-gray-500 ml-1">{standardTotal}</span>
              </div>
              <p className="text-sm text-gray-500 mt-4">Perfect for businesses and content creators</p>
            </CardHeader>

            <CardContent className="pt-2 pb-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span><strong>20</strong> Articles per month</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span><strong>60</strong> Generated images</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>LLM Selection</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Basic Fact Checking</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>SEO Scoring</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Publish to WordPress, Shopify, Notion</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center pb-8 pt-2">
              <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                Get Started
              </Button>
            </CardFooter>
          </Card>

          {/* Enterprise Plan */}
          <Card className="relative overflow-hidden border-2 hover:border-primary/20 hover:shadow-lg transition-all duration-300 bg-gradient-to-b from-slate-50 to-white">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="font-bold text-xl mb-2">Enterprise</div>
              <div className="flex items-end justify-center">
                <span className="text-lg font-medium">Contact for Pricing</span>
              </div>
              <p className="text-sm text-gray-500 mt-4">Custom solutions for high-volume content needs</p>
            </CardHeader>

            <CardContent className="pt-2 pb-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Up to <strong>100</strong> Articles per month</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span><strong>300</strong> Generated images</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Customized AI training</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Advanced Fact Checking</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>SEO Scoring</span>
                </div>
                <div className="flex items-center">
                  <Check className="h-5 w-5 text-green-500 mr-3" />
                  <span>Publish to all platforms</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-center pb-8 pt-2">
              <Button variant="outline" className="w-full border-black text-black hover:bg-black hover:text-white">
                Contact Sales
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
