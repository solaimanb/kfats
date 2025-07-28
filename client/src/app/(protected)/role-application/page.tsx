"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/lib/hooks/useAuth"
import { useRoleApplications } from "@/lib/hooks/useRoleApplications"
import { ApplicationableRole, RoleApplication } from "@/lib/types/api"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, FileText, Users, ShoppingBag } from "lucide-react"

const applicationSchema = z.object({
    requested_role: z.enum(["mentor", "seller", "writer"]),
    reason: z.string().min(50, "Please provide at least 50 characters explaining why you want this role"),
    experience: z.string().optional(),
    portfolio_url: z.string().url().optional().or(z.literal("")),
    additional_info: z.string().optional()
})

type ApplicationFormData = z.infer<typeof applicationSchema>

export default function RoleApplicationPage() {
    const { user } = useAuth()
    const { applyForRole, getMyApplications } = useRoleApplications()
    const { data: myApplications, isLoading: loadingApplications } = getMyApplications()
    const router = useRouter()

    const form = useForm<ApplicationFormData>({
        resolver: zodResolver(applicationSchema),
        defaultValues: {
            requested_role: "mentor",
            reason: "",
            experience: "",
            portfolio_url: "",
            additional_info: ""
        }
    })

    const onSubmit = async (data: ApplicationFormData) => {
        try {
            const applicationData = {
                requested_role: data.requested_role as ApplicationableRole,
                reason: data.reason,
                application_data: {
                    experience: data.experience,
                    portfolio_url: data.portfolio_url,
                    additional_info: data.additional_info
                }
            }

            await applyForRole.mutateAsync(applicationData)
            toast.success("Application submitted successfully!")
            form.reset()
            router.refresh()
        } catch (error: any) {
            toast.error(error.response?.data?.detail || "Failed to submit application")
        }
    }

    const getRoleIcon = (role: string) => {
        switch (role) {
            case "mentor":
                return <Users className="h-4 w-4" />
            case "seller":
                return <ShoppingBag className="h-4 w-4" />
            case "writer":
                return <FileText className="h-4 w-4" />
            default:
                return null
        }
    }

    const getRoleDescription = (role: string) => {
        switch (role) {
            case "mentor":
                return "Create and manage courses, teach students, and share your expertise"
            case "seller":
                return "Sell products, manage your store, and build your business"
            case "writer":
                return "Write articles, create content, and share your knowledge"
            default:
                return ""
        }
    }

    if (!user) {
        return <div>Please log in to apply for roles.</div>
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Apply for a Role</h1>
                <p className="text-muted-foreground mt-2">
                    Expand your capabilities on the platform by applying for additional roles
                </p>
            </div>

            {/* Current Role Status */}
            <Card>
                <CardHeader>
                    <CardTitle>Current Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center space-x-2">
                        <span className="font-medium">Current Role:</span>
                        <span className="px-2 py-1 bg-primary/10 text-primary rounded-md text-sm">
                            {user.role.toUpperCase()}
                        </span>
                    </div>
                </CardContent>
            </Card>

            {/* My Applications */}
            {loadingApplications ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </CardContent>
                </Card>
            ) : myApplications && myApplications.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>My Applications</CardTitle>
                        <CardDescription>Track the status of your role applications</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {myApplications.map((app: RoleApplication) => (
                                <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        {getRoleIcon(app.requested_role)}
                                        <div>
                                            <p className="font-medium">{app.requested_role.toUpperCase()}</p>
                                            <p className="text-sm text-muted-foreground">
                                                Applied on {new Date(app.applied_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className={`px-2 py-1 rounded-md text-sm ${app.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                                            app.status === "approved" ? "bg-green-100 text-green-800" :
                                                "bg-red-100 text-red-800"
                                            }`}>
                                            {app.status.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Application Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Submit New Application</CardTitle>
                    <CardDescription>
                        Choose the role you'd like to apply for and provide relevant information
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="requested_role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role to apply for" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="mentor">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="h-4 w-4" />
                                                        <span>Mentor</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="seller">
                                                    <div className="flex items-center space-x-2">
                                                        <ShoppingBag className="h-4 w-4" />
                                                        <span>Seller</span>
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="writer">
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="h-4 w-4" />
                                                        <span>Writer</span>
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            {getRoleDescription(field.value)}
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="reason"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Why do you want this role?</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Explain why you want this role and how you plan to use it..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Minimum 50 characters. Be specific about your goals and qualifications.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="experience"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Relevant Experience (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Describe your relevant experience, skills, or background..."
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="portfolio_url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Portfolio/Website URL (Optional)</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://your-portfolio.com"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Share a link to your portfolio, website, or relevant work
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
                                                placeholder="Any other information you'd like to share..."
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
                            >
                                {applyForRole.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting Application...
                                    </>
                                ) : (
                                    "Submit Application"
                                )}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    )
}
