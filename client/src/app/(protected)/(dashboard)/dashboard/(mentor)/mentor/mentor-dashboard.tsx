"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import {
  MentorOverviewStats,
  MyCoursesSection,
  StudentEngagementSection,
  RevenueAnalyticsSection,
  MentorRecentActivity,
} from "./_components"
import type {
  CoursePerformance,
  MentorOverviewData,
  StudentEngagement,
  RevenueAnalytics,
  MentorActivity,
} from "./_components/types"

interface MentorDashboardProps {
  userId?: number
  overviewData?: MentorOverviewData
  coursePerformance?: CoursePerformance[]
  studentEngagement?: StudentEngagement
  revenueAnalytics?: RevenueAnalytics
  recentActivity?: MentorActivity[]
  isLoading?: boolean
}

export function MentorDashboard({
  overviewData,
  coursePerformance,
  studentEngagement,
  revenueAnalytics,
  recentActivity,
  isLoading = false,
}: MentorDashboardProps) {
  const router = useRouter()

  const handleCreateCourse = () => {
    router.push('/dashboard/mentor/courses/create')
  }

  const handleViewCourse = (courseId: number) => {
    router.push(`/dashboard/mentor/courses/${courseId}`)
  }

  const handleEditCourse = (courseId: number) => {
    router.push(`/dashboard/mentor/courses/${courseId}/edit`)
  }

  return (
    <div className="space-y-6">
      <MentorOverviewStats data={overviewData} isLoading={isLoading} />

      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <MyCoursesSection
            courses={coursePerformance || []}
            isLoading={isLoading}
            onCreateCourse={handleCreateCourse}
            onViewCourse={handleViewCourse}
            onEditCourse={handleEditCourse}
          />
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <StudentEngagementSection data={studentEngagement} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <RevenueAnalyticsSection data={revenueAnalytics} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <MentorRecentActivity activities={recentActivity || []} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
