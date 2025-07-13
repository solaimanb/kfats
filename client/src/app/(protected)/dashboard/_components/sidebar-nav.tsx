"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/auth/use-auth";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

// Common navigation items visible to all roles
const commonNavItems = [
  { href: "/dashboard/profile", label: "👤 My Profile" },
];

// Define navigation items for each role
const navigationConfig = {
  admin: [
    { href: "/dashboard/admin", label: "📊 Dashboard" },
    { href: "/dashboard/admin/users", label: "👥 Users" },
    { href: "/dashboard/admin/courses", label: "🎓 Courses" },
    { href: "/dashboard/admin/products", label: "🛍️ Products" },
    { href: "/dashboard/admin/articles", label: "📝 Articles" },
    { href: "/dashboard/admin/payments", label: "💰 Payments" },
    { href: "/dashboard/admin/settings", label: "⚙️ Settings" },
  ],
  mentor: [
    { href: "/dashboard/mentor", label: "📊 Dashboard" },
    { href: "/dashboard/mentor/manage-courses", label: "📚 Manage Courses" },
    { href: "/dashboard/mentor/post-course", label: "➕ Post Course" },
    { href: "/dashboard/mentor/enrolled-students", label: "👥 Students" },
    { href: "/dashboard/mentor/live-classes", label: "🎥 Live Classes" },
    { href: "/dashboard/mentor/earnings", label: "💰 Earnings" },
    { href: "/dashboard/mentor/settings", label: "⚙️ Settings" },
  ],
  writer: [
    { href: "/dashboard/writer", label: "📊 Dashboard" },
    { href: "/dashboard/writer/manage-articles", label: "📝 Articles" },
    { href: "/dashboard/writer/post-article", label: "➕ Post Article" },
    { href: "/dashboard/writer/earnings", label: "💰 Earnings" },
    { href: "/dashboard/writer/feedback", label: "📬 Feedback" },
    { href: "/dashboard/writer/settings", label: "⚙️ Settings" },
  ],
  seller: [
    { href: "/dashboard/seller", label: "📊 Dashboard" },
    { href: "/dashboard/seller/manage-products", label: "🛍️ Products" },
    { href: "/dashboard/seller/add-product", label: "➕ Add Product" },
    { href: "/dashboard/seller/orders", label: "📦 Orders" },
    { href: "/dashboard/seller/earnings", label: "💰 Earnings" },
    { href: "/dashboard/seller/settings", label: "⚙️ Settings" },
  ],
  user: [
    { href: "/dashboard/user", label: "📊 Dashboard" },
    { href: "/dashboard/user/courses", label: "🎓 My Courses" },
    { href: "/dashboard/user/orders", label: "🛍️ My Orders" },
    { href: "/dashboard/user/cart", label: "🛒 My Cart" },
    { href: "/dashboard/user/recommendations", label: "🌟 Recommended" },
    { href: "/dashboard/user/role-applications", label: "📝 Role Applications" },
    { href: "/dashboard/user/settings", label: "⚙️ Settings" },
  ],
};

export function SidebarNav() {
  const { user } = useAuth();
  const pathname = usePathname();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const primaryRole = user?.roles[0] || "user";

  const roleSpecificNavItems = navigationConfig[primaryRole as keyof typeof navigationConfig] || navigationConfig.user;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-6 py-3">
        <div className="flex items-center justify-between">
          <h2 className={`text-lg font-bold text-sidebar-foreground transition-all duration-300 text-nowrap ${isCollapsed ? "hidden" : "w-auto opacity-100"}`}>
            {primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1)} Dashboard
          </h2>
          <Link href="/" className={`inline-block ${isCollapsed ? "mx-auto" : ""}`}>
            <Image
              src="/images/kc.png"
              alt="Logo"
              width={50}
              height={50}
              className="object-contain w-8 h-8"
            />
          </Link>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4">
                {/* Common navigation items */}
                <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-sidebar-foreground/70">
            Account
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {commonNavItems.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === link.href}
                    tooltip={link.label}
                    className="transition-colors duration-200"
                  >
                    <Link href={link.href}>
                      <span className="flex items-center gap-2 text-sm">
                        {link.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Role-specific navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-sidebar-foreground/70">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {roleSpecificNavItems.map((link) => (
                <SidebarMenuItem key={link.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === link.href}
                    tooltip={link.label}
                    className="transition-colors duration-200"
                  >
                    <Link href={link.href}>
                      <span className="flex items-center gap-2 text-sm">
                        {link.label}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
