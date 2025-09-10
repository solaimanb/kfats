"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Users,
  TrendingUp,
  Eye,
  Edit,
  Plus,
  Star,
  Clock,
  Filter,
  Search,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/common/data-table";
import { ColumnDef } from "@tanstack/react-table";

import { MentorsAPI, type MentorOverviewResponse } from "@/lib/api/mentors";
import { getStatusBadgeClass, formatPercentage } from "../_components/utils";

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

  // Define table columns
  const columns: ColumnDef<MentorOverviewResponse["course_performance"][0]>[] =
    [
      {
        accessorKey: "title",
        header: "Course",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center">
              <div className="flex-shrink-0 h-10 w-10">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900 line-clamp-1 max-w-xs">
                  {course.title}
                </div>
                <div className="text-sm text-gray-500">
                  ID: {course.course_id}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <Badge
              className={`${getStatusBadgeClass(
                course.status
              )} text-xs px-2 py-1 font-medium`}
            >
              {course.status}
            </Badge>
          );
        },
      },
      {
        accessorKey: "enrolled_count",
        header: "Students",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center">
              <Users className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">
                {course.enrolled_count}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "avg_completion",
        header: "Completion",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-gray-400 mr-2" />
              <span className="text-sm font-medium text-gray-900">
                {formatPercentage(course.avg_completion)}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="h-4 w-4 text-gray-400 mr-2" />
              {new Date(course.created_at).toLocaleDateString()}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center space-x-2">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="rounded-sm hover:bg-blue-50 hover:text-blue-600"
              >
                <Link
                  href={`/dashboard/mentor/courses/${course.course_id}`}
                  className="flex items-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-sm bg-blue-600 hover:bg-blue-700"
              >
                <Link
                  href={`/dashboard/mentor/courses/${course.course_id}/edit`}
                  className="flex items-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Link>
              </Button>
            </div>
          );
        },
      },
    ];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                My Courses
              </h1>
              <p className="text-lg text-gray-600">
                Manage your courses and track student progress
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="rounded-sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="rounded-sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
              <Button
                asChild
                className="rounded-sm bg-blue-600 hover:bg-blue-700"
              >
                <Link href="/dashboard/mentor/courses/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Course
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-sm border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 mb-1">
                    Total Courses
                  </p>
                  <p className="text-3xl font-bold text-blue-900">
                    {courses.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700 mb-1">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-green-900">
                    {courses.reduce(
                      (sum: number, course) => sum + course.enrolled_count,
                      0
                    )}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-1">
                    Avg. Completion
                  </p>
                  <p className="text-3xl font-bold text-purple-900">
                    {courses.length > 0
                      ? formatPercentage(
                          courses.reduce(
                            (sum: number, course) =>
                              sum + course.avg_completion,
                            0
                          ) / courses.length
                        )
                      : "0%"}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-sm border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-700 mb-1">
                    Published
                  </p>
                  <p className="text-3xl font-bold text-emerald-900">
                    {
                      courses.filter((course) => course.status === "published")
                        .length
                    }
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <Star className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Course Library
          </h2>
          <p className="text-gray-600">
            {courses.length > 0
              ? `Showing ${courses.length} course${
                  courses.length !== 1 ? "s" : ""
                }`
              : "No courses created yet"}
          </p>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <Card className="rounded-sm border-0 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Loading courses...</p>
            </CardContent>
          </Card>
        ) : courses.length === 0 ? (
          <Card className="rounded-sm border-2 border-dashed border-gray-300 bg-gray-50/50">
            <CardContent className="p-12 text-center">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <BookOpen className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                No courses yet
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Start your teaching journey by creating your first course. Share
                your knowledge and help students learn something new.
              </p>
              <Button
                asChild
                size="lg"
                className="rounded-sm bg-blue-600 hover:bg-blue-700"
              >
                <Link href="/dashboard/mentor/courses/create">
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Course
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DataTable
            columns={columns}
            data={courses}
            pageSize={10}
            showPagination={true}
            className="rounded-sm border-0 shadow-sm"
          />
        )}
      </div>
    </div>
  );
}
