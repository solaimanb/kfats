import { memo, useMemo } from "react";

interface TypeBadgeProps {
    type: string;
}

export const TypeBadge = memo(({ type }: TypeBadgeProps) => {
    const className = useMemo(() => {
        const baseClasses = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium";

        switch (type) {
            case "article":
                return `${baseClasses} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300`;
            case "course":
                return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`;
            case "product":
                return `${baseClasses} bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300`;
        }
    }, [type]);

    const displayType = useMemo(() =>
        type.charAt(0).toUpperCase() + type.slice(1),
        [type]
    );

    return <span className={className}>{displayType}</span>;
});

TypeBadge.displayName = "TypeBadge";
