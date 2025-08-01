import { memo } from "react";

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
    <div className="rounded-lg border bg-card p-4 transition-colors hover:bg-accent/50">
        <div className={`text-2xl font-bold ${colorClass}`}>
            {value.toLocaleString()}
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
    </div>
));

StatsCard.displayName = "StatsCard";
