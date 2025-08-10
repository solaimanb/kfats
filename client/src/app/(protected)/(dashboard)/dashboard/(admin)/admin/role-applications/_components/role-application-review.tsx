"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRoleApplications, useAllApplications, useApplicationStats } from "@/lib/hooks/useRoleApplications"
import { RoleApplicationStatus, ApplicationableRole } from "@/lib/types/api"
import {
  Check,
  X,
  Eye,
  Clock,
  FileText,
  Loader2,
  AlertCircle
} from "lucide-react"
import { toast } from "sonner"
import { getRoleIcon } from "@/lib/utils/role"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface RoleApplicationReviewProps {
  onlyPending?: boolean
}

export function RoleApplicationReview({ onlyPending = false }: RoleApplicationReviewProps) {
  const [selectedStatus, setSelectedStatus] = useState<RoleApplicationStatus | "all">("all")
  const [selectedRole, setSelectedRole] = useState<ApplicationableRole | "all">("all")
  const [adminNotes, setAdminNotes] = useState("")
  const { reviewApplication } = useRoleApplications()

  const { data: applications, isLoading } = useAllApplications(
    selectedStatus === "all" ? undefined : selectedStatus,
    selectedRole === "all" ? undefined : selectedRole
  )

  const { data: stats } = useApplicationStats()

  const getApplicationDataString = (data: Record<string, unknown>, key: string): string | null => {
    const value = data[key]
    return typeof value === 'string' ? value : null
  }

  const handleReview = async (applicationId: number, status: RoleApplicationStatus) => {
    try {
      await reviewApplication.mutateAsync({
        applicationId,
        data: {
          status,
          admin_notes: adminNotes.trim() || undefined
        }
      })

      toast.success(`Application ${status === "approved" ? "approved" : "rejected"} successfully`)
      setAdminNotes("")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error && 'response' in error &&
        typeof error.response === 'object' && error.response !== null &&
        'data' in error.response && typeof error.response.data === 'object' &&
        error.response.data !== null && 'detail' in error.response.data
        ? String(error.response.data.detail)
        : `Failed to ${status} application`
      toast.error(errorMessage)
    }
  }

  const getStatusBadge = (status: RoleApplicationStatus) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case "approved":
        return <Badge variant="outline" className="text-green-600 border-green-600"><Check className="w-3 h-3 mr-1" />Approved</Badge>
      case "rejected":
        return <Badge variant="outline" className="text-red-600 border-red-600"><X className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  const filteredApplications = onlyPending
    ? applications?.filter(app => app.status === "pending")
    : applications

  return (
    <div className="space-y-6">
      {stats && (
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

      {!onlyPending && (
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as RoleApplicationStatus | "all")}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as ApplicationableRole | "all")}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="mentor">Mentor</SelectItem>
                    <SelectItem value="seller">Seller</SelectItem>
                    <SelectItem value="writer">Writer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {onlyPending ? "Pending Applications" : "Role Applications"}
          </CardTitle>
          <CardDescription>
            {onlyPending
              ? "Applications waiting for your review"
              : "All role applications submitted by users"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!filteredApplications || filteredApplications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p>No applications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div key={app.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {getRoleIcon(app.requested_role, { context: 'application' })}
                      <div>
                        <p className="font-medium">{app.requested_role.toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          User ID: {app.user_id} • Applied {new Date(app.applied_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(app.status)}
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              {getRoleIcon(app.requested_role, { context: 'application' })}
                              <span>{app.requested_role.toUpperCase()} Application</span>
                            </DialogTitle>
                            <DialogDescription>
                              Review and approve or reject this role application
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium">User ID</Label>
                              <p className="text-sm">{app.user_id}</p>
                            </div>

                            <div>
                              <Label className="text-sm font-medium">Reason</Label>
                              <p className="text-sm bg-muted p-3 rounded-md">{app.reason}</p>
                            </div>

                            {app.application_data && (
                              <div>
                                <Label className="text-sm font-medium">Additional Information</Label>
                                <div className="space-y-2 text-sm">
                                  {(() => {
                                    const experience = getApplicationDataString(app.application_data, 'experience')
                                    const portfolioUrl = getApplicationDataString(app.application_data, 'portfolio_url')
                                    const additionalInfo = getApplicationDataString(app.application_data, 'additional_info')

                                    return (
                                      <>
                                        {experience && (
                                          <div>
                                            <span className="font-medium">Experience:</span>
                                            <p className="bg-muted p-2 rounded">{experience}</p>
                                          </div>
                                        )}
                                        {portfolioUrl && (
                                          <div>
                                            <span className="font-medium">Portfolio:</span>
                                            <a
                                              href={portfolioUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline ml-2"
                                            >
                                              {portfolioUrl}
                                            </a>
                                          </div>
                                        )}
                                        {additionalInfo && (
                                          <div>
                                            <span className="font-medium">Additional Info:</span>
                                            <p className="bg-muted p-2 rounded">{additionalInfo}</p>
                                          </div>
                                        )}
                                      </>
                                    )
                                  })()}
                                </div>
                              </div>
                            )}

                            {app.status === "pending" && (
                              <div>
                                <Label className="text-sm font-medium">Admin Notes (Optional)</Label>
                                <Textarea
                                  value={adminNotes}
                                  onChange={(e) => setAdminNotes(e.target.value)}
                                  placeholder="Add notes for your review decision..."
                                  className="mt-1"
                                />
                              </div>
                            )}

                            {app.admin_notes && (
                              <div>
                                <Label className="text-sm font-medium">Admin Notes</Label>
                                <p className="text-sm bg-muted p-3 rounded-md">{app.admin_notes}</p>
                              </div>
                            )}
                          </div>

                          {app.status === "pending" && (
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => handleReview(app.id, RoleApplicationStatus.REJECTED)}
                                disabled={reviewApplication.isPending}
                              >
                                <X className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => handleReview(app.id, RoleApplicationStatus.APPROVED)}
                                disabled={reviewApplication.isPending}
                              >
                                {reviewApplication.isPending ? (
                                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-1" />
                                )}
                                Approve
                              </Button>
                            </DialogFooter>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {app.reason}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
