"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWriterArticles } from "@/lib/hooks/useArticles"
import {
  PenTool,
  Eye,
  Edit,
  Plus,
  BarChart3
} from "lucide-react"

interface WriterDashboardProps {
  userId?: number // Optional since we're not using it yet
}

export function WriterDashboard({}: WriterDashboardProps) {
  const { data: myArticles, isLoading } = useWriterArticles()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Articles</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myArticles?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total articles written
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myArticles?.reduce((acc: number, article) => acc + article.views_count, 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all articles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {myArticles?.filter(article => article.status === 'published').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Published articles
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              My Articles
            </span>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Write Article
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading articles...</p>
          ) : myArticles?.length ? (
            <div className="space-y-3">
              {myArticles.map((article) => (
                <div key={article.id} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{article.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {article.views_count} views • {article.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <PenTool className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                You haven&apos;t written any articles yet
              </p>
              <Button>Write Your First Article</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
