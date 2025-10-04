import { useCallback } from "react";
import { useContentManagement } from "@/lib/hooks/useContentManagement";
import type { ContentOverviewItem } from "@/lib/api/content-management";

export function useContentActions() {
  const { toggleFeature, toggleContentStatus } = useContentManagement();

  const handleView = useCallback(async (content: ContentOverviewItem) => {
    try {
      let publicUrl = "";

      if (content.type === "course") {
        // Courses use slug in URL: /courses/[slug]
        publicUrl = `/courses/${content.slug}`;
      } else if (content.type === "article") {
        // Articles use slug in URL: /articles/[slug]
        publicUrl = `/articles/${content.slug}`;
      } else if (content.type === "product") {
        // Products use slug in URL: /products/[slug]
        publicUrl = `/products/${content.slug}`;
      }

      if (publicUrl) {
        // Open in new tab immediately
        window.open(publicUrl, "_blank", "noopener,noreferrer");
      } else {
        console.error("Could not construct public URL for content:", content);
      }
    } catch (error) {
      console.error("Failed to view content:", error);
    }
  }, []);

  const handleToggleFeature = useCallback(
    async (content: ContentOverviewItem) => {
      try {
        await toggleFeature.mutateAsync({
          contentType: content.type,
          contentId: content.id,
        });
      } catch (error) {
        console.error("Failed to toggle feature:", error);
        // TODO: Add toast notification for user feedback
      }
    },
    [toggleFeature]
  );

  const handleArchive = useCallback(
    async (content: ContentOverviewItem) => {
      try {
        await toggleContentStatus.mutateAsync({
          contentType: content.type,
          contentId: content.id,
          action: "archive",
        });
      } catch (error) {
        console.error("Failed to archive content:", error);
        // TODO: Add toast notification for user feedback
      }
    },
    [toggleContentStatus]
  );

  return {
    handleView,
    handleToggleFeature,
    handleArchive,
    isToggling: toggleFeature.isPending,
    isArchiving: toggleContentStatus.isPending,
  };
}
