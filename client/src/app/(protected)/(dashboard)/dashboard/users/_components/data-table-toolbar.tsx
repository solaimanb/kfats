"use client"

import { X, RefreshCw } from "lucide-react"
import { Table } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableViewOptions } from "./data-table-view-options"
import { DataTableFacetedFilter } from "./data-table-faceted-filter"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { 
  Shield, 
  GraduationCap, 
  PenTool, 
  ShoppingBag, 
  BookOpen, 
  User,
  UserCheck,
  UserX
} from "lucide-react"

interface DataTableToolbarProps<TData> {
  table: Table<TData>
  onRefresh?: () => void
  isFetching?: boolean
}

const roles = [
  {
    value: "admin",
    label: "Admin",
    icon: Shield,
  },
  {
    value: "mentor",
    label: "Mentor", 
    icon: GraduationCap,
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
  {
    value: "student",
    label: "Student",
    icon: BookOpen,
  },
  {
    value: "user",
    label: "User",
    icon: User,
  },
]

const statuses = [
  {
    value: "active",
    label: "Active",
    icon: UserCheck,
  },
  {
    value: "inactive", 
    label: "Inactive",
    icon: UserX,
  },
  {
    value: "suspended", 
    label: "Suspended",
    icon: UserX,
  },
  {
    value: "pending", 
    label: "Pending",
    icon: UserX,
  },
]

export function DataTableToolbar<TData>({
  table,
  onRefresh,
  isFetching = false,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  const handleRefresh = () => {
    if (onRefresh && !isFetching) {
      onRefresh()
    }
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <div className="relative">
          <Input
            placeholder="Search by email, name, username, or role..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[320px]"
            autoComplete="off"
            autoCorrect="off"
            spellCheck="false"
          />
          {isFetching && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
        {table.getColumn("role") && (
          <DataTableFacetedFilter
            column={table.getColumn("role")}
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
            onClick={() => {
              table.resetColumnFilters()
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        
        {isFiltered && (
          <Badge variant="secondary" className="h-6">
            {table.getState().columnFilters.length} filter{table.getState().columnFilters.length !== 1 ? 's' : ''} active
          </Badge>
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
                className="h-8"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isFetching ? 'Refreshing...' : 'Refresh data'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              {table.getFilteredSelectedRowModel().rows.length} selected
            </Badge>
            <Button variant="outline" size="sm">
              Bulk Actions
            </Button>
          </div>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  )
}
