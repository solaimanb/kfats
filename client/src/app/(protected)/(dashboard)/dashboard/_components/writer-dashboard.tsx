"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWriterArticles } from "@/lib/hooks/useArticles"
import { 
  calculateWriterOverview, 
  generateContentAnalytics
} from "./writer/utils"

// Import modular components
import { WriterOverviewStats } from "./writer/writer-overview-stats"
import { MyArticlesSection } from "./writer/my-articles-section"
import { ContentAnalyticsSection } from "./writer/content-analytics-section"

import {
  BarChart3,
  PenTool
} from "lucide-react"

interface WriterDashboardProps {
  userId?: number // Optional since we're not using it yet
}

export function WriterDashboard({}: WriterDashboardProps) {
  const { data: myArticles, isLoading } = useWriterArticles()

  // Generate analytics data
  const overviewData = myArticles ? calculateWriterOverview(myArticles) : null
  const contentAnalytics = myArticles ? generateContentAnalytics(myArticles) : null

  const handleCreateArticle = () => {
    // TODO: Navigate to article creation page
    console.log("Creating new article...")
  }

  const handleEditArticle = (articleId: number) => {
    // TODO: Navigate to article edit page
    console.log("Editing article:", articleId)
  }

  const handleViewArticle = (articleId: number) => {
    // TODO: Navigate to article view page
    console.log("Viewing article:", articleId)
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      {overviewData && (
        <WriterOverviewStats 
          data={overviewData} 
          isLoading={isLoading}
        />
      )}

      {/* Tabbed Interface */}
      <Tabs defaultValue="articles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <PenTool className="h-4 w-4" />
            <span className="hidden sm:inline">Articles</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
        </TabsList>

        {/* Articles Tab */}
        <TabsContent value="articles" className="space-y-4">
          <MyArticlesSection
            articles={myArticles || []}
            isLoading={isLoading}
            onCreateArticle={handleCreateArticle}
            onEditArticle={handleEditArticle}
            onViewArticle={handleViewArticle}
          />
        </TabsContent>

        {/* Analytics Tab */}
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
  )
}
