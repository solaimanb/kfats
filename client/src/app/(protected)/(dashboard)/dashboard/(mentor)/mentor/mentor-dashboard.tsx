"use client";

import { useRouter } from "next/navigation";
import {
  MentorOverviewStats,
  MyCoursesSection,
  StudentEngagementSection,
  RevenueAnalyticsSection,
  MentorRecentActivity,
} from "./_components";
import type {
  CoursePerformance,
  MentorOverviewData,
  StudentEngagement,
  RevenueAnalytics,
  MentorActivity,
} from "./_components/types";

interface MentorDashboardProps {
  userId?: number;
  overviewData?: MentorOverviewData;
  coursePerformance?: CoursePerformance[];
  studentEngagement?: StudentEngagement;
  revenueAnalytics?: RevenueAnalytics;
  recentActivity?: MentorActivity[];
  isLoading?: boolean;
  error?: string | null;
}

export function MentorDashboard({
  overviewData,
  coursePerformance,
  studentEngagement,
  revenueAnalytics,
  recentActivity,
  isLoading = false,
  error,
}: MentorDashboardProps) {
  const router = useRouter();

  const handleCreateCourse = () => {
    router.push("/dashboard/mentor/courses/create");
  };

  const handleViewCourse = (courseId: number) => {
    router.push(`/dashboard/mentor/courses/${courseId}`);
  };

  const handleEditCourse = (courseId: number) => {
    router.push(`/dashboard/mentor/courses/${courseId}/edit`);
  };

  const handleViewAllCourses = () => {
    router.push("/dashboard/mentor/courses");
  };

  const handleViewAllStudents = () => {
    router.push("/dashboard/mentor/students");
  };

  const handleViewAllActivity = () => {
    // For now, this could navigate to a dedicated activity page or just scroll to activity section
    // Since we don't have a dedicated activity page, we'll just keep it as a placeholder
    console.log("View all activity clicked");
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 space-y-8">
        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error Loading Dashboard
                </h3>
                <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                  {error}
                </div>
              </div>
            </div>
          </div>
        )}

        <MentorOverviewStats data={overviewData} isLoading={isLoading} />

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            <MyCoursesSection
              courses={coursePerformance || []}
              isLoading={isLoading}
              onCreateCourse={handleCreateCourse}
              onViewCourse={handleViewCourse}
              onEditCourse={handleEditCourse}
              onViewAllCourses={handleViewAllCourses}
            />

            <RevenueAnalyticsSection
              data={revenueAnalytics}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-4 space-y-6">
            <StudentEngagementSection
              data={studentEngagement}
              isLoading={isLoading}
              onViewAllStudents={handleViewAllStudents}
            />

            <MentorRecentActivity
              activities={recentActivity || []}
              isLoading={isLoading}
              onViewAllActivity={handleViewAllActivity}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
