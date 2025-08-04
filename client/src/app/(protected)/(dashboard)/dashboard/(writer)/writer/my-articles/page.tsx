"use client"

import { useAuth, useRoleAccess } from "@/providers/auth-provider"
import { useWriterArticles } from "@/lib/hooks/useArticles"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MyArticlesPageSkeleton } from "./_components/loading-skeleton"
import {
    MyArticlesSection,
} from "@/app/(protected)/(dashboard)/dashboard/(writer)/writer/_components"
import {
    PenTool,
    AlertTriangle,
    UserPlus,
    ArrowLeft
} from "lucide-react"

export default function MyArticlesPage() {
    const { user } = useAuth()
    const { canWriteArticles } = useRoleAccess()
    const { data: myArticles, isLoading, error } = useWriterArticles()
    const router = useRouter()

    useEffect(() => {
        document.title = `My Articles - ${user?.full_name || 'Writer'} | KFATS`
    }, [user])

    if (isLoading) {
        return <MyArticlesPageSkeleton />
    }

    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold">My Articles</h1>
                        <p className="text-muted-foreground">Manage your published content and analytics</p>
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>

                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Failed to load articles: {error instanceof Error ? error.message : 'Unknown error occurred'}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (!canWriteArticles) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold">My Articles</h1>
                        <p className="text-muted-foreground">Writer access required</p>
                    </div>
                    <Button variant="outline" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Go Back
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PenTool className="h-5 w-5 text-purple-600" />
                            Writer Access Required
                        </CardTitle>
                        <CardDescription>
                            You need writer privileges to access this page and manage articles.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-center py-6">
                            <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="font-medium mb-2">Become a Writer</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Apply for writer role to start creating and publishing articles
                            </p>
                            <Button onClick={() => router.push('/role-application')}>
                                Apply for Writer Role
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    const handleCreateArticle = () => {
        router.push('/articles/create')
    }

    const handleEditArticle = (articleId: number) => {
        router.push(`/articles/${articleId}/edit`)
    }

    const handleViewArticle = (articleId: number) => {
        router.push(`/articles/${articleId}`)
    }

    const handleGoToDashboard = () => {
        router.push('/dashboard')
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold">My Articles</h1>
                        <Badge
                            className="bg-purple-100 text-purple-800 border-purple-200 flex items-center gap-1"
                        >
                            <PenTool className="h-3 w-3" />
                            Writer
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Manage your published content, track performance, and create new articles
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleGoToDashboard}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Dashboard
                    </Button>
                    <Button onClick={handleCreateArticle}>
                        <PenTool className="h-4 w-4 mr-2" />
                        Write Article
                    </Button>
                </div>
            </div>

            <MyArticlesSection
                articles={myArticles || []}
                isLoading={isLoading}
                onEditArticle={handleEditArticle}
                onViewArticle={handleViewArticle}
            />
        </div>
    )
}
