"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Activity } from "lucide-react"
import { getStatusBadgeClass } from "./utils"
import type { UserAnalytics } from "./types"

interface DetailedUserAnalyticsProps {
  userAnalytics: UserAnalytics | undefined
  isLoading: boolean
}

export function DetailedUserAnalytics({ userAnalytics, isLoading }: DetailedUserAnalyticsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="animate-pulse rounded-xs">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="flex justify-between items-center">
                      <div className="h-4 bg-muted rounded w-20" />
                      <div className="h-6 bg-muted rounded w-12" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Users className="h-5 w-5" />
        User Analytics
      </h3>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userAnalytics?.status_distribution && Object.entries(userAnalytics.status_distribution).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{status}</span>
                  <Badge className={getStatusBadgeClass(status)}>
                    {count as number}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              User Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Users</span>
                <Badge variant="outline">
                  {userAnalytics?.total_users || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Users (30 days)</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {userAnalytics?.active_users || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
