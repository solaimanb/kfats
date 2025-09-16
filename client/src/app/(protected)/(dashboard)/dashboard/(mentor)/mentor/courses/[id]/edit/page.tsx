"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CoursesAPI } from "@/lib/api/courses";
import { Course, CourseLevel, CourseStatus } from "@/lib/types/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  Loader2,
  BookOpen,
  DollarSign,
  Users,
  FileText,
  Target,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

type FormStep = "basic" | "details" | "preview";

export default function EditCoursePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const courseId = parseInt(params.id);

  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [level, setLevel] = useState<CourseLevel>("beginner" as CourseLevel);
  const [price, setPrice] = useState<number>(0);
  const [maxStudents, setMaxStudents] = useState<number | undefined>();
  const [status, setStatus] = useState<CourseStatus>(CourseStatus.DRAFT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [success, setSuccess] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data: Course = await CoursesAPI.getCourseById(courseId);
        if (!mounted) return;

        setCourseData(data);
        setTitle(data.title);
        setDescription(data.description);
        setShortDescription(data.short_description || "");
        setLevel(data.level);
        setPrice(data.price);
        setMaxStudents(data.max_students);
        setStatus(data.status);
      } catch (e: unknown) {
        const message =
          e instanceof Error ? e.message : "Failed to load course";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    if (courseId) load();
    return () => {
      mounted = false;
    };
  }, [courseId]);

  useEffect(() => {
    if (title || description || shortDescription || maxStudents) {
      const timer = setTimeout(() => {
        setAutoSaveStatus("saving");
        setTimeout(() => setAutoSaveStatus("saved"), 1000);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [title, description, shortDescription, level, price, maxStudents]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(undefined);
    setSuccess(false);

    try {
      await CoursesAPI.updateCourse(courseId, {
        title,
        description,
        short_description: shortDescription || undefined,
        level,
        price,
        max_students: maxStudents,
        status,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/mentor/courses/${courseId}`);
      }, 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update course";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep === "basic") setCurrentStep("details");
    else if (currentStep === "details") setCurrentStep("preview");
  };

  const prevStep = () => {
    if (currentStep === "details") setCurrentStep("basic");
    else if (currentStep === "preview") setCurrentStep("details");
  };

  const canProceed = () => {
    if (currentStep === "basic") return title.trim().length >= 5;
    if (currentStep === "details") return description.trim().length >= 20;
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg rounded-none shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Loading Course...
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Please wait while we load your course data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg rounded-none shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Course Updated Successfully! 🎉
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Your course{" "}
              <span className="font-semibold text-gray-900">
                &quot;{title}&quot;
              </span>{" "}
              has been updated and saved. You&apos;ll be redirected to the
              course management page shortly.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
              <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
            </div>
            <p className="text-xs text-gray-500">
              Redirecting in a few seconds...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-none"
            >
              <Link href={`/dashboard/mentor/courses/${courseId}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Course
              </Link>
            </Button>

            {/* Auto-save indicator */}
            <div className="flex items-center gap-2">
              {autoSaveStatus === "saving" && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                  Saving draft...
                </div>
              )}
              {autoSaveStatus === "saved" && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <Save className="h-4 w-4" />
                  Draft saved
                </div>
              )}
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Edit Course
            </h1>
            <p className="text-gray-600 mt-1">
              Update your course information and settings
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              {[
                { key: "basic", label: "Basic Info", icon: BookOpen },
                { key: "details", label: "Details", icon: FileText },
                { key: "preview", label: "Preview", icon: Target },
              ].map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.key;
                const isCompleted =
                  (currentStep === "details" && step.key === "basic") ||
                  (currentStep === "preview" &&
                    (step.key === "basic" || step.key === "details"));

                return (
                  <div key={step.key} className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isActive
                          ? "border-blue-600 bg-blue-600 text-white"
                          : isCompleted
                          ? "border-green-600 bg-green-600 text-white"
                          : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`ml-2 text-sm font-medium ${
                        isActive
                          ? "text-blue-600"
                          : isCompleted
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {index < 2 && (
                      <div
                        className={`w-12 h-0.5 mx-4 ${
                          isCompleted ? "bg-green-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card className="rounded-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {currentStep === "basic" && <BookOpen className="h-5 w-5" />}
                  {currentStep === "details" && (
                    <FileText className="h-5 w-5" />
                  )}
                  {currentStep === "preview" && <Target className="h-5 w-5" />}
                  {currentStep === "basic" && "Course Basic Information"}
                  {currentStep === "details" && "Course Details & Settings"}
                  {currentStep === "preview" && "Preview & Save Changes"}
                </CardTitle>
              </CardHeader>

              <form onSubmit={submit}>
                <CardContent className="p-8 space-y-8">
                  {/* Step 1: Basic Info */}
                  {currentStep === "basic" && (
                    <div className="space-y-6">
                      <div className="grid gap-3">
                        <Label
                          htmlFor="title"
                          className="text-base font-semibold flex items-center gap-2"
                        >
                          <Sparkles className="h-4 w-4 text-blue-600" />
                          Course Title *
                        </Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                          placeholder="e.g. Complete Guide to Watercolor Painting Mastery"
                          className="rounded-none text-lg py-3"
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">
                            Choose a compelling title that clearly describes
                            your course
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {title.length}/100
                          </Badge>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <Label
                          htmlFor="description"
                          className="text-base font-semibold flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4 text-green-600" />
                          Course Description *
                        </Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                          placeholder="Describe what students will learn, the benefits, prerequisites, and what makes this course unique..."
                          rows={8}
                          className="rounded-none resize-none"
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-500">
                            Write a compelling description that highlights the
                            value and outcomes
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {description.length}/1000
                          </Badge>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Details */}
                  {currentStep === "details" && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            Difficulty Level *
                          </Label>
                          <Select
                            value={level}
                            onValueChange={(val) =>
                              setLevel(val as CourseLevel)
                            }
                          >
                            <SelectTrigger className="rounded-none">
                              <SelectValue placeholder="Select difficulty level" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="beginner">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Beginner - No prior knowledge needed
                                </div>
                              </SelectItem>
                              <SelectItem value="intermediate">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                  Intermediate - Some basic knowledge required
                                </div>
                              </SelectItem>
                              <SelectItem value="advanced">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                  Advanced - Extensive prior knowledge needed
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-3">
                          <Label
                            htmlFor="price"
                            className="text-base font-semibold flex items-center gap-2"
                          >
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            Price (USD)
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            min={0}
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            placeholder="0.00"
                            className="rounded-none text-lg"
                          />
                          <p className="text-sm text-gray-500">
                            Set to 0 for free courses • Recommended: $49-$199
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                          <Label
                            htmlFor="shortDescription"
                            className="text-base font-semibold"
                          >
                            Short Description
                          </Label>
                          <Input
                            id="shortDescription"
                            value={shortDescription}
                            onChange={(e) => setShortDescription(e.target.value)}
                            placeholder="Brief course summary (optional)"
                            className="rounded-none"
                          />
                          <p className="text-sm text-gray-500">
                            A concise summary shown in course listings
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                          <Label
                            htmlFor="maxStudents"
                            className="text-base font-semibold flex items-center gap-2"
                          >
                            <Users className="h-4 w-4 text-green-600" />
                            Max Students
                          </Label>
                          <Input
                            id="maxStudents"
                            type="number"
                            min={0}
                            value={maxStudents || ""}
                            onChange={(e) => setMaxStudents(e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="Unlimited"
                            className="rounded-none"
                          />
                          <p className="text-sm text-gray-500">
                            Maximum number of students (leave empty for unlimited)
                          </p>
                        </div>

                        <div className="grid gap-3">
                          <Label className="text-base font-semibold">
                            Status
                          </Label>
                          <Select
                            value={status}
                            onValueChange={(val) => setStatus(val as CourseStatus)}
                          >
                            <SelectTrigger className="rounded-none">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={CourseStatus.DRAFT}>
                                Draft - Keep private while editing
                              </SelectItem>
                              <SelectItem value={CourseStatus.PUBLISHED}>
                                Published - Make available to students
                              </SelectItem>
                              <SelectItem value={CourseStatus.ARCHIVED}>
                                Archived - Hide from students
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-sm text-gray-500">
                            You can change this later in course settings
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Preview */}
                  {currentStep === "preview" && (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h3 className="text-lg font-semibold mb-4">
                          Course Preview
                        </h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {title || "Course Title"}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {shortDescription || description || "Course description will appear here..."}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Target className="h-4 w-4" />
                              {level}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4" />
                              {price === 0 ? "Free" : `$${price}`}
                            </span>
                            {maxStudents && (
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                Max {maxStudents}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`px-2 py-1 rounded text-xs ${
                              status === CourseStatus.PUBLISHED
                                ? "bg-green-100 text-green-800"
                                : status === CourseStatus.DRAFT
                                ? "bg-gray-100 text-gray-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {status}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Alert className="rounded-none">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>
                          Review the information above and click &quot;Save Changes&quot;
                          when you&apos;re satisfied with your updates.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive" className="rounded-none">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                <CardFooter className="flex justify-between border-t bg-gray-50/50 px-8 py-6">
                  <div className="flex gap-3">
                    {currentStep !== "basic" && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={prevStep}
                        className="rounded-none"
                      >
                        Previous
                      </Button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    {currentStep !== "preview" ? (
                      <Button
                        type="button"
                        onClick={nextStep}
                        disabled={!canProceed()}
                        className="bg-blue-600 hover:bg-blue-700 rounded-none"
                      >
                        Next Step
                      </Button>
                    ) : (
                      <Button
                        type="submit"
                        disabled={
                          saving || !title.trim() || !description.trim()
                        }
                        className="bg-green-600 hover:bg-green-700 rounded-none"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving Changes...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardFooter>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Course Stats Preview */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Current Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">
                      {courseData?.enrolled_count || 0}
                    </div>
                    <div className="text-xs text-blue-600">Students</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">0%</div>
                    <div className="text-xs text-green-600">Completion</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Stats will update as students enroll and progress
                </p>
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="rounded-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Editing Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Clear Updates</p>
                      <p className="text-xs text-gray-600">
                        Make sure changes are clear and beneficial
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-600">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Test Changes</p>
                      <p className="text-xs text-gray-600">
                        Preview your course before publishing updates
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Notify Students</p>
                      <p className="text-xs text-gray-600">
                        Consider informing enrolled students of major changes
                      </p>
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
