"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
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
import { PenTool, ExternalLink } from "lucide-react";
import { PaginatedResponse, Article } from "@/lib/types/api";

interface WriterDashboardProps {
  userId?: number;
}

export function WriterDashboard({}: WriterDashboardProps) {
  const { data: myArticles, isLoading } = useWriterArticles();

  const articlesArray = (myArticles as PaginatedResponse<Article>)?.items || [];
  const overviewData =
    articlesArray.length > 0 ? calculateWriterOverview(articlesArray) : null;
  const contentAnalytics =
    articlesArray.length > 0 ? generateContentAnalytics(articlesArray) : null;

  return (
    <div className="space-y-6">
      <WriterOverviewStats
        data={
          overviewData || {
            totalArticles: 0,
            publishedArticles: 0,
            draftArticles: 0,
            archivedArticles: 0,
            engagementRate: 0,
            recentArticles: 0,
          }
        }
        isLoading={isLoading || !overviewData}
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="default" asChild>
          <Link href="/dashboard/writer/articles/create">
            <PenTool className="h-4 w-4 mr-2" />
            Write New Article
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/dashboard/writer/my-articles">
            <ExternalLink className="h-4 w-4 mr-2" />
            Manage All Articles
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <MyArticlesSection
          articles={articlesArray}
          isLoading={isLoading}
          maxDisplay={4}
        />

        <ContentAnalyticsSection
          analytics={
            contentAnalytics || {
              popularArticles: [],
              engagementTrend: [],
              topicPerformance: [],
              readingTrends: [],
            }
          }
          isLoading={isLoading || !contentAnalytics}
        />
      </div>
    </div>
  );
}
