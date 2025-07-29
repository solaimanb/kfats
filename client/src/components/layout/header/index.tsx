"use client"

import { useAuth } from "@/providers/auth-provider"
import DefaultHeader from "./defualt-header"
import SecureHeader from "./secure-header"

export function Header() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="h-8 w-20 bg-muted animate-pulse rounded" />
          <div className="h-8 w-32 bg-muted animate-pulse rounded" />
        </div>
      </header>
    )
  }

  if (user) {
    return <SecureHeader />
  }

  return <DefaultHeader />
}

// Re-export individual headers for specific use cases
export { default as DefaultHeader } from "./defualt-header"
export { default as SecureHeader } from "./secure-header"
