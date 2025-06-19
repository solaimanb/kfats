"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import * as z from "zod";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { PlusCircle, X } from "lucide-react";

const qualificationSchema = z.object({
  degree: z.string().min(2, "Degree is required"),
  institution: z.string().min(2, "Institution is required"),
  year: z.number().min(1900, "Invalid year").max(new Date().getFullYear()),
  field: z.string().min(2, "Field of study is required"),
  certificate: z.string().optional(),
});

const formSchema = z.object({
  // Basic Profile
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\+?[\d\s-]{10,}$/, "Invalid phone number format"),
  bio: z.string().min(100, "Bio must be at least 100 characters").max(500),

  // Address (optional)
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),

  // Social Links (optional)
  socialLinks: z.object({
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    linkedin: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
    twitter: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    facebook: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),
  }),

  // Mentor-specific
  expertise: z
    .array(z.string())
    .min(1, "At least one area of expertise is required"),
  qualifications: z
    .array(qualificationSchema)
    .min(1, "At least one qualification is required"),
  experience: z.number().min(1, "Must have at least 1 year of experience"),
  languages: z.array(z.string()).min(1, "At least one language is required"),

  agreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

export const BecomeMentorForm = () => {
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [expertiseInput, setExpertiseInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      socialLinks: {
        website: "",
        linkedin: "",
        twitter: "",
        facebook: "",
      },
      expertise: [],
      qualifications: [
        {
          degree: "",
          institution: "",
          year: new Date().getFullYear(),
          field: "",
          certificate: "",
        },
      ],
      experience: 0,
      languages: [],
      agreement: false,
    },
  });

  const {
    fields: qualificationFields,
    append: appendQualification,
    remove: removeQualification,
  } = useFieldArray({
    name: "qualifications",
    control: form.control,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log("Form Data:", values);
    console.log("Profile Image:", profileImage);
  };

  return (
    <section className="max-w-full bg-gradient-to-br to-kc-text/60 from-kc-dark py-10">
      <Link href="/" className="inline-block">
        <Image
          src="/images/kc-logo.png"
          alt="Logo"
          width={100}
          height={100}
          className="object-contain w-20 ml-8"
        />
      </Link>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Become a Mentor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Profile Image Upload */}
              <div className="text-center">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={120}
                    height={120}
                    className="rounded-full mx-auto mb-2 object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full mx-auto mb-2 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                    Preview
                  </div>
                )}
                <Label
                  htmlFor="profile"
                  className="block text-sm font-medium mb-1"
                >
                  Upload Profile Picture
                </Label>
                <Input
                  id="profile"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full"
                />
              </div>

              {/* Basic Profile */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Your email"
                          {...field}
                        />
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

              {/* Bio */}
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about yourself and your teaching philosophy"
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Address (Optional)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="Street address" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="City" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="State" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Postal code" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="Country" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  Social Links (Optional)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="socialLinks.website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="Your website URL" {...field} />
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
                          <Input
                            placeholder="LinkedIn profile URL"
                            {...field}
                          />
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
                          <Input placeholder="Twitter profile URL" {...field} />
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
                          <Input
                            placeholder="Facebook profile URL"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Separator />

              {/* Expertise */}
              <div className="space-y-2">
                <Label>Areas of Expertise</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add expertise"
                    value={expertiseInput}
                    onChange={(e) => setExpertiseInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (expertiseInput.trim()) {
                          form.setValue("expertise", [
                            ...form.watch("expertise"),
                            expertiseInput.trim(),
                          ]);
                          setExpertiseInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (expertiseInput.trim()) {
                        form.setValue("expertise", [
                          ...form.watch("expertise"),
                          expertiseInput.trim(),
                        ]);
                        setExpertiseInput("");
                      }
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="expertise"
                  render={() => (
                    <FormItem>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("expertise").map((item, index) => (
                          <div
                            key={index}
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => {
                                const newExpertise = [
                                  ...form.watch("expertise"),
                                ];
                                newExpertise.splice(index, 1);
                                form.setValue("expertise", newExpertise);
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

              {/* Qualifications */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Qualifications</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      appendQualification({
                        degree: "",
                        institution: "",
                        year: new Date().getFullYear(),
                        field: "",
                        certificate: "",
                      })
                    }
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Qualification
                  </Button>
                </div>

                {qualificationFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="space-y-4 p-4 border rounded-lg relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeQualification(index)}
                      className="absolute right-2 top-2 text-destructive hover:text-destructive/80"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`qualifications.${index}.degree`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Degree</FormLabel>
                            <FormControl>
                              <Input placeholder="Your degree" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`qualifications.${index}.institution`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Institution</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Institution name"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`qualifications.${index}.year`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder="Year of completion"
                                {...field}
                                onChange={(e) =>
                                  field.onChange(parseInt(e.target.value))
                                }
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`qualifications.${index}.field`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Field of Study</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Your field of study"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`qualifications.${index}.certificate`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Certificate URL (Optional)</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Link to your certificate"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Experience */}
              <FormField
                control={form.control}
                name="experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Years of teaching experience"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Languages */}
              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add language"
                    value={languageInput}
                    onChange={(e) => setLanguageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (languageInput.trim()) {
                          form.setValue("languages", [
                            ...form.watch("languages"),
                            languageInput.trim(),
                          ]);
                          setLanguageInput("");
                        }
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (languageInput.trim()) {
                        form.setValue("languages", [
                          ...form.watch("languages"),
                          languageInput.trim(),
                        ]);
                        setLanguageInput("");
                      }
                    }}
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name="languages"
                  render={() => (
                    <FormItem>
                      <div className="flex flex-wrap gap-2">
                        {form.watch("languages").map((item, index) => (
                          <div
                            key={index}
                            className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2"
                          >
                            {item}
                            <button
                              type="button"
                              onClick={() => {
                                const newLanguages = [
                                  ...form.watch("languages"),
                                ];
                                newLanguages.splice(index, 1);
                                form.setValue("languages", newLanguages);
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

              {/* Agreement */}
              <FormField
                control={form.control}
                name="agreement"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I confirm all information is accurate and I agree to the
                        terms and conditions
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-center">
                <Button type="submit" size="lg">
                  Submit Application
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </section>
  );
};
