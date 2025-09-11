"use client";

import { Skeleton } from "@/components/ui/skeleton";
import type { MentorOverviewResponse } from "@/lib/api/mentors";

interface CoursesSectionHeaderProps {
  courses: MentorOverviewResponse["course_performance"];
  loading: boolean;
}

export function CoursesSectionHeader({
  courses,
  loading,
}: CoursesSectionHeaderProps) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Course Library
      </h2>
      {loading ? (
        <Skeleton className="h-4 w-48" />
      ) : (
        <p className="text-gray-600">
          {courses.length > 0
            ? `Showing ${courses.length} course${
                courses.length !== 1 ? "s" : ""
              }`
            : "No courses created yet"}
        </p>
      )}
    </div>
  );
}
