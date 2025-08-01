"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/hooks/useAuth"
import { useMyApplications } from "@/lib/hooks/useRoleApplications"
import { RoleApplication } from "@/lib/types/api"
import { Loader2, FileText, Users, ShoppingBag, Star, PenTool } from "lucide-react"
import { RoleSelectionCard } from "./_components/role-selection-card"
import { MentorApplication } from "./_components/mentor-application"
import { SellerApplication } from "./_components/seller-application"
import { WriterApplication } from "./_components/writer-application"

type SelectedRole = "mentor" | "seller" | "writer" | null

export default function RoleApplicationPage() {
    const { user } = useAuth()
    const { data: myApplications, isLoading: loadingApplications } = useMyApplications()
    const searchParams = useSearchParams()
    const [selectedRole, setSelectedRole] = useState<SelectedRole>(
        (searchParams.get('role') as SelectedRole) || null
    )

    const roleDefinitions = {
        mentor: {
            title: "Mentor",
            description: "Create and manage courses, teach students, and share your expertise",
            features: ["Create courses", "Manage students", "Upload course content", "Earn from teaching"],
            icon: Users,
            color: "bg-green-500"
        },
        seller: {
            title: "Seller",
            description: "List and sell products, manage inventory, and grow your business",
            features: ["List products", "Manage inventory", "Process orders", "Build marketplace presence"],
            icon: ShoppingBag,
            color: "bg-orange-500"
        },
        writer: {
            title: "Writer",
            description: "Create and publish articles, blogs, and educational content",
            features: ["Write articles", "Publish blogs", "Build audience", "Share expertise"],
            icon: PenTool,
            color: "bg-purple-500"
        }
    }

    const getRoleStatus = (role: SelectedRole) => {
        if (!role) return { canApply: true }

        if (user?.role === role) {
            return { canApply: false, reason: "Current Role" }
        }

        const pendingApp = myApplications?.find(
            (app: RoleApplication) => app.requested_role === role && app.status === "pending"
        )
        if (pendingApp) {
            return { canApply: false, reason: "Application Pending" }
        }

        const rejectedApp = myApplications?.find(
            (app: RoleApplication) => app.requested_role === role && app.status === "rejected"
        )
        if (rejectedApp) {
            const reviewedDate = new Date(rejectedApp.reviewed_at!)
            const daysSinceRejection = Math.floor((Date.now() - reviewedDate.getTime()) / (1000 * 60 * 60 * 24))
            if (daysSinceRejection < 30) {
                return { canApply: false, reason: `Wait ${30 - daysSinceRejection} days` }
            }
        }

        return { canApply: true }
    }

    const handleRoleSelect = (role: SelectedRole) => {
        setSelectedRole(role)
        const url = new URL(window.location.href)
        if (role) {
            url.searchParams.set('apply-for', role)
        } else {
            url.searchParams.delete('apply-for')
        }
        window.history.pushState({}, '', url.toString())
    }

    const handleBackToSelection = () => {
        setSelectedRole(null)
        const url = new URL(window.location.href)
        url.searchParams.delete('role')
        window.history.pushState({}, '', url.toString())
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

    if (selectedRole) {
        switch (selectedRole) {
            case "mentor":
                return <MentorApplication onBack={handleBackToSelection} />
            case "seller":
                return <SellerApplication onBack={handleBackToSelection} />
            case "writer":
                return <WriterApplication onBack={handleBackToSelection} />
            default:
                break
        }
    }

    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Header */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <Badge variant="secondary">Role Applications</Badge>
                    <Star className="h-6 w-6 text-yellow-500" />
                </div>
                <h1 className="text-4xl font-bold mb-4">Choose Your Role</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Expand your capabilities on the KFATS platform by applying for specialized roles
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
                        <Badge variant="outline" className="text-sm">
                            {user?.role.toUpperCase()}
                        </Badge>
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
                                        <Badge
                                            variant={app.status === "pending" ? "secondary" :
                                                app.status === "approved" ? "default" : "destructive"}
                                            className="text-sm"
                                        >
                                            {app.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Role Selection Cards */}
            <div>
                <h2 className="text-2xl font-semibold mb-6 text-center">Available Roles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Object.entries(roleDefinitions).map(([role, config]) => {
                        const status = getRoleStatus(role as SelectedRole)
                        return (
                            <RoleSelectionCard
                                key={role}
                                role={role as "mentor" | "seller" | "writer"}
                                title={config.title}
                                description={config.description}
                                features={config.features}
                                icon={config.icon}
                                color={config.color}
                                onClick={() => handleRoleSelect(role as SelectedRole)}
                                isDisabled={!status.canApply}
                                disabledReason={status.reason}
                            />
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
