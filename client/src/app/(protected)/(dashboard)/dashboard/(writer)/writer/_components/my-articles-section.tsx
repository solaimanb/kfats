"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Article } from "@/lib/types/api";
import {
  getArticleStatusColor,
  calculateReadingTime,
} from "./utils";
import {
  Edit,
  Calendar,
  Clock,
  MoreHorizontal,
} from "lucide-react";

interface MyArticlesSectionProps {
  articles: Article[];
  isLoading?: boolean;
  maxDisplay?: number;
}

export function MyArticlesSection({
  articles,
  isLoading,
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
            {Array.from({ length: maxDisplay }).map((_, i) => (
              <div key={i} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="h-4 w-3/4 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-3 w-full bg-muted animate-pulse rounded mb-1" />
                      <div className="h-3 w-2/3 bg-muted animate-pulse rounded mb-3" />
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-12 bg-muted animate-pulse rounded" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="h-3 w-3 bg-muted animate-pulse rounded" />
                          <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                  </div>
                </div>
                <div className="flex items-center gap-1 ml-3">
                  <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                  <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                </div>
              </div>
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
                    asChild
                    className="h-8 w-8 p-0"
                  >
                    <Link href={`/dashboard/writer/articles/${article.slug}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
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
                  asChild
                  className="w-full"
                >
                  <Link href="/dashboard/writer/my-articles">
                    View All Articles ({sortedArticles.length})
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-6 w-48 bg-muted animate-pulse rounded mx-auto mb-2" />
            <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto mb-6" />
            <div className="space-y-2">
              <div className="h-10 w-48 bg-muted animate-pulse rounded mx-auto" />
              <div className="h-3 w-56 bg-muted animate-pulse rounded mx-auto" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
