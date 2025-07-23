"use client";

import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/gAuth/google`;
  };

  return (
    <div className="flex min-h-screen bg-kc-dark">
      <div className="w-full md:w-1/2 p-4">
        <Link href="/" className="inline-block">
          <Image
            src="/images/kc-logo.png"
            alt="Sign Up logo"
            width={100}
            height={100}
            className="object-contain w-20"
          />
        </Link>
        <div className="flex w-full items-center justify-center p-10 rounded-r-3xl">
          <div className="w-full max-w-md space-y-6">
            <h2 className="text-3xl font-bold text-kc-orange text-center">
              Login to your account
            </h2>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md hover:shadow-kc-green hover:shadow-md focus:ring-2 focus:ring-kc-orange"
                  required
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md hover:shadow-kc-green hover:shadow-md focus:ring-2 focus:ring-kc-orange"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-kc-orange text-white py-2 font-bold rounded-md hover:bg-kc-green transition ${
                  isLoading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <p className="text-sm text-center text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-orange-600 font-medium hover:underline"
              >
                Sign up
              </Link>
            </p>

            <div className="relative text-center text-gray-400">
              <span className="absolute left-0 top-1/2 w-full border-t border-gray-200"></span>
              <span className="bg-kc-dark px-4 relative z-10 text-sm">or</span>
            </div>

            <button
              onClick={handleGoogleLogin}
              type="button"
              className="flex items-center justify-center w-full border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-700 transition mt-4"
            >
              <FcGoogle className="mr-2 text-xl" />
              Continue with Google
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:flex w-1/2 items-center justify-center relative overflow-hidden">
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

        <motion.div
          initial={{ x: "100%" }}
          whileInView={{ x: "-50%" }}
          transition={{ duration: 2, ease: "linear" }}
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-l from-transparent via-yellow-200 to-transparent opacity-20"
        />
      </div>
    </div>
  );
}
