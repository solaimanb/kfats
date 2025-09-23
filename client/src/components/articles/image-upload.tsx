"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link, X, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

export function ImageUpload({
  value = "",
  onChange,
  placeholder = "Enter image URL...",
  className,
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const validateAndSetImage = async (url: string) => {
    if (!url.trim()) {
      onChange("");
      setImageUrl("");
      setError("");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Basic URL validation
      new URL(url);
      
      // Check if it's an image URL
      const isValidImageUrl = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url) || 
                             url.includes('unsplash.com') || 
                             url.includes('imgur.com') ||
                             url.includes('cloudinary.com');

      if (!isValidImageUrl) {
        throw new Error("Please provide a valid image URL");
      }

      // Test if image loads
      const img = document.createElement('img');
      img.onload = () => {
        onChange(url);
        setImageUrl(url);
        setIsLoading(false);
      };
      img.onerror = () => {
        setError("Could not load image from this URL");
        setIsLoading(false);
      };
      img.src = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid URL");
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setImageUrl(url);
    
    // Debounce validation
    if (url.trim()) {
      const timeoutId = setTimeout(() => {
        validateAndSetImage(url);
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      onChange("");
      setError("");
    }
  };

  const clearImage = () => {
    setImageUrl("");
    onChange("");
    setError("");
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* URL Input */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Image URL</Label>
        <div className="relative">
          <Input
            type="url"
            value={imageUrl}
            onChange={handleInputChange}
            placeholder={placeholder}
            className={cn(
              "pr-10",
              error ? "border-red-500 focus:border-red-500" : ""
            )}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : value ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={clearImage}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Link className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        
        {error && (
          <p className="text-xs text-red-500">{error}</p>
        )}
      </div>

      {/* Image Preview */}
      {value && !error && (
        <Card className="p-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Preview</Label>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Featured image preview"
                className="h-full w-full object-cover"
                onError={() => setError("Failed to load image")}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Upload Suggestions */}
      {!value && (
        <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
            <div className="space-y-1">
              <p className="text-sm font-medium">No image selected</p>
              <p className="text-xs text-muted-foreground">
                Paste an image URL above or use one of these services:
              </p>
            </div>
            <div className="flex flex-wrap gap-1 text-xs">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2"
                onClick={() => window.open("https://unsplash.com", "_blank")}
              >
                Unsplash
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2"
                onClick={() => window.open("https://imgur.com", "_blank")}
              >
                Imgur
              </Button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Supported formats: JPG, PNG, GIF, WebP, SVG
      </p>
    </div>
  );
}