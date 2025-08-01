import { apiClient } from './client'
import { PaginatedResponse, ApiResponse } from '@/lib/types/api'

export type { PaginatedResponse } from '@/lib/types/api'

export interface ContentOverviewItem {
  id: number
  title: string
  type: 'article' | 'course' | 'product'
  status: string
  author_id: number
  author_name: string
  author_role: string
  created_at: string
  updated_at: string
  published_at?: string | null
  views_count: number
  is_featured: boolean
  admin_notes?: string | null
  admin_action_by?: number | null
  admin_action_at?: string | null
}

export interface ContentStats {
  total_published: number
  total_unpublished: number
  total_drafts: number
  total_archived: number
  total_featured: number
  recent_activity: Record<string, unknown>[]
  by_type: Record<string, number>
  by_author_role: Record<string, number>
}

export interface ContentActionRequest {
  action: 'publish' | 'unpublish' | 'archive'
  admin_notes?: string
  reason?: string
}

export interface AdminNotesRequest {
  notes: string
  is_private?: boolean
}

export interface ContentFilters {
  contentType?: 'articles' | 'courses' | 'products' | 'all'
  status?: string
  authorRole?: string
  search?: string
  page?: number
  size?: number
}

export class ContentManagementAPI {
  /**
   * Get all content across platform for admin oversight
   */
  static async getAllContent(filters: ContentFilters = {}): Promise<PaginatedResponse<ContentOverviewItem>> {
    const params = new URLSearchParams()
    
    if (filters.contentType && filters.contentType !== 'all') {
      params.append('content_type', filters.contentType)
    }
    if (filters.status) {
      params.append('status', filters.status)
    }
    if (filters.authorRole) {
      params.append('author_role', filters.authorRole)
    }
    if (filters.search) {
      params.append('search', filters.search)
    }
    if (filters.page) {
      params.append('page', filters.page.toString())
    }
    if (filters.size) {
      params.append('size', filters.size.toString())
    }

    const response = await apiClient.get(`/content-management/all-content?${params}`)
    return response.data
  }

  /**
   * Admin: Publish/Unpublish/Archive content
   */
  static async toggleContentStatus(data: {
    contentType: string
    contentId: number
    action: 'publish' | 'unpublish' | 'archive'
    admin_notes?: string
    reason?: string
  }): Promise<ApiResponse> {
    const response = await apiClient.put(
      `/content-management/content/${data.contentType}/${data.contentId}/toggle-status`,
      {
        action: data.action,
        admin_notes: data.admin_notes,
        reason: data.reason
      }
    )
    return response.data
  }

  /**
   * Admin: Feature/unfeature content
   */
  static async toggleFeatureContent(data: {
    contentType: string
    contentId: number
  }): Promise<ApiResponse> {
    const response = await apiClient.put(
      `/content-management/content/${data.contentType}/${data.contentId}/feature`
    )
    return response.data
  }

  /**
   * Admin: Add notes to content
   */
  static async updateAdminNotes(data: {
    contentType: string
    contentId: number
    notes: string
    is_private?: boolean
  }): Promise<ApiResponse> {
    const response = await apiClient.put(
      `/content-management/content/${data.contentType}/${data.contentId}/admin-notes`,
      {
        notes: data.notes,
        is_private: data.is_private
      }
    )
    return response.data
  }

  /**
   * Get content statistics for admin dashboard
   */
  static async getContentStats(): Promise<ContentStats> {
    const response = await apiClient.get('/content-management/content-stats')
    return response.data
  }

  /**
   * Bulk actions for multiple content items
   */
  static async bulkToggleStatus(data: {
    items: Array<{ contentType: string; contentId: number }>
    action: 'publish' | 'unpublish' | 'archive'
    admin_notes?: string
  }): Promise<ApiResponse[]> {
    const promises = data.items.map(item =>
      this.toggleContentStatus({
        contentType: item.contentType,
        contentId: item.contentId,
        action: data.action,
        admin_notes: data.admin_notes
      })
    )
    
    return Promise.all(promises)
  }
}
