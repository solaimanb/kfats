"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/providers/auth-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  GraduationCap,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  BookOpen,
  PenTool,
  ShoppingBag,
  LayoutDashboard,
  UserPlus,
} from "lucide-react"
import { UserRole } from "@/lib/types/api"
import { getRoleBadgeClasses, getRoleIcon } from "@/lib/utils/role"
import { useState } from "react"
import SearchBar from "@/components/common/search/search-bar"

export default function SecureHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push("/")
  }



  const getNavigationLinks = () => {
    const baseLinks = [
      { href: "/courses", label: "Courses", icon: BookOpen },
      { href: "/articles", label: "Articles", icon: PenTool },
      { href: "/marketplace", label: "Marketplace", icon: ShoppingBag }
    ]

    // Add role-specific links
    const roleLinks = []

    if (user.role !== UserRole.USER) {
      roleLinks.push({ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard })
    }

    if (user.role === UserRole.MENTOR || user.role === UserRole.ADMIN) {
      roleLinks.push({ href: "/courses/create", label: "Create Course", icon: BookOpen })
    }

    if (user.role === UserRole.WRITER || user.role === UserRole.ADMIN) {
      roleLinks.push({ href: "/articles/create", label: "Write Article", icon: PenTool })
    }

    if (user.role === UserRole.SELLER || user.role === UserRole.ADMIN) {
      roleLinks.push({ href: "/products/create", label: "List Product", icon: ShoppingBag })
    }

    if (user.role === UserRole.USER) {
      roleLinks.push({ href: "/role-application", label: "Upgrade Role", icon: UserPlus })
    }

    return [...roleLinks, ...baseLinks]
  }

  return (
    <header className="h-16 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <GraduationCap className="h-8 w-8 text-primary" />
          <span className="text-xl font-bold">KFATS</span>
        </Link>

        {/* Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
          {getNavigationLinks().slice(0, 4).map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center gap-4">
          <SearchBar />

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            {/* Notification indicator */}
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Menu */}
          <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-1">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-sm font-semibold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>

                  {/* User Info */}
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-medium leading-none">{user.full_name}</div>
                    <div className="flex items-center gap-1 mt-1">
                      {getRoleIcon(user.role)}
                      <span className="text-xs text-muted-foreground capitalize">
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DialogTrigger>

            <DialogContent className="w-80">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground text-lg font-semibold">
                    {user.full_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-lg font-semibold">{user.full_name}</div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`${getRoleBadgeClasses(user.role, 'solid')} text-xs`}
                      >
                        <span className="mr-1">{getRoleIcon(user.role)}</span>
                        {user.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-2">
                {user.role !== UserRole.USER && (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                )}

                {user.role === UserRole.USER && (
                  <Link
                    href="/role-application"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Upgrade Role</span>
                  </Link>
                )}

                <Link
                  href="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>

                <hr className="my-2" />

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full p-2 text-left hover:bg-destructive hover:text-destructive-foreground rounded-md transition-colors text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  )
}
