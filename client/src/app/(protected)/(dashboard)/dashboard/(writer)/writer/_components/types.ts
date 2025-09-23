import { Article } from "@/lib/types/api"

export interface WriterOverviewData {
    totalArticles: number
    publishedArticles: number
    draftArticles: number
    archivedArticles: number
    engagementRate: number
    recentArticles: number
}

export interface ArticlePerformance extends Article {
    engagement_score: number
    comments_count: number
    shares_count: number
    read_time_minutes: number
    bounce_rate: number
    performance_trend: 'increasing' | 'decreasing' | 'stable'
}

export interface ContentAnalytics {
    popularArticles: Array<{
        id: number
        title: string
        engagement_rate: number
        published_date: string
    }>
    engagementTrend: Array<{
        date: string
        articles_published: number
        engagement_rate: number
    }>
    topicPerformance: Array<{
        topic: string
        articles_count: number
        average_engagement: number
    }>
    readingTrends: Array<{
        time_period: string
        average_read_time: number
        completion_rate: number
    }>
}
