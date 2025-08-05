"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/providers/auth-provider"
import { UserRole } from "@/lib/types/api"
import { AppSidebarSkeleton } from "./app-sidebar-skeleton"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  Users,
  PenTool,
  ShoppingBag,
  FileText,
  Settings,
  User,
  Bell,
  BarChart3,
  Shield,
  UserPlus,
  Plus,
  LogOut,
  ChevronUp,
  Home,
} from "lucide-react"

const getNavigationData = (userRole: UserRole) => {
  const getDashboardUrl = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return "/dashboard/admin"
      case UserRole.WRITER:
        return "/dashboard/writer"
      case UserRole.MENTOR:
        return "/dashboard/mentor"
      case UserRole.SELLER:
        return "/dashboard/seller"
      case UserRole.STUDENT:
        return "/dashboard/student"
      default:
        return "/dashboard"
    }
  }

  const baseNavigation = [
    {
      title: "Overview",
      url: getDashboardUrl(userRole),
      icon: LayoutDashboard,
      isActive: false,
    },
  ]

  const roleSpecificNavigation = {
    [UserRole.STUDENT]: [
      {
        title: "Browse Courses",
        url: "/courses",
        icon: BookOpen,
      },
      {
        title: "My Learning",
        url: "/dashboard/student/my-learning",
        icon: BarChart3,
      },
    ],
    [UserRole.MENTOR]: [
      {
        title: "My Courses",
        url: "/dashboard/mentor/my-courses",
        icon: BookOpen,
      },
      {
        title: "Students",
        url: "/dashboard/mentor/students",
        icon: Users,
      },
      {
        title: "Create Course",
        url: "/courses/create",
        icon: Plus,
      },
    ],
    [UserRole.WRITER]: [
      {
        title: "My Articles",
        url: "/dashboard/writer/my-articles",
        icon: PenTool,
      },
      {
        title: "Write Article",
        url: "/articles/create",
        icon: Plus,
      },
      // {
      //   title: "Analytics",
      //   url: "/dashboard/writer/analytics",
      //   icon: BarChart3,
      // },
    ],
    [UserRole.SELLER]: [
      {
        title: "My Products",
        url: "/dashboard/seller/my-products",
        icon: ShoppingBag,
      },
      {
        title: "Add Product",
        url: "/products/create",
        icon: Plus,
      },
      {
        title: "Orders",
        url: "/dashboard/seller/orders",
        icon: FileText,
      },
      // {
      //   title: "Sales Analytics",
      //   url: "/dashboard/seller/analytics",
      //   icon: BarChart3,
      // },
    ],
    [UserRole.ADMIN]: [
      {
        title: "User Management",
        url: "/dashboard/admin/users",
        icon: Users,
      },
      {
        title: "Role Applications",
        url: "/dashboard/admin/role-applications",
        icon: UserPlus,
      },
      {
        title: "Content Management",
        url: "/dashboard/admin/content-management",
        icon: FileText,
      },
      // {
      //   title: "Analytics",
      //   url: "/dashboard/admin/analytics",
      //   icon: BarChart3,
      // },
    ],
    [UserRole.USER]: [
      {
        title: "Upgrade Role",
        url: "/role-application",
        icon: UserPlus,
      },
    ],
  }

  const quickLinks = [
    {
      title: "Browse Courses",
      url: "/courses",
      icon: BookOpen,
    },
    {
      title: "Read Articles",
      url: "/articles",
      icon: PenTool,
    },
    {
      title: "Marketplace",
      url: "/marketplace",
      icon: ShoppingBag,
    },
  ]

  return {
    main: [...baseNavigation, ...(roleSpecificNavigation[userRole] || [])],
    quickLinks,
  }
}

export function AppSidebar() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  if (!user) return <AppSidebarSkeleton />

  const navigation = getNavigationData(user.role)

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

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">KFATS</span>
                  <span className="truncate text-xs">Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="overflow-x-hidden">
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.main.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Quick Links */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.quickLinks.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Account Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/dashboard/profile">
                    <User />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/notifications">
                    <Bell />
                    <span>Notifications</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/settings">
                    <Settings />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar_url} alt={user.full_name} />
                    <AvatarFallback className="rounded-lg">
                      {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.full_name}</span>
                    <div className="flex items-center gap-1">
                      {getRoleIcon(user.role)}
                      <span className="truncate text-xs capitalize">{user.role}</span>
                    </div>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar_url} alt={user.full_name} />
                    <AvatarFallback className="rounded-lg">
                      {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.full_name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${getRoleBadgeColor(user.role)} text-white text-xs`}
                  >
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
