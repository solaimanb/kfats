import { apiClient } from "./client";
import {
  Article,
  ArticleCreate,
  ArticleUpdate,
  PaginatedResponse,
  ApiResponse,
} from "../types/api";

export class ArticlesAPI {
  /**
   * Create a new article (Writer/Admin only)
   */
  static async createArticle(articleData: ArticleCreate): Promise<Article> {
    const response = await apiClient.post<Article>("/articles/", articleData);
    return response.data;
  }

  /**
   * Get all published articles
   */
  static async getAllArticles(params?: {
    page?: number;
    size?: number;
    author_id?: number;
    tags?: string[];
    search?: string;
  }): Promise<PaginatedResponse<Article>> {
    const response = await apiClient.get<PaginatedResponse<Article>>(
      "/articles/",
      {
        params: {
          ...params,
          tags: params?.tags?.join(","),
        },
      }
    );
    return response.data;
  }

  /**
   * Get article by ID
   */
  static async getArticleById(articleId: number): Promise<Article> {
    const response = await apiClient.get<Article>(`/articles/${articleId}`);
    return response.data;
  }

  /**
   * Get article by slug
   */
  static async getArticleBySlug(slug: string): Promise<Article> {
    const response = await apiClient.get<Article>(`/articles/by-slug/${slug}`);
    return response.data;
  }

  /**
   * Get writer's articles
   */
  static async getWriterArticles(params?: {
    page?: number;
    size?: number;
  }): Promise<PaginatedResponse<Article>> {
    const response = await apiClient.get<PaginatedResponse<Article>>(
      "/articles/my-articles",
      { params }
    );
    return response.data;
  }

  /**
   * Update article (Writer/Admin only)
   */
  static async updateArticle(
    articleId: number,
    articleData: ArticleUpdate
  ): Promise<Article> {
    const response = await apiClient.put<Article>(
      `/articles/${articleId}`,
      articleData
    );
    return response.data;
  }

  /**
   * Delete article (Writer/Admin only)
   */
  static async deleteArticle(articleId: number): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(
      `/articles/${articleId}`
    );
    return response.data;
  }
}
