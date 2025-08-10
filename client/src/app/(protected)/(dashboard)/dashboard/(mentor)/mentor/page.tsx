import { MentorDashboard } from "./mentor-dashboard"
import { getMentorOverview, getMentorActivity } from "@/lib/server/mentor"

export default async function MentorDashboardPage() {
  const [overview, activity] = await Promise.all([
    getMentorOverview(),
    getMentorActivity(50),
  ])

  const overviewData = {
    my_courses: overview.course_performance.length,
    total_students: overview.overview.total_students,
    total_enrollments: overview.overview.enrollments_last_30d,
    total_revenue: 0,
    monthly_revenue: 0,
    course_completion_rate: overview.overview.avg_completion,
    average_rating: 0,
  }

  const coursePerformance = overview.course_performance.map(cp => ({
    course_id: cp.course_id,
    title: cp.title,
    enrolled_count: cp.enrolled_count,
    completion_rate: cp.avg_completion,
    average_rating: 0,
    total_revenue: 0,
    status: cp.status,
    created_at: cp.created_at,
    last_updated: cp.last_updated,
  }))

  const studentEngagement = {
    active_students: Math.round(overview.overview.total_students * 0.7),
    new_enrollments_this_month: overview.overview.enrollments_last_30d,
    completion_trends: overview.overview.monthly_enrollments.map(m => ({ month: m.month, completions: m.count })),
    engagement_rate: Math.min(1, (overview.overview.avg_completion || 0) / 100),
  }

  const revenueAnalytics = { total_revenue: 0, monthly_revenue: 0, revenue_by_course: [], revenue_trends: [] }

  return (
    <MentorDashboard
      overviewData={overviewData}
      coursePerformance={coursePerformance}
      studentEngagement={studentEngagement}
      revenueAnalytics={revenueAnalytics}
      recentActivity={activity.activities.map((a, i) => ({ id: String(i), ...a }))}
      isLoading={false}
    />
  )
}