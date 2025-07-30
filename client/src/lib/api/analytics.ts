import { apiClient } from './client'

// Analytics API Types
export interface OverviewAnalytics {
  totals: {
    users: number
    courses: number
    articles: number
    products: number
    enrollments: number
  }
  growth: {
    new_users_this_month: number
    new_courses_this_month: number
    new_articles_this_month: number
  }
  user_distribution: Record<string, number>
}

export interface UserAnalytics {
  status_distribution: Record<string, number>
  growth_trend: Array<{
    month: string
    count: number
  }>
  active_users: number
  total_users: number
}

export interface CourseAnalytics {
  overview: {
    total_courses: number
    published_courses: number
    total_enrollments: number
  }
  enrollment_trends: Array<{
    month: string
    enrollments: number
  }>
  popular_courses: Array<{
    course_id: number
    title: string
    enrolled_count: number
    actual_enrollments: number
  }>
  mentor_performance: Array<{
    mentor_id: number
    mentor_name: string
    total_courses: number
    total_students: number
  }>
}

export interface ArticleAnalytics {
  overview: {
    total_articles: number
    published_articles: number
    total_views: number
  }
  popular_articles: Array<{
    article_id: number
    title: string
    views: number
    author: string
  }>
  writer_performance: Array<{
    writer_id: number
    writer_name: string
    total_articles: number
    total_views: number
  }>
}

export interface ProductAnalytics {
  overview: {
    total_products: number
    active_products: number
    total_inventory_value: number
  }
  category_distribution: Record<string, number>
  low_stock_alerts: Array<{
    product_id: number
    name: string
    stock: number
    seller: string
  }>
}

export interface ActivityData {
  activities: Array<{
    type: string
    description: string
    timestamp: string
    user_id?: number
    course_id?: number
    article_id?: number
  }>
}

export class AnalyticsAPI {
  /**
   * Get system overview analytics
   */
  static async getOverviewAnalytics(): Promise<OverviewAnalytics> {
    const response = await apiClient.get<OverviewAnalytics>('/analytics/overview')
    return response.data
  }

  /**
   * Get user analytics (Admin only)
   */
  static async getUserAnalytics(): Promise<UserAnalytics> {
    const response = await apiClient.get<UserAnalytics>('/analytics/users')
    return response.data
  }

  /**
   * Get course performance analytics
   */
  static async getCourseAnalytics(): Promise<CourseAnalytics> {
    const response = await apiClient.get<CourseAnalytics>('/analytics/courses')
    return response.data
  }

  /**
   * Get article and content analytics
   */
  static async getArticleAnalytics(): Promise<ArticleAnalytics> {
    const response = await apiClient.get<ArticleAnalytics>('/analytics/articles')
    return response.data
  }

  /**
   * Get product and marketplace analytics
   */
  static async getProductAnalytics(): Promise<ProductAnalytics> {
    const response = await apiClient.get<ProductAnalytics>('/analytics/products')
    return response.data
  }

  /**
   * Get recent system activity
   */
  static async getRecentActivity(limit = 50): Promise<ActivityData> {
    const response = await apiClient.get<ActivityData>(`/analytics/activity?limit=${limit}`)
    return response.data
  }
}
