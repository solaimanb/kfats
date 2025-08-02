"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useSellerProducts } from "@/lib/hooks/useProducts"
import { useRouter } from "next/navigation"
import { ProductCategory } from "@/lib/types/api"
import {
  SellerOverviewStats,
  MyProductsSection,
  OrderManagementSection,
  RevenueAnalyticsSection,
  SellerRecentActivity,
  type ProductPerformance,
  type SellerOverviewData,
  type OrderAnalytics,
  type SellerRevenueAnalytics,
  type SellerActivity
} from "./seller"

interface SellerDashboardProps {
  userId?: number
}

export function SellerDashboard({ }: SellerDashboardProps) {
  const router = useRouter()
  const { data: myProducts, isLoading: productsLoading } = useSellerProducts()

  // Transform products data to include performance metrics
  const productPerformance: ProductPerformance[] = myProducts?.map(product => ({
    ...product,
    views_count: Math.floor(Math.random() * 500) + 50, // Mock data
    orders_count: Math.floor(Math.random() * 20) + 1, // Mock data
    revenue_generated: Math.floor(Math.random() * 1000) + 100, // Mock data
    rating: 4.0 + Math.random() * 1, // Mock data
    review_count: Math.floor(Math.random() * 15) + 1, // Mock data
    conversion_rate: Math.random() * 0.1 + 0.02, // Mock data (2-12%)
    last_sold_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
  })) || []

  // Mock data for demonstration - in real app, these would come from API
  const overviewData: SellerOverviewData = {
    my_products: myProducts?.length || 0,
    total_orders: productPerformance.reduce((acc, p) => acc + p.orders_count, 0),
    total_revenue: productPerformance.reduce((acc, p) => acc + p.revenue_generated, 0),
    monthly_revenue: productPerformance.reduce((acc, p) => acc + p.revenue_generated, 0) * 0.3, // Mock: 30% of total
    average_rating: productPerformance.length > 0 
      ? productPerformance.reduce((acc, p) => acc + p.rating, 0) / productPerformance.length 
      : 0,
    total_stock_value: myProducts?.reduce((acc, product) => acc + (product.price * (product.stock_quantity || 0)), 0) || 0,
    low_stock_products: myProducts?.filter(product => (product.stock_quantity || 0) <= 10).length || 0,
    active_products: myProducts?.filter(product => product.status === 'active').length || 0
  }

  const orderAnalytics: OrderAnalytics = {
    total_orders: overviewData.total_orders,
    pending_orders: Math.floor(overviewData.total_orders * 0.2), // Mock: 20% pending
    completed_orders: Math.floor(overviewData.total_orders * 0.7), // Mock: 70% completed
    cancelled_orders: Math.floor(overviewData.total_orders * 0.1), // Mock: 10% cancelled
    average_order_value: overviewData.total_orders > 0 
      ? overviewData.total_revenue / overviewData.total_orders 
      : 0,
    order_trends: [
      { month: "Sep 2024", orders: Math.floor(overviewData.total_orders * 0.2), revenue: overviewData.total_revenue * 0.2 },
      { month: "Oct 2024", orders: Math.floor(overviewData.total_orders * 0.3), revenue: overviewData.total_revenue * 0.3 },
      { month: "Nov 2024", orders: Math.floor(overviewData.total_orders * 0.25), revenue: overviewData.total_revenue * 0.25 },
      { month: "Dec 2024", orders: Math.floor(overviewData.total_orders * 0.25), revenue: overviewData.total_revenue * 0.25 }
    ]
  }

  const revenueAnalytics: SellerRevenueAnalytics = {
    total_revenue: overviewData.total_revenue,
    monthly_revenue: overviewData.monthly_revenue,
    revenue_by_product: productPerformance.slice(0, 5).map(product => ({
      product_id: product.id,
      product_name: product.name,
      revenue: product.revenue_generated,
      orders: product.orders_count
    })),
    revenue_by_category: [
      { category: ProductCategory.PAINTING, revenue: overviewData.total_revenue * 0.4, percentage: 40 },
      { category: ProductCategory.DIGITAL_ART, revenue: overviewData.total_revenue * 0.3, percentage: 30 },
      { category: ProductCategory.PHOTOGRAPHY, revenue: overviewData.total_revenue * 0.2, percentage: 20 },
      { category: ProductCategory.CRAFTS, revenue: overviewData.total_revenue * 0.1, percentage: 10 }
    ],
    revenue_trends: [
      { month: "Sep 2024", revenue: overviewData.total_revenue * 0.2, growth_rate: 5.2 },
      { month: "Oct 2024", revenue: overviewData.total_revenue * 0.3, growth_rate: 8.1 },
      { month: "Nov 2024", revenue: overviewData.total_revenue * 0.25, growth_rate: -3.2 },
      { month: "Dec 2024", revenue: overviewData.total_revenue * 0.25, growth_rate: 12.4 }
    ]
  }

  const recentActivity: SellerActivity[] = [
    {
      id: "1",
      type: "product_sold",
      description: "Product sold successfully",
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
      product_name: myProducts?.[0]?.name || "Digital Art Piece",
      amount: 89.99,
      customer_name: "Sarah Johnson",
      order_id: "ORD-2024-001"
    },
    {
      id: "2",
      type: "order_received",
      description: "New order received",
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
      product_name: myProducts?.[1]?.name || "Abstract Painting",
      amount: 156.50,
      customer_name: "Mike Chen",
      order_id: "ORD-2024-002"
    },
    {
      id: "3",
      type: "review_received",
      description: "New 5-star review received",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      product_name: myProducts?.[0]?.name || "Sculpture Design",
      customer_name: "Emma Wilson"
    },
    {
      id: "4",
      type: "product_added",
      description: "New product added to store",
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
      product_name: "Latest Creation"
    },
    {
      id: "5",
      type: "stock_updated",
      description: "Inventory updated",
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
      product_name: myProducts?.[2]?.name || "Photography Print"
    }
  ]

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
      {/* Overview Stats */}
      <SellerOverviewStats
        data={overviewData}
        isLoading={productsLoading}
      />

      {/* Main Content Tabs */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <MyProductsSection
            products={productPerformance}
            isLoading={productsLoading}
            onCreateProduct={handleCreateProduct}
            onViewProduct={handleViewProduct}
            onEditProduct={handleEditProduct}
          />
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <OrderManagementSection
            data={orderAnalytics}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <RevenueAnalyticsSection
            data={revenueAnalytics}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <SellerRecentActivity
            activities={recentActivity}
            isLoading={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
