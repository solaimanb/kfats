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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sellerFormSchema = z.object({
  businessInfo: z.object({
    name: z.string().min(2, "Business name must be at least 2 characters"),
    type: z.string().min(1, "Business type is required"),
    registrationNumber: z.string().min(1, "Registration number is required"),
    taxId: z.string().min(1, "Tax ID is required"),
    description: z
      .string()
      .min(100, "Business description must be at least 100 characters"),
    yearEstablished: z.number().min(1900).max(new Date().getFullYear()),
  }),
  contact: z.object({
    phone: z.string().min(10, "Valid phone number required"),
    email: z.string().email("Valid email required"),
    address: z.object({
      street: z.string().min(1, "Street address is required"),
      city: z.string().min(1, "City is required"),
      state: z.string().min(1, "State is required"),
      postalCode: z.string().min(1, "Postal code is required"),
      country: z.string().min(1, "Country is required"),
    }),
  }),
  products: z.object({
    categories: z.array(z.string()).min(1, "Select at least one category"),
    shippingMethods: z
      .array(z.string())
      .min(1, "Select at least one shipping method"),
    estimatedProducts: z.number().min(1, "Number of products required"),
  }),
  documents: z.object({
    businessRegistration: z.any(),
    taxCertificate: z.any(),
    bankStatement: z.any(),
    identityProof: z.any(),
  }),
  bankingInfo: z.object({
    accountHolder: z.string().min(1, "Account holder name required"),
    accountNumber: z.string().min(1, "Account number required"),
    bankName: z.string().min(1, "Bank name required"),
    routingNumber: z.string().min(1, "Routing number required"),
    accountType: z.enum(["checking", "savings"]),
  }),
});

type SellerFormValues = z.infer<typeof sellerFormSchema>;

const businessTypes = [
  "Sole Proprietorship",
  "Partnership",
  "LLC",
  "Corporation",
  "Other",
];

const productCategories = [
  "Art Supplies",
  "Educational Materials",
  "Digital Products",
  "Craft Supplies",
  "Books & Publications",
  "Technology & Electronics",
  "Other",
];

const shippingMethods = [
  "Standard Shipping",
  "Express Shipping",
  "Local Pickup",
  "Digital Delivery",
];

export function SellerApplication() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerFormSchema),
    defaultValues: {
      businessInfo: {
        yearEstablished: new Date().getFullYear(),
      },
      products: {
        categories: [],
        shippingMethods: [],
        estimatedProducts: 0,
      },
    },
  });

  async function onSubmit(data: SellerFormValues) {
    try {
      setIsSubmitting(true);
      setError(null);

      // Handle document uploads
      const documentUploads = Object.entries(data.documents).map(
        async ([key, file]) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("type", key);

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) throw new Error(`Failed to upload ${key}`);
          return response.json();
        }
      );

      const uploadedDocuments = await Promise.all(documentUploads);

      // Submit application
      const response = await fetch("/api/role-applications/seller", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          documents: uploadedDocuments,
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
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Seller Application</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Accordion type="single" collapsible className="w-full">
              {/* Business Information Section */}
              <AccordionItem value="business-info">
                <AccordionTrigger>Business Information</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="businessInfo.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessInfo.type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {businessTypes.map((type) => (
                              <SelectItem key={type} value={type}>
                                {type}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessInfo.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your business..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Products & Services Section */}
              <AccordionItem value="products">
                <AccordionTrigger>Products & Services</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="products.categories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Product Categories</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const current = field.value || [];
                            const newValue = current.includes(value)
                              ? current.filter((item) => item !== value)
                              : [...current, value];
                            field.onChange(newValue);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select categories" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {productCategories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="products.shippingMethods"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Methods</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            const current = field.value || [];
                            const newValue = current.includes(value)
                              ? current.filter((item) => item !== value)
                              : [...current, value];
                            field.onChange(newValue);
                          }}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select shipping methods" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {shippingMethods.map((method) => (
                              <SelectItem key={method} value={method}>
                                {method}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Documents Section */}
              <AccordionItem value="documents">
                <AccordionTrigger>Required Documents</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="documents.businessRegistration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Registration Certificate</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          Upload a clear copy of your business registration
                          certificate
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="documents.taxCertificate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax Registration Certificate</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) =>
                              field.onChange(e.target.files?.[0])
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Banking Information Section */}
              <AccordionItem value="banking">
                <AccordionTrigger>Banking Information</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="bankingInfo.accountHolder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Holder Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="bankingInfo.accountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Type</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select account type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="checking">Checking</SelectItem>
                            <SelectItem value="savings">Savings</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>

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
