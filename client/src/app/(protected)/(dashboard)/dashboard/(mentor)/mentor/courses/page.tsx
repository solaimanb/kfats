"use client";

import { useEffect, useState } from "react";
import { MentorsAPI, type MentorOverviewResponse } from "@/lib/api/mentors";
import {
  CoursesHeader,
  CoursesStats,
  CoursesSectionHeader,
  CoursesTable,
  CoursesEmptyState,
} from "./_components";

export default function MentorCoursesPage() {
  const [courses, setCourses] = useState<
    MentorOverviewResponse["course_performance"]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const overview = await MentorsAPI.getMentorOverview();
        setCourses(overview.course_performance);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <CoursesHeader />
        <CoursesStats courses={courses} loading={loading} />
        <CoursesSectionHeader courses={courses} loading={loading} />

        {courses.length === 0 && !loading ? (
          <CoursesEmptyState />
        ) : (
          <CoursesTable courses={courses} loading={loading} />
        )}
      </div>
    </div>
  );
}
