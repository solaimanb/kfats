import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const mentorFormSchema = z.object({
  expertise: z
    .string()
    .min(100, "Please provide detailed information about your expertise"),
  qualifications: z.object({
    degree: z.string().min(1, "Degree is required"),
    field: z.string().min(1, "Field of study is required"),
    certificate: z.any().optional(),
  }),
  sampleCourse: z.object({
    title: z.string().min(1, "Course title is required"),
    description: z
      .string()
      .min(100, "Please provide a detailed course description"),
    syllabus: z.any(), // For file upload
    sampleMaterial: z.any(), // For file upload
  }),
  documents: z.object({
    cv: z.any(),
    certifications: z.any().optional(),
  }),
});

type MentorFormValues = z.infer<typeof mentorFormSchema>;

export function MentorApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<MentorFormValues>({
    resolver: zodResolver(mentorFormSchema),
    defaultValues: {
      expertise: "",
      qualifications: {
        degree: "",
        field: "",
      },
      sampleCourse: {
        title: "",
        description: "",
      },
    },
  });

  async function onSubmit(data: MentorFormValues) {
    try {
      setIsSubmitting(true);
      setError(null);

      // Handle file uploads
      const formData = new FormData();

      // Add files to formData
      if (data.sampleCourse.syllabus) {
        formData.append("syllabus", data.sampleCourse.syllabus);
      }
      if (data.sampleCourse.sampleMaterial) {
        formData.append("sampleMaterial", data.sampleCourse.sampleMaterial);
      }
      if (data.documents.cv) {
        formData.append("cv", data.documents.cv);
      }
      if (data.documents.certifications) {
        formData.append("certifications", data.documents.certifications);
      }

      // Add other data
      formData.append(
        "data",
        JSON.stringify({
          expertise: data.expertise,
          qualifications: data.qualifications,
          sampleCourse: {
            title: data.sampleCourse.title,
            description: data.sampleCourse.description,
          },
        })
      );

      const response = await fetch("/api/role-applications/mentor", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Application submission failed");
      }

      // Handle success
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Mentor Application</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Expertise */}
            <FormField
              control={form.control}
              name="expertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Expertise</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your expertise and what you can teach..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Detail your subject matter expertise and teaching experience
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Qualifications */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="qualifications.degree"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Degree/Qualification</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualifications.field"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Field of Study</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="qualifications.certificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Certificate</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Sample Course */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="sampleCourse.title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sample Course Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sampleCourse.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe your course..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sampleCourse.syllabus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Course Syllabus</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sampleCourse.sampleMaterial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload Sample Course Material</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a sample lesson or course material
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Documents */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="documents.cv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload CV/Resume</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => field.onChange(e.target.files?.[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
