"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText, ExternalLink } from "lucide-react";
import { formatDate } from "@/lib/utils/date.utils";
import { RoleApplication } from "@/types/domain/role/application";
import { StatusBadge } from "./status-badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ApplicationCardProps {
  application: RoleApplication;
  onWithdraw: (id: string) => Promise<void>;
}

export function ApplicationCard({ application, onWithdraw }: ApplicationCardProps) {
  const uniqueDocuments = Array.from(
    new Set(application.documents.map(doc => doc.name))
  ).map(name => application.documents.find(doc => doc.name === name)!);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div>
          <CardTitle className="text-xl font-semibold">
            {application.role.charAt(0).toUpperCase() + application.role.slice(1)} Role
          </CardTitle>
          <CardDescription className="flex items-center mt-1 space-x-4">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              Submitted {formatDate(application.createdAt)}
            </span>
            {application.updatedAt !== application.createdAt && (
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Updated {formatDate(application.updatedAt)}
              </span>
            )}
          </CardDescription>
        </div>
        <StatusBadge status={application.status} />
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2 flex items-center">
              <FileText className="w-4 h-4 mr-2" /> Documents
            </h4>
            <ul className="space-y-2">
              {uniqueDocuments.map((doc) => (
                <li key={doc._id} className="flex items-center text-sm">
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    {doc.name}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {application.feedback && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Feedback</h4>
                <p className="text-sm text-muted-foreground">{application.feedback}</p>
              </div>
            </>
          )}

          {application.status === "pending" && (
            <div className="flex justify-end mt-4">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    Withdraw Application
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Withdraw Application?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. You will need to submit a new application if you wish to apply again.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onWithdraw(application._id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Withdraw
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
