"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MentorDashboardSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 space-y-8">
        {/* Overview Stats Skeleton */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="relative overflow-hidden bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-none"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-5 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            {/* My Courses Skeleton */}
            <Card className="rounded-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-9 w-28" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-700 rounded-none"
                    >
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                      <div className="flex gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Revenue Analytics Skeleton */}
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className="rounded-none">
                  <CardHeader>
                    <Skeleton className="h-6 w-32" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="flex justify-between items-center">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-6 w-16" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            {/* Student Engagement Skeleton */}
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

            {/* Recent Activity Skeleton */}
            <Card className="rounded-none">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-4"
                    >
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}