import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 space-y-8">
        {/* Header Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-32" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
          </CardContent>
        </Card>

        {/* Tabs Skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex space-x-1 border-b">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24" />
                ))}
              </div>
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
