"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WriterOverviewData } from "./types";
import { PenTool, FileText, Archive } from "lucide-react";

interface WriterOverviewStatsProps {
  data: WriterOverviewData;
  isLoading?: boolean;
}

export function WriterOverviewStats({
  data,
  isLoading,
}: WriterOverviewStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              <div className={`p-2 rounded-lg bg-muted animate-pulse`} />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-12 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              {i === 2 && (
                <div className="h-5 w-16 bg-muted animate-pulse rounded mt-2" />
              )}
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/5 pointer-events-none" />
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      title: "Total Articles",
      value: data.totalArticles,
      description: "All time articles",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Published",
      value: data.publishedArticles,
      description: "Live articles",
      icon: PenTool,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Draft Articles",
      value: data.draftArticles,
      description: "Work in progress",
      icon: FileText,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Archived",
      value: data.archivedArticles,
      description: "Archived content",
      icon: Archive,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>

            {/* Subtle gradient overlay for visual appeal */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/5 pointer-events-none" />
          </Card>
        );
      })}
    </div>
  );
}
