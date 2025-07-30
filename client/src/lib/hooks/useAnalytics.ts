import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { AnalyticsAPI, OverviewAnalytics, UserAnalytics, CourseAnalytics, ArticleAnalytics, ProductAnalytics, ActivityData } from '../api/analytics'

export function useOverviewAnalytics(): UseQueryResult<OverviewAnalytics> {
  return useQuery({
    queryKey: ['analytics', 'overview'],
    queryFn: () => AnalyticsAPI.getOverviewAnalytics(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useUserAnalytics(): UseQueryResult<UserAnalytics> {
  return useQuery({
    queryKey: ['analytics', 'users'],
    queryFn: () => AnalyticsAPI.getUserAnalytics(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useCourseAnalytics(): UseQueryResult<CourseAnalytics> {
  return useQuery({
    queryKey: ['analytics', 'courses'],
    queryFn: () => AnalyticsAPI.getCourseAnalytics(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useArticleAnalytics(): UseQueryResult<ArticleAnalytics> {
  return useQuery({
    queryKey: ['analytics', 'articles'],
    queryFn: () => AnalyticsAPI.getArticleAnalytics(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useProductAnalytics(): UseQueryResult<ProductAnalytics> {
  return useQuery({
    queryKey: ['analytics', 'products'],
    queryFn: () => AnalyticsAPI.getProductAnalytics(),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useActivityData(): UseQueryResult<ActivityData> {
  return useQuery({
    queryKey: ['analytics', 'activity'],
    queryFn: () => AnalyticsAPI.getRecentActivity(50),
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

export const useAnalyticsDashboard = () => {
  const overview = useOverviewAnalytics()
  const users = useUserAnalytics()
  const courses = useCourseAnalytics()
  const articles = useArticleAnalytics()
  const products = useProductAnalytics()
  const activity = useActivityData()

  return {
    overview,
    users,
    courses,
    articles,
    products,
    activity,
    isLoading: overview.isLoading || users.isLoading || courses.isLoading || articles.isLoading || products.isLoading || activity.isLoading,
    isError: overview.isError || users.isError || courses.isError || articles.isError || products.isError || activity.isError,
  }
}
