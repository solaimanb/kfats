import { ContentOverviewItem } from "@/lib/api/content-management";

export interface StatsData {
    total_published: number;
    total_drafts: number;
    total_featured: number;
    by_type: {
        articles?: number;
        courses?: number;
        products?: number;
    };
}

export interface StatsCardData {
    value: number;
    label: string;
    colorClass: string;
}

export interface PaginationInfo {
    page: number;
    size: number;
    total: number;
    pages: number;
}

export interface ContentActions {
    onView: (content: ContentOverviewItem) => void;
    onToggleFeature: (content: ContentOverviewItem) => void;
    onArchive: (content: ContentOverviewItem) => void;
}

export type ContentStatus = "published" | "draft" | "unpublished" | "inactive" | "archived";
export type ContentType = "article" | "course" | "product";

export type { ContentOverviewItem };
