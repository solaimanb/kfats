"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { CoursesAPI } from "@/lib/api/courses";
import { CourseLevel, CourseStatus } from "@/lib/types/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Eye,
  Sparkles,
  Clock,
  Users,
  Lightbulb,
  Settings,
} from "lucide-react";

type FormStep = "basic" | "details" | "preview";

export default function CreateCoursePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<FormStep>("basic");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [maxStudents, setMaxStudents] = useState<number | undefined>();
  const [status, setStatus] = useState<CourseStatus>(CourseStatus.DRAFT);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>("");
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState(false);

  // Form validation states
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [fieldTouched, setFieldTouched] = useState<Record<string, boolean>>({});

  // Validation functions
  const validateField = (
    field: string,
    value: string | number | undefined
  ): string => {
    switch (field) {
      case "title":
        if (!value || !String(value).trim()) return "Course title is required";
        if (String(value).trim().length < 5)
          return "Title must be at least 5 characters";
        if (String(value).trim().length > 100)
          return "Title must be less than 100 characters";
        return "";
      case "description":
        if (!value || !String(value).trim())
          return "Course description is required";
        if (String(value).trim().length < 20)
          return "Description must be at least 20 characters";
        if (String(value).trim().length > 2000)
          return "Description must be less than 2000 characters";
        return "";
      case "shortDescription":
        if (value && String(value).trim().length > 200)
          return "Short description must be less than 200 characters";
        return "";
      case "price":
        if (typeof value === "number" && value < 0)
          return "Price cannot be negative";
        if (typeof value === "number" && value > 10000)
          return "Price cannot exceed $10,000";
        return "";
      case "maxStudents":
        if (value && typeof value === "number" && value < 1)
          return "Maximum students must be at least 1";
        if (value && typeof value === "number" && value > 10000)
          return "Maximum students cannot exceed 10,000";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (
    field: string,
    value: string | number | undefined
  ) => {
    switch (field) {
      case "title":
        setTitle(String(value || ""));
        break;
      case "description":
        setDescription(String(value || ""));
        break;
      case "shortDescription":
        setShortDescription(String(value || ""));
        break;
      case "price":
        setPrice(Number(value) || 0);
        break;
      case "maxStudents":
        setMaxStudents(value ? Number(value) : undefined);
        break;
      case "status":
        setStatus(value as CourseStatus);
        break;
      case "thumbnailUrl":
        setThumbnailUrl(String(value || ""));
        break;
    }

    // Mark field as touched
    setFieldTouched((prev) => ({ ...prev, [field]: true }));

    // Validate field
    const error = validateField(field, value);
    setValidationErrors((prev) => ({ ...prev, [field]: error }));
  };

  const getFieldError = (field: string): string => {
    return fieldTouched[field] ? validationErrors[field] || "" : "";
  };

  const isFieldValid = (field: string): boolean => {
    return fieldTouched[field] && !validationErrors[field];
  };

  const hasFieldError = (field: string): boolean => {
    return fieldTouched[field] && !!validationErrors[field];
  };

  const nextStep = () => {
    if (currentStep === "basic") setCurrentStep("details");
    else if (currentStep === "details") setCurrentStep("preview");
  };

  const prevStep = () => {
    if (currentStep === "details") setCurrentStep("basic");
    else if (currentStep === "preview") setCurrentStep("details");
  };

  // Enhanced canProceed with validation
  const canProceed = () => {
    if (currentStep === "basic") {
      return title.trim().length >= 5 && !validationErrors.title;
    }
    if (currentStep === "details") {
      return (
        description.trim().length >= 20 &&
        !validationErrors.description &&
        !validationErrors.price &&
        !validationErrors.maxStudents
      );
    }
    return true;
  };

  // Enhanced submit with validation
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submission
    const allFields = [
      "title",
      "description",
      "shortDescription",
      "price",
      "maxStudents",
    ];
    const newErrors: Record<string, string> = {};
    let hasErrors = false;

    allFields.forEach((field) => {
      const value =
        field === "title"
          ? title
          : field === "description"
          ? description
          : field === "shortDescription"
          ? shortDescription
          : field === "price"
          ? price
          : field === "maxStudents"
          ? maxStudents
          : "";
      const error = validateField(field, value);
      if (error) {
        newErrors[field] = error;
        hasErrors = true;
      }
    });

    setValidationErrors(newErrors);
    setFieldTouched({
      title: true,
      description: true,
      shortDescription: true,
      price: true,
      maxStudents: true,
    });

    if (hasErrors) {
      setError("Please fix the validation errors before submitting");
      return;
    }

    setLoading(true);
    setError(undefined);
    setSuccess(false);

    try {
      const course = await CoursesAPI.createCourse({
        title: title.trim(),
        description: description.trim(),
        short_description: shortDescription.trim() || undefined,
        level: "beginner" as CourseLevel,
        price,
        max_students: maxStudents,
        status,
        thumbnail_url: thumbnailUrl || undefined,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/dashboard/mentor/courses/${course.id}`);
      }, 2000);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create course";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl border-0 mx-4">
          <CardContent className="p-6 sm:p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-8">
              <CheckCircle2 className="h-12 w-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Course Created Successfully! 🎉
            </h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              Your course{" "}
              <span className="font-semibold text-emerald-700">
                &quot;{title}&quot;
              </span>{" "}
              has been created and is ready for content creation.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                <span className="text-xs sm:text-sm font-medium text-blue-900">
                  Next: Add course content
                </span>
              </div>
              <div className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-lg">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="text-xs sm:text-sm font-medium text-green-900">
                  Ready for enrollments
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div className="bg-emerald-600 h-3 rounded-full animate-pulse"></div>
            </div>
            <p className="text-sm text-gray-500">
              Redirecting to course management...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Course
                </h1>
                <p className="text-sm text-gray-600">
                  Build an amazing learning experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
        {/* Step Indicator */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4 sm:space-x-8">
              {[
                {
                  key: "basic",
                  label: "Basic Info",
                  icon: BookOpen,
                  desc: "Title & overview",
                },
                {
                  key: "details",
                  label: "Details",
                  icon: Settings,
                  desc: "Settings & pricing",
                },
                {
                  key: "preview",
                  label: "Review",
                  icon: Eye,
                  desc: "Final review",
                },
              ].map((step, index) => {
                const Icon = step.icon;
                const isActive = currentStep === step.key;
                const isCompleted =
                  (currentStep === "details" && step.key === "basic") ||
                  (currentStep === "preview" &&
                    (step.key === "basic" || step.key === "details"));

                return (
                  <div key={step.key} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 mb-2 transition-all duration-200 ${
                          isActive
                            ? "border-blue-600 bg-blue-600 text-white shadow-lg"
                            : isCompleted
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-gray-300 bg-white text-gray-400"
                        }`}
                      >
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                      </div>
                      <div className="text-center max-w-16 sm:max-w-none">
                        <div
                          className={`text-xs sm:text-sm font-semibold ${
                            isActive
                              ? "text-blue-600"
                              : isCompleted
                              ? "text-emerald-600"
                              : "text-gray-400"
                          }`}
                        >
                          {step.label}
                        </div>
                        <div className="text-xs text-gray-500 hidden sm:block mt-1">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                    {index < 2 && (
                      <div
                        className={`w-8 sm:w-16 h-0.5 mx-2 sm:mx-6 transition-colors duration-200 ${
                          isCompleted ? "bg-emerald-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-6 gap-6 sm:gap-8">
          {/* Main Form */}
          <div className="xl:col-span-4">
            <Card className="shadow-sm border-0">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  {currentStep === "basic" && (
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  )}
                  {currentStep === "details" && (
                    <Settings className="h-6 w-6 text-purple-600" />
                  )}
                  {currentStep === "preview" && (
                    <Eye className="h-6 w-6 text-emerald-600" />
                  )}
                  <div>
                    <CardTitle className="text-xl">
                      {currentStep === "basic" && "Course Basic Information"}
                      {currentStep === "details" && "Course Details & Settings"}
                      {currentStep === "preview" && "Review & Publish"}
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentStep === "basic" &&
                        "Start with the fundamentals of your course"}
                      {currentStep === "details" &&
                        "Configure pricing and other settings"}
                      {currentStep === "preview" &&
                        "Review everything before publishing"}
                    </p>
                  </div>
                </div>
              </CardHeader>

              <form onSubmit={submit}>
                <CardContent className="space-y-8">
                  {/* Step 1: Basic Info */}
                  {currentStep === "basic" && (
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <Label
                          htmlFor="title"
                          className="text-base font-semibold flex items-center gap-2"
                        >
                          <Sparkles className="h-5 w-5 text-blue-600" />
                          Course Title *
                        </Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) =>
                            handleFieldChange("title", e.target.value)
                          }
                          required
                          placeholder="e.g. Complete Guide to Watercolor Painting Mastery"
                          className={`text-lg h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                            hasFieldError("title")
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : isFieldValid("title")
                              ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                              : ""
                          }`}
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            Choose a compelling title that clearly describes
                            your course
                          </p>
                          <Badge
                            variant={
                              title.length >= 5 && !hasFieldError("title")
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {title.length}/100
                          </Badge>
                        </div>
                        {hasFieldError("title") && (
                          <p className="text-sm text-red-600 mt-1">
                            {getFieldError("title")}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="shortDescription"
                          className="text-base font-semibold"
                        >
                          Short Description
                        </Label>
                        <Textarea
                          id="shortDescription"
                          value={shortDescription}
                          onChange={(e) => setShortDescription(e.target.value)}
                          placeholder="Brief course summary (1-2 sentences)"
                          rows={3}
                          className="resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        />
                        <p className="text-sm text-gray-600">
                          A concise summary shown in course listings and search
                          results
                        </p>
                      </div>

                      <div className="space-y-3">
                        <Label
                          htmlFor="thumbnailInput"
                          className="text-base font-semibold flex items-center gap-2"
                        >
                          <ImageIcon className="h-5 w-5 text-orange-600" />
                          Course Thumbnail
                        </Label>
                        <div className="relative">
                          <Input
                            id="thumbnailInput"
                            value={thumbnailFile ? thumbnailFile.name : thumbnailUrl}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.startsWith('http') || value.startsWith('https') || value.startsWith('data:')) {
                                setThumbnailUrl(value);
                                setThumbnailFile(null);
                              } else {
                                setThumbnailUrl(value);
                                setThumbnailFile(null);
                              }
                            }}
                            placeholder="Enter image URL or drop file here"
                            className="h-12 border-gray-300 focus:border-orange-500 focus:ring-orange-500 pr-12"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => document.getElementById('thumbnailFile')?.click()}
                            className="absolute right-1 top-1 h-10 px-3 hover:bg-orange-50 border-2 bg-background"
                          >
                            <ImageIcon className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                        </div>
                        <Input
                          id="thumbnailFile"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              // Validate file size (max 5MB)
                              if (file.size > 5 * 1024 * 1024) {
                                alert("File size must be less than 5MB");
                                return;
                              }

                              setThumbnailFile(file);

                              // Convert to data URL for preview
                              const reader = new FileReader();
                              reader.onload = (e) => {
                                setThumbnailUrl(e.target?.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                        <p className="text-sm text-gray-600">
                          Enter an image URL or click &quot;Upload&quot; to choose a file (max 5MB, optional)
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Details */}
                  {currentStep === "details" && (
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <Label
                          htmlFor="description"
                          className="text-base font-semibold flex items-center gap-2"
                        >
                          <FileText className="h-5 w-5 text-purple-600" />
                          Course Description *
                        </Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) =>
                            handleFieldChange("description", e.target.value)
                          }
                          required
                          placeholder="Describe what students will learn, the benefits, prerequisites, and what makes this course unique..."
                          rows={6}
                          className={`resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                            hasFieldError("description")
                              ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                              : isFieldValid("description")
                              ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                              : ""
                          }`}
                        />
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-gray-600">
                            Write a compelling description that highlights the
                            value and outcomes
                          </p>
                          <Badge
                            variant={
                              description.length >= 20 &&
                              !hasFieldError("description")
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {description.length}/2000
                          </Badge>
                        </div>
                        {hasFieldError("description") && (
                          <p className="text-sm text-red-600 mt-1">
                            {getFieldError("description")}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                        <div className="space-y-3">
                          <Label
                            htmlFor="price"
                            className="text-base font-semibold flex items-center gap-2"
                          >
                            <DollarSign className="h-5 w-5 text-emerald-600" />
                            Price (USD)
                          </Label>
                          <Input
                            id="price"
                            type="number"
                            min={0}
                            step="0.01"
                            value={price}
                            onChange={(e) =>
                              handleFieldChange("price", Number(e.target.value))
                            }
                            placeholder="0.00"
                            className={`h-12 text-lg border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 ${
                              hasFieldError("price")
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : isFieldValid("price")
                                ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                                : ""
                            }`}
                          />
                          {hasFieldError("price") && (
                            <p className="text-sm text-red-600 mt-1">
                              {getFieldError("price")}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label
                            htmlFor="maxStudents"
                            className="text-base font-semibold flex items-center gap-2"
                          >
                            <Users className="h-5 w-5 text-blue-600" />
                            Max Students
                          </Label>
                          <Input
                            id="maxStudents"
                            type="number"
                            min={0}
                            value={maxStudents || ""}
                            onChange={(e) =>
                              handleFieldChange(
                                "maxStudents",
                                e.target.value
                                  ? Number(e.target.value)
                                  : undefined
                              )
                            }
                            placeholder="Unlimited"
                            className={`h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                              hasFieldError("maxStudents")
                                ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                : isFieldValid("maxStudents")
                                ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                                : ""
                            }`}
                          />
                          <p className="text-xs text-gray-600">
                            Maximum number of students (leave empty for
                            unlimited)
                          </p>
                          {hasFieldError("maxStudents") && (
                            <p className="text-sm text-red-600 mt-1">
                              {getFieldError("maxStudents")}
                            </p>
                          )}
                        </div>

                        <div className="space-y-3">
                          <Label className="text-base font-semibold flex items-center gap-2">
                            <Eye className="h-5 w-5 text-gray-600" />
                            Initial Status
                          </Label>
                          <Select
                            value={status}
                            onValueChange={(val) =>
                              handleFieldChange("status", val)
                            }
                          >
                            <SelectTrigger className="border-gray-300 focus:border-gray-500 focus:ring-gray-500 h-12">
                              <SelectValue placeholder="Select initial status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={CourseStatus.DRAFT}>
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                                  <div className="font-medium">Draft</div>
                                </div>
                              </SelectItem>
                              <SelectItem value={CourseStatus.PUBLISHED}>
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                  <div className="font-medium">Published</div>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Preview */}
                  {currentStep === "preview" && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
                        <h3 className="text-xl font-semibold mb-6 text-gray-900">
                          Course Preview
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">
                              {title || "Course Title"}
                            </h4>
                            <p className="text-gray-700 leading-relaxed">
                              {shortDescription ||
                                description ||
                                "Course description will appear here..."}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 rounded-full">
                              <DollarSign className="h-4 w-4 text-emerald-600" />
                              <span className="text-sm font-medium text-emerald-800">
                                {price === 0 ? "Free" : `$${price}`}
                              </span>
                            </div>
                            {maxStudents && (
                              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 rounded-full">
                                <Users className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-800">
                                  Max {maxStudents}
                                </span>
                              </div>
                            )}
                            <div
                              className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                                status === CourseStatus.PUBLISHED
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              <span className="text-sm font-medium capitalize">
                                {status}
                              </span>
                            </div>
                          </div>

                          {thumbnailUrl && (
                            <div className="mt-6">
                              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                Course Thumbnail
                              </Label>
                              <div className="w-full max-w-md h-32 bg-gray-100 rounded-lg overflow-hidden">
                                <Image
                                  src={thumbnailUrl}
                                  alt="Course thumbnail"
                                  width={400}
                                  height={128}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Alert className="border-emerald-200 bg-emerald-50">
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        <AlertDescription className="text-emerald-800">
                          Your course is ready to be published! Review the
                          information above and click &quot;Create Course&quot;
                          when you&apos;re satisfied.
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive" className="border-red-200">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription className="text-red-800">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>

                <div className="border-t border-gray-100 bg-gray-50/50 px-4 sm:px-8 py-4 sm:py-6">
                  <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
                    <div className="flex gap-3 order-2 sm:order-1">
                      {currentStep !== "basic" && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={prevStep}
                          className="border-gray-300 hover:bg-gray-50 flex-1 sm:flex-none"
                        >
                          Previous
                        </Button>
                      )}
                    </div>

                    <div className="flex gap-3 order-1 sm:order-2">
                      {currentStep !== "preview" ? (
                        <Button
                          type="button"
                          onClick={nextStep}
                          disabled={!canProceed()}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 flex-1 sm:flex-none"
                        >
                          Next Step
                        </Button>
                      ) : (
                        <Button
                          type="submit"
                          disabled={
                            loading || !title.trim() || !description.trim()
                          }
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 sm:px-8 flex-1 sm:flex-none"
                        >
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Creating Course...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="h-5 w-5 mr-2" />
                              Create Course
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 order-first xl:order-last xl:col-span-2">
            {/* Quick Actions Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 hover:bg-purple-50 hover:border-purple-400"
                    onClick={() => setCurrentStep("basic")}
                    disabled={currentStep === "basic"}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Edit Basic Info
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 hover:bg-blue-50 hover:border-blue-400"
                    onClick={() => setCurrentStep("details")}
                    disabled={currentStep === "details"}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Details
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-gray-300 hover:bg-emerald-50 hover:border-emerald-400"
                    onClick={() => setCurrentStep("preview")}
                    disabled={currentStep === "preview"}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Course
                  </Button>
                </div>
              </CardContent>
            </Card>
            {/* Tips Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-600" />
                  Success Tips
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div
                    className={`flex gap-3 p-3 rounded-lg transition-colors ${
                      currentStep === "basic"
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Compelling Title
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Make it specific and benefit-focused to attract students
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex gap-3 p-3 rounded-lg transition-colors ${
                      currentStep === "details"
                        ? "bg-purple-50 border border-purple-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-purple-600">
                        2
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Clear Description
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Explain what students will learn and the outcomes
                        they&apos;ll achieve
                      </p>
                    </div>
                  </div>

                  <div
                    className={`flex gap-3 p-3 rounded-lg transition-colors ${
                      currentStep === "preview"
                        ? "bg-emerald-50 border border-emerald-200"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-emerald-600">
                        3
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Right Price Point
                      </p>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Balance value with accessibility for your target
                        audience
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Preview Card */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5 text-emerald-600" />
                  Course Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border">
                    {thumbnailUrl ? (
                      <Image
                        src={thumbnailUrl}
                        alt="Course thumbnail preview"
                        width={200}
                        height={112}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-center">
                        <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <p className="text-xs text-gray-500">No thumbnail</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                      {title || "Course Title"}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {shortDescription ||
                        description ||
                        "Course description..."}
                    </p>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-emerald-600" />
                        <span>{price === 0 ? "Free" : `$${price}`}</span>
                      </div>
                    </div>

                    {maxStudents && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users className="h-3 w-3" />
                        <span>Max {maxStudents} students</span>
                      </div>
                    )}
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
