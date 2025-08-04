"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, DollarSign, Star, } from "lucide-react"
import type { MentorOverviewData } from "./types"
import { formatCurrency, } from "./utils"

interface MentorOverviewStatsProps {
    data: MentorOverviewData | undefined
    isLoading: boolean
}

export function MentorOverviewStats({ data, isLoading }: MentorOverviewStatsProps) {
    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="relative overflow-hidden animate-pulse">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 bg-muted rounded w-20" />
                            <div className="h-4 w-4 bg-muted rounded" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 bg-muted rounded w-16 mb-1" />
                            <div className="h-3 bg-muted rounded w-24" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">My Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data?.my_courses || 0}</div>
                    <p className="text-xs text-muted-foreground">Total courses created</p>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-400 to-green-600" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data?.total_students || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all courses</p>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(data?.monthly_revenue || 0)}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Rating</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{data?.average_rating?.toFixed(1) || "0.0"}</div>
                    <p className="text-xs text-muted-foreground">Student ratings</p>
                </CardContent>
            </Card>
        </div>
    )
}
