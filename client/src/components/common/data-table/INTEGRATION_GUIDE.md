# Data Table Integration Guide

This guide shows how to integrate the reusable data table with KFATS API endpoints and React Query for real-world usage.

## Table of Contents

1. [Basic API Integration](#basic-api-integration)
2. [With React Query](#with-react-query)
3. [Server-Side Pagination](#server-side-pagination)
4. [Advanced Filtering](#advanced-filtering)
5. [Real-Time Updates](#real-time-updates)
6. [Export Functionality](#export-functionality)

## Basic API Integration

### Users Management Page

```tsx
"use client"

import { useState, useEffect } from "react"
import { UsersAPI } from "@/lib/api/users"
import { UsersDataTable } from "@/components/common/data-table/examples/users-data-table"
import { User } from "@/lib/types/api"
import { Loading } from "@/components/ui/loading"
import { toast } from "sonner"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await UsersAPI.getAllUsers()
      setUsers(response.items)
    } catch (error) {
      toast.error("Failed to load users")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    // Navigate to edit page or open modal
    console.log("Edit user:", user)
  }

  const handleDeleteUser = async (user: User) => {
    if (confirm(`Delete user ${user.full_name}?`)) {
      try {
        await UsersAPI.deleteUser(user.id)
        toast.success("User deleted successfully")
        loadUsers() // Refresh data
      } catch (error) {
        toast.error("Failed to delete user")
      }
    }
  }

  const handleBulkAction = async (action: string, selectedUsers: User[]) => {
    console.log(`${action} for ${selectedUsers.length} users`)
    // Implement bulk actions
  }

  if (loading) {
    return <Loading />
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>
      
      <UsersDataTable
        users={users}
        onEditUser={handleEditUser}
        onDeleteUser={handleDeleteUser}
        onBulkAction={handleBulkAction}
      />
    </div>
  )
}
```

## With React Query

### Optimized with Caching and Background Updates

```tsx
"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { UsersAPI } from "@/lib/api/users"
import { UsersDataTable } from "@/components/common/data-table/examples/users-data-table"
import { User } from "@/lib/types/api"
import { Loading } from "@/components/ui/loading"
import { toast } from "sonner"

export default function UsersPageWithQuery() {
  const queryClient = useQueryClient()

  // Fetch users with React Query
  const {
    data: users = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const response = await UsersAPI.getAllUsers()
      return response.items
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => UsersAPI.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("User deleted successfully")
    },
    onError: () => {
      toast.error("Failed to delete user")
    },
  })

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({
      action,
      userIds,
    }: {
      action: string
      userIds: number[]
    }) => {
      // Implement bulk operations
      switch (action) {
        case "delete":
          await Promise.all(userIds.map(id => UsersAPI.deleteUser(id)))
          break
        case "activate":
          // Implement bulk activate
          break
        case "deactivate":
          // Implement bulk deactivate
          break
        default:
          throw new Error("Unknown action")
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast.success("Bulk action completed")
    },
    onError: () => {
      toast.error("Bulk action failed")
    },
  })

  const handleDeleteUser = (user: User) => {
    if (confirm(`Delete user ${user.full_name}?`)) {
      deleteUserMutation.mutate(user.id)
    }
  }

  const handleBulkAction = (action: string, selectedUsers: User[]) => {
    const userIds = selectedUsers.map(user => user.id)
    bulkActionMutation.mutate({ action, userIds })
  }

  if (isLoading) return <Loading />
  if (error) return <div>Error loading users</div>

  return (
    <div className="container mx-auto py-6">
      <UsersDataTable
        users={users}
        onDeleteUser={handleDeleteUser}
        onBulkAction={handleBulkAction}
      />
    </div>
  )
}
```

## Server-Side Pagination

### For Large Datasets

```tsx
"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { DataTableOptimized } from "@/components/common/data-table"
import { UsersAPI } from "@/lib/api/users"
import { PaginatedResponse, User } from "@/lib/types/api"

export default function UsersPageWithServerPagination() {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<Record<string, unknown>>({})

  const {
    data,
    isLoading,
    isFetching,
  } = useQuery({
    queryKey: ["users", page, pageSize, search, filters],
    queryFn: async () => {
      return await UsersAPI.getAllUsers({
        page,
        size: pageSize,
        search,
        ...filters,
      })
    },
    keepPreviousData: true, // Keep previous data while fetching new
  })

  // Custom pagination component
  const ServerPagination = () => (
    <div className="flex items-center justify-between px-2">
      <div className="text-sm text-muted-foreground">
        Showing {((page - 1) * pageSize) + 1} to{" "}
        {Math.min(page * pageSize, data?.total || 0)} of{" "}
        {data?.total || 0} entries
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1 || isFetching}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {page} of {data?.pages || 1}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= (data?.pages || 1) || isFetching}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      <DataTableOptimized
        columns={userColumns}
        data={data?.items || []}
        searchKey="email"
        showPagination={false} // Disable built-in pagination
        // ... other props
      />
      
      {/* Custom server pagination */}
      <ServerPagination />
      
      {isFetching && (
        <div className="text-center text-sm text-muted-foreground">
          Loading...
        </div>
      )}
    </div>
  )
}
```

## Advanced Filtering

### Multi-Column Filters

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface FilterState {
  search: string
  role: string
  status: string
  dateRange: { start: string; end: string }
}

export function AdvancedFilters({
  onFiltersChange,
}: {
  onFiltersChange: (filters: FilterState) => void
}) {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    role: "",
    status: "",
    dateRange: { start: "", end: "" },
  })

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearFilter = (key: keyof FilterState) => {
    const newFilters = { ...filters }
    if (key === "dateRange") {
      newFilters[key] = { start: "", end: "" }
    } else {
      newFilters[key] = ""
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const clearAllFilters = () => {
    const newFilters: FilterState = {
      search: "",
      role: "",
      status: "",
      dateRange: { start: "", end: "" },
    }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const activeFiltersCount = Object.values(filters).filter(
    value => value && (typeof value === "string" ? value : value.start || value.end)
  ).length

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Search users..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="max-w-sm"
        />
        
        <Select
          value={filters.role}
          onValueChange={(value) => updateFilter("role", value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="mentor">Mentor</SelectItem>
            <SelectItem value="student">Student</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={filters.status}
          onValueChange={(value) => updateFilter("status", value)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
        
        {activeFiltersCount > 0 && (
          <Button variant="outline" onClick={clearAllFilters}>
            Clear All ({activeFiltersCount})
          </Button>
        )}
      </div>
      
      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("search")}
              />
            </Badge>
          )}
          {filters.role && (
            <Badge variant="secondary" className="gap-1">
              Role: {filters.role}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("role")}
              />
            </Badge>
          )}
          {filters.status && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => clearFilter("status")}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
```

## Real-Time Updates

### WebSocket Integration

```tsx
"use client"

import { useEffect } from "react"
import { useQueryClient } from "@tanstack/react-query"

export function useRealTimeUpdates() {
  const queryClient = useQueryClient()

  useEffect(() => {
    // WebSocket connection (implement based on your setup)
    const ws = new WebSocket("ws://localhost:8000/ws")
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      
      switch (message.type) {
        case "user_updated":
          queryClient.invalidateQueries({ queryKey: ["users"] })
          break
        case "course_updated":
          queryClient.invalidateQueries({ queryKey: ["courses"] })
          break
        // Handle other update types
      }
    }
    
    return () => ws.close()
  }, [queryClient])
}

// Usage in component
export default function UsersPageWithRealTime() {
  useRealTimeUpdates()
  
  // ... rest of component
}
```

## Export Functionality

### CSV/Excel Export

```tsx
"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

export function ExportButton<T>({
  data,
  filename,
  selectedRows,
}: {
  data: T[]
  filename: string
  selectedRows?: T[]
}) {
  const exportToCSV = () => {
    const exportData = selectedRows?.length ? selectedRows : data
    
    if (!exportData.length) return
    
    // Convert to CSV
    const headers = Object.keys(exportData[0] as object)
    const csvContent = [
      headers.join(","),
      ...exportData.map(row =>
        headers.map(header => 
          JSON.stringify((row as any)[header] || "")
        ).join(",")
      ),
    ].join("\n")
    
    // Download
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${filename}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Button variant="outline" size="sm" onClick={exportToCSV}>
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  )
}
```

## Best Practices

1. **Performance Optimization**
   - Use React Query for caching and background updates
   - Implement virtual scrolling for large datasets
   - Debounce search inputs
   - Memoize column definitions

2. **User Experience**
   - Show loading states during data fetching
   - Provide clear error messages
   - Implement optimistic updates
   - Add keyboard shortcuts

3. **Accessibility**
   - Use proper ARIA labels
   - Ensure keyboard navigation works
   - Provide screen reader support
   - Use semantic HTML

4. **Error Handling**
   - Implement retry mechanisms
   - Show user-friendly error messages
   - Log errors for debugging
   - Provide fallback UI states

5. **Security**
   - Validate permissions for actions
   - Sanitize exported data
   - Implement rate limiting
   - Audit user actions
