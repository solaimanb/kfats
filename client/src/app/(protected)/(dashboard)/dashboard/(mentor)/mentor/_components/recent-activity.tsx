"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { getMentorActivityIcon, getMentorActivityColor } from "./utils"
import type { MentorActivity } from "./types"

interface MentorRecentActivityProps {
  activities: MentorActivity[]
  isLoading: boolean
}

export function MentorRecentActivity({ activities, isLoading }: MentorRecentActivityProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-muted rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-40" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
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
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.slice(0, 8).map((activity) => {
              const IconComponent = getMentorActivityIcon(activity.type)
              const colorClass = getMentorActivityColor(activity.type)
              
              return (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full bg-muted ${colorClass}`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                      </span>
                      {activity.course_title && (
                        <>
                          <span>•</span>
                          <span className="font-medium">{activity.course_title}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
