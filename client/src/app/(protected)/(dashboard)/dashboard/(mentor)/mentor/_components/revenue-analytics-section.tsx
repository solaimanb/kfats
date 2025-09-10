"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp } from "lucide-react";
import { formatCurrency } from "./utils";
import type { RevenueAnalytics } from "./types";

interface RevenueAnalyticsSectionProps {
  data: RevenueAnalytics | undefined;
  isLoading: boolean;
}

export function RevenueAnalyticsSection({
  data,
  isLoading,
}: RevenueAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i} className="rounded-none">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex justify-between items-center">
                    <div className="h-4 bg-muted rounded w-20" />
                    <div className="h-6 bg-muted rounded w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Revenue Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Revenue</span>
              <Badge variant="outline" className="text-base font-semibold">
                {formatCurrency(data?.total_revenue || 0)}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">This Month</span>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                {formatCurrency(data?.monthly_revenue || 0)}
              </Badge>
            </div>

            {data?.revenue_trends && data.revenue_trends.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Revenue Trends</span>
                </div>
                <div className="space-y-2">
                  {data.revenue_trends.slice(-3).map((trend, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center text-sm"
                    >
                      <span className="text-muted-foreground">
                        {trend.month}
                      </span>
                      <span className="font-medium">
                        {formatCurrency(trend.revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Earning Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data?.revenue_by_course && data.revenue_by_course.length > 0 ? (
            <div className="space-y-3">
              {data.revenue_by_course.slice(0, 5).map((course, index) => (
                <div
                  key={course.course_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium truncate max-w-32">
                      {course.title}
                    </span>
                  </div>
                  <Badge variant="outline">
                    {formatCurrency(course.revenue)}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No revenue data yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
