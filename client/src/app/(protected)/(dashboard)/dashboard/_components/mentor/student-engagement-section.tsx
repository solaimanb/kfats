"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, UserCheck } from "lucide-react"
import type { StudentEngagement } from "./types"

interface StudentEngagementSectionProps {
  data: StudentEngagement | undefined
  isLoading: boolean
}

export function StudentEngagementSection({ data, isLoading }: StudentEngagementSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-40 animate-pulse" />
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
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Student Engagement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Active Students</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              {data?.active_students || 0}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">New Enrollments (This Month)</span>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              +{data?.new_enrollments_this_month || 0}
            </Badge>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Engagement Rate</span>
            <Badge variant="outline">
              {Math.round((data?.engagement_rate || 0) * 100)}%
            </Badge>
          </div>

          {data?.completion_trends && data.completion_trends.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Completion Trends</span>
              </div>
              <div className="space-y-2">
                {data.completion_trends.slice(-3).map((trend, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">{trend.month}</span>
                    <div className="flex items-center gap-1">
                      <UserCheck className="h-3 w-3 text-green-600" />
                      <span>{trend.completions} completions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
