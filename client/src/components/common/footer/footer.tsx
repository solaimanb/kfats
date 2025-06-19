import Image from "next/image";
import Link from "next/link";
import { FaFacebookF, FaYoutube, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-kc-dark text-white py-12 px-6 md:px-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand / Logo */}
        <div>
          <Link href="/" className="inline-block">
          <Image
            src="/images/kc-logo.png"
            alt="Sign Up logo"
            width={100}
            height={100}
            className="object-contain w-20"
          />
        </Link>
          <p className="mt-2 text-sm text-gray-400">
            আপনার শেখার যাত্রার বিশ্বস্ত সঙ্গী।
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">দ্রুত লিংকসমূহ</h4>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li><Link href="/">হোম</Link></li>
            <li><Link href="/courses">কোর্সসমূহ</Link></li>
            <li><Link href="/about">আমাদের সম্পর্কে</Link></li>
            <li><Link href="/contact">যোগাযোগ</Link></li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-lg font-semibold mb-4">আমাদের অনুসরণ করুন</h4>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-kc-green transition">
              <FaFacebookF size={20} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-kc-green transition">
              <FaYoutube size={24} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-kc-green transition">
              <FaInstagram size={20} />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom copyright */}
      <div className="mt-10 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Kushtia Charukola. সর্বস্বত্ব সংরক্ষিত।
      </div>
    </footer>
  );
}
