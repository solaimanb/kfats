import { Article, ArticleStatus } from "@/lib/types/api"
import {
    WriterOverviewData,
    ContentAnalytics
} from "./types"

/**
 * Calculate writer overview statistics from articles data
 */
export function calculateWriterOverview(articles: Article[]): WriterOverviewData {
    const totalArticles = articles.length
    const publishedArticles = articles.filter(a => a.status === ArticleStatus.PUBLISHED).length
    const draftArticles = articles.filter(a => a.status === ArticleStatus.DRAFT).length
    const archivedArticles = articles.filter(a => a.status === ArticleStatus.ARCHIVED).length
    const totalViews = articles.reduce((sum, a) => sum + a.views_count, 0)
    const averageViews = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentArticles = articles.filter(a =>
        new Date(a.created_at) > thirtyDaysAgo
    ).length

    return {
        totalArticles,
        publishedArticles,
        draftArticles,
        archivedArticles,
        totalViews,
        averageViews,
        engagementRate: publishedArticles > 0 ? Math.round((totalViews / publishedArticles) * 0.1) : 0,
        recentArticles
    }
}

/**
 * Generate mock content analytics (would be replaced with real API calls)
 */
export function generateContentAnalytics(articles: Article[]): ContentAnalytics {
    const publishedArticles = articles.filter(a => a.status === ArticleStatus.PUBLISHED)

    return {
        popularArticles: publishedArticles
            .sort((a, b) => b.views_count - a.views_count)
            .slice(0, 5)
            .map(article => ({
                id: article.id,
                title: article.title,
                views: article.views_count,
                engagement_rate: Math.round(Math.random() * 15 + 5),
                published_date: article.published_at || article.created_at
            })),
        viewsTrend: generateViewsTrend(),
        topicPerformance: generateTopicPerformance(articles),
        readingTrends: generateReadingTrends()
    }
}

/**
 * Format number with appropriate suffixes (K, M, etc.)
 */
export function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K'
    }
    return num.toString()
}

/**
 * Format percentage with appropriate styling
 */
export function formatPercentage(num: number): string {
    return `${num > 0 ? '+' : ''}${num}%`
}

/**
 * Calculate reading time estimate
 */
export function calculateReadingTime(content: string): number {
    const wordsPerMinute = 200
    const words = content.trim().split(/\s+/).length
    return Math.ceil(words / wordsPerMinute)
}

/**
 * Get article status badge color
 */
export function getArticleStatusColor(status: ArticleStatus): string {
    switch (status) {
        case ArticleStatus.PUBLISHED:
            return 'bg-green-100 text-green-800 border-green-200'
        case ArticleStatus.DRAFT:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200'
        case ArticleStatus.ARCHIVED:
            return 'bg-gray-100 text-gray-800 border-gray-200'
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200'
    }
}

/**
 * Get performance trend indicator
 */
export function getTrendIndicator(trend: 'up' | 'down' | 'stable'): {
    icon: string
    color: string
    text: string
} {
    switch (trend) {
        case 'up':
            return { icon: '↗️', color: 'text-green-600', text: 'Increasing' }
        case 'down':
            return { icon: '↘️', color: 'text-red-600', text: 'Decreasing' }
        case 'stable':
            return { icon: '→', color: 'text-blue-600', text: 'Stable' }
    }
}

/**
 * Generate mock views trend data
 */
function generateViewsTrend() {
    const trend = []
    for (let i = 29; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        trend.push({
            date: date.toISOString().split('T')[0],
            views: Math.floor(Math.random() * 100 + 20),
            articles_published: Math.random() > 0.8 ? 1 : 0
        })
    }
    return trend
}

/**
 * Generate mock topic performance data
 */
function generateTopicPerformance(articles: Article[]) {
    const topics = ['Technology', 'Education', 'Business', 'Tutorials', 'Opinion']
    return topics.map(topic => ({
        topic,
        articles_count: Math.floor(Math.random() * 5 + 1),
        total_views: Math.floor(Math.random() * 500 + 100),
        average_engagement: Math.floor(Math.random() * 15 + 5)
    }))
}

/**
 * Generate mock reading trends data
 */
function generateReadingTrends() {
    return [
        { time_period: 'Morning (6-12)', average_read_time: 3.2, completion_rate: 78 },
        { time_period: 'Afternoon (12-18)', average_read_time: 2.8, completion_rate: 65 },
        { time_period: 'Evening (18-24)', average_read_time: 4.1, completion_rate: 82 },
        { time_period: 'Night (0-6)', average_read_time: 2.1, completion_rate: 45 }
    ]
}
