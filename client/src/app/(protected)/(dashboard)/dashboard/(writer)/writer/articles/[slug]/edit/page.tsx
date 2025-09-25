"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth, useRoleAccess } from "@/providers/auth-provider";
import { useArticleBySlug, useUpdateArticle } from "@/lib/hooks/useArticles";
import { ArticleForm, ArticleFormData } from "@/components/articles";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PenTool, ArrowLeft, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { ArticleStatus } from "@/lib/types/api";

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { canWriteArticles } = useRoleAccess();

  const articleSlug = params.slug as string;
  const {
    data: article,
    isLoading: articleLoading,
    error: articleError,
  } = useArticleBySlug(articleSlug);
  const updateArticleMutation = useUpdateArticle();

  const handleSubmit = async (data: ArticleFormData) => {
    if (!article) return;

    try {
      const updatedArticle = await updateArticleMutation.mutateAsync({
        articleId: article.id,
        articleData: data,
      });

      toast.success(
        data.status === "published"
          ? "Article updated and published successfully!"
          : "Article updated as draft!"
      );

      // Redirect to article view or my articles
      if (data.status === "published") {
        router.push(`/articles/${updatedArticle.slug}`);
      } else {
        router.push("/dashboard/writer/my-articles");
      }
    } catch (error) {
      console.error("Failed to update article:", error);
      toast.error("Failed to update article. Please try again.");
    }
  };

  const handleSaveDraft = async (data: ArticleFormData) => {
    if (!article) return;

    try {
      await updateArticleMutation.mutateAsync({
        articleId: article.id,
        articleData: { ...data, status: ArticleStatus.DRAFT },
      });
      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Failed to save draft:", error);
      toast.error("Failed to save draft. Please try again.");
    }
  };

  // Check if user has writer access
  if (!canWriteArticles) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Article</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need writer privileges to edit articles.
          </AlertDescription>
        </Alert>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-purple-600" />
              Writer Access Required
            </CardTitle>
            <CardDescription>
              Apply for writer role to start creating and editing articles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Become a Writer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join our community of writers and share your knowledge
              </p>
              <Button
                onClick={() => router.push("/role-application?role=writer")}
              >
                Apply for Writer Role
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (articleLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <PenTool className="h-6 w-6 text-purple-600" />
            <div>
              <div className="h-8 w-64 bg-muted animate-pulse rounded mb-2" />
              <div className="h-4 w-48 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-32 bg-muted animate-pulse rounded" />
            <div className="h-10 bg-muted animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (articleError || !article) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Article</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {articleError
              ? `Failed to load article: ${
                  articleError instanceof Error
                    ? articleError.message
                    : "Unknown error"
                }`
              : "Article not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Check if user is the author
  if (article.author_id !== user?.id) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Edit Article</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You can only edit your own articles.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <PenTool className="h-6 w-6 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold">Edit Article</h1>
            <p className="text-sm text-muted-foreground">
              Editing: {article.title} • {user?.full_name || user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Article Form */}
      <ArticleForm
        mode="edit"
        initialData={article}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isLoading={updateArticleMutation.isPending}
      />

      {/* Tips Section */}
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">
            ✏️ Editing Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• Make sure your title is clear and engaging</p>
          <p>• Use the preview feature to see how your article will look</p>
          <p>• Save as draft frequently to avoid losing your work</p>
          <p>• Check your tags to ensure proper categorization</p>
          <p>• Review your content for grammar and clarity before publishing</p>
        </CardContent>
      </Card>
    </div>
  );
}
