"use client";

import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";

export default function LoginForm() {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Login Form */}
      <div className="w-full md:w-1/2 p-4">
        <Image
          src="/images/kc-logo.png"
          alt="Login image"
          width={100}
          height={100}
          className="object-contain"
        />
        <div className="flex w-full items-center justify-center p-10 rounded-r-3xl">
          <div className="w-full max-w-md space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-[#faaf23] text-center">
                Login to your account
              </h2>
            </div>

            <form className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-400"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#faaf23] text-white py-2 font-bold rounded-md hover:bg-[#68b218] transition"
              >
                Login
              </button>
            </form>

            <p className="text-sm text-center text-gray-500">
              Don&apos;t have an account?{" "}
              <a
                href="#"
                className="text-orange-600 font-medium hover:underline"
              >
                Sign up
              </a>
            </p>

            <button className="flex items-center justify-center w-full border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-50 transition mt-4">
              <FcGoogle className="mr-2 text-xl" />
              Continue with Google
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden">
        {/* Login Image */}
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        >
          <Image
            src="/images/login-image.jpg"
            alt="Login image"
            width={500}
            height={500}
            className="object-contain rounded-3xl"
          />
        </motion.div>

        {/* Bright Light Animation */}
        <motion.div
          initial={{ x: "100%" }}
          whileInView={{ x: "-50%" }}
          transition={{
            duration: 2,
            ease: "linear",
          }}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-transparent via-yellow-200 to-transparent opacity-20"
        />
      </div>
    </div>
  );
}
