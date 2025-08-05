import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, UserRole } from "@/lib/types/api"
import {
  Edit,
  Mail,
  Calendar,
  BookOpen,
  GraduationCap,
  PenTool,
  ShoppingBag,
  Shield,
  User as UserIcon
} from "lucide-react"

const getRoleIcon = (role: UserRole) => {
  switch (role) {
    case UserRole.STUDENT:
      return <BookOpen className="h-4 w-4" />
    case UserRole.MENTOR:
      return <GraduationCap className="h-4 w-4" />
    case UserRole.WRITER:
      return <PenTool className="h-4 w-4" />
    case UserRole.SELLER:
      return <ShoppingBag className="h-4 w-4" />
    case UserRole.ADMIN:
      return <Shield className="h-4 w-4" />
    default:
      return <UserIcon className="h-4 w-4" />
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

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={user.avatar_url} alt={user.full_name} />
            <AvatarFallback className="text-lg">
              {user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{user.full_name}</h1>
                <Badge
                  variant="secondary"
                  className={`${getRoleBadgeColor(user.role)} text-white`}
                >
                  <span className="mr-1">{getRoleIcon(user.role)}</span>
                  {user.role.toUpperCase()}
                </Badge>
              </div>
              <p className="text-muted-foreground">@{user.username}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Joined {new Date(user.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long'
                })}</span>
              </div>
              {user.bio && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground mt-3">
                  <UserIcon className="h-4 w-4 mt-0.5" />
                  <p>{user.bio}</p>
                </div>
              )}
            </div>
          </div>

          <Button variant="outline" className="self-start">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
