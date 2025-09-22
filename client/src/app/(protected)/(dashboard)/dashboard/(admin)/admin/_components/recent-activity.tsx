"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { getActivityIcon, getActivityColor } from "./utils";
import type { ActivityData } from "./types";

interface RecentActivityProps {
  data: ActivityData | undefined;
  isLoading: boolean;
}

export function RecentActivity({ data, isLoading }: RecentActivityProps) {
  return (
    <Card className="rounded-xs">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
        ) : (
          <div className="space-y-4">
            {data?.activities.slice(0, 5).map((activity, index) => {
              const IconComponent = getActivityIcon(activity.type);

              return (
                <div key={index} className="flex items-center space-x-4">
                  <div
                    className={`p-2 rounded-full bg-muted ${getActivityColor(
                      activity.type
                    )}`}
                  >
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {activity.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}

            {(!data?.activities || data.activities.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
