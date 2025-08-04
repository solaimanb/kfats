import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ErrorStateProps {
    onRetry: () => void;
}

export function ErrorState({ onRetry }: ErrorStateProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Content Management</h2>
                    <p className="text-muted-foreground">
                        Unable to load content data
                    </p>
                </div>
                <Button onClick={onRetry} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                </Button>
            </div>
            <div className="rounded-lg border bg-muted/50 p-8 text-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="rounded-full bg-muted p-3">
                        <RefreshCw className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="font-semibold">Something went wrong</h3>
                        <p className="text-sm text-muted-foreground max-w-md">
                            We&apos;re having trouble loading your content right now. This is usually temporary.
                        </p>
                    </div>
                    <Button onClick={onRetry} className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Content
                    </Button>
                </div>
            </div>
        </div>
    );
}
