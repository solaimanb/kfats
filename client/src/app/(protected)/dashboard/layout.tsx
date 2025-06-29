"use client";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SidebarNav } from "./_components/sidebar-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <SidebarNav />
        <main className="flex-1">
          <div className="flex items-center h-14 px-6 border-b border-border">
            <SidebarTrigger />
          </div>
          <div className="p-6 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
