"use client";

import { useRouter } from "next/navigation";
import { useAuth, useRoleAccess } from "@/providers/auth-provider";
import { useCreateArticle } from "@/lib/hooks/useArticles";
import { ArticleForm, ArticleFormData } from "@/components/articles";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PenTool, ArrowLeft, UserPlus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function CreateArticlePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { canWriteArticles } = useRoleAccess();
  const createArticleMutation = useCreateArticle();

  const handleSubmit = async (data: ArticleFormData) => {
    try {
      const article = await createArticleMutation.mutateAsync(data);
      
      toast.success(
        data.status === "published" 
          ? "Article published successfully!" 
          : "Article saved as draft!"
      );
      
      // Redirect to article view or my articles
      if (data.status === "published") {
        router.push(`/articles/${article.slug}`);
      } else {
        router.push("/dashboard/writer/my-articles");
      }
    } catch (error) {
      console.error("Failed to create article:", error);
      toast.error("Failed to create article. Please try again.");
    }
  };

  const handleSaveDraft = async (data: ArticleFormData) => {
    try {
      const draftData = { ...data, status: "draft" as const };
      await createArticleMutation.mutateAsync(draftData);
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
          <h1 className="text-2xl font-bold">Create Article</h1>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need writer privileges to create articles.
          </AlertDescription>
        </Alert>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-purple-600" />
              Writer Access Required
            </CardTitle>
            <CardDescription>
              Apply for writer role to start creating and publishing articles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-6">
              <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium mb-2">Become a Writer</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Join our community of writers and share your knowledge
              </p>
              <Button onClick={() => router.push("/role-application?role=writer")}>
                Apply for Writer Role
              </Button>
            </div>
          </CardContent>
        </Card>
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
            <h1 className="text-2xl font-bold">Create New Article</h1>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.full_name || user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Article Form */}
      <ArticleForm
        mode="create"
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isLoading={createArticleMutation.isPending}
      />

      {/* Tips Section */}
      <Card className="mt-8 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900">
            📝 Writing Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• Use headings (#, ##, ###) to structure your article</p>
          <p>• Add relevant tags to help readers find your content</p>
          <p>• Include a compelling excerpt to entice readers</p>
          <p>• Save as draft first, then preview before publishing</p>
          <p>• Add a featured image to make your article more engaging</p>
        </CardContent>
      </Card>
    </div>
  );
}