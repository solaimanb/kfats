"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { CourseAnalytics } from "./types"

interface CourseAnalyticsSectionProps {
  data: CourseAnalytics | undefined
  isLoading: boolean
}

export function CourseAnalyticsSection({ data, isLoading }: CourseAnalyticsSectionProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          Course Analytics
        </h3>
        <div className="space-y-4">
          <Card className="rounded-xs">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <BookOpen className="h-5 w-5" />
        Course Analytics
      </h3>
      <div className="space-y-4">
        <Card className="rounded-xs">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Course Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Courses</span>
                <Badge variant="outline">
                  {data?.overview?.total_courses || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Published</span>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  {data?.overview?.published_courses || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Enrollments</span>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {data?.overview?.total_enrollments || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {data?.popular_courses && data.popular_courses.length > 0 && (
          <Card className="rounded-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Popular Courses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.popular_courses.slice(0, 3).map((course, index) => (
                  <div key={course.course_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{course.title}</h4>
                      </div>
                    </div>
                    <Badge>
                      {course.enrolled_count} enrollments
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
