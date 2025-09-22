import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
    value: number;
    label: string;
    colorClass?: string;
}

export const StatsCard = memo(({
    value,
    label,
    colorClass = "text-foreground"
}: StatsCardProps) => (
    <Card className="rounded-xs">
        <CardContent className="p-4">
            <div className={`text-2xl font-bold ${colorClass}`}>
                {value.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">{label}</p>
        </CardContent>
    </Card>
));

StatsCard.displayName = "StatsCard";
