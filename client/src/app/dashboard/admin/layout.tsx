"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";

const adminLinks = [
  { href: "/dashboard/admin", label: "🧑‍💼 Admin Home" },
  { href: "/dashboard/admin/users", label: "👥 Manage Users" },
  { href: "/dashboard/admin/courses", label: "🎓 Manage Courses" },
  { href: "/dashboard/admin/products", label: "🛍️ Manage Products" },
  { href: "/dashboard/admin/articles", label: "✍️ Manage Articles" },
  { href: "/dashboard/admin/payments", label: "💰 Payments" },
  { href: "/dashboard/admin/site-settings", label: "⚙️ Site Settings" },
  { href: "/dashboard/admin/settings", label: "⚙️ Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-red-100 text-kc-dark p-6 shadow-md">
        <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
            <Link href="/" className="inline-block">
            <Image
              src="/images/kc.png"
              alt="Logo"
              width={50}
              height={50}
              className="object-contain w-8"
            />
          </Link>
        </div>
        
        <nav className="flex flex-col gap-3">
          {adminLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "py-2 px-3 rounded hover:bg-red-200",
                pathname === link.href && "bg-red-300 font-semibold"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 bg-white p-6">{children}</main>
    </div>
  );
}
