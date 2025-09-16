"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CheckCircle,
  Users,
  BookOpen,
  CreditCard,
  Shield,
  Award,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CoursesAPI } from "@/lib/api/courses";
import { Course, CourseLevel } from "@/lib/types/api";
import { useEnrollInCourse } from "@/lib/hooks/useCourses";

export default function CourseEnrollmentPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = params.slug as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrollmentSuccess, setEnrollmentSuccess] = useState(false);

  const enrollMutation = useEnrollInCourse();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const courseData = await CoursesAPI.getCourseBySlug(courseSlug);
        setCourse(courseData);
      } catch (error) {
        console.error("Failed to fetch course details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseSlug) {
      fetchCourseDetails();
    }
  }, [courseSlug]);

  const handleEnroll = async () => {
    if (!course) return;

    try {
      await enrollMutation.mutateAsync(course.id);
      setEnrollmentSuccess(true);

      // Redirect to course page after a short delay
      setTimeout(() => {
        router.push(`/courses/${courseSlug}`);
      }, 3000);
    } catch (error) {
      console.error("Failed to enroll in course:", error);
    }
  };

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

  if (loading) {
    return <EnrollmentPageSkeleton />;
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Course Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The course you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Button asChild>
            <Link href="/courses">Browse All Courses</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (enrollmentSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Enrollment Successful!
            </h2>
            <p className="text-gray-600 mb-6">
              You have successfully enrolled in <strong>{course.title}</strong>.
              You can now access all course materials and start learning.
            </p>
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href={`/courses/${courseSlug}`}>Start Learning Now</Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/courses">Browse More Courses</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Back Navigation */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-0">
            <Link
              href={`/courses/${courseSlug}`}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Course
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Course Information */}
          <div className="space-y-6">
            {/* Course Header */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className={getLevelColor(course.level)}>
                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                </Badge>
                <Badge variant="secondary">{course.status}</Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                {course.title}
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                {course.short_description ||
                  course.description.substring(0, 200) + "..."}
              </p>
            </div>

            {/* Course Image */}
            <div className="relative aspect-video overflow-hidden rounded-lg shadow-lg">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <BookOpen className="h-16 w-16 text-white/80" />
                </div>
              )}
            </div>

            {/* Course Stats */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Users className="h-5 w-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">Students</div>
                <div className="text-sm text-gray-600">
                  {course.enrolled_count}
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  What You&apos;ll Learn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
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
                    <div className="text-center text-gray-500 py-4">
                      Course content details will be available after enrollment
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrollment Section */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  {formatPrice(course.price)}
                  {course.price > 0 && (
                    <span className="text-sm font-normal text-gray-600 block">
                      One-time payment
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Full lifetime access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      Certificate of completion
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">
                      Mobile and desktop access
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Progress tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">Community support</span>
                  </div>
                </div>

                <Separator />

                {/* Enrollment Button */}
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                  onClick={handleEnroll}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-5 w-5 mr-2" />
                      {course.price === 0
                        ? "Enroll for Free"
                        : `Enroll Now - ${formatPrice(course.price)}`}
                    </>
                  )}
                </Button>

                {/* Error Message */}
                {enrollMutation.isError && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertDescription className="text-red-800">
                      {enrollMutation.error?.message ||
                        "Failed to enroll in course. Please try again."}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center">
                  By enrolling, you agree to our Terms of Service and Privacy
                  Policy. You can cancel your enrollment within 30 days for a
                  full refund.
                </p>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="flex justify-center gap-6">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-green-600" />
                      <span className="text-sm font-medium">
                        Secure Payment
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <span className="text-sm font-medium">
                        Quality Content
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-1">
                      30-Day Money-Back Guarantee
                    </div>
                    <div>Not satisfied? Get a full refund within 30 days.</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Instructor Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {course.mentor_id}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      Expert Instructor
                    </div>
                    <div className="text-sm text-gray-600">
                      Mentor ID: {course.mentor_id}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function EnrollmentPageSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          <div className="space-y-6">
            <div className="space-y-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-32 mx-auto" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-full" />
                  ))}
                </div>
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
