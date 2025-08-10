"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  MoreHorizontal,
  Check,
  X,
  Eye,
  Clock,
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  MessageSquare,
  FileText
} from "lucide-react"
import { format } from "date-fns"
import { RoleApplication, RoleApplicationStatus } from "@/lib/types/api"
import { useRoleApplications } from "@/lib/hooks/useRoleApplications"
import { toast } from "sonner"
import { getRoleBadgeClasses, getRoleIcon } from "@/lib/utils/role"

interface ApplicationActionsProps {
  application: RoleApplication
}

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

export function ApplicationActions({ application }: ApplicationActionsProps) {
  const { reviewApplication } = useRoleApplications()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const handleApprove = async () => {
    try {
      await reviewApplication.mutateAsync({
        applicationId: application.id,
        data: {
          status: 'approved' as RoleApplicationStatus,
          admin_notes: 'Application approved'
        }
      })
      toast.success('Application approved successfully')
    } catch (error) {
      toast.error('Failed to approve application')
      console.error(error)
    }
  }

  const handleReject = async () => {
    try {
      await reviewApplication.mutateAsync({
        applicationId: application.id,
        data: {
          status: 'rejected' as RoleApplicationStatus,
          admin_notes: 'Application rejected'
        }
      })
      toast.success('Application rejected successfully')
    } catch (error) {
      toast.error('Failed to reject application')
      console.error(error)
    }
  }

  const getStatusIcon = () => {
    switch (application.status) {
      case 'approved':
        return <Check className="h-4 w-4" />
      case 'rejected':
        return <X className="h-4 w-4" />
      case 'pending':
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setIsDetailsOpen(true)}>
            <Eye className="mr-2 h-4 w-4" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {application.status === 'pending' && (
            <>
              <DropdownMenuItem
                className="text-green-600 cursor-pointer"
                onClick={handleApprove}
                disabled={reviewApplication.isPending}
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 cursor-pointer"
                onClick={handleReject}
                disabled={reviewApplication.isPending}
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Role Application Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the role application
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Applicant Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Applicant Information
              </h3>

              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={application.user?.avatar_url} alt={application.user?.full_name} />
                  <AvatarFallback className="text-lg">
                    {application.user?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-2">
                  <div>
                    <h4 className="font-semibold text-lg">{application.user?.full_name || 'Unknown User'}</h4>
                    <p className="text-muted-foreground">@{application.user?.username || 'unknown'}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {application.user?.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span>{application.user.email}</span>
                      </div>
                    )}
                    {application.user?.phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{application.user.phone}</span>
                      </div>
                    )}
                  </div>

                  {application.user?.bio && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">{application.user.bio}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Application Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Application Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Requested Role</label>
                  <div className="flex items-center gap-2">
                    {getRoleIcon(application.requested_role, { context: 'application' })}
                    <Badge className={getRoleBadgeClasses(application.requested_role, 'soft')}>
                      {application.requested_role.charAt(0).toUpperCase() + application.requested_role.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon()}
                    <Badge className={getStatusBadgeColor(application.status)}>
                      {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Applied Date</label>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(application.applied_at), 'PPp')}</span>
                  </div>
                </div>

                {application.reviewed_at && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Reviewed Date</label>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(application.reviewed_at), 'PPp')}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Application Reason</label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm leading-relaxed">{application.reason}</p>
                </div>
              </div>

              {application.admin_notes && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Admin Notes</label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <p className="text-sm leading-relaxed">{application.admin_notes}</p>
                  </div>
                </div>
              )}

              {application.application_data && Object.keys(application.application_data).length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Additional Data</label>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
                      {JSON.stringify(application.application_data, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons for Pending Applications */}
            {application.status === 'pending' && (
              <>
                <Separator />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={handleReject}
                    disabled={reviewApplication.isPending}
                    className="text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Reject Application
                  </Button>
                  <Button
                    onClick={handleApprove}
                    disabled={reviewApplication.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Approve Application
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
