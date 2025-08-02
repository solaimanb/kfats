export interface AdminDashboardProps {
  userId?: number
}

export interface ActivityItem {
  type: string
  description: string
  timestamp: string
}

export interface OverviewData {
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
  total_users: number
  active_users: number
  status_distribution: Record<string, number>
}

export interface CourseAnalytics {
  overview: {
    total_courses: number
    published_courses: number
    total_enrollments: number
  }
  popular_courses: Array<{
    course_id: number
    title: string
    enrolled_count: number
    actual_enrollments: number
  }>
}

export interface ArticleAnalytics {
  overview: {
    total_articles: number
    published_articles: number
  }
}

export interface ProductAnalytics {
  overview: {
    total_products: number
    active_products: number
  }
}

export interface ActivityData {
  activities: ActivityItem[]
}
