"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, DollarSign, Star } from "lucide-react";
import type { MentorOverviewData } from "./types";
import { formatCurrency } from "./utils";

interface MentorOverviewStatsProps {
  data: MentorOverviewData | undefined;
  isLoading: boolean;
}

export function MentorOverviewStats({
  data,
  isLoading,
}: MentorOverviewStatsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="relative overflow-hidden animate-pulse bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-none"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-20" />
              <div className="h-5 w-5 bg-slate-200 dark:bg-slate-700 rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-16 mb-2" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-200 rounded-none">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            My Courses
          </CardTitle>
          <div className="p-2 bg-blue-500/10 dark:bg-blue-400/10 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-1">
            {data?.my_courses || 0}
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
            Total courses created
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-200 rounded-none">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-green-500 to-green-600" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-green-900 dark:text-green-100">
            Total Students
          </CardTitle>
          <div className="p-2 bg-green-500/10 dark:bg-green-400/10 rounded-lg">
            <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-900 dark:text-green-100 mb-1">
            {data?.total_students || 0}
          </div>
          <p className="text-xs text-green-700 dark:text-green-300 font-medium">
            Across all courses
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:shadow-lg transition-all duration-200 rounded-none">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
            Monthly Revenue
          </CardTitle>
          <div className="p-2 bg-emerald-500/10 dark:bg-emerald-400/10 rounded-lg">
            <DollarSign className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100 mb-1">
            {formatCurrency(data?.monthly_revenue || 0)}
          </div>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            This month
          </p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/20 dark:to-yellow-900/20 border-yellow-200 dark:border-yellow-800 hover:shadow-lg transition-all duration-200 rounded-none">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-yellow-500 to-yellow-600" />
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
            Avg. Rating
          </CardTitle>
          <div className="p-2 bg-yellow-500/10 dark:bg-yellow-400/10 rounded-lg">
            <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mb-1">
            {data?.average_rating?.toFixed(1) || "0.0"}
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
            Student ratings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
