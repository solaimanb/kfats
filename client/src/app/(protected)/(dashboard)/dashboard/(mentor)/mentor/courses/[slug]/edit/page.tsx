"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CoursesAPI } from "@/lib/api/courses";
import type { Course, CourseLevel, CourseStatus } from "@/lib/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  DollarSign,
  Clock,
  Users,
} from "lucide-react";

export default function EditCoursePage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    short_description: "",
    level: "beginner" as CourseLevel,
    price: 0,
    duration_hours: 0,
    max_students: 0,
    status: "draft" as CourseStatus,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data: Course = await CoursesAPI.getCourseBySlug(slug);
        if (!mounted) return;

        setCourseData(data);
        setFormData({
          title: data.title,
          description: data.description,
          short_description: data.short_description || "",
          level: data.level,
          price: data.price,
          duration_hours: data.duration_hours || 0,
          max_students: data.max_students || 0,
          status: data.status,
        });
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to load course";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    if (slug) load();
    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    setSuccess(false);

    try {
      await CoursesAPI.updateCourse(courseData!.id, formData);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/mentor/courses/${slug}`);
      }, 1500);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update course";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-6 py-6 max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-500">Loading course...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-6 max-w-4xl">
        {/* Header Section */}
        <div className="mb-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Button asChild variant="ghost" size="sm" className="h-8 px-2">
              <Link
                href={`/dashboard/mentor/courses/${slug}`}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Course</span>
              </Link>
            </Button>
          </div>

          {/* Title and Status */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Edit Course
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Update course information and settings
              </p>
            </div>
            <Badge
              className={`${
                formData.status === "published"
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              } text-xs px-3 py-1`}
            >
              {formData.status}
            </Badge>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-sm">
            <p className="text-sm text-green-600 font-medium">
              ✓ Course updated successfully! Redirecting...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-sm">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={submit} className="space-y-8">
          {/* Basic Information */}
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Course Title *
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter course title"
                    required
                    className="rounded-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Difficulty Level *
                  </label>
                  <Select
                    value={formData.level}
                    onValueChange={(value) => handleInputChange("level", value)}
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Short Description
                </label>
                <Input
                  value={formData.short_description}
                  onChange={(e) =>
                    handleInputChange("short_description", e.target.value)
                  }
                  placeholder="Brief course summary (optional)"
                  className="rounded-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Course Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  placeholder="Detailed course description"
                  required
                  rows={6}
                  className="rounded-sm resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Course Settings */}
          <Card className="rounded-sm">
            <CardHeader>
              <CardTitle className="text-lg">Course Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Price *
                  </label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) =>
                      handleInputChange("price", Number(e.target.value))
                    }
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    className="rounded-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Duration (hours)
                  </label>
                  <Input
                    type="number"
                    value={formData.duration_hours}
                    onChange={(e) =>
                      handleInputChange(
                        "duration_hours",
                        Number(e.target.value)
                      )
                    }
                    placeholder="0"
                    min="0"
                    className="rounded-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Max Students
                  </label>
                  <Input
                    type="number"
                    value={formData.max_students}
                    onChange={(e) =>
                      handleInputChange("max_students", Number(e.target.value))
                    }
                    placeholder="Unlimited"
                    min="0"
                    className="rounded-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      handleInputChange("status", value)
                    }
                  >
                    <SelectTrigger className="rounded-sm">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              asChild
              className="rounded-sm"
            >
              <Link href={`/dashboard/mentor/courses/${slug}`}>Cancel</Link>
            </Button>

            <Button
              type="submit"
              disabled={saving}
              className="rounded-sm min-w-[120px]"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
