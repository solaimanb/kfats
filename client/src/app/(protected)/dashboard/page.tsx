"use client"

import { useAuth } from "@/providers/auth-provider"
import { Card, CardContent } from "@/components/ui/card"
import { UserRole } from "@/lib/types/api"
import {
  StudentDashboard,
  MentorDashboard,
  WriterDashboard,
  SellerDashboard,
  AdminDashboard,
  DefaultDashboard
} from "./_components"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p>Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderDashboard = () => {
    switch (user.role) {
      case UserRole.STUDENT:
        return <StudentDashboard userId={user.id} />
      case UserRole.MENTOR:
        return <MentorDashboard userId={user.id} />
      case UserRole.WRITER:
        return <WriterDashboard userId={user.id} />
      case UserRole.SELLER:
        return <SellerDashboard userId={user.id} />
      case UserRole.ADMIN:
        return <AdminDashboard userId={user.id} />
      default:
        return <DefaultDashboard userId={user.id} />
    }
  }

  return (
    <div className="container mx-auto">
      {renderDashboard()}
    </div>
  )
}
