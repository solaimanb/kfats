import { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
    status: string;
}

export const StatusBadge = memo(({ status }: StatusBadgeProps) => {
    const variant = useMemo(() => {
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case "published":
            case "active":
                return "default" as const;
            case "draft":
                return "secondary" as const;
            case "unpublished":
            case "inactive":
                return "outline" as const;
            case "archived":
                return "destructive" as const;
            default:
                return "outline" as const;
        }
    }, [status]);

    const displayStatus = useMemo(() =>
        status.charAt(0).toUpperCase() + status.slice(1),
        [status]
    );

    return <Badge variant={variant}>{displayStatus}</Badge>;
});

StatusBadge.displayName = "StatusBadge";
