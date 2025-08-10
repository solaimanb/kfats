"use client"

import { useState, useEffect, useCallback } from "react"
import { useAllApplications, useApplicationStats } from "@/lib/hooks/useRoleApplications"
import { columns } from "./columns"
import { DataTable } from "@/components/common/data-table"
import { DataTableToolbar } from "./data-table-toolbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, Clock, Check, X, FileText } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

export function RoleApplicationsTable() {
    const queryClient = useQueryClient()
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })

    const {
        data: applications,
        isLoading: applicationsLoading,
        error,
        refetch,
        isFetching
    } = useAllApplications(
        undefined,
        undefined,
        pagination.pageIndex * pagination.pageSize,
        pagination.pageSize
    )

    const { data: stats, isLoading: statsLoading } = useApplicationStats()

    useEffect(() => {
        // Reset to first page when page size changes
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
    }, [pagination.pageSize])

    const handleRefresh = useCallback(() => {
        refetch()
        queryClient.invalidateQueries({ queryKey: ['roleApplications'] })
    }, [refetch, queryClient])

    // No server-driven filter sync; client-side faceted filters are used in the toolbar

    if (error) {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Error loading role applications: {error instanceof Error ? error.message : "An unexpected error occurred"}
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    if (applicationsLoading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <Card key={index}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-4 w-4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-8 w-16" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

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
                                <div className="flex items-center space-x-2">
                                    <Skeleton className="h-10 w-10" />
                                    <Skeleton className="h-10 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-[400px] w-full" />
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {stats && !statsLoading && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_applications}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">{stats.pending_applications}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Approved</CardTitle>
                            <Check className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{stats.approved_applications}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                            <X className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{stats.rejected_applications}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Card>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={applications || []}
                        pageSize={pagination.pageSize}
                        showPagination={true}
                        toolbar={(table) => (
                            <DataTableToolbar table={table} onRefresh={handleRefresh} isFetching={isFetching} />
                        )}
                    />
                </CardContent>
            </Card>
        </div>
    )
}
