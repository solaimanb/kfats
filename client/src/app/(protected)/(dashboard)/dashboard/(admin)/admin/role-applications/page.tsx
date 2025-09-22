"use client"

import { useAuth } from "@/providers/auth-provider"
import { UserRole } from "@/lib/types/api"
import { RoleApplicationsTable } from "./_components/role-applications-table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RoleApplicationsPage() {
    const { user, isLoading } = useAuth()

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <CardTitle>Authentication Required</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground mb-4">
                            Please log in to access role applications.
                        </p>
                        <Button asChild>
                            <Link href="/login">Sign In</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (user.role !== UserRole.ADMIN) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                        <CardTitle>Access Denied</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <p className="text-muted-foreground mb-4">
                            Only administrators can access role applications management.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/dashboard">Return to Dashboard</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Shield className="h-6 w-6 text-primary" />
                        <h1 className="text-2xl font-bold tracking-tight">Role Applications</h1>
                    </div>
                    <p className="text-muted-foreground">
                        Review and manage user role upgrade applications
                    </p>
                </div>
            </div>
            <RoleApplicationsTable />
        </div>
    )
}
