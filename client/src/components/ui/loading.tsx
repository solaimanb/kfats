"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LoadingSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
}

export function LoadingSpinner({ className, size = "md", ...props }: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-gray-300 border-t-primary",
        {
          "h-4 w-4": size === "sm",
          "h-8 w-8": size === "md",
          "h-12 w-12": size === "lg",
        },
        className
      )}
      {...props}
    />
  )
}

interface LoadingProps {
  text?: string
  size?: "sm" | "md" | "lg"
}

export function Loading({ text = "Loading...", size = "md" }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <LoadingSpinner size={size} />
      <p className="text-muted-foreground text-sm">{text}</p>
    </div>
  )
}

export function PageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading text="Loading page..." size="lg" />
    </div>
  )
}
