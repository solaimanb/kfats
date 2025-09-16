"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Users, Clock, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Course, CourseLevel } from "@/lib/types/api";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const getLevelColor = (level: CourseLevel) => {
    switch (level) {
      case CourseLevel.BEGINNER:
        return "bg-green-100 text-green-800 border-green-200";
      case CourseLevel.INTERMEDIATE:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case CourseLevel.ADVANCED:
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price.toFixed(2)}`;
  };

  const formatDuration = (hours?: number) => {
    if (!hours) return null;
    if (hours >= 1) {
      return `${hours}h`;
    }
    return `${Math.round(hours * 60)}m`;
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-sm hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="aspect-video relative overflow-hidden rounded-t-lg bg-gradient-to-br from-blue-100 to-blue-200">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-blue-400" />
            </div>
          )}

          {/* Level Badge */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="secondary"
              className={`${getLevelColor(
                course.level
              )} text-xs font-medium border`}
            >
              {course.level.toUpperCase()}
            </Badge>
          </div>

          {/* Price Badge */}
          <div className="absolute top-3 right-3">
            <Badge
              variant="secondary"
              className="bg-white/90 text-gray-900 border border-gray-200 text-sm font-semibold px-3 py-1"
            >
              {formatPrice(course.price)}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="space-y-3">
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors">
            {course.title}
          </h3>

          {course.short_description && (
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {course.short_description}
            </p>
          )}

          {/* Course Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{course.enrolled_count} students</span>
              </div>

              {course.duration_hours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{formatDuration(course.duration_hours)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Rating Placeholder */}
          <div className="flex items-center gap-1">
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-1">(4.5)</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Created {new Date(course.created_at).toLocaleDateString()}
            </span>
            <span>
              Last updated {new Date(course.updated_at).toLocaleDateString()}
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="flex-1 rounded-md hover:bg-gray-50"
            >
              <Link href={`/courses/${course.slug || course.id}`}>
                View Details
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="flex-1 rounded-md bg-blue-600 hover:bg-blue-700"
            >
              <Link href={`/courses/${course.slug || course.id}/enroll`}>
                {course.price === 0 ? "Enroll Free" : "Enroll Now"}
              </Link>
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
