import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import AIResearchTooltip from "@/components/AIResearchTooltip";
import { AI_RESEARCH_TOOLTIPS } from "@/lib/tooltipContent";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email address is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface DownloadFormProps {
  onSubmit: (data: FormValues) => void;
  isLoading: boolean;
}

export default function DownloadForm({ onSubmit, isLoading }: DownloadFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
  };

  return (
    <Card className="max-w-md w-full mx-auto bg-white shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-center">
          Download Your Article
          <AIResearchTooltip 
            content={AI_RESEARCH_TOOLTIPS.downloadOption.content}
            title={AI_RESEARCH_TOOLTIPS.downloadOption.title}
            className="ml-2"
          />
        </CardTitle>
        <CardDescription className="flex items-center justify-center">
          Enter your details to receive the article and images by email
          <AIResearchTooltip 
            content="Your information is only used to deliver your content package and will never be shared with third parties."
            title="Privacy Assured"
            className="ml-1"
            iconSize={14}
          />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Send to my email"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}