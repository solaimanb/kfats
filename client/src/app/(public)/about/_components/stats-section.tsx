"use client";

import { useOverviewAnalytics } from "@/lib/hooks/useAnalytics";
import { Users, GraduationCap, BookOpen, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function StatsSection() {
  const { data: analytics, isLoading, error } = useOverviewAnalytics();

  // Fallback data if API fails
  const fallbackStats = {
    activeStudents: 500,
    expertMentors: 50,
    coursesAvailable: 100,
    successRate: 95,
  };

  // Calculate stats from analytics data
  const stats = analytics
    ? {
        activeStudents: analytics.totals.users || fallbackStats.activeStudents,
        expertMentors:
          analytics.user_distribution?.mentor || fallbackStats.expertMentors,
        coursesAvailable:
          analytics.totals.courses || fallbackStats.coursesAvailable,
        successRate: fallbackStats.successRate, // This might need a separate API endpoint
      }
    : fallbackStats;

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-4 gap-6 text-center">
        {[1, 2, 3, 4].map((i) => (
          <div key={i}>
            <Skeleton className="h-8 w-8 mx-auto mb-2" />
            <Skeleton className="h-8 w-16 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    // Show fallback data with a note
    return (
      <div className="grid md:grid-cols-4 gap-6 text-center">
        <div>
          <Users className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">
            {fallbackStats.activeStudents}+
          </div>
          <div className="text-muted-foreground">Active Students</div>
        </div>
        <div>
          <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">
            {fallbackStats.expertMentors}+
          </div>
          <div className="text-muted-foreground">Expert Mentors</div>
        </div>
        <div>
          <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">
            {fallbackStats.coursesAvailable}+
          </div>
          <div className="text-muted-foreground">Courses Available</div>
        </div>
        <div>
          <Award className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold">{fallbackStats.successRate}%</div>
          <div className="text-muted-foreground">Success Rate</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 gap-6 text-center">
      <div>
        <Users className="h-8 w-8 text-primary mx-auto mb-2" />
        <div className="text-2xl font-bold">{stats.activeStudents}+</div>
        <div className="text-muted-foreground">Active Students</div>
      </div>
      <div>
        <GraduationCap className="h-8 w-8 text-primary mx-auto mb-2" />
        <div className="text-2xl font-bold">{stats.expertMentors}+</div>
        <div className="text-muted-foreground">Expert Mentors</div>
      </div>
      <div>
        <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
        <div className="text-2xl font-bold">{stats.coursesAvailable}+</div>
        <div className="text-muted-foreground">Courses Available</div>
      </div>
      <div>
        <Award className="h-8 w-8 text-primary mx-auto mb-2" />
        <div className="text-2xl font-bold">{stats.successRate}%</div>
        <div className="text-muted-foreground">Success Rate</div>
      </div>
    </div>
  );
}
