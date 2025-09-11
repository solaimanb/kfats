"use client";

import Link from "next/link";
import { BookOpen, Users, Eye, Edit, Clock, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/components/common/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { getStatusBadgeClass, formatPercentage } from "../../_components/utils";
import type { MentorOverviewResponse } from "@/lib/api/mentors";

interface CoursesTableProps {
  courses: MentorOverviewResponse["course_performance"];
  loading: boolean;
}

export function CoursesTable({ courses, loading }: CoursesTableProps) {
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

  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-12">Course</TableHead>
              <TableHead className="h-12">Status</TableHead>
              <TableHead className="h-12">Students</TableHead>
              <TableHead className="h-12">Completion</TableHead>
              <TableHead className="h-12">Created</TableHead>
              <TableHead className="h-12">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i} className="h-12">
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-12" />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {/* Pagination Skeleton */}
        <div className="flex items-center justify-between px-2 py-4 border-t">
          <Skeleton className="h-4 w-32" />
          <div className="flex items-center space-x-6 lg:space-x-8">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-4 w-24" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return null; // Let the parent handle empty state
  }

  return (
    <DataTable
      columns={columns}
      data={courses}
      pageSize={10}
      showPagination={true}
      className="rounded-sm border-0 shadow-sm"
    />
  );
}
