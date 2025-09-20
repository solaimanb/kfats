"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, TrendingUp, UserCheck, ArrowRight } from "lucide-react";
import type { StudentEngagement } from "./types";

interface StudentEngagementSectionProps {
  data: StudentEngagement | undefined;
  isLoading: boolean;
  onViewAllStudents?: () => void;
}

export function StudentEngagementSection({
  data,
  isLoading,
  onViewAllStudents,
}: StudentEngagementSectionProps) {
  if (isLoading) {
    return (
      <Card className="rounded-none">
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-lg">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
          Student Engagement
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          <div className="flex justify-between items-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-none border border-blue-200 dark:border-blue-800">
            <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Active Students
            </span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-700 text-lg px-3 py-1">
              {data?.active_students || 0}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-4 bg-green-50 dark:bg-green-950/20 rounded-none border border-green-200 dark:border-green-800">
            <span className="text-sm font-medium text-green-900 dark:text-green-100">
              New Enrollments (This Month)
            </span>
            <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-200 dark:border-green-700 text-lg px-3 py-1">
              +{data?.new_enrollments_this_month || 0}
            </Badge>
          </div>

          <div className="flex justify-between items-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-none border border-purple-200 dark:border-purple-800">
            <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
              Engagement Rate
            </span>
            <Badge
              variant="outline"
              className="border-purple-300 dark:border-purple-600 text-purple-700 dark:text-purple-300 text-lg px-3 py-1"
            >
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
                  <div
                    key={index}
                    className="flex justify-between items-center text-sm"
                  >
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

          {onViewAllStudents && (
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={onViewAllStudents}
                className="w-full rounded-none"
              >
                View All Students
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
