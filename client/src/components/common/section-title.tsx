import { cn } from "@/lib/utils";
import { IconType } from "react-icons";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  centered?: boolean;
  Icon?: IconType;
}

export const SectionTitle = ({
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  centered = false,
  Icon,
}: SectionTitleProps) => {
  return (
    <div className={cn("space-y-2", centered && "text-center", className)}>
      <div className="flex items-center gap-2 justify-center">
        {Icon && <Icon className="w-6 h-6 text-primary" />}
        <h2
          className={cn(
            "text-3xl font-bold tracking-tight text-foreground",
            titleClassName
          )}
        >
          {title}
        </h2>
      </div>
      {subtitle && (
        <p
          className={cn(
            "text-muted-foreground text-sm sm:text-base",
            subtitleClassName
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
