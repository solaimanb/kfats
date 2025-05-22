"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";

const writerLinks = [
  { href: "/dashboard/writer", label: "📝 Dashboard" },
  { href: "/dashboard/writer/post-article", label: "➕ Post an Article" },
  { href: "/dashboard/writer/manage-articles", label: "📚 Manage Articles" },
  { href: "/dashboard/writer/feedback", label: "💬 Feedback & Comments" },
  { href: "/dashboard/writer/earnings", label: "💸 Earnings" },
  { href: "/dashboard/writer/settings", label: "⚙️ Settings" },
];

export default function WriterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-purple-100 text-kc-dark p-6 shadow-md">
        <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-4">Writer Panel</h2>
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
          {writerLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "py-2 px-3 rounded hover:bg-purple-200",
                pathname === link.href && "bg-purple-300 font-semibold"
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
