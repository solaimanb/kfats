"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";

const mentorLinks = [
  { href: "/dashboard/mentor", label: "📊 Dashboard" },
  { href: "/dashboard/mentor/post-course", label: "➕ Post a Course" },
  { href: "/dashboard/mentor/manage-courses", label: "📚 Manage Your Courses" },
  { href: "/dashboard/mentor/enrolled-students", label: "👥  Enrolled Students" },
  { href: "/dashboard/mentor/q&a", label: "💬 Q&A / Discussions" },
  { href: "/dashboard/mentor/live-classes", label: "🗓️ Live Class Schedule" },
  { href: "/dashboard/mentor/earnings", label: "💸 Earnings & Payouts" },
  { href: "/dashboard/mentor/settings", label: "⚙️ Settings" },
  // Add more mentor-specific links later
];

export default function MentorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-orange-100 text-kc-dark p-6 shadow-md">
        <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-4">Mentor Panel</h2>
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
          {mentorLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "py-2 px-3 rounded hover:bg-orange-200",
                pathname === link.href && "bg-orange-300 font-semibold"
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
