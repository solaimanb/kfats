"use client";

import { BookOpen, Users, TrendingUp, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPercentage } from "../../_components/utils";
import type { MentorOverviewResponse } from "@/lib/api/mentors";

interface CoursesStatsProps {
  courses: MentorOverviewResponse["course_performance"];
  loading: boolean;
}

export function CoursesStats({ courses, loading }: CoursesStatsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-sm border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-12 w-12 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="rounded-sm border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700 mb-1">
                Total Courses
              </p>
              <p className="text-3xl font-bold text-blue-900">
                {courses.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700 mb-1">
                Total Students
              </p>
              <p className="text-3xl font-bold text-green-900">
                {courses.reduce(
                  (sum: number, course) => sum + course.enrolled_count,
                  0
                )}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-700 mb-1">
                Avg. Completion
              </p>
              <p className="text-3xl font-bold text-purple-900">
                {courses.length > 0
                  ? formatPercentage(
                      courses.reduce(
                        (sum: number, course) => sum + course.avg_completion,
                        0
                      ) / courses.length
                    )
                  : "0%"}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-sm border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700 mb-1">
                Published
              </p>
              <p className="text-3xl font-bold text-emerald-900">
                {
                  courses.filter((course) => course.status === "published")
                    .length
                }
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Star className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
