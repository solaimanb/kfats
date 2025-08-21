import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function ProductCardSkeleton() {
    return (
        <Card className="overflow-hidden border-0 shadow-md">
            <CardHeader className="p-0">
                <Skeleton className="h-56 w-full" />
            </CardHeader>
            <CardContent className="p-6">
                <Skeleton className="h-7 w-3/4 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-6" />
                <div className="flex justify-between">
                    <Skeleton className="h-12 w-20" />
                    <Skeleton className="h-12 w-20" />
                    <Skeleton className="h-12 w-20" />
                </div>
            </CardContent>
            <CardFooter className="p-6 pt-0">
                <Skeleton className="h-10 w-full" />
            </CardFooter>
        </Card>
    )
}
