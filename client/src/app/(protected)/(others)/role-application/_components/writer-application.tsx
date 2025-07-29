"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { PenTool, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useRoleApplications } from "@/lib/hooks/useRoleApplications"
import { ApplicationableRole } from "@/lib/types/api"

const writerApplicationSchema = z.object({
  reason: z.string().min(50, "Please provide at least 50 characters explaining why you want to become a writer"),
  writing_experience: z.string().min(10, "Please describe your writing experience"),
  content_topics: z.string().min(10, "Please describe what topics you plan to write about"),
  writing_samples: z.string().optional(),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  additional_info: z.string().optional()
})

type WriterApplicationFormData = z.infer<typeof writerApplicationSchema>

interface WriterApplicationProps {
  onBack: () => void
}

export function WriterApplication({ onBack }: WriterApplicationProps) {
  const { applyForRole } = useRoleApplications()

  const form = useForm<WriterApplicationFormData>({
    resolver: zodResolver(writerApplicationSchema),
    defaultValues: {
      reason: "",
      writing_experience: "",
      content_topics: "",
      writing_samples: "",
      portfolio_url: "",
      additional_info: ""
    }
  })

  const onSubmit = async (data: WriterApplicationFormData) => {
    try {
      const applicationData = {
        requested_role: "writer" as ApplicationableRole,
        reason: data.reason,
        application_data: {
          writing_experience: data.writing_experience,
          content_topics: data.content_topics,
          writing_samples: data.writing_samples,
          portfolio_url: data.portfolio_url,
          additional_info: data.additional_info
        }
      }

      await applyForRole.mutateAsync(applicationData)
      toast.success("Writer application submitted successfully!")
      form.reset()
      onBack() // Return to selection view
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error &&
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : "Failed to submit application"
      toast.error(errorMessage)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Roles
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-purple-500 flex items-center justify-center">
          <PenTool className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Apply to Become a Writer</h1>
          <p className="text-muted-foreground">Share your knowledge through articles and content</p>
        </div>
      </div>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Writer Application</CardTitle>
          <CardDescription>
            Help us understand your writing background and content interests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Why do you want to become a writer?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your passion for writing and content creation..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 50 characters. Tell us about your writing goals.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="writing_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Writing Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your experience in writing, blogging, or content creation..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any published work, blogs, or writing projects.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="content_topics"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Topics</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What topics do you want to write about? (e.g., technology, art, education, tutorials...)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What subjects or areas would you like to create content about?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="writing_samples"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Writing Samples or Links (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share links to your published articles or paste a short writing sample..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Help us see your writing style and quality.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portfolio_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Writing Portfolio/Blog URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://your-blog.com or Medium profile"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share your blog, Medium profile, or writing portfolio
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additional_info"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Information (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any other relevant information about your writing background..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={applyForRole.isPending}
                className="w-full"
                size="lg"
              >
                {applyForRole.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  "Submit Writer Application"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
