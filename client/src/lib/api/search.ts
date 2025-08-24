import { apiClient } from './client'

export interface SearchResult {
    type: 'article' | 'course' | 'product'
    id: number
    title: string
    snippet: string
    slug?: string
}

export class SearchAPI {
    /**
     * Global search for articles, courses, and products
     */
    static async globalSearch(query: string, type?: 'article' | 'course' | 'product' | 'all', limit = 10): Promise<SearchResult[]> {
        const params: Record<string, string | number> = { query, limit }
        if (type) params.type = type
        const response = await apiClient.get<SearchResult[]>('/search/', { params })
        return response.data
    }
}
