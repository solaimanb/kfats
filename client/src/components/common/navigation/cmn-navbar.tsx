"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AiOutlineUser, AiOutlineLogout } from "react-icons/ai";
import { useAuth } from "@/contexts/auth-context/auth-context";
import PromoMarquee from "./promo-marquee";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const CmnNavbar = () => {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
  };

  const handleProfileClick = () => {
    router.push("/profile");
  };

  return (
    <div className="w-full sticky top-0 z-50 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.3)] bg-white">
      {/* Promotional Bar */}
      <PromoMarquee />

      {/* Main Navbar */}
      <div className="flex justify-between items-center px-6 py-2 bg-orange-100">
        <Link href="/" className="inline-block">
          <Image
            src="/images/kc-logo.png"
            alt="Sign Up logo"
            width={100}
            height={100}
            className="object-contain w-20"
          />
        </Link>
        <div className="flex items-center gap-4">
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
                  <span className="text-sm">{user.profile?.firstName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-white">
                <DropdownMenuItem
                  onClick={handleProfileClick}
                  className="hover:text-kc-green"
                >
                  Profile
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
            <>
              <Link href="/login" className="inline-block">
                <Button className="bg-kc-text text-white px-4 py-1 rounded cursor-pointer hover:bg-kc-green">
                  Log in
                </Button>
              </Link>

              <span className="text-gray-500">or</span>

              <Link href="/register" className="inline-block">
                <Button variant="outline" className="border-kc-text text-kc-text px-4 py-1 rounded cursor-pointer hover:text-kc-green hover:border-kc-green">
                  Register
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CmnNavbar;
