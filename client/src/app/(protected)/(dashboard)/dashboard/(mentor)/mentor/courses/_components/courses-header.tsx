"use client";

import Link from "next/link";
import { Filter, Search, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CoursesHeader() {
  return (
    <div className="mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
          <p className="text-lg text-gray-600">
            Manage your courses and track student progress
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" className="rounded-sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="rounded-sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
          <Button asChild className="rounded-sm bg-blue-600 hover:bg-blue-700">
            <Link href="/dashboard/mentor/courses/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
