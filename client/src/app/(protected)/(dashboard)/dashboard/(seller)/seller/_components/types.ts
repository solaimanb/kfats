import { Product, ProductCategory } from "@/lib/types/api"

// Seller Overview Data
export interface SellerOverviewData {
    my_products: number
    total_orders: number
    total_revenue: number
    monthly_revenue: number
    average_rating: number
    total_stock_value: number
    low_stock_products: number
    active_products: number
}

// Product Performance Analytics
export interface ProductPerformance extends Product {
    views_count: number
    orders_count: number
    revenue_generated: number
    rating: number
    review_count: number
    conversion_rate: number
    last_sold_at?: string
}

// Order Analytics
export interface OrderAnalytics {
    total_orders: number
    pending_orders: number
    completed_orders: number
    cancelled_orders: number
    average_order_value: number
    order_trends: {
        month: string
        orders: number
        revenue: number
    }[]
}

// Revenue Analytics
export interface SellerRevenueAnalytics {
    total_revenue: number
    monthly_revenue: number
    revenue_by_product: {
        product_id: number
        product_name: string
        revenue: number
        orders: number
    }[]
    revenue_by_category: {
        category: ProductCategory
        revenue: number
        percentage: number
    }[]
    revenue_trends: {
        month: string
        revenue: number
        growth_rate: number
    }[]
}

// Inventory Management
export interface InventoryData {
    total_products: number
    active_products: number
    inactive_products: number
    out_of_stock: number
    low_stock_threshold: number
    low_stock_products: ProductPerformance[]
    total_stock_value: number
    categories_breakdown: {
        category: ProductCategory
        count: number
        value: number
    }[]
}

// Customer Analytics
export interface CustomerAnalytics {
    total_customers: number
    repeat_customers: number
    customer_satisfaction: number
    recent_reviews: {
        id: string
        customer_name: string
        product_name: string
        rating: number
        comment: string
        created_at: string
    }[]
    top_customers: {
        customer_id: number
        customer_name: string
        total_orders: number
        total_spent: number
    }[]
}

// Seller Activity
export interface SellerActivity {
    id: string
    type: 'product_added' | 'product_updated' | 'order_received' | 'order_shipped' | 'review_received' | 'stock_updated' | 'product_sold'
    description: string
    timestamp: string
    product_id?: number
    product_name?: string
    order_id?: string
    amount?: number
    customer_name?: string
}

// Seller Performance Metrics
export interface SellerPerformanceMetrics {
    performance_score: number
    delivery_rating: number
    customer_service_rating: number
    product_quality_rating: number
    response_time_hours: number
    fulfillment_rate: number
    return_rate: number
}
