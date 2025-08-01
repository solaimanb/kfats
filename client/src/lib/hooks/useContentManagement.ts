import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ContentManagementAPI, ContentFilters, ContentOverviewItem } from '@/lib/api/content-management'
import { toast } from 'sonner'

export function useContentManagement() {
  const queryClient = useQueryClient()

  const toggleContentStatus = useMutation({
    mutationFn: ContentManagementAPI.toggleContentStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-management'] })
      queryClient.invalidateQueries({ queryKey: ['content-stats'] })
      
      const actionText = variables.action === 'publish' ? 'published' : 
                        variables.action === 'unpublish' ? 'unpublished' : 'archived'
      toast.success(`Content ${actionText} successfully`)
    },
    onError: (error: Error) => {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || `Failed to update content status`
      toast.error(message)
    }
  })

  const toggleFeature = useMutation({
    mutationFn: ContentManagementAPI.toggleFeatureContent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['content-management'] })
      queryClient.invalidateQueries({ queryKey: ['content-stats'] })
      
      const isNowFeatured = (data.data as Record<string, unknown>)?.is_featured ?? false
      const action = isNowFeatured ? 'featured' : 'unfeatured'
      toast.success(`Content ${action} successfully`)
    },
    onError: (error: Error) => {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to toggle feature status'
      toast.error(message)
    }
  })

  const updateAdminNotes = useMutation({
    mutationFn: ContentManagementAPI.updateAdminNotes,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-management'] })
      toast.success('Admin notes updated successfully')
    },
    onError: (error: Error) => {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to update admin notes'
      toast.error(message)
    }
  })

  const bulkToggleStatus = useMutation({
    mutationFn: ContentManagementAPI.bulkToggleStatus,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['content-management'] })
      queryClient.invalidateQueries({ queryKey: ['content-stats'] })
      
      const actionText = variables.action === 'publish' ? 'published' : 
                        variables.action === 'unpublish' ? 'unpublished' : 'archived'
      toast.success(`${variables.items.length} items ${actionText} successfully`)
    },
    onError: (error: Error) => {
      const message = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to perform bulk action'
      toast.error(message)
    }
  })

  return { 
    toggleContentStatus, 
    toggleFeature, 
    updateAdminNotes,
    bulkToggleStatus
  }
}

export function useAllContent(filters: ContentFilters = {}) {
  return useQuery({
    queryKey: ['content-management', 'all-content', filters],
    queryFn: () => ContentManagementAPI.getAllContent(filters),
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  })
}

export function useContentStats() {
  return useQuery({
    queryKey: ['content-stats'],
    queryFn: ContentManagementAPI.getContentStats,
    staleTime: 60000, // 1 minute
    refetchInterval: 300000, // 5 minutes
  })
}

// Hook for real-time content filtering
export function useContentFiltering(
  initialFilters: ContentFilters = {},
  onFiltersChange?: (filters: ContentFilters) => void
) {
  const [filters, setFilters] = useState<ContentFilters>(initialFilters)
  
  const updateFilters = (newFilters: Partial<ContentFilters>) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }
    setFilters(updatedFilters)
    onFiltersChange?.(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters = { 
      contentType: 'all' as const, 
      page: 1, 
      size: 20 
    }
    setFilters(clearedFilters)
    onFiltersChange?.(clearedFilters)
  }

  const { data: content, isLoading, error } = useAllContent(filters)

  return {
    filters,
    updateFilters,
    clearFilters,
    content,
    isLoading,
    error
  }
}

// Hook for content selection (for bulk actions)
export function useContentSelection() {
  const [selectedItems, setSelectedItems] = useState<ContentOverviewItem[]>([])

  const selectItem = (item: ContentOverviewItem) => {
    setSelectedItems((prev: ContentOverviewItem[]) => {
      const exists = prev.find((selected: ContentOverviewItem) => selected.id === item.id && selected.type === item.type)
      if (exists) {
        return prev.filter((selected: ContentOverviewItem) => !(selected.id === item.id && selected.type === item.type))
      } else {
        return [...prev, item]
      }
    })
  }

  const selectAll = (items: ContentOverviewItem[]) => {
    setSelectedItems(items)
  }

  const clearSelection = () => {
    setSelectedItems([])
  }

  const isSelected = (item: ContentOverviewItem) => {
    return selectedItems.some((selected: ContentOverviewItem) => selected.id === item.id && selected.type === item.type)
  }

  return {
    selectedItems,
    selectItem,
    selectAll,
    clearSelection,
    isSelected,
    hasSelection: selectedItems.length > 0,
    selectionCount: selectedItems.length
  }
}
