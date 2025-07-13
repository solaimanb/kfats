"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth/use-auth";
import { UserRole } from "@/config/rbac/types";

export default function UnauthorizedPage() {
    const router = useRouter();
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background">
            <div className="max-w-md w-full mx-auto p-6">
                <div className="text-center space-y-6">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold text-foreground">Access Denied</h1>
                    <p className="text-muted-foreground">
                        Sorry, you don&apos;t have permission to access this page. This might be because:
                    </p>
                    <ul className="text-sm text-muted-foreground text-left list-disc list-inside space-y-2">
                        <li>You&apos;re trying to access a page that requires different role permissions</li>
                        <li>You need to complete your profile or verify your account</li>
                        <li>The page is restricted to specific user types</li>
                    </ul>
                    <div className="space-y-4 pt-4">
                        <Button
                            onClick={() => router.push("/dashboard")}
                            variant="default"
                            className="w-full"
                        >
                            Go to Dashboard
                        </Button>
                        <Button
                            onClick={() => router.back()}
                            variant="outline"
                            className="w-full"
                        >
                            Go Back
                        </Button>
                        {!user?.roles.includes(UserRole.USER) && (
                            <Button
                                onClick={() => router.push("/dashboard/user/role-applications")}
                                variant="secondary"
                                className="w-full"
                            >
                                Apply for Required Role
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
} 