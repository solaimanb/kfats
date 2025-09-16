import Link from "next/link";
import { notFound } from "next/navigation";
import { getMentorOverview } from "@/lib/server/mentor";
import { CoursesAPI } from "@/lib/api/courses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Edit,
  ArrowLeft,
  Calendar,
  Clock,
  BarChart3,
  Eye,
  Play,
  FileText,
} from "lucide-react";
import { getStatusBadgeClass, formatPercentage } from "../../_components/utils";
import { unstable_noStore } from "next/cache";

export const revalidate = 0;

export default async function MentorCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  unstable_noStore();

  const { id } = await params;
  const courseId = parseInt(id);

  // Get fresh course data directly from API
  const course = await CoursesAPI.getCourseById(courseId);

  const overview = await getMentorOverview();
  const overviewCourse = overview.course_performance.find(
    (c) => c.course_id === course.id
  );

  if (!course) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-6 max-w-6xl">
        {/* Header Section */}
        <div className="mb-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2">
              <Link
                href="/dashboard/mentor/courses"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Courses</span>
              </Link>
            </Button>
          </div>
          {/* Title and Status */}
          <div className="mb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">
                {course.title}
              </h1>
              <Badge
                className={`${getStatusBadgeClass(
                  course.status
                )} text-xs px-2 py-0.5`}
              >
                {course.status}
              </Badge>
            </div>
          </div>
          {/* Subtitle and Actions */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">Course Management Dashboard</p>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href={`/dashboard/mentor/courses/${courseId}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Course
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href={`/courses/${courseId}`}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Public
                </Link>
              </Button>
            </div>
          </div>{" "}
          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-gray-50 rounded-sm p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {overviewCourse?.enrolled_count || course.enrolled_count}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Students
              </div>
            </div>
            <div className="bg-gray-50 rounded-sm p-4 text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatPercentage(overviewCourse?.avg_completion || 0)}
              </div>
              <div className="text-xs text-gray-500 uppercase tracking-wide">
                Completion
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Overview */}
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="text-lg">Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <FileText className="h-8 w-8 mx-auto mb-2" />
                  </div>
                  <p className="text-sm text-gray-500">
                    Course content details
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Content information will be displayed here
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm border-t pt-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Created {new Date(course.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      Updated {new Date(course.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">
                      {overviewCourse?.enrolled_count || course.enrolled_count}{" "}
                      enrolled
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  </div>
                  <p className="text-sm text-gray-500">No recent activity</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Activity data will appear here when available
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Preview Course
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Curriculum
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Manage Students
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  size="sm"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Course Settings */}
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="text-lg">Course Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Visibility</span>
                    <Badge variant="outline" className="text-xs">
                      {course.status === "published" ? "Public" : "Private"}
                    </Badge>
                  </div>

                  <div className="text-center py-4 border-t">
                    <p className="text-xs text-gray-400">
                      Additional settings will be available here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance */}
            <Card className="rounded-sm">
              <CardHeader>
                <CardTitle className="text-lg">Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                  </div>
                  <p className="text-sm text-gray-500">Performance metrics</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Analytics data will appear here when available
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
