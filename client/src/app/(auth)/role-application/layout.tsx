"use client";

import { useAuth } from "@/hooks/auth/use-auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { roleApplicationService } from "@/lib/api/services/role-application.service";
import type { RoleApplication } from "@/types/domain/role/application";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RoleApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [hasExistingApplication, setHasExistingApplication] = useState(false);
  const [existingApplicationRole, setExistingApplicationRole] = useState<string>("");
  const [isCheckingApplication, setIsCheckingApplication] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      toast.error("Please login to continue");
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const checkExistingApplications = async () => {
      try {
        setIsCheckingApplication(true);
        const response = await roleApplicationService.getUserApplications();
        const applications = response.data || [];
        const pendingApplications = applications.filter(
          (app: RoleApplication) => app.status === 'pending'
        );
        
        if (pendingApplications.length > 0) {
          setExistingApplicationRole(pendingApplications[0].role);
          setHasExistingApplication(true);
        }
      } catch (error) {
        console.error("Error checking applications:", error);
        toast.error("Failed to check existing applications");
      } finally {
        setIsCheckingApplication(false);
      }
    };

    if (user) {
      checkExistingApplications();
    }
  }, [user]);

  if (isLoading || isCheckingApplication) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <AlertDialog open={hasExistingApplication}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pending Application Exists</AlertDialogTitle>
            <AlertDialogDescription>
              You already have a pending application for the {existingApplicationRole} role.
              Please wait for it to be processed before applying for another role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => router.push("/dashboard/user/role-applications")}>
              View My Applications
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {!hasExistingApplication && children}
    </>
  );
}
