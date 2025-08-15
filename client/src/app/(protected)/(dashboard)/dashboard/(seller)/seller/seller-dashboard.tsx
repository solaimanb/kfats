"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import {
  SellerOverviewStats,
  MyProductsSection,
  OrderManagementSection,
  RevenueAnalyticsSection,
  SellerRecentActivity,
  type ProductPerformance,
  type OrderAnalytics,
  type SellerRevenueAnalytics,
  type SellerActivity
} from "./_components"
import React from "react"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { SellerAnalyticsAPI } from "@/lib/api/seller-analytics"

interface SellerDashboardProps {
  userId?: number
}

export function SellerDashboard({ }: SellerDashboardProps) {
  const router = useRouter()
  const [orderAnalytics, setOrderAnalytics] = React.useState<OrderAnalytics | null>(null)
  const [revenueAnalytics, setRevenueAnalytics] = React.useState<SellerRevenueAnalytics | null>(null)
  const [rawProducts, setRawProducts] = React.useState<ProductPerformance[]>([])
  const [loadingAnalytics, setLoadingAnalytics] = React.useState(true)

  const productsPerformance = React.useMemo(() => rawProducts, [rawProducts])

  const overviewData = React.useMemo(() => {
    if (!rawProducts || !orderAnalytics || !revenueAnalytics) return null
    return {
      my_products: rawProducts.length,
      total_orders: orderAnalytics.total_orders,
      total_revenue: revenueAnalytics.total_revenue,
      monthly_revenue: revenueAnalytics.revenue_trends.length > 0 ? revenueAnalytics.revenue_trends[revenueAnalytics.revenue_trends.length - 1].revenue : 0,
      average_rating: 0, // TODO: Add rating if available
      total_stock_value: rawProducts.reduce(
        (acc: number, p: ProductPerformance) => acc + (p.price * (p.stock_quantity || 0)),
        0
      ),
      low_stock_products: rawProducts.filter(
        (p: ProductPerformance) => (p.stock_quantity || 0) <= 10
      ).length,
      active_products: rawProducts.filter(
        (p: ProductPerformance) => p.status === "active"
      ).length
    }
  }, [rawProducts, orderAnalytics, revenueAnalytics])

  React.useEffect(() => {
    async function fetchAnalytics() {
      setLoadingAnalytics(true)
      try {
        const [revenue, orders, products] = await Promise.all([
          SellerAnalyticsAPI.getRevenue(),
          SellerAnalyticsAPI.getOrders(),
          SellerAnalyticsAPI.getProducts()
        ])

        console.log('Seller Analytics - Revenue:', revenue)
        console.log('Seller Analytics - Orders:', orders)
        console.log('Seller Analytics - Products:', products)

        setRevenueAnalytics(revenue)
        setOrderAnalytics(orders)
        setRawProducts(products.products)
      } catch (e: unknown) {
        const message = typeof e === "object" && e && "message" in e ? (e as { message?: string }).message : "Failed to load analytics data."
        toast.error(message || "Failed to load analytics data.")
      }
      setLoadingAnalytics(false)
    }
    fetchAnalytics()
  }, [])

  // TODO: Replace recentActivity with real API if available
  const recentActivity: SellerActivity[] = []

  const handleCreateProduct = () => {
    router.push('/products/create')
  }

  const handleViewProduct = (productId: number) => {
    router.push(`/products/${productId}`)
  }

  const handleEditProduct = (productId: number) => {
    router.push(`/products/${productId}/edit`)
  }

  return (
    <div className="space-y-6">
      <SellerOverviewStats
        data={overviewData || {
          my_products: 0,
          total_orders: 0,
          total_revenue: 0,
          monthly_revenue: 0,
          average_rating: 0,
          total_stock_value: 0,
          low_stock_products: 0,
          active_products: 0
        }}
        isLoading={loadingAnalytics}
      />

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          {loadingAnalytics ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ) : productsPerformance.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No products found.</div>
          ) : (
            <MyProductsSection
              products={productsPerformance}
              isLoading={loadingAnalytics}
              onCreateProduct={handleCreateProduct}
              onViewProduct={handleViewProduct}
              onEditProduct={handleEditProduct}
            />
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          {loadingAnalytics ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ) : !orderAnalytics || orderAnalytics.total_orders === 0 ? (
            <div className="text-center text-muted-foreground py-8">No orders found.</div>
          ) : (
            <OrderManagementSection
              data={orderAnalytics}
              isLoading={loadingAnalytics}
            />
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {loadingAnalytics ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ) : !revenueAnalytics || revenueAnalytics.total_revenue === 0 ? (
            <div className="text-center text-muted-foreground py-8">No revenue analytics found.</div>
          ) : (
            <RevenueAnalyticsSection
              data={revenueAnalytics}
              isLoading={loadingAnalytics}
            />
          )}
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          {loadingAnalytics ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-8 w-1/2" />
            </div>
          ) : recentActivity.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">No recent activity found.</div>
          ) : (
            <SellerRecentActivity
              activities={recentActivity}
              isLoading={loadingAnalytics}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
