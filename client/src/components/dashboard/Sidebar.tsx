"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const linkClass = (path: string) =>
    `block px-4 py-2 rounded hover:bg-orange-100 ${
      pathname === path ? "bg-orange-200 font-semibold" : ""
    }`;

  return (
    <aside className="w-64 bg-white text-kc-text shadow-lg p-4 space-y-2">
      <h2 className="text-lg text-kc-dark font-bold mb-4">Dashboard</h2>

      <Link href="/dashboard/courses" className={linkClass("/dashboard/courses")}>
        🎓 My Courses
      </Link>
      <Link href="/dashboard/orders" className={linkClass("/dashboard/orders")}>
        🛍️ My Orders
      </Link>
      <Link href="/dashboard/cart" className={linkClass("/dashboard/cart")}>
        🛒 My Cart
      </Link>
      <Link href="/dashboard/recommendations" className={linkClass("/dashboard/recommendations")}>
        🌟 Recommended for You
      </Link>

      {(role === "user" || !role) && (
        <Link href="/dashboard/choose-path" className={linkClass("/dashboard/choose-path")}>
          🔀 Choose Your Path
        </Link>
      )}

      {(role === "mentor" || role === "seller" || role === "writer") && (
        <Link href={`/dashboard/${role}`} className={linkClass(`/dashboard/${role}`)}>
          🛠️ {role[0].toUpperCase() + role.slice(1)} Panel
        </Link>
      )}

      <Link href="/dashboard/settings" className={linkClass("/dashboard/settings")}>
        ⚙️ Account Settings
      </Link>
    </aside>
  );
}