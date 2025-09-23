"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/lib/types/api";
import {
  getArticleStatusColor,
  calculateReadingTime,
} from "./utils";
import {
  PenTool,
  Edit,
  Plus,
  Calendar,
  Clock,
  MoreHorizontal,
} from "lucide-react";

interface MyArticlesSectionProps {
  articles: Article[];
  isLoading?: boolean;
  onCreateArticle?: () => void;
  onEditArticle?: (articleId: number) => void;
  onViewAllArticles?: () => void;
  maxDisplay?: number;
}

export function MyArticlesSection({
  articles,
  isLoading,
  onCreateArticle,
  onEditArticle,
  onViewAllArticles,
  maxDisplay = 6,
}: MyArticlesSectionProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-9 w-24 bg-muted animate-pulse rounded" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const sortedArticles = [...articles].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  return (
    <Card>
      <CardContent>
        {sortedArticles.length > 0 ? (
          <div className="space-y-4">
            {sortedArticles.slice(0, maxDisplay).map((article) => (
              <div
                key={article.id}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-1 mb-1">
                        {article.title}
                      </h4>

                      {article.excerpt && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {article.excerpt}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {calculateReadingTime(article.content)} min read
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(article.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className={`text-xs ${getArticleStatusColor(
                        article.status
                      )}`}
                    >
                      {article.status}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-1 ml-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditArticle?.(article.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            {sortedArticles.length > maxDisplay && (
              <div className="text-center pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onViewAllArticles}
                  className="w-full"
                >
                  View All Articles ({sortedArticles.length})
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <PenTool className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No articles yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
              Start writing your first article to share your knowledge and
              expertise with readers.
            </p>
            <div className="space-y-2">
              <Button onClick={onCreateArticle}>
                <Plus className="h-4 w-4 mr-2" />
                Write Your First Article
              </Button>
              <p className="text-xs text-muted-foreground">
                Pro tip: Articles with engaging titles get 3x more engagement
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
