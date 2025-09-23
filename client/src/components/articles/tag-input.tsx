"use client";

import { useState, KeyboardEvent } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  className?: string;
}

export function TagInput({
  value = [],
  onChange,
  placeholder = "Add tags...",
  maxTags = 10,
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim().toLowerCase();
    
    // Validation
    if (!trimmedTag) return;
    if (value.includes(trimmedTag)) return;
    if (value.length >= maxTags) return;
    if (trimmedTag.length > 20) return;

    onChange([...value, trimmedTag]);
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value.length - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Prevent adding commas directly
    if (newValue.includes(",")) {
      const tags = newValue.split(",").filter(Boolean);
      tags.forEach((tag) => addTag(tag));
    } else {
      setInputValue(newValue);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {/* Tag Display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 px-2 py-1"
            >
              <span className="text-xs">#{tag}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => removeTag(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="space-y-2">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            value.length >= maxTags
              ? `Maximum ${maxTags} tags reached`
              : placeholder
          }
          disabled={value.length >= maxTags}
          className="text-sm"
        />
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Press Enter or comma to add tags</span>
          <span>{value.length}/{maxTags} tags</span>
        </div>
      </div>

      {/* Suggested Tags (Optional) */}
      {value.length < maxTags && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Suggested tags:</p>
          <div className="flex flex-wrap gap-1">
            {["tutorial", "guide", "tips", "javascript", "react", "nextjs", "programming", "web-dev"]
              .filter((tag) => !value.includes(tag))
              .slice(0, 6)
              .map((tag) => (
                <Button
                  key={tag}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => addTag(tag)}
                >
                  #{tag}
                </Button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}