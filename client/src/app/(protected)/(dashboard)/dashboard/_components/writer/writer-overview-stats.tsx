"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { WriterOverviewData } from "./types"
import { formatNumber } from "./utils"
import {
    PenTool,
    Eye,
    FileText,
    TrendingUp,
    BarChart3,
    Calendar,
    Archive,
    Target
} from "lucide-react"

interface WriterOverviewStatsProps {
    data: WriterOverviewData
    isLoading?: boolean
}

export function WriterOverviewStats({ data, isLoading }: WriterOverviewStatsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-muted animate-pulse rounded mb-2" />
                            <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    const stats = [
        {
            title: "Total Articles",
            value: data.totalArticles,
            description: "All time articles",
            icon: FileText,
            color: "text-blue-600",
            bgColor: "bg-blue-50"
        },
        {
            title: "Published",
            value: data.publishedArticles,
            description: "Live articles",
            icon: PenTool,
            color: "text-green-600",
            bgColor: "bg-green-50"
        },
        {
            title: "Total Views",
            value: formatNumber(data.totalViews),
            description: "Across all articles",
            icon: Eye,
            color: "text-purple-600",
            bgColor: "bg-purple-50"
        },
        {
            title: "Average Views",
            value: formatNumber(data.averageViews),
            description: "Per article",
            icon: BarChart3,
            color: "text-orange-600",
            bgColor: "bg-orange-50"
        },
        {
            title: "Engagement Rate",
            value: `${data.engagementRate}%`,
            description: "Reader interaction",
            icon: TrendingUp,
            color: "text-pink-600",
            bgColor: "bg-pink-50"
        },
        {
            title: "Recent Articles",
            value: data.recentArticles,
            description: "Last 30 days",
            icon: Calendar,
            color: "text-indigo-600",
            bgColor: "bg-indigo-50"
        },
        {
            title: "Draft Articles",
            value: data.draftArticles,
            description: "Work in progress",
            icon: FileText,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50"
        },
        {
            title: "Archived",
            value: data.archivedArticles,
            description: "Archived content",
            icon: Archive,
            color: "text-gray-600",
            bgColor: "bg-gray-50"
        }
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                    <Card key={index} className="relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {stat.description}
                            </p>

                            {/* Performance indicators for specific metrics */}
                            {stat.title === "Engagement Rate" && data.engagementRate > 10 && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                    <TrendingUp className="h-3 w-3 mr-1" />
                                    Above average
                                </Badge>
                            )}

                            {stat.title === "Recent Articles" && data.recentArticles > 5 && (
                                <Badge variant="secondary" className="mt-2 text-xs">
                                    <Target className="h-3 w-3 mr-1" />
                                    Highly active
                                </Badge>
                            )}
                        </CardContent>

                        {/* Subtle gradient overlay for visual appeal */}
                        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/5 pointer-events-none" />
                    </Card>
                )
            })}
        </div>
    )
}
