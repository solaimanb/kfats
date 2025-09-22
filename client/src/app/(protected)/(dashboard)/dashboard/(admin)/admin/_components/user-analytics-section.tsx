"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Shield, BarChart3, Settings } from "lucide-react"
import { getStatusTextClass } from "./utils"
import type { UserAnalytics, OverviewData } from "./types"

interface UserAnalyticsSectionProps {
  userAnalytics: UserAnalytics | undefined
  overviewData: OverviewData | undefined
  isLoading: boolean
}

export function UserAnalyticsSection({ 
  userAnalytics, 
  overviewData, 
  isLoading 
}: UserAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="animate-pulse rounded-xs">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-20" />
                  <div className="h-6 bg-muted rounded w-12" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="animate-pulse rounded-xs">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="h-4 bg-muted rounded w-24" />
                  <div className="h-6 bg-muted rounded w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Active Users (30 days)</span>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {userAnalytics?.active_users || 0}
              </Badge>
            </div>

            {/* User Status Distribution */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">By Status</h4>
              {userAnalytics?.status_distribution && Object.entries(userAnalytics.status_distribution).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{status}</span>
                  <span className={`text-sm font-medium ${getStatusTextClass(status)}`}>
                    {count}
                  </span>
                </div>
              ))}
            </div>

            {/* Role Distribution */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">By Role</h4>
              {overviewData?.user_distribution && Object.entries(overviewData.user_distribution).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-sm capitalize">{role}</span>
                  <Badge variant="secondary" className="text-xs">
                    {count}
                  </Badge>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full mt-4">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Detailed Analytics
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xs">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            System Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">System Health</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Excellent
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Total Enrollments</span>
              <span className="text-sm font-medium">
                {overviewData?.totals.enrollments || 0}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">Growth Rate</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                +12.5%
              </Badge>
            </div>

            <div className="pt-2 space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Platform Usage</span>
                <span>89%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '89%' }}></div>
              </div>
            </div>

            <Button variant="outline" className="w-full mt-4">
              <Settings className="h-4 w-4 mr-2" />
              System Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
