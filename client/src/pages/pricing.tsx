import React, { useState } from 'react';
import { Link } from 'wouter';
import { Check, X, ArrowLeft, MessageSquareText, ImageIcon, Zap, LineChart, Globe, Database, BookText } from 'lucide-react';
import { SiShopify, SiWordpress, SiWebflow, SiNotion, SiAirtable, 
         SiSlack, SiTrello, SiAsana, SiHubspot, SiSalesforce } from "react-icons/si";
import AppLayout from '../components/AppLayout';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleBillingCycleChange = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  const standardPrice = billingCycle === 'monthly' ? '$12' : '$10';
  const standardTotal = billingCycle === 'monthly' ? '/month' : '/month, billed yearly';
  
  return (
    <AppLayout activePage="pricing">
      <div className="container mx-auto px-4 py-16 flex-grow">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
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
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>
                      Customized Prompt Engineering
                      <span className="block text-xs text-gray-500 ml-8">$250 onboarding and training in your brand voice</span>
                    </span>
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
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Priority Support</span>
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

          {/* Feature Comparison */}
          <div className="mt-24 mb-16">
            <h2 className="text-2xl font-bold text-center mb-12">Detailed Feature Comparison</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-6 font-medium text-gray-500">Features</th>
                    <th className="py-4 px-6 font-medium text-gray-500">Basic</th>
                    <th className="py-4 px-6 font-medium text-gray-500">Standard</th>
                    <th className="py-4 px-6 font-medium text-gray-500">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="py-4 px-6 flex items-center">
                      <MessageSquareText className="h-5 w-5 text-primary mr-2" />
                      <span>Articles per month</span>
                    </td>
                    <td className="py-4 px-6 text-center">5</td>
                    <td className="py-4 px-6 text-center">20</td>
                    <td className="py-4 px-6 text-center">Up to 100</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 flex items-center">
                      <ImageIcon className="h-5 w-5 text-primary mr-2" />
                      <span>Generated images</span>
                    </td>
                    <td className="py-4 px-6 text-center">15</td>
                    <td className="py-4 px-6 text-center">60</td>
                    <td className="py-4 px-6 text-center">300</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 flex items-center">
                      <Zap className="h-5 w-5 text-primary mr-2" />
                      <span>Prompt Engineering</span>
                    </td>
                    <td className="py-4 px-6 text-center">Basic</td>
                    <td className="py-4 px-6 text-center">Custom ($250 setup)</td>
                    <td className="py-4 px-6 text-center">Advanced Custom</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 flex items-center">
                      <Database className="h-5 w-5 text-primary mr-2" />
                      <span>LLM Selection</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 flex items-center">
                      <BookText className="h-5 w-5 text-primary mr-2" />
                      <span>Fact Checking</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">Basic</td>
                    <td className="py-4 px-6 text-center">Advanced</td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 flex items-center">
                      <LineChart className="h-5 w-5 text-primary mr-2" />
                      <span>SEO Scoring</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 flex items-center">
                      <Globe className="h-5 w-5 text-primary mr-2" />
                      <span>Publishing Options</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X className="h-5 w-5 text-red-400 mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">WordPress, Shopify, Notion</td>
                    <td className="py-4 px-6 text-center">All platforms</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mt-16 mb-16">
            <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-2">Can I upgrade or downgrade my plan?</h3>
                <p className="text-gray-600">Yes, you can change your plan at any time. Changes will take effect at the start of your next billing cycle.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-2">What happens if I reach my article or image limit?</h3>
                <p className="text-gray-600">You can purchase additional credits or upgrade to a higher plan to continue creating content when you reach your limits.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-2">What is included in the onboarding for the Standard plan?</h3>
                <p className="text-gray-600">The $250 onboarding includes a personalized training session where we analyze your brand voice and create custom prompt templates that match your style and tone.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="font-bold text-lg mb-2">How does the Enterprise plan differ?</h3>
                <p className="text-gray-600">Enterprise includes dedicated support, custom AI training with your specific content, advanced fact-checking algorithms, and integration with all major publishing platforms.</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-16 mb-8">
            <p className="text-lg mb-5">Ready to take your content creation to the next level?</p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
              Get Started Today
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}