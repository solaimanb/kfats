"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { DataTable } from "@/components/common/data-table/data-table";
import { DataTableFacetedFilter } from "@/components/common/data-table/data-table-faceted-filter";
import { DataTableViewOptions } from "@/components/common/data-table/data-table-view-options";
import { useAllContent, useContentStats } from "@/lib/hooks/useContentManagement";
import { useContentColumns } from "../_hooks/use-content-columns";
import { useContentActions } from "../_hooks/use-content-actions";
import { useStatsCards } from "../_hooks/use-stats-cards";
import { ErrorState } from "./states/error-state";
import { StatsGrid } from "./layout/stats-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Search } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import type { ContentOverviewItem } from "../_types/types";

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
                pageSize={10}
                showPagination={true}
                toolbar={(table: Table<ContentOverviewItem>) => (
                    <>
                        <div className="relative max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search content..."
                                value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                                onChange={(event) =>
                                    table.getColumn("title")?.setFilterValue(event.target.value)
                                }
                                className="pl-8"
                            />
                        </div>
                        <DataTableFacetedFilter
                            column={table.getColumn("type")}
                            title="Type"
                            options={[
                                { label: "Article", value: "article" },
                                { label: "Course", value: "course" },
                                { label: "Product", value: "product" },
                            ]}
                        />
                        <DataTableFacetedFilter
                            column={table.getColumn("status")}
                            title="Status"
                            options={[
                                { label: "Published", value: "published" },
                                { label: "Draft", value: "draft" },
                                { label: "Unpublished", value: "unpublished" },
                                { label: "Inactive", value: "inactive" },
                                { label: "Archived", value: "archived" },
                            ]}
                        />
                        <DataTableViewOptions table={table} />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleRefresh}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
                            {isFetching ? 'Refreshing...' : 'Refresh'}
                        </Button>
                    </>
                )}
            />
        </div>
    );
}
