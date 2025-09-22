"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserCheck, Clock, CheckCircle, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface RoleApplication {
  id: string
  user_name: string
  role: string
  status: "pending" | "approved" | "rejected"
  submitted_at: string
}

interface RoleApplicationsProps {
  applications: RoleApplication[]
  isLoading: boolean
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
}

export function RoleApplicationsSection({ 
  applications, 
  isLoading,
  onApprove,
  onReject 
}: RoleApplicationsProps) {
  if (isLoading) {
    return (
      <Card className="animate-pulse rounded-xs">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-muted rounded">
                <div className="space-y-2">
                  <div className="h-4 bg-muted-foreground/20 rounded w-32" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-24" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-muted-foreground/20 rounded w-16" />
                  <div className="h-8 bg-muted-foreground/20 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <Card className="rounded-xs">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Role Applications
        </CardTitle>
      </CardHeader>
      <CardContent>
        {applications.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No role applications found
          </div>
        ) : (
          <div className="space-y-3">
            {applications.map((application) => (
              <div 
                key={application.id} 
                className="flex justify-between items-center p-3 bg-background rounded-lg border"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{application.user_name}</span>
                    <Badge variant="outline" className="text-xs">
                      {application.role}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge className={getStatusColor(application.status)}>
                      {getStatusIcon(application.status)}
                      <span className="ml-1 capitalize">{application.status}</span>
                    </Badge>
                    <span>
                      {formatDistanceToNow(new Date(application.submitted_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {application.status === "pending" && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={() => onApprove?.(application.id)}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => onReject?.(application.id)}
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
