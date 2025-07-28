"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAuth } from "@/providers/auth-provider"
import { TOAST_IDS, TOAST_MESSAGES } from "@/lib/constants/toast"

const signupSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    username: z.string()
        .min(3, "Username must be at least 3 characters")
        .max(50, "Username must be less than 50 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
    full_name: z.string()
        .min(2, "Full name must be at least 2 characters")
        .max(100, "Full name must be less than 100 characters"),
    password: z.string()
        .min(6, "Password must be at least 6 characters")
        .max(128, "Password must be less than 128 characters"),
    confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type SignupFormData = z.infer<typeof signupSchema>

export function SignupForm({
    className,
    ...props
}: React.ComponentProps<"div">) {
    const router = useRouter()
    const { register } = useAuth()

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "",
            username: "",
            full_name: "",
            password: "",
            confirmPassword: "",
        },
    })

    const onSubmit = async (data: SignupFormData) => {
        try {
            toast.loading(TOAST_MESSAGES.AUTH.SIGNUP.LOADING, { id: TOAST_IDS.AUTH.SIGNUP })

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { confirmPassword: _, ...registrationData } = data

            await register(registrationData)

            toast.success(TOAST_MESSAGES.AUTH.SIGNUP.SUCCESS, { id: TOAST_IDS.AUTH.SIGNUP })

            setTimeout(() => {
                router.push('/dashboard')
            }, 1000)
        } catch (error) {
            console.error("Signup failed:", error)
            const errorMessage = error instanceof Error ? error.message : TOAST_MESSAGES.AUTH.SIGNUP.ERROR
            toast.error(errorMessage, { id: TOAST_IDS.AUTH.SIGNUP })
        }
    }

    const handleGoogleSignup = () => {
        // TODO: Implement Google OAuth signup
        console.log("Google signup clicked")
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="overflow-hidden p-0">
                <CardContent className="grid p-0 md:grid-cols-2">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 md:p-8">
                            <div className="flex flex-col gap-6">
                                <div className="flex flex-col items-center text-center">
                                    <h1 className="text-2xl font-bold">Create an account</h1>
                                    <p className="text-muted-foreground text-sm">
                                        Join KFATS today
                                    </p>
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="user@kfats.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="username"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Username</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="johndoe"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="text"
                                                    placeholder="John Doe"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Enter your password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <Input type="password" placeholder="Confirm your password" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? "Creating account..." : "Create account"}
                                </Button>

                                <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                                    <span className="bg-card text-muted-foreground relative z-10 px-2">
                                        Or continue with
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        className="w-full"
                                        onClick={handleGoogleSignup}
                                        disabled={form.formState.isSubmitting}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                                            <path
                                                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                                                fill="currentColor"
                                            />
                                        </svg>
                                        Continue with Google
                                    </Button>
                                </div>

                                <div className="text-center text-sm">
                                    Already have an account?{" "}
                                    <Link href="/login" className="underline underline-offset-4">
                                        Sign in
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </Form>
                    <div className="bg-muted relative hidden md:block">
                        <Image
                            src="/placeholder.svg"
                            alt="Signup illustration"
                            fill
                            className="object-cover dark:brightness-[0.2] dark:grayscale"
                            priority
                        />
                    </div>
                </CardContent>
            </Card>
            <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <Link href="#">Terms of Service</Link>{" "}
                and <Link href="#">Privacy Policy</Link>.
            </div>
        </div>
    )
}
