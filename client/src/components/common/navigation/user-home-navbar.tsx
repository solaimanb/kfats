"use client";

// import SearchInput from "@/components/SearchInput";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AiOutlineShoppingCart,
  AiOutlineUser,
  AiOutlineDown,
  AiOutlineLogout,
  AiOutlineMenu,
} from "react-icons/ai";
import { useAuth } from '@/hooks/auth/use-auth';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

export default function UserHomeNavbar() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const { user, logout, isLoading } = useAuth();

  // Role-based dashboard link
  const getDashboardLink = () => {
    if (!user) return "/dashboard";
    const role = user.roles[0];
    if (role === "admin") return "/dashboard/admin";
    if (role === "mentor") return "/dashboard/mentoring";
    if (role === "writer") return "/dashboard/articles";
    if (role === "seller") return "/dashboard/products";
    if (role === "student") return "/dashboard/courses";
    return "/dashboard";
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-[#fff5eb] shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Join As Dropdown */}
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-block">
            <Image
              src="/images/kc-logo.png"
              alt="Logo"
              width={100}
              height={100}
              className="object-contain w-20"
            />
          </Link>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-1 text-black hover:text-kc-green hover:bg-transparent"
                >
                  Join as <AiOutlineDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-white">
                <DropdownMenuItem asChild>
                  <Link
                    href="/role-application/become-mentor"
                    className="flex items-center hover:text-kc-green"
                  >
                    ✅ Become a Mentor
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/role-application/become-seller"
                    className="flex items-center hover:text-kc-green"
                  >
                    🛍️ Become a Seller
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/role-application/become-writer"
                    className="flex items-center hover:text-kc-green"
                  >
                    ✍️ Become a Writer
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 mx-6 max-w-md">
          <Input
            type="text"
            placeholder="Search courses, products..."
            className="w-full border-2 border-kc-orange bg-white rounded-md focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-gray-500"
          />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/courses" className="text-black hover:text-kc-green">
            কোর্সসমূহ
          </Link>
          <Link href="/products" className="text-black hover:text-kc-green">
            প্রোডাক্টস
          </Link>
          {user && (
            <Link
              href={getDashboardLink()}
              className="text-black hover:text-kc-green"
            >
              ড্যাশবোর্ড
            </Link>
          )}
          <Link href="/about" className="text-black hover:text-kc-green">
            আমাদের সম্পর্কে
          </Link>
          <Link
            href="/cart"
            className="text-black hover:text-kc-green relative"
          >
            <AiOutlineShoppingCart size={20} />
          </Link>

          {isLoading ? (
            <div className="w-[70px]" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 text-black hover:text-kc-green hover:bg-transparent"
                >
                  <AiOutlineUser size={20} />
                  <span className="text-sm">{user.profile.firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="hover:text-kc-green w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700"
                >
                  <AiOutlineLogout size={16} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/login">
              <Button
                variant="default"
                className="bg-kc-orange hover:bg-kc-orange/90 text-white border-none"
              >
                Login
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-black hover:text-kc-green hover:bg-transparent"
            >
              <AiOutlineMenu size={24} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] bg-white">
            <div className="flex flex-col gap-4">
              <Link
                href="/courses"
                onClick={() => setSheetOpen(false)}
                className="text-black hover:text-kc-green"
              >
                কোর্সসমূহ
              </Link>
              <Link
                href="/products"
                onClick={() => setSheetOpen(false)}
                className="text-black hover:text-kc-green"
              >
                প্রোডাক্টস
              </Link>
              {user && (
                <Link
                  href={getDashboardLink()}
                  onClick={() => setSheetOpen(false)}
                  className="text-black hover:text-kc-green"
                >
                  ড্যাশবোর্ড
                </Link>
              )}
              <Link
                href="/about"
                onClick={() => setSheetOpen(false)}
                className="text-black hover:text-kc-green"
              >
                আমাদের সম্পর্কে
              </Link>
              <Link
                href="/cart"
                onClick={() => setSheetOpen(false)}
                className="text-black hover:text-kc-green"
              >
                🛒 কার্ট
              </Link>

              {!isLoading &&
                (user ? (
                  <>
                    <Link href="/profile" className="w-full">
                      <Button
                        variant="ghost"
                        className="justify-start text-black hover:text-kc-green hover:bg-transparent w-full"
                      >
                        👤 {user.profile.firstName}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={handleLogout}
                      className="justify-start text-red-600 hover:text-red-700 hover:bg-transparent"
                    >
                      <AiOutlineLogout size={16} className="mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <Link href="/login">
                    <Button
                      variant="default"
                      className="bg-kc-orange hover:bg-kc-orange/90 text-white border-none"
                    >
                      Login
                    </Button>
                  </Link>
                ))}

              {user && (
                <div className="border-t pt-4">
                  <h3 className="mb-2 font-medium text-black">Join as</h3>
                  <div className="ml-4 flex flex-col gap-2">
                    <Link
                      href="/role-application/become-mentor"
                      onClick={() => setSheetOpen(false)}
                      className="flex items-center text-black hover:text-kc-green"
                    >
                      ✅ Become a Mentor
                    </Link>
                    <Link
                      href="/role-application/become-seller"
                      onClick={() => setSheetOpen(false)}
                      className="flex items-center text-black hover:text-kc-green"
                    >
                      🛍️ Become a Seller
                    </Link>
                    <Link
                      href="/role-application/become-writer"
                      onClick={() => setSheetOpen(false)}
                      className="flex items-center text-black hover:text-kc-green"
                    >
                      ✍️ Become a Writer
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
