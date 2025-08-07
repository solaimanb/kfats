"use client"

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useCallback } from "react"
import { PasswordAPI } from "@/lib/api"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Eye, EyeOff } from "lucide-react"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const passwordSchema = z.object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"]
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export function PasswordChangeForm() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const form = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: ""
        }
    });

    const toggleCurrent = useCallback(() => setShowCurrent((v: boolean) => !v), []);
    const toggleNew = useCallback(() => setShowNew((v: boolean) => !v), []);
    const toggleConfirm = useCallback(() => setShowConfirm((v: boolean) => !v), []);

    const onSubmit = async (data: PasswordFormData) => {
        try {
            await PasswordAPI.changePassword({
                current_password: data.currentPassword,
                new_password: data.newPassword
            });
            toast.success("Password changed successfully.");
            form.reset();
        } catch (err: unknown) {
            let message = "Failed to change password.";
            if (err && typeof err === "object" && "message" in err) {
                const maybeMsg = (err as { message?: unknown }).message;
                if (typeof maybeMsg === "string") message = maybeMsg;
            }
            toast.error(message);
            form.setError("currentPassword", { message });
        }
    };

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                    Update your account password below.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
                        <FormField
                            control={form.control}
                            name="currentPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                id="current-password"
                                                type={showCurrent ? "text" : "password"}
                                                autoComplete="current-password"
                                                disabled={form.formState.isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={toggleCurrent}
                                                tabIndex={-1}
                                                aria-label={showCurrent ? "Hide password" : "Show password"}
                                            >
                                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                <span className="sr-only">{showCurrent ? "Hide password" : "Show password"}</span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="newPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                id="new-password"
                                                type={showNew ? "text" : "password"}
                                                autoComplete="new-password"
                                                disabled={form.formState.isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={toggleNew}
                                                tabIndex={-1}
                                                aria-label={showNew ? "Hide password" : "Show password"}
                                            >
                                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                <span className="sr-only">{showNew ? "Hide password" : "Show password"}</span>
                                            </Button>
                                        </div>
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
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <Input
                                                {...field}
                                                id="confirm-password"
                                                type={showConfirm ? "text" : "password"}
                                                autoComplete="new-password"
                                                disabled={form.formState.isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                onClick={toggleConfirm}
                                                tabIndex={-1}
                                                aria-label={showConfirm ? "Hide password" : "Show password"}
                                            >
                                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                <span className="sr-only">{showConfirm ? "Hide password" : "Show password"}</span>
                                            </Button>
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full justify-center"
                            disabled={form.formState.isSubmitting}
                        >
                            <Shield className="h-4 w-4 mr-2" />
                            {form.formState.isSubmitting ? "Changing..." : "Change Password"}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
