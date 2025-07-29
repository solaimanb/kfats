"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useCourses } from "@/lib/hooks/useCourses"
import { BookOpen, TrendingUp, Award } from "lucide-react"

interface StudentDashboardProps {
  userId?: number // Optional since we're not using it yet
}

export function StudentDashboard({}: StudentDashboardProps) {
  const { data: courses, isLoading } = useCourses({ size: 5 })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Available Courses
          </CardTitle>
          <CardDescription>
            Explore courses to enhance your skills
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading courses...</p>
          ) : courses?.items?.length ? (
            <div className="space-y-3">
              {courses.items.slice(0, 3).map((course) => (
                <div key={course.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{course.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {course.level} • ${course.price}
                    </p>
                  </div>
                  <Button size="sm">Enroll</Button>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                View All Courses
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No courses available</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Enrolled Courses</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>In Progress</span>
                <span className="font-medium">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Complete your first course to unlock achievements!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
