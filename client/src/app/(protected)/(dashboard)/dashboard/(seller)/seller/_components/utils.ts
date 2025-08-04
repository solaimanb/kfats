import { ProductCategory, ProductStatus } from "@/lib/types/api"
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown, 
  Star,
  AlertTriangle,
  DollarSign,
  BarChart3
} from "lucide-react"

/**
 * Get icon for seller activity type
 */
export function getSellerActivityIcon(type: string) {
  const icons = {
    product_added: Package,
    product_updated: Package,
    order_received: ShoppingCart,
    order_shipped: TrendingUp,
    review_received: Star,
    stock_updated: BarChart3,
    product_sold: DollarSign
  }
  
  return icons[type as keyof typeof icons] || Package
}

/**
 * Get color for seller activity type
 */
export function getSellerActivityColor(type: string): string {
  const colors = {
    product_added: "text-green-600 bg-green-50",
    product_updated: "text-blue-600 bg-blue-50",
    order_received: "text-purple-600 bg-purple-50",
    order_shipped: "text-indigo-600 bg-indigo-50",
    review_received: "text-yellow-600 bg-yellow-50",
    stock_updated: "text-orange-600 bg-orange-50",
    product_sold: "text-emerald-600 bg-emerald-50"
  }
  
  return colors[type as keyof typeof colors] || "text-gray-600 bg-gray-50"
}

/**
 * Get color for product status
 */
export function getProductStatusColor(status: ProductStatus): string {
  switch (status) {
    case ProductStatus.ACTIVE:
      return "text-green-600 bg-green-50 border-green-200"
    case ProductStatus.INACTIVE:
      return "text-yellow-600 bg-yellow-50 border-yellow-200"
    case ProductStatus.OUT_OF_STOCK:
      return "text-red-600 bg-red-50 border-red-200"
    default:
      return "text-gray-600 bg-gray-50 border-gray-200"
  }
}

/**
 * Get color for product category
 */
export function getProductCategoryColor(category: ProductCategory): string {
  switch (category) {
    case ProductCategory.PAINTING:
      return "text-red-600 bg-red-50"
    case ProductCategory.SCULPTURE:
      return "text-blue-600 bg-blue-50"
    case ProductCategory.DIGITAL_ART:
      return "text-purple-600 bg-purple-50"
    case ProductCategory.PHOTOGRAPHY:
      return "text-green-600 bg-green-50"
    case ProductCategory.CRAFTS:
      return "text-orange-600 bg-orange-50"
    default:
      return "text-gray-600 bg-gray-50"
  }
}

/**
 * Format currency value
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

/**
 * Format percentage with sign
 */
export function formatPercentage(value: number, showSign: boolean = true): string {
  const formatted = `${Math.abs(value).toFixed(1)}%`
  if (!showSign) return formatted
  return value > 0 ? `+${formatted}` : value < 0 ? `-${formatted}` : formatted
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Get performance score color
 */
export function getPerformanceScoreColor(score: number): string {
  if (score >= 90) return "text-green-600"
  if (score >= 80) return "text-blue-600"
  if (score >= 70) return "text-yellow-600"
  if (score >= 60) return "text-orange-600"
  return "text-red-600"
}

/**
 * Get trend icon and color
 */
export function getTrendIndicator(value: number, isPositiveTrend: boolean = true) {
  const isPositive = isPositiveTrend ? value > 0 : value < 0
  const isNegative = isPositiveTrend ? value < 0 : value > 0
  
  return {
    icon: isPositive ? TrendingUp : isNegative ? TrendingDown : null,
    color: isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-600",
    bgColor: isPositive ? "bg-green-50" : isNegative ? "bg-red-50" : "bg-gray-50"
  }
}

/**
 * Get stock level indicator
 */
export function getStockLevelIndicator(currentStock: number, threshold: number = 10) {
  if (currentStock === 0) {
    return {
      label: "Out of Stock",
      color: "text-red-600 bg-red-50",
      icon: AlertTriangle
    }
  }
  
  if (currentStock <= threshold) {
    return {
      label: "Low Stock",
      color: "text-yellow-600 bg-yellow-50",
      icon: AlertTriangle
    }
  }
  
  return {
    label: "In Stock",
    color: "text-green-600 bg-green-50",
    icon: Package
  }
}

/**
 * Calculate time ago string
 */
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

/**
 * Get rating stars display
 */
export function getRatingStars(rating: number): string {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 >= 0.5
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
  
  return '★'.repeat(fullStars) + (hasHalfStar ? '☆' : '') + '☆'.repeat(emptyStars)
}
