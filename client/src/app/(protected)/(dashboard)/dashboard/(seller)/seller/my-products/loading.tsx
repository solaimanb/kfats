import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header skeleton */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8" />
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>
        </div>
        <Skeleton className="h-6 w-24" />
      </header>

      {/* Table skeleton */}
      <Card>
        <CardContent className="p-6">
          {/* Toolbar skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-1 items-center space-x-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-8 w-16" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>

          {/* Table header skeleton */}
          <div className="border rounded-md">
            <div className="border-b bg-muted/50 px-4 py-3">
              <div className="grid grid-cols-6 gap-4">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>

            {/* Table rows skeleton */}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="border-b px-4 py-4 last:border-b-0">
                <div className="grid grid-cols-6 gap-4 items-center">
                  <Skeleton className="h-4 w-6" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                </div>
              </div>
            ))}
          </div>

          {/* Pagination skeleton */}
          <div className="flex items-center justify-between mt-4">
            <Skeleton className="h-4 w-32" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}