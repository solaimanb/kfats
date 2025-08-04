import { useMemo } from "react";
import type { StatsData } from "../_types/types";

export function useStatsCards(stats: StatsData | undefined) {
    return useMemo(() => {
        if (!stats) return null;

        const totalItems = (stats.by_type.articles || 0) +
            (stats.by_type.courses || 0) +
            (stats.by_type.products || 0);

        return [
            {
                value: stats.total_published,
                label: "Published",
                colorClass: "text-green-600"
            },
            {
                value: stats.total_drafts,
                label: "Drafts",
                colorClass: "text-yellow-600"
            },
            {
                value: stats.total_featured,
                label: "Featured",
                colorClass: "text-blue-600"
            },
            {
                value: totalItems,
                label: "Total Items",
                colorClass: "text-foreground"
            }
        ];
    }, [stats]);
}
