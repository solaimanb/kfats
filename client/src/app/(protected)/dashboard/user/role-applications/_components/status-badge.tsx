"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle, Clock } from "lucide-react";

export type ApplicationStatus = "pending" | "approved" | "rejected" | "withdrawn";

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const statusConfig = {
  pending: {
    className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    icon: <Clock className="w-3 h-3 mr-1" />
  },
  approved: {
    className: "bg-green-100 text-green-800 hover:bg-green-200",
    icon: <AlertCircle className="w-3 h-3 mr-1" />
  },
  rejected: {
    className: "bg-red-100 text-red-800 hover:bg-red-200",
    icon: <AlertCircle className="w-3 h-3 mr-1" />
  },
  withdrawn: {
    className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    icon: <AlertCircle className="w-3 h-3 mr-1" />
  },
} as const;

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status.toLowerCase() as ApplicationStatus];

  return (
    <Badge variant="outline" className={config.className}>
      {config.icon}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
