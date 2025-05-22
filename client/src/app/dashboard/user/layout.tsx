"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";

const userLinks = [
  { href: "/dashboard/courses", label: "🎓 My Courses" },
  { href: "/dashboard/orders", label: "🛍️ My Orders" },
  { href: "/dashboard/cart", label: "🛒 My Cart" },
  { href: "/dashboard/recommendations", label: "🌟 Recommended" },
  { href: "/dashboard/choose-path", label: "🔀 Choose Your Path" },
  { href: "/dashboard/settings", label: "⚙️ Account Settings" },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-blue-100 text-kc-dark p-6 shadow-md">
        <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-4">User Panel</h2>
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
          {userLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "py-2 px-3 rounded hover:bg-blue-200",
                pathname === link.href && "bg-blue-300 font-semibold"
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
