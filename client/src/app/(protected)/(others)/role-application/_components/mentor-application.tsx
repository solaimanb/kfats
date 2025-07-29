"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Users, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useRoleApplications } from "@/lib/hooks/useRoleApplications"
import { ApplicationableRole } from "@/lib/types/api"

const mentorApplicationSchema = z.object({
  reason: z.string().min(50, "Please provide at least 50 characters explaining why you want to become a mentor"),
  teaching_experience: z.string().min(10, "Please describe your teaching or mentoring experience"),
  expertise_areas: z.string().min(10, "Please list your areas of expertise"),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  additional_info: z.string().optional()
})

type MentorApplicationFormData = z.infer<typeof mentorApplicationSchema>

interface MentorApplicationProps {
  onBack: () => void
}

export function MentorApplication({ onBack }: MentorApplicationProps) {
  const { applyForRole } = useRoleApplications()

  const form = useForm<MentorApplicationFormData>({
    resolver: zodResolver(mentorApplicationSchema),
    defaultValues: {
      reason: "",
      teaching_experience: "",
      expertise_areas: "",
      portfolio_url: "",
      additional_info: ""
    }
  })

  const onSubmit = async (data: MentorApplicationFormData) => {
    try {
      const applicationData = {
        requested_role: "mentor" as ApplicationableRole,
        reason: data.reason,
        application_data: {
          teaching_experience: data.teaching_experience,
          expertise_areas: data.expertise_areas,
          portfolio_url: data.portfolio_url,
          additional_info: data.additional_info
        }
      }

      await applyForRole.mutateAsync(applicationData)
      toast.success("Mentor application submitted successfully!")
      form.reset()
      onBack()
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
        <div className="w-12 h-12 rounded-lg bg-green-500 flex items-center justify-center">
          <Users className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Apply to Become a Mentor</h1>
          <p className="text-muted-foreground">Share your knowledge and help students learn</p>
        </div>
      </div>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Mentor Application</CardTitle>
          <CardDescription>
            Help us understand your teaching background and expertise
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
                    <FormLabel>Why do you want to become a mentor?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your motivation for teaching and helping students..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 50 characters. Tell us about your passion for education.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="teaching_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teaching or Mentoring Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your experience in teaching, training, or mentoring others..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include formal and informal teaching experiences.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expertise_areas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Areas of Expertise</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="List your skills, subjects, or technologies you can teach..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      What subjects or skills would you like to create courses about?
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
                    <FormLabel>Portfolio/LinkedIn URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://your-portfolio.com or LinkedIn profile"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share your professional profile or portfolio
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
                        placeholder="Any other relevant information about your qualifications..."
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
                  "Submit Mentor Application"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
