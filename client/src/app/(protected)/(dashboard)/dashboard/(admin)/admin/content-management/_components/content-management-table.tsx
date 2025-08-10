"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { DataTable } from "@/components/common/data-table/data-table";
import { useAllContent, useContentStats } from "@/lib/hooks/useContentManagement";
import { useContentColumns } from "../_hooks/use-content-columns";
import { useContentActions } from "../_hooks/use-content-actions";
import { useStatsCards } from "../_hooks/use-stats-cards";
import { ErrorState } from "./states/error-state";
import { StatsGrid } from "./layout/stats-grid";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

const ContentManagementSkeleton = dynamic(
    () => import("./content-management-skeleton").then(mod => ({ default: mod.ContentManagementSkeleton })),
    {
        loading: () => <div className="animate-pulse">Loading...</div>,
        ssr: false
    }
);

export function ContentManagementTable() {
    const {
        data: contentResponse,
        isLoading: contentLoading,
        isFetching: contentFetching,
        error: contentError,
        refetch: refetchContent
    } = useAllContent();

    const {
        data: stats,
        isLoading: statsLoading,
        isFetching: statsFetching,
        refetch: refetchStats
    } = useContentStats();

    const { handleToggleFeature, handleArchive } = useContentActions();
    const statsCards = useStatsCards(stats);

    const handleRefresh = () => {
        refetchContent();
        refetchStats();
    };

    const derivedData = useMemo(() => {
        const data = contentResponse?.items || [];
        const paginationInfo = contentResponse ? {
            page: contentResponse.page,
            size: contentResponse.size,
            total: contentResponse.total,
            pages: Math.ceil(contentResponse.total / contentResponse.size)
        } : { page: 1, size: 20, total: 0, pages: 0 };

        return { data, paginationInfo };
    }, [contentResponse]);

    const columns = useContentColumns({
        onToggleFeature: handleToggleFeature,
        onArchive: handleArchive
    });

    const isLoading = contentLoading || statsLoading;
    const isFetching = contentFetching || statsFetching;
    const hasError = Boolean(contentError);

    if (isLoading) {
        return <ContentManagementSkeleton />;
    }

    if (hasError) {
        return <ErrorState onRetry={handleRefresh} />;
    }

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
                <p className="text-muted-foreground">
                    Manage all content across the platform ({derivedData.paginationInfo.total.toLocaleString()} items)
                </p>
            </div>

            {statsCards && <StatsGrid stats={statsCards} />}

            <DataTable
                columns={columns}
                data={derivedData.data}
                pageSize={20}
                showPagination={true}
                toolbar={
                    <div className="flex items-center justify-end ml-auto mr-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                            {isFetching ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </div>
                }
            />
        </div>
    );
}
