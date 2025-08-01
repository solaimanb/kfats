import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentHeaderProps {
    totalItems: number;
    onRefresh: () => void;
    isRefreshing?: boolean;
}

export function ContentHeader({ totalItems, onRefresh, isRefreshing = false }: ContentHeaderProps) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Content Management</h1>
                <p className="text-muted-foreground">
                    Manage all content across the platform ({totalItems.toLocaleString()} items)
                </p>
            </div>
            <Button 
                onClick={onRefresh} 
                variant="outline" 
                size="sm"
                disabled={isRefreshing}
            >
                <RefreshCw className={cn(
                    "h-4 w-4 mr-2",
                    isRefreshing && "animate-spin"
                )} />
                {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
        </div>
    );
}
