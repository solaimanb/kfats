"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import Image from "next/image";

const sellerLinks = [
  { href: "/dashboard/seller", label: "🛍️ Dashboard" },
  { href: "/dashboard/seller/add-product", label: "➕ Add a Product" },
  { href: "/dashboard/seller/manage-products", label: "📦 Manage Products" },
  { href: "/dashboard/seller/orders", label: "📃 Orders" },
  { href: "/dashboard/seller/earnings", label: "💸 Earnings" },
  { href: "/dashboard/seller/settings", label: "⚙️ Settings" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-green-100 text-kc-dark p-6 shadow-md">
        <div className="flex justify-between">
            <h2 className="text-xl font-bold mb-4">Seller Panel</h2>
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
          {sellerLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className={clsx(
                "py-2 px-3 rounded hover:bg-green-200",
                pathname === link.href && "bg-green-300 font-semibold"
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
