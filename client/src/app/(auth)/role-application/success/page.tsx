"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RoleApplicationSuccessPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-green-600">
            Application Submitted Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Thank you for submitting your application. Our team will review your
              application and get back to you soon.
            </p>
            <p className="text-gray-600">
              You will receive updates about your application status via email.
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
            >
              Return to Home
            </Button>
            <Button
              onClick={() => router.push("/dashboard/user")}
              variant="default"
            >
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
