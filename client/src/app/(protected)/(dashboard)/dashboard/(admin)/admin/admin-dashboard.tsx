"use client";

import {
  useOverviewAnalytics,
  useUserAnalytics,
  useActivityData,
  useCourseAnalytics,
  useArticleAnalytics,
  useProductAnalytics,
} from "@/lib/hooks/useAnalytics";
import {
  OverviewStats,
  UserAnalyticsSection,
  DetailedUserAnalytics,
  RecentActivity,
  RoleApplicationsSection,
  CourseAnalyticsSection,
  ContentAnalyticsSection,
} from "./_components";

interface AdminDashboardProps {
  userId?: number;
}

export function AdminDashboard({}: AdminDashboardProps) {
  const { data: overviewData, isLoading: overviewLoading } =
    useOverviewAnalytics();
  const { data: userAnalytics, isLoading: userAnalyticsLoading } =
    useUserAnalytics();
  const { data: activityData, isLoading: activityLoading } = useActivityData();
  const { data: courseAnalytics, isLoading: courseAnalyticsLoading } =
    useCourseAnalytics();
  const { data: articleAnalytics, isLoading: articleAnalyticsLoading } =
    useArticleAnalytics();
  const { data: productAnalytics, isLoading: productAnalyticsLoading } =
    useProductAnalytics();

  const contentAnalytics = {
    articles: articleAnalytics,
    products: productAnalytics,
  };
  const contentAnalyticsLoading =
    articleAnalyticsLoading || productAnalyticsLoading;

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <OverviewStats data={overviewData} isLoading={overviewLoading} />

      {/* User Management Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <UserAnalyticsSection
            userAnalytics={userAnalytics}
            overviewData={overviewData}
            isLoading={userAnalyticsLoading}
          />
          <RoleApplicationsSection applications={[]} isLoading={false} />
        </div>

        <DetailedUserAnalytics
          userAnalytics={userAnalytics}
          isLoading={userAnalyticsLoading}
        />
      </section>

      {/* Platform Activity Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-bold tracking-tight">
            Platform Activity
          </h2>
        </div>

        <RecentActivity data={activityData} isLoading={activityLoading} />
      </section>

      {/* Content Management Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 bg-primary rounded-full"></div>
          <h2 className="text-2xl font-bold tracking-tight">
            Content Management
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CourseAnalyticsSection
            data={courseAnalytics}
            isLoading={courseAnalyticsLoading}
          />
          <ContentAnalyticsSection
            data={contentAnalytics}
            isLoading={contentAnalyticsLoading}
          />
        </div>
      </section>
    </div>
  );
}
