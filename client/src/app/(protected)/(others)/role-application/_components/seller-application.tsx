"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { ShoppingBag, Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { useRoleApplications } from "@/lib/hooks/useRoleApplications"
import { ApplicationableRole } from "@/lib/types/api"

const sellerApplicationSchema = z.object({
  reason: z.string().min(50, "Please provide at least 50 characters explaining why you want to become a seller"),
  business_experience: z.string().min(10, "Please describe your business or sales experience"),
  product_categories: z.string().min(10, "Please describe what types of products you plan to sell"),
  business_plan: z.string().min(20, "Please briefly describe your business approach"),
  portfolio_url: z.string().url().optional().or(z.literal("")),
  additional_info: z.string().optional()
})

type SellerApplicationFormData = z.infer<typeof sellerApplicationSchema>

interface SellerApplicationProps {
  onBack: () => void
}

export function SellerApplication({ onBack }: SellerApplicationProps) {
  const { applyForRole } = useRoleApplications()

  const form = useForm<SellerApplicationFormData>({
    resolver: zodResolver(sellerApplicationSchema),
    defaultValues: {
      reason: "",
      business_experience: "",
      product_categories: "",
      business_plan: "",
      portfolio_url: "",
      additional_info: ""
    }
  })

  const onSubmit = async (data: SellerApplicationFormData) => {
    try {
      const applicationData = {
        requested_role: "seller" as ApplicationableRole,
        reason: data.reason,
        application_data: {
          business_experience: data.business_experience,
          product_categories: data.product_categories,
          business_plan: data.business_plan,
          portfolio_url: data.portfolio_url,
          additional_info: data.additional_info
        }
      }

      await applyForRole.mutateAsync(applicationData)
      toast.success("Seller application submitted successfully!")
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
        <div className="w-12 h-12 rounded-lg bg-orange-500 flex items-center justify-center">
          <ShoppingBag className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Apply to Become a Seller</h1>
          <p className="text-muted-foreground">Build your business and reach customers</p>
        </div>
      </div>

      {/* Application Form */}
      <Card>
        <CardHeader>
          <CardTitle>Seller Application</CardTitle>
          <CardDescription>
            Tell us about your business goals and what you plan to sell
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
                    <FormLabel>Why do you want to become a seller?</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your motivation for starting a business on our platform..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Minimum 50 characters. Tell us about your business goals.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business or Sales Experience</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your experience in business, sales, or entrepreneurship..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any relevant business or sales experience.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="product_categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Categories</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="What types of products do you plan to sell? (e.g., art supplies, digital products, handmade items...)"
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Describe the products or services you want to offer.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="business_plan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Approach</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe your business strategy and how you plan to serve customers..."
                        className="min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      How do you plan to operate your business on our platform?
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
                    <FormLabel>Business Website/Portfolio (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://your-business-website.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Share your existing business website or portfolio
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
                        placeholder="Any other relevant information about your business plans..."
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
                  "Submit Seller Application"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
