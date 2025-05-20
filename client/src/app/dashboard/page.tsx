"use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import {
//   AiOutlineShoppingCart,
//   AiOutlineBook,
//   AiOutlineStar,
//   AiOutlineSetting,
//   AiOutlineUnorderedList,
//   AiOutlineBranches,
// } from "react-icons/ai";
// import { cn } from "@/lib/utils";

// const navItems = [
//   {
//     label: "My Courses",
//     href: "/dashboard/courses",
//     icon: <AiOutlineBook size={18} />,
//   },
//   {
//     label: "My Orders",
//     href: "/dashboard/orders",
//     icon: <AiOutlineUnorderedList size={18} />,
//   },
//   {
//     label: "My Cart",
//     href: "/cart",
//     icon: <AiOutlineShoppingCart size={18} />,
//   },
//   {
//     label: "Recommended for You",
//     href: "/dashboard/recommended",
//     icon: <AiOutlineStar size={18} />,
//   },
//   {
//     label: "Choose Your Path",
//     href: "/choose-path",
//     icon: <AiOutlineBranches size={18} />,
//   },
//   {
//     label: "Account Settings",
//     href: "/dashboard/settings",
//     icon: <AiOutlineSetting size={18} />,
//   },
// ];

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
//   const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      {/* <aside className="hidden md:block w-64 bg-orange-50 border-r p-6">
        <h2 className="text-xl font-semibold mb-4 text-kc-dark">User Dashboard</h2>
        <nav className="space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-md hover:bg-orange-100 text-kc-text",
                pathname === item.href && "bg-orange-200 text-kc-dark font-medium"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
      </aside> */}

      {/* Main content */}
      <main className="flex-1 p-6 bg-white">
        {children}
      </main>
    </div>
  );
}
