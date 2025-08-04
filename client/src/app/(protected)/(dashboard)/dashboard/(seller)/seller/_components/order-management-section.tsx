"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ShoppingCart, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react"
import { OrderAnalytics } from "./types"
import { formatCurrency, formatNumber } from "./utils"

interface OrderManagementSectionProps {
  data: OrderAnalytics
  isLoading: boolean
}

export function OrderManagementSection({ data, isLoading }: OrderManagementSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center p-4 border rounded-lg">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-4 w-20 mx-auto" />
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
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const orderStatusCards = [
    {
      title: "Total Orders",
      value: data.total_orders,
      icon: ShoppingCart,
      color: "text-blue-600 bg-blue-50",
      description: "All time"
    },
    {
      title: "Pending",
      value: data.pending_orders,
      icon: Clock,
      color: "text-yellow-600 bg-yellow-50",
      description: "Need action"
    },
    {
      title: "Completed",
      value: data.completed_orders,
      icon: CheckCircle,
      color: "text-green-600 bg-green-50",
      description: "Delivered"
    },
    {
      title: "Cancelled",
      value: data.cancelled_orders,
      icon: XCircle,
      color: "text-red-600 bg-red-50",
      description: "Refunded"
    }
  ]

  const recentTrends = data.order_trends.slice(-6) // Last 6 months

  return (
    <div className="space-y-6">
      {/* Order Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Order Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {orderStatusCards.map((card, index) => {
              const Icon = card.icon
              return (
                <div key={index} className="text-center p-4 border rounded-lg">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-3 ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold">{formatNumber(card.value)}</div>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
              )
            })}
          </div>

          {/* Average Order Value */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Average Order Value</h3>
                <p className="text-sm text-muted-foreground">Per completed order</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(data.average_order_value)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {data.completed_orders > 0 ? 'Across all orders' : 'No completed orders yet'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Order Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTrends.length > 0 ? (
            <div className="space-y-4">
              {recentTrends.map((trend, index) => {
                const growthRate = index > 0 ? 
                  ((trend.orders - recentTrends[index - 1].orders) / recentTrends[index - 1].orders * 100) : 0
                
                return (
                  <div key={trend.month} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{trend.month}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(trend.orders)} orders • {formatCurrency(trend.revenue)}
                      </div>
                    </div>
                    <div className="text-right">
                      {index > 0 && (
                        <Badge 
                          variant="outline" 
                          className={growthRate >= 0 ? "text-green-600 bg-green-50" : "text-red-600 bg-red-50"}
                        >
                          {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">No orders yet</h3>
              <p className="text-sm text-muted-foreground">
                Order trends will appear here once you start receiving orders
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
