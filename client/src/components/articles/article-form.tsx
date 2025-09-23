"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArticleEditor } from "./article-editor";
import { TagInput } from "./tag-input";
import { ImageUpload } from "./image-upload";
import { ArticlePreview } from "./article-preview";
import { Article } from "@/lib/types/api";
import { ArticleStatus } from "@/lib/types/api";
import { 
  Save, 
  Eye, 
  Send, 
  FileText, 
  Image as ImageIcon, 
  Tags, 
  Settings,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

// Validation schema
const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().max(300, "Excerpt too long").optional(),
  featured_image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
  tags: z.array(z.string()).max(10, "Maximum 10 tags allowed").optional(),
  status: z.nativeEnum(ArticleStatus).optional(),
});

export type ArticleFormData = z.infer<typeof articleSchema>;

interface ArticleFormProps {
  initialData?: Partial<Article>;
  onSubmit: (data: ArticleFormData) => Promise<void>;
  onSaveDraft?: (data: ArticleFormData) => Promise<void>;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export function ArticleForm({
  initialData,
  onSubmit,
  onSaveDraft,
  isLoading = false,
  mode,
}: ArticleFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isPublished, setIsPublished] = useState(
    initialData?.status === ArticleStatus.PUBLISHED
  );

  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<ArticleFormData>({
    resolver: zodResolver(articleSchema),
    defaultValues: {
      title: initialData?.title || "",
      content: initialData?.content || "",
      excerpt: initialData?.excerpt || "",
      featured_image_url: initialData?.featured_image_url || "",
      tags: initialData?.tags || [],
      status: initialData?.status || ArticleStatus.DRAFT,
    },
  });

  const watchedData = watch();

  // Auto-generate excerpt from content if not provided
  useEffect(() => {
    if (!watchedData.excerpt && watchedData.content) {
      const plainText = watchedData.content.replace(/<[^>]*>/g, "");
      const autoExcerpt = plainText.slice(0, 200) + (plainText.length > 200 ? "..." : "");
      setValue("excerpt", autoExcerpt);
    }
  }, [watchedData.content, watchedData.excerpt, setValue]);

  const handleFormSubmit = async (data: ArticleFormData) => {
    try {
      const submitData = {
        ...data,
        status: isPublished ? ArticleStatus.PUBLISHED : ArticleStatus.DRAFT,
      };
      await onSubmit(submitData);
      toast.success(
        isPublished 
          ? `Article ${mode === "create" ? "published" : "updated"} successfully!`
          : `Article saved as draft successfully!`
      );
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Failed to save article. Please try again.");
    }
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;
    
    try {
      const draftData = {
        ...watchedData,
        status: ArticleStatus.DRAFT,
      };
      await onSaveDraft(draftData);
      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error("Draft save error:", error);
      toast.error("Failed to save draft. Please try again.");
    }
  };

  if (showPreview) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Article Preview</h2>
          <Button variant="outline" onClick={() => setShowPreview(false)}>
            <FileText className="h-4 w-4 mr-2" />
            Back to Editor
          </Button>
        </div>
        <ArticlePreview
          title={watchedData.title}
          content={watchedData.content}
          excerpt={watchedData.excerpt}
          featuredImage={watchedData.featured_image_url}
          tags={watchedData.tags}
          publishedAt={new Date()}
        />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">
            {mode === "create" ? "Create New Article" : "Edit Article"}
          </h2>
          <p className="text-muted-foreground">
            {mode === "create" 
              ? "Write and publish your article to share with the community"
              : "Update your article content and settings"
            }
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading || !isDirty}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          )}
          
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(true)}
            disabled={!watchedData.title || !watchedData.content}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>

          <Button 
            type="submit" 
            disabled={isLoading}
            className={isPublished ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : isPublished ? (
              <Send className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isPublished ? "Publish Article" : "Save Draft"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Title */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Article Content
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter article title..."
                  {...register("title")}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Brief description of your article (auto-generated if empty)..."
                  rows={3}
                  {...register("excerpt")}
                  className={errors.excerpt ? "border-red-500" : ""}
                />
                {errors.excerpt && (
                  <p className="text-sm text-red-500">{errors.excerpt.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {watchedData.excerpt?.length || 0}/300 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Content Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Article Content *</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="content"
                control={control}
                render={({ field }) => (
                  <ArticleEditor
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Start writing your article..."
                  />
                )}
              />
              {errors.content && (
                <p className="text-sm text-red-500 mt-2">{errors.content.message}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Publish Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Status</Label>
                  <p className="text-sm text-muted-foreground">
                    {isPublished ? "Publish immediately" : "Save as draft"}
                  </p>
                </div>
                <Switch
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>

              <div className="pt-2">
                <Badge 
                  variant={isPublished ? "default" : "secondary"}
                  className="w-full justify-center py-2"
                >
                  {isPublished ? "Will be Published" : "Will be Draft"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Featured Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="featured_image_url"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Add featured image URL..."
                  />
                )}
              />
              {errors.featured_image_url && (
                <p className="text-sm text-red-500 mt-2">
                  {errors.featured_image_url.message}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tags className="h-5 w-5" />
                Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <TagInput
                    value={field.value || []}
                    onChange={field.onChange}
                    placeholder="Add tags..."
                    maxTags={10}
                  />
                )}
              />
              {errors.tags && (
                <p className="text-sm text-red-500 mt-2">{errors.tags.message}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}