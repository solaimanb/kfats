import Link from 'next/link';
import React from 'react';
import PromoMarquee from './PromoMarquee';
import Image from 'next/image';

const CmnNavbar = () => {
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
          <Link href="/login" className="inline-block ">
            <button className="bg-kc-text text-white px-4 py-1 rounded cursor-pointer hover:bg-kc-green">Log in</button>
          </Link>

          <span className="text-gray-500">or</span>

          <Link href="/signup" className="inline-block ">
            <button className="bg-white border border-kc-text text-kc-text px-4 py-1 rounded cursor-pointer hover:text-kc-green hover:border-kc-green">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CmnNavbar;
