"use client"

import * as React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card"

interface ErrorDisplayProps {
  error: Error | string
  retry?: () => void
  className?: string
}

export function ErrorDisplay({ error, retry, className }: ErrorDisplayProps) {
  const message = typeof error === 'string' ? error : error.message

  return (
    <Card className={cn("max-w-md mx-auto", className)}>
      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-2">
          <AlertCircle className="h-12 w-12 text-destructive" />
        </div>
        <CardTitle className="text-destructive">Something went wrong</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {retry && (
        <CardContent className="text-center">
          <Button onClick={retry} variant="outline" className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

interface PageErrorProps {
  error: Error | string
  reset?: () => void
}

export function PageError({ error, reset }: PageErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <ErrorDisplay error={error} retry={reset} />
    </div>
  )
}

interface InlineErrorProps {
  error: Error | string
  retry?: () => void
  className?: string
}

export function InlineError({ error, retry, className }: InlineErrorProps) {
  const message = typeof error === 'string' ? error : error.message

  return (
    <div className={cn("flex items-center gap-2 text-destructive text-sm", className)}>
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
      {retry && (
        <Button onClick={retry} variant="ghost" size="sm" className="ml-auto">
          <RefreshCw className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
