"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { MentorActivity } from "./types";

interface MentorRecentActivityProps {
  activities: MentorActivity[];
  isLoading: boolean;
  onViewAllActivity?: () => void;
}

export function MentorRecentActivity({
  activities,
  isLoading,
  onViewAllActivity,
}: MentorRecentActivityProps) {
  if (isLoading) {
    return (
      <Card className="rounded-none">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32 animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 animate-pulse"
              >
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
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Activity className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="h-12 w-12 mx-auto opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {activities.slice(0, 5).map((activity) => {
                return (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-none border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200"
                  >
                    <div className="space-y-2 flex-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <Activity className="h-3 w-3" />
                          {formatDistanceToNow(new Date(activity.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {onViewAllActivity && activities.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewAllActivity}
                  className="w-full rounded-none"
                >
                  View All Activity
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
