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

import { DataTablePagination } from "../../users/_components/data-table-pagination"
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
        applied_at: false,
        reviewed_at: false,
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
                        case 'reason':
                            filters.search = filter.value as string
                            break
                        case 'requested_role':
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
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        manualPagination: true,
        pageCount: Math.ceil(totalCount / pagination.pageSize),
    })

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-[250px]" />
                        <Skeleton className="h-8 w-[100px]" />
                        <Skeleton className="h-8 w-[100px]" />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-[100px]" />
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {columns.map((_, index) => (
                                    <TableHead key={index}>
                                        <Skeleton className="h-4 w-full" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <TableRow key={index}>
                                    {columns.map((_, cellIndex) => (
                                        <TableCell key={cellIndex}>
                                            <Skeleton className="h-4 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex items-center justify-between">
                    <Skeleton className="h-4 w-[100px]" />
                    <div className="flex items-center space-x-2">
                        <Skeleton className="h-8 w-[100px]" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-[100px]" />
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <DataTableToolbar table={table} onRefresh={onRefresh} isFetching={isFetching} />
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
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
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No role applications found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <DataTablePagination
                table={table}
                totalCount={totalCount}
            />
        </div>
    )
}
