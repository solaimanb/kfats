"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DollarSign, TrendingUp, Package, PieChart } from "lucide-react"
import { SellerRevenueAnalytics } from "./types"
import { formatCurrency, formatPercentage, getTrendIndicator } from "./utils"

interface RevenueAnalyticsSectionProps {
  data: SellerRevenueAnalytics
  isLoading: boolean
}

export function RevenueAnalyticsSection({ data, isLoading }: RevenueAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <Skeleton className="h-6 w-20 mb-2" />
                  <Skeleton className="h-8 w-32" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const recentTrends = data.revenue_trends.slice(-3) // Last 3 months
  const currentMonthGrowth = recentTrends.length > 1 ? 
    recentTrends[recentTrends.length - 1].growth_rate : 0
  const trendIndicator = getTrendIndicator(currentMonthGrowth)

  return (
    <div className="space-y-6">
      {/* Revenue Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-6 border rounded-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700">Total Revenue</span>
              </div>
              <div className="text-3xl font-bold text-green-700">
                {formatCurrency(data.total_revenue)}
              </div>
              <p className="text-sm text-green-600 mt-1">All time earnings</p>
            </div>

            <div className="p-6 border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Monthly Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-bold text-blue-700">
                  {formatCurrency(data.monthly_revenue)}
                </div>
                {currentMonthGrowth !== 0 && trendIndicator.icon && (
                  <div className={`flex items-center gap-1 ${trendIndicator.color}`}>
                    <trendIndicator.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {formatPercentage(currentMonthGrowth)}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-sm text-blue-600 mt-1">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Products by Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Top Products by Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenue_by_product && data.revenue_by_product.length > 0 ? (
              <div className="space-y-4">
                {data.revenue_by_product.slice(0, 5).map((product, index) => (
                  <div key={product.product_id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-100 text-gray-700' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {index + 1}
                        </span>
                        <span className="font-medium truncate">{product.product_name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground ml-8">
                        {product.orders} orders
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-green-600">
                        {formatCurrency(product.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No sales data available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Revenue by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.revenue_by_category && data.revenue_by_category.length > 0 ? (
              <div className="space-y-4">
                {data.revenue_by_category.map((category) => (
                  <div key={category.category} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium capitalize">
                        {category.category.replace('_', ' ')}
                      </span>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(category.revenue)}</div>
                        <div className="text-sm text-muted-foreground">
                          {formatPercentage(category.percentage, false)}
                        </div>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(category.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  No category data available yet
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      {data.revenue_trends && data.revenue_trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTrends.map((trend, index) => (
                <div key={`${trend.month}-${index}`} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{trend.month}</div>
                    <div className="text-sm text-muted-foreground">
                      Monthly revenue
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      {formatCurrency(trend.revenue)}
                    </div>
                    {trend.growth_rate !== undefined && trend.growth_rate !== null && !isNaN(trend.growth_rate) && trend.growth_rate !== 0 && (
                      <div className={`text-sm ${trend.growth_rate > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatPercentage(trend.growth_rate)} vs prev month
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
