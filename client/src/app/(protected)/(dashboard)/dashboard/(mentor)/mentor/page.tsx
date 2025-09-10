import { MentorDashboard } from "./mentor-dashboard";
import { getMentorOverview, getMentorActivity } from "@/lib/server/mentor";
import type { CoursePerformance, MentorActivity } from "./_components/types";
import { unstable_noStore } from "next/cache";

export const revalidate = 0;

export default async function MentorDashboardPage() {
  unstable_noStore();
  let overviewData = null;
  let coursePerformance: CoursePerformance[] = [];
  let studentEngagement = null;
  let revenueAnalytics = null;
  let recentActivity: MentorActivity[] = [];
  let isLoading = true;
  let error: string | null = null;

  try {
    const [overview, activity] = await Promise.all([
      getMentorOverview(),
      getMentorActivity(50),
    ]);

    overviewData = {
      my_courses: overview.course_performance.length,
      total_students: overview.overview.total_students,
      total_enrollments: overview.overview.enrollments_last_30d,
      total_revenue: 0,
      monthly_revenue: 0,
      course_completion_rate: overview.overview.avg_completion,
      average_rating: 0,
    };

    coursePerformance = overview.course_performance.map(
      (cp: {
        course_id: number;
        title: string;
        enrolled_count: number;
        avg_completion: number;
        status: string;
        created_at: string;
        last_updated: string;
      }) => ({
        course_id: cp.course_id,
        title: cp.title,
        enrolled_count: cp.enrolled_count,
        completion_rate: cp.avg_completion,
        average_rating: 0,
        total_revenue: 0,
        status: cp.status,
        created_at: cp.created_at,
        last_updated: cp.last_updated,
      })
    );

    studentEngagement = {
      active_students: Math.round(overview.overview.total_students * 0.7),
      new_enrollments_this_month: overview.overview.enrollments_last_30d,
      completion_trends: overview.overview.monthly_enrollments.map(
        (m: { month: string; count: number }) => ({
          month: m.month,
          completions: m.count,
        })
      ),
      engagement_rate: Math.min(
        1,
        (overview.overview.avg_completion || 0) / 100
      ),
    };

    revenueAnalytics = {
      total_revenue: 0,
      monthly_revenue: 0,
      revenue_by_course: [],
      revenue_trends: [],
    };
    recentActivity = activity.activities.map(
      (
        a: {
          type: string;
          description: string;
          timestamp: string;
          course_id: number;
          course_title: string;
          user_id?: number;
          student_name?: string;
        },
        i: number
      ) => ({
        id: String(i),
        ...a,
      })
    );
    isLoading = false;
  } catch (err) {
    console.error("Failed to fetch mentor data:", err);
    const errorMessage =
      err instanceof Error
        ? err.message
        : "Failed to load dashboard data. Please try refreshing the page.";
    error = errorMessage;
    isLoading = false;

    // Provide fallback/mock data for development
    overviewData = {
      my_courses: 0,
      total_students: 0,
      total_enrollments: 0,
      total_revenue: 0,
      monthly_revenue: 0,
      course_completion_rate: 0,
      average_rating: 0,
    };

    coursePerformance = [];
    studentEngagement = {
      active_students: 0,
      new_enrollments_this_month: 0,
      completion_trends: [],
      engagement_rate: 0,
    };

    revenueAnalytics = {
      total_revenue: 0,
      monthly_revenue: 0,
      revenue_by_course: [],
      revenue_trends: [],
    };
    recentActivity = [];
  }

  return (
    <MentorDashboard
      overviewData={overviewData}
      coursePerformance={coursePerformance}
      studentEngagement={studentEngagement}
      revenueAnalytics={revenueAnalytics}
      recentActivity={recentActivity}
      isLoading={isLoading}
      error={error}
    />
  );
}
