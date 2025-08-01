import { Skeleton } from "@/components/ui/skeleton";

export function ContentManagementSkeleton() {
    return (
        <div className="space-y-4">
            {/* Header Skeleton */}
            <div className="flex items-center justify-between">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-[200px]" />
                    <Skeleton className="h-4 w-[300px]" />
                </div>
            </div>

            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg border bg-card p-4 space-y-2">
                        <Skeleton className="h-8 w-[60px]" />
                        <Skeleton className="h-4 w-[80px]" />
                    </div>
                ))}
            </div>

            {/* Search Bar Skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-9 w-[300px]" />
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-9 w-[100px]" />
                    <Skeleton className="h-9 w-[80px]" />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className="rounded-md border">
                <div className="border-b bg-muted/50 p-4">
                    <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-[40px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[120px]" />
                        <Skeleton className="h-4 w-[80px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[100px]" />
                        <Skeleton className="h-4 w-[60px]" />
                    </div>
                </div>

                {/* Table Rows */}
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="border-b p-4 last:border-b-0">
                        <div className="flex items-center space-x-4">
                            <Skeleton className="h-4 w-[40px]" />
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-4 w-4 rounded" />
                                <Skeleton className="h-4 w-[180px]" />
                            </div>
                            <Skeleton className="h-6 w-[60px] rounded-full" />
                            <Skeleton className="h-6 w-[80px] rounded-full" />
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-3 w-[80px]" />
                            </div>
                            <div className="flex items-center space-x-1">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-[40px]" />
                            </div>
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-[80px]" />
                                <Skeleton className="h-3 w-[60px]" />
                            </div>
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-[80px]" />
                                <Skeleton className="h-3 w-[60px]" />
                            </div>
                            <Skeleton className="h-8 w-[40px]" />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-[100px]" />
                <div className="flex items-center space-x-2">
                    <Skeleton className="h-8 w-[80px]" />
                    <Skeleton className="h-8 w-[60px]" />
                    <Skeleton className="h-8 w-[80px]" />
                </div>
            </div>
        </div>
    );
}
