import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Star } from "lucide-react";
import { DataTableColumnHeader } from "@/components/common/data-table/data-table-column-header";
import { DataTableRowActions } from "@/components/common/data-table/data-table-row-actions";
import { StatusBadge } from "../_components/badges/status-badge";
import { TypeBadge } from "../_components/badges/type-badge";
import type { ContentOverviewItem, ContentActions } from "../_types/types";

export function useContentColumns({ onToggleFeature, onArchive }: ContentActions) {
    return useMemo((): ColumnDef<ContentOverviewItem>[] => [
        {
            accessorKey: "id",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="ID" />
            ),
            cell: ({ row }) => (
                <div className="w-[60px] font-mono text-sm">
                    {row.getValue("id")}
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Title" />
            ),
            cell: ({ row }) => {
                const title = row.getValue("title") as string;
                const isFeatured = row.original.is_featured;

                return (
                    <div className="flex items-center space-x-2 max-w-[300px]">
                        {isFeatured && (
                            <Star
                                className="h-4 w-4 text-yellow-500 fill-current shrink-0"
                                aria-label="Featured content"
                            />
                        )}
                        <span className="truncate font-medium" title={title}>
                            {title}
                        </span>
                    </div>
                );
            },
            enableSorting: true,
            enableHiding: false,
        },
        {
            accessorKey: "type",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Type" />
            ),
            cell: ({ row }) => {
                const type = row.getValue("type") as string;
                return <TypeBadge type={type} />;
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "status",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Status" />
            ),
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                return <StatusBadge status={status} />;
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "author_name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Author" />
            ),
            cell: ({ row }) => {
                const authorName = row.getValue("author_name") as string;
                const authorRole = row.original.author_role;

                return (
                    <div className="flex flex-col min-w-0">
                        <span className="font-medium truncate" title={authorName}>
                            {authorName}
                        </span>
                        <span className="text-sm text-muted-foreground capitalize">
                            {authorRole}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "views_count",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Views" />
            ),
            cell: ({ row }) => {
                const views = row.getValue("views_count") as number;
                return (
                    <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="tabular-nums">{views.toLocaleString()}</span>
                    </div>
                );
            },
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Created" />
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("created_at"));
                return (
                    <div className="flex flex-col text-sm">
                        <time className="tabular-nums" dateTime={date.toISOString()}>
                            {date.toLocaleDateString()}
                        </time>
                        <time className="text-xs text-muted-foreground tabular-nums">
                            {date.toLocaleTimeString()}
                        </time>
                    </div>
                );
            },
        },
        {
            accessorKey: "published_at",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Published" />
            ),
            cell: ({ row }) => {
                const publishedAt = row.getValue("published_at") as string | undefined;

                if (!publishedAt) {
                    return <span className="text-muted-foreground">—</span>;
                }

                const date = new Date(publishedAt);
                return (
                    <div className="flex flex-col text-sm">
                        <time className="tabular-nums" dateTime={date.toISOString()}>
                            {date.toLocaleDateString()}
                        </time>
                        <time className="text-xs text-muted-foreground tabular-nums">
                            {date.toLocaleTimeString()}
                        </time>
                    </div>
                );
            },
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const content = row.original;

                return (
                    <DataTableRowActions
                        row={row}
                        onView={(data) => console.log("View", data.id)}
                        onEdit={(data) => console.log("Edit", data.id)}
                        customActions={[
                            {
                                label: content.is_featured ? "Unfeature" : "Feature",
                                onClick: () => onToggleFeature(content),
                            },
                            {
                                label: "Archive",
                                onClick: () => onArchive(content),
                                variant: "destructive",
                            }
                        ]}
                    />
                );
            },
        },
    ], [onToggleFeature, onArchive]);
}
