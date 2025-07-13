"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { roleApplicationService } from "@/lib/api/services/role-application.service";
import { handleApiError } from "@/lib/utils/error";
import { RoleApplication } from "@/types/domain/role/application";
import { ApplicationCard } from "./_components/application-card";
import { EmptyState } from "./_components/empty-state";
import { Suspense } from "react";
import RoleApplicationsLoading from "./loading";

export default function RoleApplicationsPage() {
  const [applications, setApplications] = useState<RoleApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const response = await roleApplicationService.getUserApplications();
      setApplications(response.status === 'success' ? response.data : []);
    } catch (error) {
      toast.error(handleApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async (applicationId: string) => {
    try {
      await roleApplicationService.withdrawApplication(applicationId);
      toast.success("Application withdrawn successfully");
      loadApplications();
    } catch (error) {
      toast.error(handleApiError(error));
    }
  };

  if (isLoading) {
    return <RoleApplicationsLoading />;
  }

  return (
    <Suspense fallback={<RoleApplicationsLoading />}>
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Role Applications</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage your role applications
            </p>
          </div>
        </div>

        {applications.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4">
            {applications.map((application) => (
              <ApplicationCard
                key={application._id}
                application={application}
                onWithdraw={handleWithdraw}
              />
            ))}
          </div>
        )}
      </div>
    </Suspense>
  );
}
