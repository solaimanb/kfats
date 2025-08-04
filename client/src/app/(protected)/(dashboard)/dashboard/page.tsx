'use client'

import { useAuth } from '@/providers/auth-provider'
import { UserRole } from '@/lib/types/api'
import { LoadingSpinner } from '@/components/ui/loading'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function DashboardFallbackPage() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user?.role === UserRole.USER) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome to KFATS</h1>
          <p className="text-muted-foreground">
            Get started by applying for a role to access more features.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-2">Student Role</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Access courses, track progress, and earn certificates.
            </p>
            <Button asChild size="sm">
              <Link href="/role-application?role=student">Apply Now</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-2">Writer Role</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create and publish articles, build your reputation.
            </p>
            <Button asChild size="sm">
              <Link href="/role-application?role=writer">Apply Now</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-2">Mentor Role</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create courses, teach students, share knowledge.
            </p>
            <Button asChild size="sm">
              <Link href="/role-application?role=mentor">Apply Now</Link>
            </Button>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="font-semibold mb-2">Seller Role</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sell products and manage your online store.
            </p>
            <Button asChild size="sm">
              <Link href="/role-application?role=seller">Apply Now</Link>
            </Button>
          </div>
        </div>

        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Role applications are subject to review.
            You&apos;ll receive an email notification once your application is processed.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[50vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">Dashboard Access</h2>
        <p className="text-muted-foreground mb-4">
          Unable to determine your dashboard. Please try refreshing the page.
        </p>
        <Button asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
