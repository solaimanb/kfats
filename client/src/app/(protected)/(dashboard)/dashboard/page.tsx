"use client"

import { useAuth } from "@/providers/auth-provider"
import { Badge } from "@/components/ui/badge"
import { UserRole } from "@/lib/types/api"
import {
  StudentDashboard,
  MentorDashboard,
  WriterDashboard,
  SellerDashboard,
  AdminDashboard,
  DefaultDashboard
} from "./_components"
import {
  BookOpen,
  GraduationCap,
  PenTool,
  ShoppingBag,
  Shield,
  User,
} from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case UserRole.STUDENT:
        return <BookOpen className="h-5 w-5" />
      case UserRole.MENTOR:
        return <GraduationCap className="h-5 w-5" />
      case UserRole.WRITER:
        return <PenTool className="h-5 w-5" />
      case UserRole.SELLER:
        return <ShoppingBag className="h-5 w-5" />
      case UserRole.ADMIN:
        return <Shield className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case UserRole.STUDENT:
        return "bg-blue-500"
      case UserRole.MENTOR:
        return "bg-green-500"
      case UserRole.WRITER:
        return "bg-purple-500"
      case UserRole.SELLER:
        return "bg-orange-500"
      case UserRole.ADMIN:
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getRoleDisplayName = (role: UserRole) => {
    return role.charAt(0).toUpperCase() + role.slice(1)
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
    <div className="space-y-6">
      <div className="border-b pb-4">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">Welcome back, {user.full_name || user.username}!</h1>
          <Badge
            className={`${getRoleBadgeColor(user.role)} text-white flex items-center gap-1`}
          >
            {getRoleIcon(user.role)}
            {getRoleDisplayName(user.role)}
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </div>

      {renderDashboard()}
    </div>
  )
}
