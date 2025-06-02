"use client";

// import SearchInput from "@/components/SearchInput";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineShoppingCart,
  AiOutlineUser,
  AiOutlineDown,
  AiOutlineLogout,
} from "react-icons/ai";
import { useAuth } from "@/contexts/auth-context";

export default function UserHomeNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const { user, logout } = useAuth();
  console.log("USER - user-home-navbar:", user);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  const toggleProfileDropdown = () =>
    setProfileDropdownOpen(!profileDropdownOpen);

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
    setProfileDropdownOpen(false);
  };

  return (
    <header className="bg-orange-100 shadow-md sticky top-0 z-50">
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
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center gap-1 text-kc-text font-medium hover:text-kc-green"
              >
                Join as <AiOutlineDown size={14} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-2 w-48 bg-white text-gray-600 shadow-md border rounded-md z-50">
                  <Link
                    href="/become-mentor"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-orange-50"
                  >
                    ✅ Become a Mentor
                  </Link>
                  <Link
                    href="/become-seller"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-orange-50"
                  >
                    🛍️ Become a Seller
                  </Link>
                  <Link
                    href="/become-writer"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-orange-50"
                  >
                    ✍️ Become a Writer
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 mx-6 max-w-md">
          {/* Search Bar Placeholder (Design only) */}
          <div className="hidden md:flex flex-1 mx-6 max-w-md">
            <div className="w-full px-4 py-2 border-2 border-amber-600 bg-white text-gray-400 rounded-md">
              Search courses, products...
            </div>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/courses" className="text-kc-text hover:text-kc-green">
            কোর্সসমূহ
          </Link>
          <Link href="/products" className="text-kc-text hover:text-kc-green">
            প্রোডাক্টস
          </Link>
          {user && (
            <Link
              href={getDashboardLink()}
              className="text-kc-text hover:text-kc-green"
            >
              ড্যাশবোর্ড
            </Link>
          )}
          <Link href="/about" className="text-kc-text hover:text-kc-green">
            আমাদের সম্পর্কে
          </Link>
          <Link
            href="/cart"
            className="text-kc-text hover:text-kc-green relative"
          >
            <AiOutlineShoppingCart size={20} />
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={toggleProfileDropdown}
                className="flex items-center gap-2 text-kc-text hover:text-kc-green"
              >
                <AiOutlineUser size={20} />
                <span className="text-sm">{user.profile.firstName}</span>
              </button>
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white shadow-md border rounded-md z-50">
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="block px-4 py-2 text-gray-600 hover:bg-orange-50"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-gray-600 hover:bg-orange-50 flex items-center gap-2"
                  >
                    <AiOutlineLogout size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="inline-block">
              <button className="bg-kc-text text-white px-4 py-1 rounded cursor-pointer hover:bg-kc-green">
                Log in
              </button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Icon */}
        <button onClick={toggleMenu} className="md:hidden text-kc-green">
          {menuOpen ? (
            <AiOutlineClose size={24} />
          ) : (
            <AiOutlineMenu size={24} />
          )}
        </button>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4 text-kc-dark">
          <Link href="/courses" onClick={toggleMenu}>
            কোর্সসমূহ
          </Link>
          <Link href="/products" onClick={toggleMenu}>
            প্রোডাক্টস
          </Link>
          {user && (
            <Link href={getDashboardLink()} onClick={toggleMenu}>
              ড্যাশবোর্ড
            </Link>
          )}
          <Link href="/about" onClick={toggleMenu}>
            আমাদের সম্পর্কে
          </Link>
          <Link href="/cart" onClick={toggleMenu}>
            🛒 কার্ট
          </Link>
          {user ? (
            <>
              <Link href="/profile" onClick={toggleMenu}>
                👤 {user.profile.firstName}
              </Link>
              <button
                onClick={handleLogout}
                className="text-left flex items-center gap-2 text-red-600"
              >
                <AiOutlineLogout size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" onClick={toggleMenu}>
              Login
            </Link>
          )}

          {user && (
            <details className="border-t pt-2">
              <summary className="cursor-pointer text-kc-text">Join as</summary>
              <div className="ml-4 mt-2 flex flex-col gap-2">
                <Link href="/become-mentor" onClick={toggleMenu}>
                  ✅ Become a Mentor
                </Link>
                <Link href="/become-seller" onClick={toggleMenu}>
                  🛍️ Become a Seller
                </Link>
                <Link href="/become-writer" onClick={toggleMenu}>
                  ✍️ Become a Writer
                </Link>
              </div>
            </details>
          )}
        </div>
      )}
    </header>
  );
}
