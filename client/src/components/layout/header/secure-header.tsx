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
  User,
  Settings,
  LogOut,
  ChevronDown,
  Bell,
  Search,
  BookOpen,
  PenTool,
  ShoppingBag,
  LayoutDashboard,
  UserPlus,
  Shield
} from "lucide-react"
import { UserRole } from "@/lib/types/api"
import { useState } from "react"

export default function SecureHeader() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  if (!user) return null

  const handleLogout = () => {
    logout()
    router.push("/")
  }

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
        return <User className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: UserRole) => {
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
          {/* Search */}
          <Button variant="ghost" size="sm" className="hidden md:flex">
            <Search className="h-4 w-4" />
          </Button>

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
                        className={`${getRoleColor(user.role)} text-white text-xs`}
                      >
                        <span className="mr-1">{getRoleIcon(user.role)}</span>
                        {user.role.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-2">
                {/* Profile Actions */}
                <Link 
                  href="/profile" 
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-3 w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span>Profile Settings</span>
                </Link>

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

                <button 
                  className="flex items-center gap-3 w-full p-2 text-left hover:bg-muted rounded-md transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </button>

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
