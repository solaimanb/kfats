"use client";

import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function CoursesEmptyState() {
  return (
    <Card className="rounded-sm border-2 border-dashed border-gray-300 bg-gray-50/50">
      <CardContent className="p-12 text-center">
        <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <BookOpen className="h-10 w-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          No courses yet
        </h3>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Start your teaching journey by creating your first course. Share your
          knowledge and help students learn something new.
        </p>
        <Button
          asChild
          size="lg"
          className="rounded-sm bg-blue-600 hover:bg-blue-700"
        >
          <Link href="/dashboard/mentor/courses/create">
            <Plus className="h-5 w-5 mr-2" />
            Create Your First Course
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
