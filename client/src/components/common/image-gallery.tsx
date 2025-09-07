"use client";

import { useState, useCallback, useEffect, useMemo, memo } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Constants for better performance and maintainability
const MIN_SWIPE_DISTANCE = 50;
const MAX_LOADED_IMAGES = 10; // Limit loaded images to prevent memory issues
const PRELOAD_DISTANCE = 2; // How many images to preload on each side

interface ImageGalleryProps {
  images: string[];
  productName: string;
  className?: string;
}

interface TouchState {
  start: number | null;
  end: number | null;
}

// Optimized image component with blur placeholder
const OptimizedImage = memo<{
  src: string;
  alt: string;
  fill: boolean;
  className?: string;
  sizes: string;
  priority?: boolean;
  onLoad?: () => void;
}>(({ src, alt, fill, className, sizes, priority, onLoad }) => (
  <Image
    src={src}
    alt={alt}
    fill={fill}
    className={className}
    sizes={sizes}
    priority={priority}
    onLoad={onLoad}
    placeholder="blur"
    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
  />
));

OptimizedImage.displayName = "OptimizedImage";

export const ImageGallery = memo<ImageGalleryProps>(
  ({ images, productName, className }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set([0]));
    const [touchState, setTouchState] = useState<TouchState>({
      start: null,
      end: null,
    });
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Memoized values for performance
    const hasMultipleImages = useMemo(() => images.length > 1, [images.length]);
    const currentImage = useMemo(
      () => images[selectedIndex],
      [images, selectedIndex]
    );
    const imageCounter = useMemo(
      () =>
        hasMultipleImages ? `${selectedIndex + 1} / ${images.length}` : null,
      [selectedIndex, images.length, hasMultipleImages]
    );

    // Optimized loaded images management with cleanup
    const updateLoadedImages = useCallback(
      (index: number) => {
        setLoadedImages((prev) => {
          const newSet = new Set([...prev, index]);

          // Cleanup: Remove images that are too far from current index to save memory
          if (newSet.size > MAX_LOADED_IMAGES) {
            const toRemove: number[] = [];
            newSet.forEach((imgIndex) => {
              if (Math.abs(imgIndex - selectedIndex) > PRELOAD_DISTANCE * 2) {
                toRemove.push(imgIndex);
              }
            });
            toRemove.forEach((imgIndex) => newSet.delete(imgIndex));
          }

          return newSet;
        });
      },
      [selectedIndex]
    );

    // Navigation handlers with transition states
    const handlePrevious = useCallback(() => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
      setTimeout(() => setIsTransitioning(false), 300);
    }, [images.length, isTransitioning]);

    const handleNext = useCallback(() => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
      setTimeout(() => setIsTransitioning(false), 300);
    }, [images.length, isTransitioning]);

    const handleThumbnailClick = useCallback(
      (index: number) => {
        if (isTransitioning || index === selectedIndex) return;
        setIsTransitioning(true);
        setSelectedIndex(index);
        setTimeout(() => setIsTransitioning(false), 300);
      },
      [selectedIndex, isTransitioning]
    );

    // Enhanced touch handlers with better performance
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      setTouchState({ start: e.targetTouches[0].clientX, end: null });
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
      setTouchState((prev) => ({ ...prev, end: e.targetTouches[0].clientX }));
    }, []);

    const handleTouchEnd = useCallback(() => {
      const { start, end } = touchState;
      if (!start || !end) return;

      const distance = start - end;
      const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
      const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

      if (isLeftSwipe && !isTransitioning) {
        handleNext();
      } else if (isRightSwipe && !isTransitioning) {
        handlePrevious();
      }

      setTouchState({ start: null, end: null });
    }, [touchState, isTransitioning, handleNext, handlePrevious]);

    // Keyboard navigation
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handlePrevious();
        } else if (e.key === "ArrowRight") {
          e.preventDefault();
          handleNext();
        }
      };

      if (hasMultipleImages) {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
      }
    }, [handlePrevious, handleNext, hasMultipleImages]);

    // Optimized preloading with better strategy
    useEffect(() => {
      const preloadImages = () => {
        for (let i = -PRELOAD_DISTANCE; i <= PRELOAD_DISTANCE; i++) {
          const index = selectedIndex + i;
          if (index >= 0 && index < images.length && !loadedImages.has(index)) {
            const img = new window.Image();
            img.src = images[index];
            img.onload = () => updateLoadedImages(index);
          }
        }
      };

      preloadImages();
    }, [selectedIndex, images, loadedImages, updateLoadedImages]);

    // Early return for empty state
    if (!images || images.length === 0) {
      return (
        <div
          className={cn(
            "relative h-96 w-full bg-slate-100 rounded-lg flex items-center justify-center",
            className
          )}
        >
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">📷</div>
            <p>No images available</p>
          </div>
        </div>
      );
    }

    return (
      <div className={cn("space-y-4", className)}>
        {/* Main image container */}
        <div className="relative group">
          <div
            className={cn(
              "relative h-96 w-full bg-slate-100 overflow-hidden rounded-lg transition-all duration-200 hover:shadow-lg",
              isTransitioning && "pointer-events-none"
            )}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            role="img"
            aria-label={`Product image ${selectedIndex + 1} of ${
              images.length
            }`}
          >
            {!loadedImages.has(selectedIndex) && (
              <Skeleton className="absolute inset-0 z-10" />
            )}

            <OptimizedImage
              src={currentImage}
              alt={`${productName} - Image ${selectedIndex + 1}`}
              fill
              className={cn(
                "object-cover transition-opacity duration-300",
                loadedImages.has(selectedIndex) ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => updateLoadedImages(selectedIndex)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={selectedIndex === 0}
            />

            {/* Navigation arrows - only render when needed */}
            {hasMultipleImages && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  disabled={isTransitioning}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg disabled:opacity-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  disabled={isTransitioning}
                  aria-label="Next image"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}

            {/* Image counter - only render when needed */}
            {imageCounter && (
              <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                {imageCounter}
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail grid - only render when needed */}
        {hasMultipleImages && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((image, index) => (
              <button
                key={`${image}-${index}`}
                onClick={() => handleThumbnailClick(index)}
                disabled={isTransitioning}
                className={cn(
                  "relative h-20 w-full rounded-md overflow-hidden transition-all duration-200 hover:ring-2 hover:ring-primary focus:ring-2 focus:ring-primary focus:outline-none disabled:cursor-not-allowed",
                  index === selectedIndex
                    ? "ring-2 ring-primary shadow-md"
                    : "ring-1 ring-gray-200",
                  isTransitioning && "opacity-50"
                )}
                aria-label={`View image ${index + 1}`}
                aria-pressed={index === selectedIndex}
              >
                {!loadedImages.has(index) && (
                  <Skeleton className="absolute inset-0 z-10" />
                )}

                <OptimizedImage
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  fill
                  className={cn(
                    "object-cover transition-opacity duration-200",
                    loadedImages.has(index) ? "opacity-100" : "opacity-0"
                  )}
                  onLoad={() => updateLoadedImages(index)}
                  sizes="(max-width: 768px) 25vw, 100px"
                />

                {index === selectedIndex && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <div className="w-2 h-2 bg-current rounded-full" />
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

ImageGallery.displayName = "ImageGallery";
