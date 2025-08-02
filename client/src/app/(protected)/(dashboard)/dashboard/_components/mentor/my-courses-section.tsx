"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, Plus, Eye, Edit, TrendingUp } from "lucide-react"
import { getStatusBadgeClass, formatPercentage } from "./utils"
import type { CoursePerformance } from "./types"

interface MyCoursesSectionProps {
  courses: CoursePerformance[]
  isLoading: boolean
  onCreateCourse?: () => void
  onViewCourse?: (courseId: number) => void
  onEditCourse?: (courseId: number) => void
}

export function MyCoursesSection({ 
  courses, 
  isLoading, 
  onCreateCourse, 
  onViewCourse, 
  onEditCourse 
}: MyCoursesSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            <div className="h-9 bg-muted rounded w-28 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-muted rounded animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-muted-foreground/20 rounded w-40" />
                  <div className="h-3 bg-muted-foreground/20 rounded w-32" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-muted-foreground/20 rounded w-8" />
                  <div className="h-8 bg-muted-foreground/20 rounded w-8" />
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
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Courses
          </span>
          <Button size="sm" onClick={onCreateCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              You haven&apos;t created any courses yet
            </p>
            <Button onClick={onCreateCourse}>Create Your First Course</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div 
                key={course.course_id} 
                className="flex justify-between items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{course.title}</h4>
                    <Badge className={getStatusBadgeClass(course.status)}>
                      {course.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {course.enrolled_count} students
                    </span>
                    <span>
                      {formatPercentage(course.completion_rate)} completion
                    </span>
                    <span>
                      ⭐ {course.average_rating?.toFixed(1) || "0.0"}
                    </span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onViewCourse?.(course.course_id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onEditCourse?.(course.course_id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
