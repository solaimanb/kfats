"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Clock, 
  User,
  Tag
} from "lucide-react";

interface ArticlePreviewProps {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  tags?: string[];
  publishedAt: Date;
  author?: string;
  readTime?: number;
}

export function ArticlePreview({
  title,
  content,
  excerpt,
  featuredImage,
  tags = [],
  publishedAt,
  author = "You",
  readTime,
}: ArticlePreviewProps) {
  // Calculate estimated read time if not provided
  const estimatedReadTime = readTime || Math.max(1, Math.ceil(content.split(' ').length / 200));

  // Convert markdown to HTML for display
  const formatContent = (markdown: string) => {
    return markdown
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 rounded text-sm">$1</code>')
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 italic my-4 text-muted-foreground">$1</blockquote>')
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-semibold mt-6 mb-3">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mt-8 mb-4">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mt-10 mb-5">$1</h1>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$1. $2</li>')
      .split('\n')
      .map(line => line.trim() ? `<p class="mb-4">${line}</p>` : '')
      .join('');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="overflow-hidden">
        {/* Featured Image */}
        {featuredImage && (
          <div className="aspect-video w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={featuredImage}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <CardHeader className="space-y-4">
          {/* Article Meta */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{publishedAt.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{estimatedReadTime} min read</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight">
            {title || "Untitled Article"}
          </h1>

          {/* Excerpt */}
          {excerpt && (
            <p className="text-lg text-muted-foreground leading-relaxed">
              {excerpt}
            </p>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <Separator />
        </CardHeader>

        <CardContent>
          {/* Article Content */}
          <div className="prose prose-gray max-w-none">
            {content ? (
              <div 
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: formatContent(content) 
                }}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground italic">
                  No content yet. Start writing your article!
                </p>
              </div>
            )}
          </div>

          {/* Reading Progress Indicator */}
          {content && (
            <div className="mt-12 pt-6 border-t">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {content.split(' ').length} words • {estimatedReadTime} minute read
                </span>
                <span>
                  Preview Mode
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Notice */}
      <div className="mt-6 text-center">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-3">
            <p className="text-sm text-amber-800">
              📝 This is how your article will appear to readers. 
              Return to the editor to make changes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}