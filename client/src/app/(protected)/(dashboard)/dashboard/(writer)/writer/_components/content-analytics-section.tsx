"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContentAnalytics } from "./types"
import {
    BarChart3,
    Star
} from "lucide-react"

interface ContentAnalyticsSectionProps {
    analytics: ContentAnalytics
    isLoading?: boolean
}

export function ContentAnalyticsSection({ analytics, isLoading }: ContentAnalyticsSectionProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                {/* Top Performing Articles Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                            <div className="h-5 w-40 bg-muted animate-pulse rounded" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded-lg">
                                    <div className="flex items-center gap-3 flex-1">
                                        <div className="w-6 h-6 bg-muted animate-pulse rounded-full" />
                                        <div className="flex-1">
                                            <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-1" />
                                            <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                                        </div>
                                    </div>
                                    <div className="h-5 w-8 bg-muted animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Topic Performance Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                            <div className="h-5 w-32 bg-muted animate-pulse rounded" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                                            <div className="h-5 w-12 bg-muted animate-pulse rounded" />
                                        </div>
                                        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div className="bg-muted animate-pulse h-2 rounded-full w-3/4" />
                                    </div>
                                    <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-600" />
                        Top Performing Articles
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {analytics.popularArticles.map((article, index) => (
                            <div key={article.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-xs font-medium">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium line-clamp-1">
                                            {article.title}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{article.engagement_rate}% engagement</span>
                                        </div>
                                    </div>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className={`text-xs ${index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                        index === 1 ? 'bg-gray-100 text-gray-800' :
                                            index === 2 ? 'bg-orange-100 text-orange-800' :
                                                'bg-muted'
                                        }`}
                                >
                                    #{index + 1}
                                </Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-sm">
                        <BarChart3 className="h-4 w-4 text-blue-600" />
                        Topic Performance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics.topicPerformance.map((topic) => (
                            <div key={topic.topic} className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">{topic.topic}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {topic.articles_count} articles
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {topic.average_engagement}% avg engagement
                                    </div>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${Math.min(topic.average_engagement, 100)}%` }}
                                    />
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    {topic.average_engagement}% average engagement
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
