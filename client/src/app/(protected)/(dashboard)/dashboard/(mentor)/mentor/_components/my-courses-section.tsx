"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Plus,
  Eye,
  Edit,
  TrendingUp,
  ArrowRight,
  Users,
  Star,
} from "lucide-react";
import { getStatusBadgeClass, formatPercentage } from "./utils";
import type { CoursePerformance } from "./types";

interface MyCoursesSectionProps {
  courses: CoursePerformance[];
  isLoading: boolean;
  onCreateCourse?: () => void;
  onViewCourse?: (courseId: number) => void;
  onEditCourse?: (courseId: number) => void;
  onViewAllCourses?: () => void;
}

export function MyCoursesSection({
  courses,
  isLoading,
  onCreateCourse,
  onViewCourse,
  onEditCourse,
  onViewAllCourses,
}: MyCoursesSectionProps) {
  if (isLoading) {
    return (
      <Card className="rounded-none">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 bg-muted rounded w-32 animate-pulse" />
            <div className="h-9 bg-muted rounded w-28 animate-pulse" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-3 bg-muted rounded animate-pulse"
              >
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
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm rounded-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between text-lg">
          <span className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            My Courses
          </span>
          <Button
            size="sm"
            onClick={onCreateCourse}
            className="bg-blue-600 hover:bg-blue-700 rounded-none"
          >
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
            <Button onClick={onCreateCourse} className="rounded-none">
              Create Your First Course
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {courses.slice(0, 5).map((course) => (
                <div
                  key={course.course_id}
                  className="flex justify-between items-center p-5 border border-slate-200 dark:border-slate-700 rounded-none hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-md transition-all duration-200"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                        {course.title}
                      </h4>
                      <Badge
                        className={`${getStatusBadgeClass(
                          course.status
                        )} font-medium`}
                      >
                        {course.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {course.enrolled_count} students
                      </span>
                      <span className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        {formatPercentage(course.completion_rate)} completion
                      </span>
                      <span className="flex items-center gap-2">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.average_rating?.toFixed(1) || "0.0"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewCourse?.(course.course_id)}
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-none"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditCourse?.(course.course_id)}
                      className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-none"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {onViewAllCourses && courses.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewAllCourses}
                  className="w-full rounded-none"
                >
                  View All Courses
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
