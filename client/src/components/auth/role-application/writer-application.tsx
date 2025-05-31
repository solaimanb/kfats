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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const writerFormSchema = z.object({
  specializations: z.array(z.string()).min(1, {
    message: "Please select at least one specialization",
  }),
  languages: z
    .array(
      z.object({
        language: z.string(),
        proficiencyLevel: z.enum(["Native", "Fluent", "Professional"]),
      })
    )
    .min(1),
  experience: z.object({
    years: z.number().min(0),
    description: z.string().min(100, {
      message: "Experience description must be at least 100 characters",
    }),
    publications: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          date: z.string(),
        })
      )
      .optional(),
  }),
  portfolio: z.object({
    url: z.string().url().optional(),
    description: z.string().min(50, {
      message: "Portfolio description must be at least 50 characters",
    }),
  }),
  writingSamples: z.array(z.any()).min(1, {
    message: "Please upload at least one writing sample",
  }),
});

type WriterFormValues = z.infer<typeof writerFormSchema>;

const specializations = [
  { id: "technical", label: "Technical Writing" },
  { id: "creative", label: "Creative Writing" },
  { id: "content", label: "Content Writing" },
  { id: "academic", label: "Academic Writing" },
  { id: "journalism", label: "Journalism" },
  { id: "copywriting", label: "Copywriting" },
];

export function WriterApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<WriterFormValues>({
    resolver: zodResolver(writerFormSchema),
    defaultValues: {
      specializations: [],
      languages: [{ language: "English", proficiencyLevel: "Professional" }],
      experience: {
        years: 0,
        description: "",
        publications: [],
      },
      portfolio: {
        description: "",
      },
      writingSamples: [],
    },
  });

  async function onSubmit(data: WriterFormValues) {
    try {
      setIsSubmitting(true);
      setError(null);

      // Handle file uploads first
      const uploadPromises = data.writingSamples.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) throw new Error("File upload failed");
        return response.json();
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      // Submit application
      const response = await fetch("/api/role-applications/writer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          writingSamples: uploadedFiles,
        }),
      });

      if (!response.ok) {
        throw new Error("Application submission failed");
      }

      // Handle success (e.g., redirect or show success message)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Writer Application</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="specializations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Specializations</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      const current = field.value || [];
                      const newValue = current.includes(value)
                        ? current.filter((item) => item !== value)
                        : [...current, value];
                      field.onChange(newValue);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select specializations" />
                    </SelectTrigger>
                    <SelectContent>
                      {specializations.map((spec) => (
                        <SelectItem key={spec.id} value={spec.id}>
                          {spec.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select all areas you specialize in
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience.years"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experience.description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your writing experience..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your writing experience, including any
                    notable achievements
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="writingSamples"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Writing Samples</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        field.onChange(files);
                      }}
                    />
                  </FormControl>
                  <FormDescription>
                    Upload 2-3 samples of your best work (PDF, DOC, DOCX)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="portfolio.url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Portfolio URL (Optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Link to your writing portfolio or personal website
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
