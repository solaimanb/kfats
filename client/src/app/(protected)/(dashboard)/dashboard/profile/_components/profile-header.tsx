import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "@/lib/types/api"
import {
  Mail,
  Calendar,
  User as UserIcon
} from "lucide-react"
import { getRoleBadgeClasses, getRoleIcon } from "@/lib/utils/role"


interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <Avatar className="h-20 w-20">
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
                  className={getRoleBadgeClasses(user.role, 'solid')}
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

          {/* <Button variant="outline" className="self-start">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button> */}
        </div>
      </CardContent>
    </Card>
  )
}
