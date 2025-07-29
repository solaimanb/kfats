"use client"

import { useAuth } from "@/providers/auth-provider"
import { AuthenticatedHomePage } from "@/app/(public)/_components/authenticated-home"

function PublicHomePage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">KFATS</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Welcome to Kushtia Fine Arts & Technology School
        </p>
      </div>
    </div>
  )
}

function LoadingPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  )
}

export default function HomePage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingPage />
  }

  if (!user) {
    return <PublicHomePage />
  }

  return <AuthenticatedHomePage />
}
