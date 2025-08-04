"use client"

import { useState, useEffect } from "react"
import { useUsers } from "@/lib/hooks/useUsers"
import { columns } from "./columns"
import { DataTable } from "./data-table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { usersKeys } from "@/lib/hooks/useUsers"
import { UsersAPI } from "@/lib/api/users"

export function UserManagementTable() {
    const queryClient = useQueryClient()
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    const [filters, setFilters] = useState<{
        email?: string
        role?: string
        status?: string
    }>({})

    const queryParams = {
        skip: pagination.pageIndex * pagination.pageSize,
        limit: pagination.pageSize,
        ...filters,
    }

    const { data: usersData, isLoading: usersLoading, error, refetch, isFetching } = useUsers(queryParams)

    const users = usersData?.items || []

    useEffect(() => {
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }, [filters])

    useEffect(() => {
        if (usersData && usersData.pages > pagination.pageIndex + 1) {
            const nextPageParams = {
                skip: (pagination.pageIndex + 1) * pagination.pageSize,
                limit: pagination.pageSize,
                ...filters,
            }

            queryClient.prefetchQuery({
                queryKey: usersKeys.list(nextPageParams),
                queryFn: () => UsersAPI.getAllUsers(nextPageParams),
                staleTime: 2 * 60 * 1000,
            })
        }
    }, [usersData, pagination.pageIndex, pagination.pageSize, queryClient, filters])

    useEffect(() => {
        if (pagination.pageIndex > 0) {
            const prevPageParams = {
                skip: (pagination.pageIndex - 1) * pagination.pageSize,
                limit: pagination.pageSize,
                ...filters,
            }

            queryClient.prefetchQuery({
                queryKey: usersKeys.list(prevPageParams),
                queryFn: () => UsersAPI.getAllUsers(prevPageParams),
                staleTime: 2 * 60 * 1000,
            })
        }
    }, [pagination.pageIndex, pagination.pageSize, queryClient, filters])

    if (error) {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading users: {error instanceof Error ? error.message : "An unexpected error occurred"}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (usersLoading) {
        return (
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-32 mb-4" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-10 w-64" />
                                    <Skeleton className="h-10 w-24" />
                                    <Skeleton className="h-10 w-24" />
                                </div>
                                <Skeleton className="h-10 w-32" />
                            </div>

                            <div className="rounded-md border">
                                <div className="p-4 space-y-3">
                                    <div className="flex items-center space-x-4 pb-2 border-b">
                                        <Skeleton className="h-4 w-4" />
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-4 w-48" />
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-20" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>

                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div key={i} className="flex items-center space-x-4 py-3">
                                            <Skeleton className="h-4 w-4" />
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-28" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Skeleton className="h-4 w-4" />
                                                <Skeleton className="h-4 w-40" />
                                            </div>
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-8 w-8" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <Skeleton className="h-4 w-48" />
                                <div className="flex items-center space-x-6">
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-8 w-16" />
                                    </div>
                                    <Skeleton className="h-4 w-24" />
                                    <div className="flex items-center space-x-2">
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                        <Skeleton className="h-8 w-8" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <Card>
            <CardContent>
                <DataTable
                    columns={columns}
                    data={users}
                    pagination={pagination}
                    setPagination={setPagination}
                    totalCount={usersData?.total || 0}
                    isLoading={usersLoading && !isFetching}
                    isFetching={isFetching}
                    onRefresh={refetch}
                    onFiltersChange={setFilters}
                />
            </CardContent>
        </Card>
    )
}
