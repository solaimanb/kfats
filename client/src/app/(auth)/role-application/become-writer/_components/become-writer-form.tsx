"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { roleApplicationService } from "@/lib/api/services/role-application.service";
import { RoleApplicationRequest } from "@/types/api/role/requests";
import { UserRole } from "@/types/domain/role/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  // Basic Profile Info
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  email: z.string().email("Invalid email format"),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{10,}$/, "Invalid phone number format")
    .optional(),
  avatar: z.string().optional(),
  bio: z.string().max(500, "Bio cannot exceed 500 characters").optional(),

  // Writer-specific Info
  specializations: z
    .array(z.string())
    .min(1, "Add at least one specialization"),
  languages: z
    .array(
      z.object({
        language: z.string().min(1, "Language is required"),
        proficiencyLevel: z.enum([
          "Native",
          "Fluent",
          "Professional",
          "Intermediate",
          "Basic",
        ]),
      })
    )
    .min(1, "Add at least one language"),
  experience: z.object({
    years: z.number().min(0, "Years must be 0 or greater"),
    publications: z
      .array(
        z.object({
          title: z.string().min(1, "Title is required"),
          url: z.string().url("Invalid URL").optional(),
          date: z.string(),
        })
      )
      .optional(),
  }),
  portfolio: z
    .array(z.string().url("Invalid URL"))
    .min(1, "Add at least one portfolio item"),

  // Social Links (Optional)
  socialLinks: z
    .object({
      website: z.string().url("Invalid website URL").optional(),
      linkedin: z.string().url("Invalid LinkedIn URL").optional(),
      twitter: z.string().url("Invalid Twitter URL").optional(),
      facebook: z.string().url("Invalid Facebook URL").optional(),
    })
    .optional(),

  // Agreement
  agreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const proficiencyLevels = [
  "Native",
  "Fluent",
  "Professional",
  "Intermediate",
  "Basic",
] as const;

export function BecomeWriterForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [specializationInput, setSpecializationInput] = useState("");
  const [portfolioInput, setPortfolioInput] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      avatar: "",
      bio: "",
      specializations: [],
      languages: [],
      experience: {
        years: 0,
        publications: [],
      },
      portfolio: [],
      socialLinks: {
        website: "",
        linkedin: "",
        twitter: "",
        facebook: "",
      },
      agreement: false,
    },
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    name: "languages",
    control: form.control,
  });

  const {
    fields: publicationFields,
    append: appendPublication,
    remove: removePublication,
  } = useFieldArray({
    name: "experience.publications",
    control: form.control,
  });

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true);

      const applicationData: RoleApplicationRequest = {
        role: UserRole.WRITER,
        fields: {
          reason: values.bio || "Interested in becoming a writer",
          qualifications: [],
          experience: {
            years: values.experience.years,
            details: `Portfolio: ${values.portfolio.join(", ")}\nPublications: ${values.experience.publications?.map(p => p.title).join(", ") || "None"}`
          },
          specialization: values.specializations,
          teachingStyle: "",
          availability: values.languages.map(l => l.language)
        },
        documents: []
      };

      await roleApplicationService.submitApplication(applicationData);
      toast.success("Application submitted successfully!");
      router.push("/role-application/success");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 mb-8 text-muted-foreground hover:text-primary transition-colors">
          <Image
            src="/images/kc-logo.png"
            alt="Logo"
            width={48}
            height={48}
            className="object-contain"
          />
          <span className="font-medium">Back to Home</span>
        </Link>

        <Card className="border-none shadow-md bg-card/50 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-foreground">
              Become a Writer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Profile Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Basic Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your first name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Your email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Your phone number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <textarea
                            placeholder="Tell us about your writing experience and interests"
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator />

                {/* Specializations */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Specializations</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add specialization (e.g., Creative Writing, Technical Writing)"
                        value={specializationInput}
                        onChange={(e) => setSpecializationInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (specializationInput.trim()) {
                              form.setValue("specializations", [
                                ...form.watch("specializations"),
                                specializationInput.trim(),
                              ]);
                              setSpecializationInput("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (specializationInput.trim()) {
                            form.setValue("specializations", [
                              ...form.watch("specializations"),
                              specializationInput.trim(),
                            ]);
                            setSpecializationInput("");
                          }
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name="specializations"
                      render={() => (
                        <FormItem>
                          <div className="flex flex-wrap gap-2">
                            {form.watch("specializations").map((item, index) => (
                              <div
                                key={index}
                                className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                              >
                                {item}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newSpecializations = [
                                      ...form.watch("specializations"),
                                    ];
                                    newSpecializations.splice(index, 1);
                                    form.setValue(
                                      "specializations",
                                      newSpecializations
                                    );
                                  }}
                                  className="text-primary hover:text-primary/80"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Languages */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Languages</h3>
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() =>
                        appendLanguage({
                          language: "",
                          proficiencyLevel: "Professional",
                        })
                      }
                    >
                      Add Language
                    </Button>
                    {languageFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="space-y-4 p-4 bg-muted/30 rounded-lg relative"
                      >
                        <button
                          type="button"
                          onClick={() => removeLanguage(index)}
                          className="absolute right-2 top-2 text-destructive hover:text-destructive/80"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`languages.${index}.language`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Language</FormLabel>
                                <FormControl>
                                  <Input placeholder="Language name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`languages.${index}.proficiencyLevel`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Proficiency Level</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {proficiencyLevels.map((level) => (
                                      <SelectItem key={level} value={level}>
                                        {level}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Experience */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Experience</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="experience.years"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="Enter years of experience"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <h4 className="text-md font-medium">Publications</h4>
                        <span className="text-sm text-muted-foreground">(Optional)</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          appendPublication({ title: "", url: "", date: "" })
                        }
                      >
                        Add Publication
                      </Button>
                      {publicationFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="space-y-4 p-4 bg-muted/30 rounded-lg relative"
                        >
                          <button
                            type="button"
                            onClick={() => removePublication(index)}
                            className="absolute right-2 top-2 text-destructive hover:text-destructive/80"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <FormField
                            control={form.control}
                            name={`experience.publications.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="Title" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experience.publications.${index}.url`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                  <Input placeholder="URL" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`experience.publications.${index}.date`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                  <Input placeholder="Date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Portfolio */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Portfolio</h3>
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add portfolio item URL"
                        value={portfolioInput}
                        onChange={(e) => setPortfolioInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (portfolioInput.trim()) {
                              form.setValue("portfolio", [
                                ...form.watch("portfolio"),
                                portfolioInput.trim(),
                              ]);
                              setPortfolioInput("");
                            }
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          if (portfolioInput.trim()) {
                            form.setValue("portfolio", [
                              ...form.watch("portfolio"),
                              portfolioInput.trim(),
                            ]);
                            setPortfolioInput("");
                          }
                        }}
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name="portfolio"
                      render={() => (
                        <FormItem>
                          <div className="flex flex-wrap gap-2">
                            {form.watch("portfolio").map((item, index) => (
                              <div
                                key={index}
                                className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                              >
                                {item}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPortfolio = [
                                      ...form.watch("portfolio"),
                                    ];
                                    newPortfolio.splice(index, 1);
                                    form.setValue(
                                      "portfolio",
                                      newPortfolio
                                    );
                                  }}
                                  className="text-primary hover:text-primary/80"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Social Links */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Social Links</h3>
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="socialLinks.website"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Website</FormLabel>
                          <FormControl>
                            <Input placeholder="Website URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialLinks.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input placeholder="LinkedIn URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialLinks.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="Twitter URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="socialLinks.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input placeholder="Facebook URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator />

                {/* Agreement */}
                <FormField
                  control={form.control}
                  name="agreement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agreement</FormLabel>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                <LoadingButton
                  type="submit"
                  loading={isSubmitting}
                  className="w-full"
                >
                  Submit Application
                </LoadingButton>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
