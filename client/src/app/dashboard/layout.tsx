import { ReactNode } from "react";
 
import Sidebar from "@/components/dashboard/Sidebar";
import { getCurrentUser } from "@/lib/auth";


export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser(); // Example: { name, role }

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user?.role || "user"} />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
