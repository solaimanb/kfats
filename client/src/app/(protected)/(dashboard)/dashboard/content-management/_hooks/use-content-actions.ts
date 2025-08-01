import { useCallback } from "react";
import { useContentManagement } from "@/lib/hooks/useContentManagement";
import type { ContentOverviewItem } from "@/lib/api/content-management";

export function useContentActions() {
    const { toggleFeature, toggleContentStatus } = useContentManagement();

    const handleToggleFeature = useCallback(async (content: ContentOverviewItem) => {
        try {
            await toggleFeature.mutateAsync({
                contentType: content.type,
                contentId: content.id
            });
        } catch (error) {
            console.error('Failed to toggle feature:', error);
            // TODO: Add toast notification for user feedback
        }
    }, [toggleFeature]);

    const handleArchive = useCallback(async (content: ContentOverviewItem) => {
        try {
            await toggleContentStatus.mutateAsync({
                contentType: content.type,
                contentId: content.id,
                action: 'archive'
            });
        } catch (error) {
            console.error('Failed to archive content:', error);
            // TODO: Add toast notification for user feedback
        }
    }, [toggleContentStatus]);

    return {
        handleToggleFeature,
        handleArchive,
        isToggling: toggleFeature.isPending,
        isArchiving: toggleContentStatus.isPending
    };
}
