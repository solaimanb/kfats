import { apiClient } from './client'
import { Article, ArticleCreate, PaginatedResponse, ApiResponse } from '../types/api'

export class ArticlesAPI {
  /**
   * Create a new article (Writer/Admin only)
   */
  static async createArticle(articleData: ArticleCreate): Promise<Article> {
    const response = await apiClient.post<Article>('/articles/', articleData)
    return response.data
  }

  /**
   * Get all published articles
   */
  static async getAllArticles(params?: {
    page?: number
    size?: number
    author_id?: number
    tags?: string[]
    search?: string
  }): Promise<PaginatedResponse<Article>> {
    const response = await apiClient.get<PaginatedResponse<Article>>('/articles/', {
      params: {
        ...params,
        tags: params?.tags?.join(',')
      }
    })
    return response.data
  }

  /**
   * Get article by ID
   */
  static async getArticleById(articleId: number): Promise<Article> {
    const response = await apiClient.get<Article>(`/articles/${articleId}`)
    return response.data
  }

  /**
   * Get writer's articles
   */
  static async getWriterArticles(): Promise<Article[]> {
    const response = await apiClient.get<Article[]>('/articles/my-articles')
    return response.data
  }

  /**
   * Update article (Writer/Admin only)
   */
  static async updateArticle(articleId: number, articleData: Partial<ArticleCreate>): Promise<Article> {
    const response = await apiClient.put<Article>(`/articles/${articleId}`, articleData)
    return response.data
  }

  /**
   * Delete article (Writer/Admin only)
   */
  static async deleteArticle(articleId: number): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/articles/${articleId}`)
    return response.data
  }

  /**
   * Publish article (Writer/Admin only)
   */
  static async publishArticle(articleId: number): Promise<Article> {
    const response = await apiClient.post<Article>(`/articles/${articleId}/publish`)
    return response.data
  }

  /**
   * Increment article views
   */
  static async incrementViews(articleId: number): Promise<ApiResponse> {
    const response = await apiClient.post<ApiResponse>(`/articles/${articleId}/view`)
    return response.data
  }
}
