"use client"

import * as React from "react"
import { useDebounce } from "@/hooks/use-debounce"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    useReactTable,
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

import { DataTablePagination } from "./data-table-pagination"
import { DataTableToolbar } from "./data-table-toolbar"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    pagination: {
        pageIndex: number
        pageSize: number
    }
    setPagination: React.Dispatch<React.SetStateAction<{
        pageIndex: number
        pageSize: number
    }>>
    totalCount: number
    isLoading?: boolean
    isFetching?: boolean
    onRefresh?: () => void
    onFiltersChange?: (filters: Record<string, string>) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    pagination,
    setPagination,
    totalCount,
    isLoading = false,
    isFetching = false,
    onRefresh,
    onFiltersChange,
}: DataTableProps<TData, TValue>) {
    const [rowSelection, setRowSelection] = React.useState({})
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({
        created_at: false,
        last_login: false,
    })
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [sorting, setSorting] = React.useState<SortingState>([])

    const debouncedColumnFilters = useDebounce(columnFilters, 300)

    React.useEffect(() => {
        if (onFiltersChange) {
            const filters: Record<string, string> = {}
            debouncedColumnFilters.forEach(filter => {
                if (filter.value && filter.value !== '') {
                    switch (filter.id) {
                        case 'email':
                            filters.email = filter.value as string
                            break
                        case 'role':
                            const roleValues = Array.isArray(filter.value) ? filter.value : [filter.value]
                            if (roleValues.length > 0) {
                                filters.role = roleValues[0] as string
                            }
                            break
                        case 'status':
                            const statusValues = Array.isArray(filter.value) ? filter.value : [filter.value]
                            if (statusValues.length > 0) {
                                filters.status = statusValues[0] as string
                            }
                            break
                        default:
                            if (typeof filter.value === 'string') {
                                filters[filter.id] = filter.value
                            }
                            break
                    }
                }
            })
            onFiltersChange(filters)
        }
    }, [debouncedColumnFilters, onFiltersChange])

    const table = useReactTable({
        data,
        columns,
        pageCount: Math.ceil(totalCount / pagination.pageSize),
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        enableGlobalFilter: false,
        enableColumnFilters: true,
        autoResetPageIndex: false,
    })

    return (
        <div className="space-y-4">
            <DataTableToolbar
                table={table}
                onRefresh={onRefresh}
                isFetching={isFetching}
            />
            <div className="relative">
                {isFetching && !isLoading && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted/30 overflow-hidden z-10">
                        <div className="h-full bg-primary/90 w-full animate-pulse"></div>
                    </div>
                )}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </TableHead>
                                        )
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {isLoading || (isFetching && table.getRowModel().rows.length === 0) ? (
                                Array.from({ length: pagination.pageSize }).map((_, index) => (
                                    <TableRow key={`skeleton-${index}`}>
                                        {columns.map((_, colIndex) => (
                                            <TableCell key={`skeleton-cell-${colIndex}`}>
                                                {colIndex === 0 ? (
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-4 w-4" />
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                        <div className="space-y-1">
                                                            <Skeleton className="h-4 w-24" />
                                                            <Skeleton className="h-3 w-16" />
                                                        </div>
                                                    </div>
                                                ) : colIndex === 1 ? (
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4" />
                                                        <Skeleton className="h-4 w-32" />
                                                    </div>
                                                ) : colIndex === 2 || colIndex === 3 ? (
                                                    <Skeleton className="h-6 w-16 rounded-full" />
                                                ) : (
                                                    <Skeleton className="h-4 w-20" />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : isFetching ? (
                                Array.from({ length: pagination.pageSize }).map((_, index) => (
                                    <TableRow key={`pagination-skeleton-${index}`} className="animate-pulse">
                                        {columns.map((_, colIndex) => (
                                            <TableCell key={`pagination-skeleton-cell-${colIndex}`}>
                                                {colIndex === 0 ? (
                                                    <div className="flex items-center gap-3">
                                                        <Skeleton className="h-4 w-4" />
                                                        <Skeleton className="h-8 w-8 rounded-full" />
                                                        <div className="space-y-1">
                                                            <Skeleton className="h-4 w-24" />
                                                            <Skeleton className="h-3 w-16" />
                                                        </div>
                                                    </div>
                                                ) : colIndex === 1 ? (
                                                    <div className="flex items-center gap-2">
                                                        <Skeleton className="h-4 w-4" />
                                                        <Skeleton className="h-4 w-32" />
                                                    </div>
                                                ) : colIndex === 2 || colIndex === 3 ? (
                                                    <Skeleton className="h-6 w-16 rounded-full" />
                                                ) : colIndex === 4 || colIndex === 5 ? (
                                                    <Skeleton className="h-4 w-20" />
                                                ) : (
                                                    <Skeleton className="h-8 w-8" />
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
            <DataTablePagination table={table} totalCount={totalCount} isFetching={isFetching} />
        </div>
    )
}
