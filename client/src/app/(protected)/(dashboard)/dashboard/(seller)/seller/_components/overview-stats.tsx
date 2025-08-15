"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, DollarSign, ShoppingCart, Star, TrendingUp, AlertTriangle, Eye, BarChart3 } from "lucide-react"
import { SellerOverviewData } from "./types"
import { formatCurrency, formatNumber, getTrendIndicator } from "./utils"

interface SellerOverviewStatsProps {
  data: SellerOverviewData
  isLoading: boolean
}

export function SellerOverviewStats({ data, isLoading }: SellerOverviewStatsProps) {
  console.log("Seller Overview Stats - Data:", data)
  
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const monthlyGrowth = data.monthly_revenue > 0 ? 12.5 : 0 // Mock growth rate
  const trendIndicator = getTrendIndicator(monthlyGrowth)

  const stats = [
    {
      title: "My Products",
      value: data.my_products,
      icon: Package,
      description: `${data.active_products} active`,
      trend: null
    },
    {
      title: "Total Revenue",
      value: formatCurrency(data.total_revenue),
      icon: DollarSign,
      description: "All time earnings",
      trend: null
    },
    {
      title: "Monthly Revenue",
      value: formatCurrency(data.monthly_revenue),
      icon: TrendingUp,
      description: "This month",
      trend: monthlyGrowth !== 0 ? {
        value: monthlyGrowth,
        icon: trendIndicator.icon,
        color: trendIndicator.color
      } : null
    },
    {
      title: "Total Orders",
      value: formatNumber(data.total_orders),
      icon: ShoppingCart,
      description: "Completed orders",
      trend: null
    },
    {
      title: "Average Rating",
      value: data.average_rating.toFixed(1),
      icon: Star,
      description: "Customer feedback",
      trend: null
    },
    {
      title: "Stock Value",
      value: formatCurrency(data.total_stock_value),
      icon: BarChart3,
      description: "Inventory worth",
      trend: null
    },
    {
      title: "Low Stock Items",
      value: formatNumber(data.low_stock_products),
      icon: AlertTriangle,
      description: "Need attention",
      trend: null,
      highlight: data.low_stock_products > 0
    },
    {
      title: "Performance",
      value: "Good",
      icon: Eye,
      description: "Overall rating",
      trend: null
    }
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        
        return (
          <Card key={index} className={stat.highlight ? "border-orange-200 bg-orange-50/50" : ""}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.highlight ? "text-orange-600" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`text-2xl font-bold ${stat.highlight ? "text-orange-700" : ""}`}>
                  {stat.value}
                </div>
                {stat.trend && stat.trend.icon && (
                  <div className={`flex items-center space-x-1 ${stat.trend.color}`}>
                    <stat.trend.icon className="h-3 w-3" />
                    <span className="text-xs font-medium">
                      {stat.trend.value > 0 ? '+' : ''}{stat.trend.value}%
                    </span>
                  </div>
                )}
              </div>
              <p className={`text-xs ${stat.highlight ? "text-orange-600" : "text-muted-foreground"}`}>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
