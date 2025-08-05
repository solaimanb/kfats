"use client"

import { useAuth } from "@/providers/auth-provider"
import { ProfileHeader } from "./_components/profile-header"
import { ProfileTabs } from "./_components/profile-tabs"
import { ProfileSkeleton } from "./_components/profile-skeleton"

export default function ProfilePage() {
  const { user } = useAuth()

  if (!user) {
    return <ProfileSkeleton />
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-6">
        <ProfileHeader user={user} />
        <ProfileTabs user={user} />
      </div>
    </div>
  )
}
