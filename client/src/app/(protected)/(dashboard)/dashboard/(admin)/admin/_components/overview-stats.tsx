"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, BookOpen, PenTool, ShoppingBag, TrendingUp, Eye } from "lucide-react"
import type { OverviewData } from "./types"

interface OverviewStatsProps {
  data: OverviewData | undefined
  isLoading: boolean
}

export function OverviewStats({ data, isLoading }: OverviewStatsProps) {
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
              <div className="h-8 bg-muted rounded w-16 mb-2" />
              <div className="h-4 bg-muted rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = [
    {
      title: "Total Users",
      value: data?.totals.users || 0,
      growth: data?.growth.new_users_this_month || 0,
      icon: Users,
      gradient: "from-blue-500 to-blue-600",
      growthText: "this month"
    },
    {
      title: "Total Courses",
      value: data?.totals.courses || 0,
      growth: data?.growth.new_courses_this_month || 0,
      icon: BookOpen,
      gradient: "from-green-500 to-green-600",
      growthText: "this month"
    },
    {
      title: "Total Articles",
      value: data?.totals.articles || 0,
      growth: data?.growth.new_articles_this_month || 0,
      icon: PenTool,
      gradient: "from-purple-500 to-purple-600",
      growthText: "this month"
    },
    {
      title: "Total Products",
      value: data?.totals.products || 0,
      growth: null,
      icon: ShoppingBag,
      gradient: "from-orange-500 to-orange-600",
      growthText: "Marketplace items",
      growthIcon: Eye
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const GrowthIcon = stat.growthIcon || TrendingUp
        
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <GrowthIcon className="h-3 w-3 mr-1 text-green-500" />
                {stat.growth !== null ? `+${stat.growth} ` : ""}{stat.growthText}
              </div>
            </CardContent>
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r ${stat.gradient}`} />
          </Card>
        )
      })}
    </div>
  )
}
