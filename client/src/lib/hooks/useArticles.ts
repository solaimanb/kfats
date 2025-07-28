import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArticlesAPI } from '../api/articles'
import { ArticleCreate } from '../types/api'

// Query keys
export const articlesKeys = {
  all: ['articles'] as const,
  lists: () => [...articlesKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...articlesKeys.lists(), { filters }] as const,
  details: () => [...articlesKeys.all, 'detail'] as const,
  detail: (id: number) => [...articlesKeys.details(), id] as const,
  myArticles: () => [...articlesKeys.all, 'my-articles'] as const,
}

/**
 * Hook to get all articles
 */
export function useArticles(params?: {
  page?: number
  size?: number
  author_id?: number
  tags?: string[]
  search?: string
}) {
  return useQuery({
    queryKey: articlesKeys.list(params || {}),
    queryFn: () => ArticlesAPI.getAllArticles(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get article by ID
 */
export function useArticle(articleId: number) {
  return useQuery({
    queryKey: articlesKeys.detail(articleId),
    queryFn: () => ArticlesAPI.getArticleById(articleId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Hook to get writer's articles
 */
export function useWriterArticles() {
  return useQuery({
    queryKey: articlesKeys.myArticles(),
    queryFn: ArticlesAPI.getWriterArticles,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Hook for creating an article
 */
export function useCreateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleData: ArticleCreate) => ArticlesAPI.createArticle(articleData),
    onSuccess: () => {
      // Invalidate articles lists and writer articles
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: articlesKeys.myArticles() })
    },
  })
}

/**
 * Hook for updating an article
 */
export function useUpdateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ articleId, articleData }: { articleId: number; articleData: Partial<ArticleCreate> }) =>
      ArticlesAPI.updateArticle(articleId, articleData),
    onSuccess: (updatedArticle) => {
      // Update specific article cache
      queryClient.setQueryData(articlesKeys.detail(updatedArticle.id), updatedArticle)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: articlesKeys.myArticles() })
    },
  })
}

/**
 * Hook for deleting an article
 */
export function useDeleteArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: number) => ArticlesAPI.deleteArticle(articleId),
    onSuccess: (_, articleId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: articlesKeys.detail(articleId) })
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: articlesKeys.myArticles() })
    },
  })
}

/**
 * Hook for publishing an article
 */
export function usePublishArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: number) => ArticlesAPI.publishArticle(articleId),
    onSuccess: (updatedArticle) => {
      // Update specific article cache
      queryClient.setQueryData(articlesKeys.detail(updatedArticle.id), updatedArticle)
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() })
      queryClient.invalidateQueries({ queryKey: articlesKeys.myArticles() })
    },
  })
}

/**
 * Hook for incrementing article views
 */
export function useIncrementArticleViews() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (articleId: number) => ArticlesAPI.incrementViews(articleId),
    onSuccess: (_, articleId) => {
      // Invalidate article detail to refetch updated view count
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(articleId) })
    },
  })
}
