"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useWriterArticles } from "@/lib/hooks/useArticles";
import {
  calculateWriterOverview,
  generateContentAnalytics,
} from "./_components/utils";
import {
  ContentAnalyticsSection,
  MyArticlesSection,
  WriterOverviewStats,
} from "./_components";
import { BarChart3, PenTool, ExternalLink } from "lucide-react";
import { PaginatedResponse, Article } from "@/lib/types/api";

interface WriterDashboardProps {
  userId?: number;
}

export function WriterDashboard({}: WriterDashboardProps) {
  const router = useRouter();
  const { data: myArticles, isLoading } = useWriterArticles();

  const articlesArray = (myArticles as PaginatedResponse<Article>)?.items || [];
  const overviewData =
    articlesArray.length > 0 ? calculateWriterOverview(articlesArray) : null;
  const contentAnalytics =
    articlesArray.length > 0 ? generateContentAnalytics(articlesArray) : null;

  const handleCreateArticle = () => {
    router.push("/articles/create");
  };

  const handleEditArticle = (articleId: number) => {
    router.push(`/articles/${articleId}/edit`);
  };

  const handleGoToMyArticles = () => {
    router.push("/dashboard/writer/my-articles");
  };

  return (
    <div className="space-y-6">
      {overviewData && (
        <WriterOverviewStats data={overviewData} isLoading={isLoading} />
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleCreateArticle}>
          <PenTool className="h-4 w-4 mr-2" />
          Write New Article
        </Button>
        <Button variant="outline" onClick={handleGoToMyArticles}>
          <ExternalLink className="h-4 w-4 mr-2" />
          Manage All Articles
        </Button>
      </div>

      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span className="hidden sm:inline">Recent Articles</span>
            <span className="sm:hidden">Articles</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-4">
          <MyArticlesSection
            articles={articlesArray}
            isLoading={isLoading}
            onCreateArticle={handleCreateArticle}
            onEditArticle={handleEditArticle}
            onViewAllArticles={handleGoToMyArticles}
            maxDisplay={4}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {contentAnalytics && (
            <ContentAnalyticsSection
              analytics={contentAnalytics}
              isLoading={isLoading}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
