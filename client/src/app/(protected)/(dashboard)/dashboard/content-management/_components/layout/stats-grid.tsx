import { StatsCard } from "../cards/stats-card";

interface StatsGridProps {
    stats: Array<{
        value: number;
        label: string;
        colorClass: string;
    }>;
}

export function StatsGrid({ stats }: StatsGridProps) {
    return (
        <section aria-label="Content statistics">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {stats.map((stat, index) => (
                    <StatsCard
                        key={`${stat.label}-${index}`}
                        value={stat.value}
                        label={stat.label}
                        colorClass={stat.colorClass}
                    />
                ))}
            </div>
        </section>
    );
}
