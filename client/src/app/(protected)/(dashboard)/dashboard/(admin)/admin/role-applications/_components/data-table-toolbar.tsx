"use client"

import { X, RefreshCw } from "lucide-react"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { DataTableViewOptions, DataTableFacetedFilter } from "@/components/common/data-table"
import { useCallback } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Users,
  PenTool,
  ShoppingBag,
  Check,
  X as XIcon,
  Clock
} from "lucide-react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onRefresh?: () => void
  isFetching?: boolean
}

const roles = [
  {
    value: "mentor",
    label: "Mentor",
    icon: Users,
  },
  {
    value: "writer",
    label: "Writer",
    icon: PenTool,
  },
  {
    value: "seller",
    label: "Seller",
    icon: ShoppingBag,
  },
]

const statuses = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
  },
  {
    value: "approved",
    label: "Approved",
    icon: Check,
  },
  {
    value: "rejected",
    label: "Rejected",
    icon: XIcon,
  },
]

export function DataTableToolbar<TData>({
  table,
  onRefresh,
  isFetching = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const handleRefresh = useCallback(() => {
    if (onRefresh && !isFetching) {
      onRefresh()
    }
  }, [onRefresh, isFetching])

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {table.getColumn("requested_role") && (
          <DataTableFacetedFilter
            column={table.getColumn("requested_role")}
            title="Role"
            options={roles}
          />
        )}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isFetching}
                className="ml-auto h-8"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Refresh applications</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
