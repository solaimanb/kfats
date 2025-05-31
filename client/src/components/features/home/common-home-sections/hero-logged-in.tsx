"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroLoggedIn() {
  return (
    <section className="relative flex w-full min-h-[90vh] bg-cover bg-center"
    style={{ backgroundImage: "url('/images/banner.gif')" }}
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center pl-6">
        
        {/* Left: Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        > 
          <h1 className="text-4xl md:text-5xl font-bold text-kc-text mb-4">
            কুষ্টিয়া চারুকলায় আপনাকে স্বাগতম!
          </h1>
          <p className="text-lg text-gray-700 mb-6">
            আপনার দক্ষতা বৃদ্ধি ও দক্ষতাকে কাজে লাগিয়ে
             অনলাইনে <br />  আয়ের উৎসে রূপান্তর করুন আমাদের সাথে।
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/courses"
              className="bg-kc-green text-white px-6 py-3 rounded-md text-center font-semibold hover:bg-green-700 transition"
            >
              কোর্স ব্রাউজ করুন
            </Link>
            <Link
              href="/products"
              className="border-2 border-kc-green text-kc-green px-6 py-3 rounded-md text-center font-semibold hover:bg-kc-green hover:text-white transition"
            >
              প্রোডাক্ট ব্রাউজ করুন
            </Link>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
