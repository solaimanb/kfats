"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOverviewAnalytics, useUserAnalytics, useActivityData, useCourseAnalytics, useArticleAnalytics, useProductAnalytics } from "@/lib/hooks/useAnalytics"
// import { useRoleApplications } from "@/lib/hooks/useRoleApplications"
import {
  OverviewStats,
  UserAnalyticsSection,
  DetailedUserAnalytics,
  RecentActivity,
  RoleApplicationsSection,
  CourseAnalyticsSection,
  ContentAnalyticsSection
} from "./_components"

interface AdminDashboardProps {
  userId?: number
}

export function AdminDashboard({ }: AdminDashboardProps) {
  const { data: overviewData, isLoading: overviewLoading } = useOverviewAnalytics()
  const { data: userAnalytics, isLoading: userAnalyticsLoading } = useUserAnalytics()
  const { data: activityData, isLoading: activityLoading } = useActivityData()
  // const roleApplicationsHook = useRoleApplications()
  const { data: courseAnalytics, isLoading: courseAnalyticsLoading } = useCourseAnalytics()
  const { data: articleAnalytics, isLoading: articleAnalyticsLoading } = useArticleAnalytics()
  const { data: productAnalytics, isLoading: productAnalyticsLoading } = useProductAnalytics()

  const contentAnalytics = {
    articles: articleAnalytics,
    products: productAnalytics
  }
  const contentAnalyticsLoading = articleAnalyticsLoading || productAnalyticsLoading

  return (
    <div className="space-y-6">
      <OverviewStats
        data={overviewData}
        isLoading={overviewLoading}
      />

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <UserAnalyticsSection
              userAnalytics={userAnalytics}
              overviewData={overviewData}
              isLoading={userAnalyticsLoading}
            />
            <RoleApplicationsSection
              applications={[]}
              isLoading={false}
            />
          </div>
          <DetailedUserAnalytics
            userAnalytics={userAnalytics}
            isLoading={userAnalyticsLoading}
          />
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <RecentActivity
            data={activityData}
            isLoading={activityLoading}
          />
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          <CourseAnalyticsSection
            data={courseAnalytics}
            isLoading={courseAnalyticsLoading}
          />
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <ContentAnalyticsSection
            data={contentAnalytics}
            isLoading={contentAnalyticsLoading}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
