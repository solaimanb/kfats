"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Clock,
  Users,
  Star,
  BookOpen,
  Play,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { CourseCard } from "@/components/common/cards/course-card";
import { useCourseByIdOrSlug, useCourses } from "@/lib/hooks/useCourses";
import { CourseLevel } from "@/lib/types/api";
import { useAuth, useRoleAccess } from "@/providers/auth-provider";
import { useStudentEnrollments } from "@/lib/hooks/useCourses";

export default function CourseDetailsPage() {
  const params = useParams();
  const courseParam = params.id as string;
  const { isAuthenticated } = useAuth();
  const { isStudent } = useRoleAccess();
  const { data: enrollments } = useStudentEnrollments();

  // Use React Query for course details with caching
  const {
    data: course,
    isLoading,
    error,
  } = useCourseByIdOrSlug(courseParam);

  // Use React Query for related courses
  const { data: relatedCoursesResponse } = useCourses({
    page: 1,
    size: 4,
  });

  // Compute enrollment status from enrollments data
  const isEnrolled = isAuthenticated && enrollments
    ? enrollments.items.some(enrollment => enrollment.course_id === course?.id)
    : false;

  // Filter related courses (exclude current course and match level)
  const relatedCourses = relatedCoursesResponse?.items.filter(
    (c) => c.id !== course?.id && c.level === course?.level
  ).slice(0, 3) || [];

  const getLevelColor = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return "bg-green-100 text-green-800 border-green-200";
      case CourseLevel.INTERMEDIATE:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case CourseLevel.ADVANCED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price.toFixed(2)}`;
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return "Self-paced";
    if (hours >= 1) {
      return `${hours}h`;
    }
    return `${Math.round(hours * 60)}m`;
  };

  if (isLoading) {
    return <CourseDetailsSkeleton />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Course Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error?.message || "The course you're looking for doesn't exist or has been removed."}
          </p>
          <Button asChild>
            <Link href="/courses">Browse All Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-0">
            <Link href="/courses" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Course Info */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Badge className={getLevelColor(course.level)}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30"
                >
                  {course.status}
                </Badge>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                {course.title}
              </h1>

              <p className="text-xl text-blue-100 leading-relaxed">
                {course.short_description ||
                  course.description.substring(0, 200) + "..."}
              </p>

              {/* Course Stats */}
              <div className="flex flex-wrap items-center gap-6 text-blue-100">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{formatDuration(course.duration_hours)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{course.enrolled_count} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  <span>4.8 (120 reviews)</span>
                </div>
              </div>

              {/* Price and CTA */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-3xl font-bold">
                  {formatPrice(course.price)}
                </div>
                {isAuthenticated && isStudent ? (
                  <Button
                    size="lg"
                    className={`px-8 ${
                      isEnrolled
                        ? "bg-green-600 hover:bg-green-700 cursor-not-allowed"
                        : "bg-white text-blue-600 hover:bg-blue-50"
                    }`}
                    disabled={isEnrolled}
                    asChild={!isEnrolled}
                  >
                    {isEnrolled ? (
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Enrolled
                      </span>
                    ) : (
                      <Link href={`/courses/${course.id}/enroll`}>Enroll Now</Link>
                    )}
                  </Button>
                ) : isAuthenticated && !isStudent ? (
                  <Button
                    size="lg"
                    className="bg-gray-500 hover:bg-gray-600 text-white px-8 cursor-not-allowed"
                    disabled
                  >
                    Enrollment Not Available
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-blue-50 px-8"
                    asChild
                  >
                    <Link href={`/login?redirect=/courses/${course.id}`}>Sign In to Enroll</Link>
                  </Button>
                )}
              </div>
            </div>

            {/* Course Image */}
            <div className="relative">
              <div className="aspect-video relative overflow-hidden rounded-lg shadow-2xl">
                {course.thumbnail_url ? (
                  <Image
                    src={course.thumbnail_url}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <BookOpen className="h-24 w-24 text-white/80" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white/90 text-gray-900 hover:bg-white"
                  >
                    <Play className="h-5 w-5 mr-2" />
                    Preview Course
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Course Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">
                  What You&apos;ll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.description ? (
                    course.description
                      .split("\n")
                      .filter((item) => item.trim())
                      .slice(0, 6)
                      .map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{item.trim()}</span>
                        </div>
                      ))
                  ) : (
                    <div className="col-span-2 text-center text-gray-500 py-8">
                      --
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center text-gray-500 py-8">--</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Course Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Level</span>
                  <Badge className={getLevelColor(course.level)}>
                    {course.level.charAt(0).toUpperCase() +
                      course.level.slice(1)}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium">
                    {formatDuration(course.duration_hours)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Students</span>
                  <span className="font-medium">{course.enrolled_count}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Price</span>
                  <span className="font-medium text-green-600">
                    {formatPrice(course.price)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">
                    {new Date(course.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card>
              <CardHeader>
                <CardTitle>Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-white font-bold text-xl">
                      {course.mentor_id}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Expert Instructor
                    </h4>
                    <p className="text-sm text-gray-600">
                      Mentor ID: {course.mentor_id}
                    </p>
                  </div>
                  <div className="flex justify-center gap-4 text-sm text-gray-600">
                    <div className="text-center">
                      <div className="font-semibold">--</div>
                      <div>Courses</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">--</div>
                      <div>Students</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">--</div>
                      <div>Rating</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Enroll CTA */}
            {isAuthenticated && isStudent ? (
              <Card className={`${
                isEnrolled
                  ? "bg-gradient-to-r from-green-600 to-green-700"
                  : "bg-gradient-to-r from-blue-600 to-blue-700"
              } text-white`}>
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">
                    {isEnrolled ? "You're Enrolled!" : "Ready to Start Learning?"}
                  </h3>
                  <p className="text-blue-100 mb-6">
                    {isEnrolled
                      ? "You have access to all course materials. Start learning now!"
                      : `Join ${course.enrolled_count} students already learning this course`
                    }
                  </p>
                  <Button
                    size="lg"
                    className={`w-full ${
                      isEnrolled
                        ? "bg-green-600 hover:bg-green-700 text-white cursor-not-allowed"
                        : "bg-white text-blue-600 hover:bg-blue-50"
                    }`}
                    disabled={isEnrolled}
                    asChild={!isEnrolled}
                  >
                    {isEnrolled ? (
                      <span className="flex items-center justify-center gap-2">
                        <CheckCircle className="h-5 w-5" />
                        Enrolled
                      </span>
                    ) : (
                      <Link href={`/courses/${course.id}/enroll`}>
                        Enroll for {formatPrice(course.price)}
                      </Link>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ) : isAuthenticated && !isStudent ? (
              <Card className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">
                    Enrollment Not Available
                  </h3>
                  <p className="text-gray-200 mb-6">
                    Only students can enroll in courses. Please contact support if you need to upgrade your account.
                  </p>
                  <Button
                    size="lg"
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white cursor-not-allowed"
                    disabled
                  >
                    Not Available for Your Role
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gradient-to-r from-gray-600 to-gray-700 text-white">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-2">
                    Sign In to Enroll
                  </h3>
                  <p className="text-gray-200 mb-6">
                    Create an account or sign in to access this course
                  </p>
                  <div className="space-y-3">
                    <Button
                      size="lg"
                      className="w-full bg-white text-gray-700 hover:bg-gray-50"
                      asChild
                    >
                      <Link href={`/login?redirect=/courses/${course.id}`}>Sign In</Link>
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full border-white text-white hover:bg-white hover:text-gray-700"
                      asChild
                    >
                      <Link href={`/signup?redirect=/courses/${course.id}`}>Create Account</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Related Courses
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((relatedCourse) => (
                <CourseCard key={relatedCourse.id} course={relatedCourse} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <div className="flex gap-6">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <div className="flex gap-4">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
            <Skeleton className="aspect-video w-full rounded-lg" />
          </div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
