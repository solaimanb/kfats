"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DataTableColumnHeader } from "../../users/_components/data-table-column-header"
import {
  Check,
  X,
  Clock,
  User as UserIcon
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { RoleApplication, RoleApplicationStatus, ApplicationableRole } from "@/lib/types/api"
import { ApplicationActions } from "./application-actions"
import { getRoleBadgeClasses, getRoleIcon } from "@/lib/utils/role"

export type { RoleApplication }


const getStatusBadgeColor = (status: RoleApplicationStatus) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export const columns: ColumnDef<RoleApplication>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value: boolean) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value: boolean) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "applicant",
    header: "Applicant",
    cell: ({ row }) => {
      const application = row.original
      const user = application.user
      
      if (!user) {
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <UserIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">User #{application.user_id}</div>
              <div className="text-sm text-muted-foreground">Unknown User</div>
            </div>
          </div>
        )
      }

      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
            <AvatarFallback>
              {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{user.full_name}</div>
            <div className="text-sm text-muted-foreground">@{user.username}</div>
          </div>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "requested_role",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Requested Role" />
    ),
    cell: ({ row }) => {
      const role = row.getValue("requested_role") as ApplicationableRole
      return (
        <div className="flex items-center gap-2">
          {getRoleIcon(role, { context: 'application' })}
          <Badge className={getRoleBadgeClasses(role, 'soft')}>
            {role.charAt(0).toUpperCase() + role.slice(1)}
          </Badge>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as RoleApplicationStatus
      const getStatusIcon = () => {
        switch (status) {
          case 'approved':
            return <Check className="h-3 w-3 mr-1" />
          case 'rejected':
            return <X className="h-3 w-3 mr-1" />
          case 'pending':
            return <Clock className="h-3 w-3 mr-1" />
          default:
            return null
        }
      }

      return (
        <Badge className={getStatusBadgeColor(status)}>
          {getStatusIcon()}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
    filterFn: (row, id, value) => {
      const status = row.getValue(id) as string
      return value.includes(status)
    },
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => {
      const reason = row.getValue("reason") as string
      return (
        <div className="max-w-[300px]">
          <p className="text-sm line-clamp-2 leading-relaxed">
            {reason}
          </p>
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "applied_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Applied" />
    ),
    cell: ({ row }) => {
      const appliedAt = row.getValue("applied_at") as string
      return (
        <div className="text-sm">
          {formatDistanceToNow(new Date(appliedAt), { addSuffix: true })}
        </div>
      )
    },
  },
  {
    accessorKey: "reviewed_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reviewed" />
    ),
    cell: ({ row }) => {
      const reviewedAt = row.getValue("reviewed_at") as string | undefined
      return (
        <div className="text-sm">
          {reviewedAt 
            ? formatDistanceToNow(new Date(reviewedAt), { addSuffix: true })
            : "Not reviewed"
          }
        </div>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const application = row.original
      return <ApplicationActions application={application} />
    },
  },
]
