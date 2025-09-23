"use client";

import { useParams, useRouter } from "next/navigation";
import { useArticleBySlug } from "@/lib/hooks/useArticles";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  AlertCircle,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  BookOpen,
  Heart
} from "lucide-react";

export default function PublicArticleViewPage() {
  const params = useParams();
  const router = useRouter();
  
  const articleSlug = params.slug as string;
  const { data: article, isLoading, error } = useArticleBySlug(articleSlug);

  // Calculate read time
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.split(' ').length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  // Format content for display
  const formatContent = (markdown: string) => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-2 py-1 rounded text-sm font-mono">$1</code>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-6 py-2 my-4 bg-muted/20 italic">$1</blockquote>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-8 mb-4">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-semibold mt-10 mb-5">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-12 mb-6">$1</h1>')
      .replace(/^\* (.*$)/gm, '<li class="ml-6 mb-2">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-6 mb-2">$1. $2</li>')
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '<br/>';
        if (trimmed.startsWith('<')) return trimmed;
        return `<p class="mb-4 leading-relaxed">${trimmed}</p>`;
      })
      .join('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-6 w-32" />
          </div>
          
          <article className="space-y-8">
            <Skeleton className="h-64 w-full rounded-lg" />
            
            <div className="space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          </article>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Article Not Found</h1>
          </div>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error instanceof Error ? error.message : "This article could not be found or may have been removed."}
            </AlertDescription>
          </Alert>

          <Card className="mt-8">
            <CardContent className="text-center py-12">
              <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Article Not Available</h3>
              <p className="text-muted-foreground mb-6">
                The article you&apos;re looking for might have been moved or deleted.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => router.back()}>
                  Go Back
                </Button>
                <Button onClick={() => router.push("/articles")}>
                  Browse Articles
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Don't show draft articles in public view
  if (article.status !== "published") {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Article Not Available</h1>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This article is not yet published or is currently being reviewed.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const readTime = calculateReadTime(article.content);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Navigation */}
        <nav className="flex items-center justify-between mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Articles
          </Button>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Heart className="h-4 w-4 mr-2" />
              Like
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </nav>

        {/* Article Content */}
        <article className="space-y-8">
          {/* Featured Image */}
          {article.featured_image_url && (
            <div className="aspect-video w-full overflow-hidden rounded-xl shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.featured_image_url}
                alt={article.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Article Header */}
          <header className="space-y-6">
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Author #{article.author_id}</p>
                  <p className="text-muted-foreground text-xs">Writer</p>
                </div>
              </div>
              
              <Separator orientation="vertical" className="h-8" />
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(article.published_at!).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</span>
              </div>
              
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{readTime} min read</span>
              </div>
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {article.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </header>

          <Separator className="my-8" />

          {/* Article Body */}
          <div className="prose prose-lg prose-gray max-w-none">
            <div 
              className="text-lg leading-relaxed [&>p]:mb-6 [&>h1]:mt-12 [&>h1]:mb-6 [&>h2]:mt-10 [&>h2]:mb-5 [&>h3]:mt-8 [&>h3]:mb-4 [&>blockquote]:my-6 [&>ul]:my-6 [&>ol]:my-6"
              dangerouslySetInnerHTML={{ 
                __html: formatContent(article.content) 
              }}
            />
          </div>

          {/* Article Footer */}
          <footer className="pt-12 border-t space-y-6">
            {/* Article Stats */}
            <div className="flex items-center justify-between p-6 bg-muted/30 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">Enjoyed this article?</p>
                <p className="text-xs text-muted-foreground">
                  Share it with others or give it a like
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-2" />
                  Like ({Math.floor(Math.random() * 50)})
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>

            {/* Publication Info */}
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>
                Published on {new Date(article.published_at!).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
              {article.updated_at !== article.created_at && (
                <p>
                  Last updated on {new Date(article.updated_at).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Back to Articles */}
            <div className="text-center pt-6">
              <Button 
                variant="outline"
                onClick={() => router.push("/articles")}
                className="min-w-40"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                More Articles
              </Button>
            </div>
          </footer>
        </article>
      </div>
    </div>
  );
}