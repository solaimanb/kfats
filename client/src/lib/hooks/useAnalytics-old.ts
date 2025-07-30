// import { useQuery, UseQueryResult } from '@tanstack/react-query'
// import { 
//   AnalyticsAPI, 
//   OverviewAnalytics, 
//   UserAnalytics, 
//   CourseAnalytics, 
//   ArticleAnalytics, 
//   ProductAnalytics, 
//   ActivityData 
// } from '../api/analytics'

// // Query Keys
// export const analyticsKeys = {
//   all: ['analytics'] as const,
//   overview: () => [...analyticsKeys.all, 'overview'] as const,
//   users: () => [...analyticsKeys.all, 'users'] as const,
//   courses: () => [...analyticsKeys.all, 'courses'] as const,
//   articles: () => [...analyticsKeys.all, 'articles'] as const,
//   products: () => [...analyticsKeys.all, 'products'] as const,
//   activity: (limit?: number) => [...analyticsKeys.all, 'activity', limit] as const,
// }

// /**
//  * Hook for getting overview analytics
//  */
// import { useQuery } from '@tanstack/react-query'
// import { analyticsAPI } from '../api/analytics'

// // Analytics Query Hooks
// import { useQuery, UseQueryResult } from '@tanstack/react-query'
// import { AnalyticsAPI, OverviewAnalytics, UserAnalytics, CourseAnalytics, ArticleAnalytics, ProductAnalytics, ActivityData } from '../api/analytics'

// // Initialize the analytics API instance
// const analyticsAPI = new AnalyticsAPI()

// // Analytics Query Hooks
// export function useOverviewAnalytics(): UseQueryResult<OverviewAnalytics> {
//   return useQuery({
//     queryKey: ['analytics', 'overview'],
//     queryFn: () => analyticsAPI.getOverviewAnalytics(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//   })
// }

// export function useUserAnalytics(): UseQueryResult<UserAnalytics> {
//   return useQuery({
//     queryKey: ['analytics', 'users'],
//     queryFn: () => analyticsAPI.getUserAnalytics(),
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   })
// }

// export function useCourseAnalytics(): UseQueryResult<CourseAnalytics> {
//   return useQuery({
//     queryKey: ['analytics', 'courses'],
//     queryFn: () => analyticsAPI.getCourseAnalytics(),
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   })
// }

// export function useArticleAnalytics(): UseQueryResult<ArticleAnalytics> {
//   return useQuery({
//     queryKey: ['analytics', 'articles'],
//     queryFn: () => analyticsAPI.getArticleAnalytics(),
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   })
// }

// export function useProductAnalytics(): UseQueryResult<ProductAnalytics> {
//   return useQuery({
//     queryKey: ['analytics', 'products'],
//     queryFn: () => analyticsAPI.getProductAnalytics(),
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   })
// }

// export function useActivityData(): UseQueryResult<ActivityData> {
//   return useQuery({
//     queryKey: ['analytics', 'activity'],
//     queryFn: () => analyticsAPI.getActivityData(),
//     staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for activity feed)
//     gcTime: 5 * 60 * 1000,
//   })
// }

// // Combined analytics hook for dashboard overview
// export const useAnalyticsDashboard = () => {
//   const overview = useOverviewAnalytics()
//   const users = useUserAnalytics()
//   const courses = useCourseAnalytics()
//   const articles = useArticleAnalytics()
//   const products = useProductAnalytics()
//   const activity = useActivityData()

//   return {
//     overview,
//     users,
//     courses,
//     articles,
//     products,
//     activity,
//     isLoading: overview.isLoading || users.isLoading || courses.isLoading || articles.isLoading || products.isLoading || activity.isLoading,
//     isError: overview.isError || users.isError || courses.isError || articles.isError || products.isError || activity.isError,
//   }
// }

// export const useUserAnalytics = () => {
//   return useQuery({
//     queryKey: ['analytics', 'users'],
//     queryFn: () => analyticsAPI.getUserAnalytics(),
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   })
// }

// export const useCourseAnalytics = () => {
//   return useQuery({
//     queryKey: ['analytics', 'courses'],
//     queryFn: () => analyticsAPI.getCourseAnalytics(),
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   })
// }

// export const useArticleAnalytics = () => {
//   return useQuery({
//     queryKey: ['analytics', 'articles'],
//     queryFn: () => analyticsAPI.getArticleAnalytics(),
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   })
// }

// export const useProductAnalytics = () => {
//   return useQuery({
//     queryKey: ['analytics', 'products'],
//     queryFn: () => analyticsAPI.getProductAnalytics(),
//     staleTime: 5 * 60 * 1000,
//     gcTime: 10 * 60 * 1000,
//   })
// }

// export const useActivityData = () => {
//   return useQuery({
//     queryKey: ['analytics', 'activity'],
//     queryFn: () => analyticsAPI.getActivityData(),
//     staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for activity feed)
//     gcTime: 5 * 60 * 1000,
//   })
// }

// // Combined analytics hook for dashboard overview
// export const useAnalyticsDashboard = () => {
//   const overview = useOverviewAnalytics()
//   const users = useUserAnalytics()
//   const courses = useCourseAnalytics()
//   const articles = useArticleAnalytics()
//   const products = useProductAnalytics()
//   const activity = useActivityData()

//   return {
//     overview,
//     users,
//     courses,
//     articles,
//     products,
//     activity,
//     isLoading: overview.isLoading || users.isLoading || courses.isLoading || articles.isLoading || products.isLoading || activity.isLoading,
//     isError: overview.isError || users.isError || courses.isError || articles.isError || products.isError || activity.isError,
//   }
// }

// /**
//  * Hook for getting user analytics (Admin only)
//  */
// export function useUserAnalytics(): UseQueryResult<UserAnalytics> {
//   return useQuery({
//     queryKey: analyticsKeys.users(),
//     queryFn: () => AnalyticsAPI.getUserAnalytics(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//   })
// }

// /**
//  * Hook for getting course analytics
//  */
// export function useCourseAnalytics(): UseQueryResult<CourseAnalytics> {
//   return useQuery({
//     queryKey: analyticsKeys.courses(),
//     queryFn: () => AnalyticsAPI.getCourseAnalytics(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//   })
// }

// /**
//  * Hook for getting article analytics
//  */
// export function useArticleAnalytics(): UseQueryResult<ArticleAnalytics> {
//   return useQuery({
//     queryKey: analyticsKeys.articles(),
//     queryFn: () => AnalyticsAPI.getArticleAnalytics(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//   })
// }

// /**
//  * Hook for getting product analytics
//  */
// export function useProductAnalytics(): UseQueryResult<ProductAnalytics> {
//   return useQuery({
//     queryKey: analyticsKeys.products(),
//     queryFn: () => AnalyticsAPI.getProductAnalytics(),
//     staleTime: 5 * 60 * 1000, // 5 minutes
//     gcTime: 10 * 60 * 1000, // 10 minutes
//   })
// }

// /**
//  * Hook for getting recent activity
//  */
// export function useRecentActivity(limit = 50): UseQueryResult<ActivityData> {
//   return useQuery({
//     queryKey: analyticsKeys.activity(limit),
//     queryFn: () => AnalyticsAPI.getRecentActivity(limit),
//     staleTime: 2 * 60 * 1000, // 2 minutes (more frequent for activity)
//     gcTime: 5 * 60 * 1000, // 5 minutes
//   })
// }
