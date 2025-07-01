"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Checkbox } from "@/components/ui/checkbox";

import { roleApplicationService } from "@/lib/api/services/role-application.service";
import { handleApiError } from '@/lib/utils/error';
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth/use-auth";
import { UserRole } from "@/config/rbac/types";
import type { RoleApplicationRequest } from "@/types/api/role/requests";

interface Documents {
  identityProof?: File;
}

interface DocumentTypes {
  [key: string]: string[];
}

const ACCEPTED_DOCUMENT_TYPES: DocumentTypes = {
  identity_proof: ['image/jpeg', 'image/png', 'application/pdf']
};

interface UploadedDocument {
  type: string;
  url: string;
  name: string;
  mimeType: string;
  size: number;
  publicId?: string;
}

const formSchema = z.object({
  // Basic Profile
  businessName: z
    .string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must not exceed 100 characters"),
  businessType: z
    .string()
    .min(2, "Business type must be at least 2 characters")
    .max(50, "Business type must not exceed 50 characters"),
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

  // Address
  address: z.object({
    street: z.string().min(1, "Street address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postalCode: z.string().min(1, "Postal code is required"),
    country: z.string().min(1, "Country is required"),
  }),

  // Social Links (optional)
  socialLinks: z.object({
    website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    linkedin: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    twitter: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    facebook: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  }),

  // File uploads
  avatar: z.any().optional(),
  documents: z.any().array().optional(),

  agreement: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

export function BecomeSellerForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documents, setDocuments] = useState<Documents>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setPreviewUrl(URL.createObjectURL(file));
        form.setValue("avatar", file);
      } catch (error) {
        console.error('[handleImageChange] Error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error occurred';
        toast.error(`Failed to upload image: ${message}`);
      }
    }
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "identityProof"
  ) => {
    console.log(`[handleFileChange] Processing ${type} upload:`, event.target.files);
    const file = event.target.files?.[0];
    if (file) {
      if (!ACCEPTED_DOCUMENT_TYPES.identity_proof.includes(file.type)) {
        toast.error(`Invalid file type for ${type}. Please upload a PDF or image file.`);
        return;
      }

      setDocuments(prev => ({ ...prev, [type]: file }));
      const currentDocs = form.getValues("documents") || [];
      form.setValue("documents", [...currentDocs, file]);
    }
  };

  const uploadDocument = async (
    file: File,
    type: "identity_proof"
  ): Promise<UploadedDocument> => {
    console.log("[uploadDocument] Starting upload for", type);

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error(`File size must be less than 5MB`);
    }

    const formData = new FormData();
    formData.append('document', file);

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
      // Upload Identity Proof if exists
      if (documents.identityProof) {
        console.log('[uploadDocuments] Uploading Identity Proof...');
        const idDoc = await uploadDocument(documents.identityProof, 'identity_proof');
        uploadedDocs.push(idDoc);
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
        role: UserRole.SELLER,
        fields: {
          reason: values.bio || "Interested in becoming a seller",
          qualifications: [],
          experience: {
            years: 0,
            details: `Business Name: ${values.businessName}\nBusiness Type: ${values.businessType}\nBio: ${values.bio}`
          },
          specialization: [],
          teachingStyle: "",
          availability: []
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
      await roleApplicationService.submitApplication(applicationData);
      
      toast.success("Application submitted successfully!");
      setIsSuccess(true);
      router.push("/role-application/success");
    } catch (error) {
      console.error("[onSubmit] Error:", error);
      toast.error(handleApiError(error));
      setError(error as Error);
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const renderDocumentUpload = (
    type: "identityProof",
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
              accept=".pdf,.jpg,.jpeg,.png"
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
              Become a Seller
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        S
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
                    <h3 className="text-sm font-medium mb-1">Business Logo</h3>
                    <p className="text-xs text-muted-foreground">Upload your business logo or profile picture.</p>
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
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us about your business and what you sell..."
                            className="min-h-[100px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-8" />

                {/* Business Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Business Details</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="businessName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your business name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Type</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your business type" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Business Address</h3>
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
                          <FormMessage />
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
                          <FormMessage />
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
                          <FormMessage />
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
                          <FormMessage />
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
                          <FormMessage />
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

                {/* Document Upload */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Required Documents</h3>
                  {renderDocumentUpload("identityProof", "Identity Proof", true)}
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
}
