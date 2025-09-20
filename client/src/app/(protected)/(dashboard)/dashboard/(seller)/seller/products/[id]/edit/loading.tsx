import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-none border-none">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Basic Information Section */}
          <div className="space-y-6">
            <Skeleton className="h-6 w-24" />

            <div className="grid gap-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-64" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Pricing & Category Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-40" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-12 w-full" />
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-12 w-full" />
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Media & Inventory Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-36" />
            </div>

            <div className="grid gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-6 w-12" />
                </div>

                {/* Image URL inputs */}
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <Skeleton className="h-12 flex-1" />
                      <Skeleton className="h-12 w-12" />
                      <Skeleton className="h-12 w-12" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-12 w-full" />

                {/* Image previews */}
                <div className="space-y-3">
                  <Skeleton className="h-5 w-32" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="aspect-square rounded-lg">
                        <Skeleton className="w-full h-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-4 w-48" />
              </div>
            </div>
          </div>

          <div className="h-px bg-border" />

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
            <Skeleton className="h-12 w-24" />
            <Skeleton className="h-12 w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}