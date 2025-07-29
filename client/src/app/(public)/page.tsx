"use client"

import { useAuth } from "@/providers/auth-provider"
import { UserRole } from "@/lib/types/api"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AuthenticatedHomePage } from "@/app/(public)/_components/authenticated-home"

function PublicHomePage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">KFATS</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Welcome to Kushtia Fine Arts & Technology School
        </p>
        <div className="w-64 flex flex-col gap-4">
          <Link href="/login" className="w-full">
            <Button className="w-full" size="lg">Login</Button>
          </Link>
          <Link href="/signup" className="w-full">
            <Button className="w-full" variant="outline" size="lg">Register</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function LoadingPage() {
  return (
    <div className="flex h-screen flex-col items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p className="mt-4 text-muted-foreground">Loading...</p>
    </div>
  )
}

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== UserRole.USER) {
      router.replace('/dashboard')
    }
  }, [user, router])

  if (isLoading) {
    return <LoadingPage />
  }

  if (!user) {
    return <PublicHomePage />
  }

  if (user.role === UserRole.USER) {
    return <AuthenticatedHomePage />
  }

  return <LoadingPage />
}
