"use client";

import { useState, ChangeEvent, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { PlusCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import { roleApplicationService } from "@/lib/api/services/role-application.service";
import { handleApiError } from '@/lib/utils/error';
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth/use-auth";
import { UserRole } from "@/config/rbac/types";
import type { RoleApplicationRequest } from "@/types/api/role/requests";

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
  bio: z.string()
    .min(100, "Bio must be at least 100 characters")
    .max(500)
    .refine(
      (value) => !/^(.)\1+$/.test(value),
      "Please provide a meaningful bio"
    ),

  // File uploads
  avatar: z.any().optional(),
  documents: z.any().array().optional(),

  // Required fields for role application
  reason: z.string()
    .min(100, "Please provide a detailed reason for becoming a mentor (minimum 100 characters)")
    .max(500)
    .refine(
      (value) => !/^(.)\1+$/.test(value),
      "Please provide a meaningful reason"
    ),
  additionalInfo: z.string().optional(),

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
    .min(1, "At least one area of expertise is required")
    .max(5, "Maximum 5 areas of expertise allowed")
    .refine(
      (values) => values.every((value) => value.length >= 3),
      "Each expertise must be at least 3 characters long"
    ),
  experience: z.number().min(1, "Must have at least 1 year of teaching experience"),
  qualifications: z
    .array(
      z.object({
        degree: z.string().min(2, "Degree must be at least 2 characters"),
        institution: z.string().min(2, "Institution must be at least 2 characters"),
        year: z.number()
          .min(1900, "Invalid year")
          .max(new Date().getFullYear() + 5, "Year cannot be more than 5 years in the future"),
        field: z.string().min(2, "Field must be at least 2 characters"),
      })
    )
    .min(1, "At least one qualification is required"),
  teachingMethodology: z
    .string()
    .min(100, "Teaching methodology must be at least 100 characters")
    .max(1000, "Teaching methodology must not exceed 1000 characters")
    .refine(
      (value) => !/^(.)\1+$/.test(value),
      "Please provide a meaningful teaching methodology"
    ),
  languages: z
    .array(z.string())
    .min(1, "At least one teaching language is required")
    .refine(
      (values) => values.every((value) => value.length >= 2),
      "Each language must be at least 2 characters long"
    ),

  agreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

interface Documents {
  cv?: File;
  identityProof?: File;
  teachingCertification?: File;
}

interface DocumentTypes {
  [key: string]: string[];
}

const ACCEPTED_DOCUMENT_TYPES: DocumentTypes = {
  cv: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  identity_proof: ['image/jpeg', 'image/png', 'application/pdf'],
  teaching_certification: ['image/jpeg', 'image/png', 'application/pdf']
};

interface UploadedDocument {
  type: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  publicId?: string;
}

export const BecomeMentorForm = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Documents>({});
  const [expertiseInput, setExpertiseInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      bio: "",
      avatar: "",
      documents: [],
      reason: "",
      additionalInfo: "",
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
        },
      ],
      experience: 0,
      languages: [],
      agreement: false,
    },
    mode: "onChange",
  });

  // Pre-fill form with user data
  useEffect(() => {
    if (user?.profile) {
      form.setValue("firstName", user.profile.firstName || "");
      form.setValue("lastName", user.profile.lastName || "");
      form.setValue("email", user.email || "");
      form.setValue("phone", user.profile.phone || "");
      form.setValue("bio", user.profile.bio || "");

      // Pre-fill address if available
      if (user.profile.address) {
        form.setValue("address.street", user.profile.address.street || "");
        form.setValue("address.city", user.profile.address.city || "");
        form.setValue("address.state", user.profile.address.state || "");
        form.setValue("address.postalCode", user.profile.address.postalCode || "");
        form.setValue("address.country", user.profile.address.country || "");
      }

      // Pre-fill social links if available
      if (user.profile.socialLinks) {
        form.setValue("socialLinks.website", user.profile.socialLinks.website || "");
        form.setValue("socialLinks.linkedin", user.profile.socialLinks.linkedin || "");
        form.setValue("socialLinks.twitter", user.profile.socialLinks.twitter || "");
        form.setValue("socialLinks.facebook", user.profile.socialLinks.facebook || "");
      }
    }
  }, [user, form]);

  const {
    fields: qualificationFields,
    append: appendQualification,
    remove: removeQualification,
  } = useFieldArray({
    name: "qualifications",
    control: form.control,
  });

  useEffect(() => {
    if (selectedFile) {
      form.setValue("avatar", selectedFile.name);
    }
  }, [selectedFile, form]);

  useEffect(() => {
    if (selectedFiles.length > 0) {
      form.setValue("documents", selectedFiles.map((file) => file.name));
    }
  }, [selectedFiles, form]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setPreviewUrl(URL.createObjectURL(file));
        setSelectedFile(file);
        form.setValue("avatar", file);
      } catch (error) {
        console.error('[handleImageChange] Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to upload image: ${message}`);
      }
    }
  };

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    type: "cv" | "identityProof" | "teachingCertification"
  ) => {
    console.log(`[handleFileChange] Processing ${type} upload:`, event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      const documentType = type === 'cv' ? 'cv' :
        type === 'identityProof' ? 'identity_proof' :
          'teaching_certification';

      if (!ACCEPTED_DOCUMENT_TYPES[documentType].includes(file.type)) {
        toast.error(`Invalid file type for ${type}. Please upload a PDF or Word document.`);
        return;
      }

      setDocuments(prev => ({ ...prev, [type]: file }));
      setSelectedFiles(prev => [...prev, file]);
      const currentDocs = form.getValues("documents") || [];
      form.setValue("documents", [...currentDocs, file]);
    }
  };

  const uploadDocument = async (
    file: File,
    type: "cv" | "identity_proof" | "teaching_certification"
  ): Promise<UploadedDocument> => {
    console.log("[uploadDocument] Starting upload for", type);

    // Validate file type based on document type
    const allowedTypes: Record<string, string[]> = {
      cv: ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      identity_proof: ["image/jpeg", "image/png", "application/pdf"],
      teaching_certification: ["application/pdf", "image/jpeg", "image/png"]
    };

    if (!allowedTypes[type].includes(file.type)) {
      throw new Error(`Invalid file type for ${type}. Allowed types: ${allowedTypes[type].join(", ")}`);
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`File size must be less than 5MB`);
    }

    const formData = new FormData();
    formData.append('document', file);

    // Log FormData contents
    console.log('[uploadDocument] FormData contents:');
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }

    try {
      const endpoint = `/api/v1/role-applications/upload/${type}`;
      console.log('[uploadDocument] Sending request to:', endpoint);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const responseText = await response.text();
      console.log('[uploadDocument] Raw response:', responseText);

      const { status, data } = JSON.parse(responseText);
      console.log('[uploadDocument] Parsed response:', { status, data });

      if (status !== 'success' || !data?.document) {
        throw new Error('Invalid response from server');
      }

      const uploadedDoc = {
        type,
        url: data.document.url,
        name: file.name,
        mimeType: file.type,
        size: file.size,
        publicId: data.document.publicId
      };
      console.log('[uploadDocument] Created document object:', uploadedDoc);

      return uploadedDoc;
    } catch (error) {
      console.error('[uploadDocument] Error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      throw new Error(`Failed to upload ${type}: ${message}`);
    }
  };

  const uploadDocuments = async (documents: Documents): Promise<UploadedDocument[]> => {
    console.log('[uploadDocuments] Starting document uploads with:', documents);
    const uploadedDocs: UploadedDocument[] = [];

    try {
      // Upload CV if exists
      if (documents.cv) {
        console.log('[uploadDocuments] Uploading CV...');
        const cvDoc = await uploadDocument(documents.cv, 'cv');
        if (Array.isArray(cvDoc)) {
          uploadedDocs.push(...cvDoc);
        } else {
          uploadedDocs.push(cvDoc);
        }
      }

      // Upload Identity Proof if exists
      if (documents.identityProof) {
        console.log('[uploadDocuments] Uploading Identity Proof...');
        const idDoc = await uploadDocument(documents.identityProof, 'identity_proof');
        if (Array.isArray(idDoc)) {
          uploadedDocs.push(...idDoc);
        } else {
          uploadedDocs.push(idDoc);
        }
      }

      // Upload Teaching Certification if exists
      if (documents.teachingCertification) {
        console.log('[uploadDocuments] Uploading Teaching Certification...');
        const certDoc = await uploadDocument(documents.teachingCertification, 'teaching_certification');
        if (Array.isArray(certDoc)) {
          uploadedDocs.push(...certDoc);
        } else {
          uploadedDocs.push(certDoc);
        }
      }

      console.log('[uploadDocuments] All documents uploaded:', uploadedDocs);
      return uploadedDocs;
    } catch (error) {
      console.error('[uploadDocuments] Error:', error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('[onSubmit] Starting submission process');
    console.log('[onSubmit] Form values:', values);
    setIsSubmitting(true);

    try {
      console.log('[onSubmit] Starting document uploads...');
      const uploadedDocs = await uploadDocuments(documents);
      console.log('[onSubmit] All documents uploaded:', uploadedDocs);

      const applicationData: RoleApplicationRequest = {
        role: UserRole.MENTOR,
        fields: {
          reason: values.reason,
          qualifications: values.qualifications.map(q => ({
            degree: q.degree,
            institution: q.institution,
            year: q.year,
            field: q.field
          })),
          experience: {
            years: values.experience,
            details: values.bio
          },
          specialization: values.expertise,
          teachingStyle: values.teachingMethodology,
          availability: values.languages || []
        },
        documents: uploadedDocs.map(doc => ({
          type: doc.type,
          url: doc.url,
          name: doc.name,
          mimeType: doc.mimeType,
          size: doc.size
        }))
      };

      console.log('[onSubmit] Submitting application with data:', JSON.stringify(applicationData, null, 2));

      // Log the request that will be sent
      console.log('[onSubmit] Request URL:', '/api/v1/role-applications');
      console.log('[onSubmit] Request method: POST');
      console.log('[onSubmit] Request headers:', {
        'Content-Type': 'application/json'
      });
      console.log('[onSubmit] Request body:', applicationData);

      await roleApplicationService.submitApplication(applicationData);

      toast.success('Application submitted successfully!');
      router.push('/role-application/success');
      setIsSuccess(true);
    } catch (error) {
      console.log('[onSubmit] Error:', error);
      if (error instanceof Error) {
        console.log('[onSubmit] Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      toast.error(handleApiError(error));
      setError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add document upload section
  const renderDocumentUpload = (
    type: "cv" | "identityProof" | "teachingCertification",
    label: string,
    required = false
  ) => {
    const file = documents[type];
    console.log(`[renderDocumentUpload] Rendering ${type}:`, { file });

    return (
      <FormItem>
        <FormLabel>
          {label} {required && <span className="text-destructive">*</span>}
        </FormLabel>
        <FormControl>
          <div className="flex items-center gap-4">
            <Input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => handleFileChange(e, type)}
              className={cn(
                "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              )}
            />
            {file && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {file.name}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log(`[renderDocumentUpload] Removing ${type}`);
                    setDocuments(prev => {
                      const newState = { ...prev };
                      delete newState[type];
                      console.log('[renderDocumentUpload] Updated documents state:', newState);
                      return newState;
                    });
                  }}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </FormControl>
      </FormItem>
    );
  };

  // Add debug logging for form validation
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      console.log('[Form Validation] Current errors:', errors);
      console.log('[Form Validation] Form values:', form.getValues());
      console.log('[Form Validation] Required documents:', documents);
    }
  }, [form.formState.errors, form.getValues, documents, form]);

  useEffect(() => {
    if (isSuccess) {
      router.push("/role-application/success");
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

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
              Become a Mentor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(
                  (values) => {
                    console.log('[Form] Submit triggered with values:', values);
                    onSubmit(values);
                  },
                  (errors) => {
                    console.error('[Form] Validation errors:', errors);
                    toast.error("Please fill in all required fields correctly");
                  }
                )}
                className="space-y-8"
              >
                {/* Profile Image Upload */}
                <div className="flex flex-col items-center text-center space-y-6 p-8 bg-muted/30 rounded-lg">
                  <div className="relative">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={96}
                        height={96}
                        className="rounded-full object-cover w-24 h-24 border-2 border-muted"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground border-2 border-muted">
                        M
                      </div>
                    )}
                    <Label
                      htmlFor="profile"
                      className="absolute bottom-0 right-0 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </Label>
                    <Input
                      id="profile"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                  <div className="max-w-sm">
                    <h3 className="text-sm font-medium mb-1">Profile Picture</h3>
                    <p className="text-xs text-muted-foreground">Upload a professional photo for your mentor profile.</p>
                  </div>
                </div>

                {/* Basic Profile */}
                <div className="space-y-6">
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
                          <Textarea
                            placeholder="Tell us about yourself and your teaching philosophy"
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">Address</h3>
                    <span className="text-sm text-muted-foreground">(Optional)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">Social Links</h3>
                    <span className="text-sm text-muted-foreground">(Optional)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                            <Input placeholder="LinkedIn profile URL" {...field} />
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
                            <Input placeholder="Facebook profile URL" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Application Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Application Details</h3>

                  <FormField
                    control={form.control}
                    name="reason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Why do you want to become a mentor?</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Share your motivation and goals..."
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
                    name="teachingMethodology"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teaching Methodology</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your teaching approach and methods..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Expertise */}
                <div className="space-y-4">
                  <Label>Areas of Expertise</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add expertise (e.g., Oil Painting)"
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
                              className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                            >
                              {item}
                              <button
                                type="button"
                                onClick={() => {
                                  const newExpertise = [...form.watch("expertise")];
                                  newExpertise.splice(index, 1);
                                  form.setValue("expertise", newExpertise);
                                }}
                                className="text-primary hover:text-primary/80"
                              >
                                <X className="h-3 w-3" />
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
                    <h3 className="text-lg font-medium">Qualifications</h3>
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
                        })
                      }
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Qualification
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {qualificationFields.map((field, index) => (
                      <div
                        key={field.id}
                        className="p-4 border rounded-lg relative space-y-4 bg-card"
                      >
                        <button
                          type="button"
                          onClick={() => removeQualification(index)}
                          className="absolute right-2 top-2 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                                  <Input placeholder="Institution name" {...field} />
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
                                  <Input placeholder="Your field of study" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
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
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? 0 : parseInt(value));
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Languages */}
                <div className="space-y-4">
                  <Label>Languages</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add language (e.g., English)"
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
                              className="bg-primary/10 text-primary px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                            >
                              {item}
                              <button
                                type="button"
                                onClick={() => {
                                  const newLanguages = [...form.watch("languages")];
                                  newLanguages.splice(index, 1);
                                  form.setValue("languages", newLanguages);
                                }}
                                className="text-primary hover:text-primary/80"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Required Documents</h3>
                  {renderDocumentUpload("cv", "CV/Resume", true)}
                  {renderDocumentUpload("identityProof", "Identity Proof", true)}
                  {renderDocumentUpload(
                    "teachingCertification",
                    "Teaching Certification (Optional)"
                  )}
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
                          I agree to the terms and conditions
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <div className="pt-6 space-y-2">
                  <LoadingButton
                    type="submit"
                    className="w-full"
                    loading={isSubmitting}
                    disabled={isSubmitting || !form.formState.isValid}
                    onClick={() => {
                      if (!form.formState.isValid) {
                        console.log('[Submit Button] Form is invalid. Current errors:', form.formState.errors);
                        toast.error("Please fill in all required fields correctly");
                      }
                    }}
                  >
                    {isSubmitting ? "Submitting Application..." : "Submit Application"}
                  </LoadingButton>
                  {!form.formState.isValid && (
                    <p className="text-xs text-destructive/50 text-center">
                      Please fill in all required fields correctly to enable submission
                    </p>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
