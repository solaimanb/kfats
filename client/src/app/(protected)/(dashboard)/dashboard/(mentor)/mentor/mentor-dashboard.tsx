"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMentorCourses } from "@/lib/hooks/useCourses"
import { useRouter } from "next/navigation"
import {
  MentorOverviewStats,
  MyCoursesSection,
  StudentEngagementSection,
  RevenueAnalyticsSection,
  MentorRecentActivity,
  type CoursePerformance,
  type MentorOverviewData,
  type StudentEngagement,
  type RevenueAnalytics,
  type MentorActivity
} from "./_components"

interface MentorDashboardProps {
  userId?: number
}

export function MentorDashboard({ }: MentorDashboardProps) {
  const router = useRouter()
  const { data: myCourses, isLoading: coursesLoading } = useMentorCourses()

  const overviewData: MentorOverviewData = {
    my_courses: myCourses?.length || 0,
    total_students: myCourses?.reduce((acc, course) => acc + course.enrolled_count, 0) || 0,
    total_enrollments: myCourses?.reduce((acc, course) => acc + course.enrolled_count, 0) || 0,
    total_revenue: 0,
    monthly_revenue: 0,
    course_completion_rate: 85.5,
    average_rating: 4.6
  }

  const coursePerformance: CoursePerformance[] = myCourses?.map(course => ({
    course_id: course.id,
    title: course.title,
    enrolled_count: course.enrolled_count,
    completion_rate: 75 + Math.random() * 20,
    average_rating: 4.0 + Math.random() * 1,
    total_revenue: 0,
    status: course.status,
    created_at: course.created_at,
    last_updated: course.updated_at
  })) || []

  const studentEngagement: StudentEngagement = {
    active_students: Math.floor((overviewData.total_students || 0) * 0.7),
    new_enrollments_this_month: Math.floor((overviewData.total_students || 0) * 0.1),
    completion_trends: [
      { month: "Nov 2024", completions: 12 },
      { month: "Dec 2024", completions: 18 },
      { month: "Jan 2025", completions: 24 }
    ],
    engagement_rate: 0.78
  }

  const revenueAnalytics: RevenueAnalytics = {
    total_revenue: 0,
    monthly_revenue: 0,
    revenue_by_course: [],
    revenue_trends: []
  }

  const recentActivity: MentorActivity[] = [
    {
      id: "1",
      type: "course_created",
      description: "New course published",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      course_title: "Advanced JavaScript"
    },
    {
      id: "2",
      type: "student_enrolled",
      description: "New student enrolled in your course",
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      course_title: "React Fundamentals"
    }
  ]

  const handleCreateCourse = () => {
    router.push('/courses/create')
  }

  const handleViewCourse = (courseId: number) => {
    router.push(`/courses/${courseId}`)
  }

  const handleEditCourse = (courseId: number) => {
    router.push(`/courses/${courseId}/edit`)
  }

  return (
    <div className="space-y-6">
      <MentorOverviewStats
        data={overviewData}
        isLoading={coursesLoading}
      />

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <MyCoursesSection
            courses={coursePerformance}
            isLoading={coursesLoading}
            onCreateCourse={handleCreateCourse}
            onViewCourse={handleViewCourse}
            onEditCourse={handleEditCourse}
          />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentEngagementSection
            data={studentEngagement}
            isLoading={coursesLoading}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <RevenueAnalyticsSection
            data={revenueAnalytics}
            isLoading={false}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <MentorRecentActivity
            activities={recentActivity}
            isLoading={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
