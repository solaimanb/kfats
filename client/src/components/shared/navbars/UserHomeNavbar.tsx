"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineShoppingCart,
  AiOutlineUser,
  AiOutlineDown,
} from "react-icons/ai";

export default function UserHomeNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

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

          {/* Dropdown */}
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
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 mx-6 max-w-md">
          <input
            type="text"
            placeholder="Search courses, products..."
            className="w-full px-4 py-2 border-2  border-amber-600 bg-white text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-kc-text"
          />
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6 items-center">
          <Link href="/courses" className="text-kc-text hover:text-kc-green">কোর্সসমূহ</Link>
          <Link href="/products" className="text-kc-text hover:text-kc-green">প্রোডাক্টস</Link>
          <Link href="/dashboard" className="text-kc-text hover:text-kc-green">ড্যাশবোর্ড</Link>
          <Link href="/about" className="text-kc-text hover:text-kc-green">আমাদের সম্পর্কে</Link>

          <Link href="/cart" className="text-kc-text hover:text-kc-green relative">
            <AiOutlineShoppingCart size={20} />
          </Link>
          <Link href="/profile" className="text-kc-text hover:text-kc-green">
            <AiOutlineUser size={20} />
          </Link>
        </nav>

        {/* Mobile Menu Icon */}
        <button onClick={toggleMenu} className="md:hidden text-kc-green">
          {menuOpen ? <AiOutlineClose size={24} /> : <AiOutlineMenu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t px-4 py-4 flex flex-col gap-4">
          <Link href="/courses" onClick={toggleMenu}>কোর্সসমূহ</Link>
          <Link href="/products" onClick={toggleMenu}>প্রোডাক্টস</Link>
          <Link href="/dashboard" onClick={toggleMenu}>ড্যাশবোর্ড</Link>
          <Link href="/about" onClick={toggleMenu}>আমাদের সম্পর্কে</Link>
          <Link href="/cart" onClick={toggleMenu}>🛒 কার্ট</Link>
          <Link href="/profile" onClick={toggleMenu}>👤 প্রোফাইল</Link>

          {/* Mobile Dropdown */}
          <details className="border-t pt-2">
            <summary className="cursor-pointer text-kc-text">Join as</summary>
            <div className="ml-4 mt-2 flex flex-col gap-2">
              <Link href="/join/mentor" onClick={toggleMenu}>✅ Become a Mentor</Link>
              <Link href="/join/seller" onClick={toggleMenu}>🛍️ Become a Seller</Link>
              <Link href="/join/writer" onClick={toggleMenu}>✍️ Become a Writer</Link>
            </div>
          </details>
        </div>
      )}
    </header>
  );
}
