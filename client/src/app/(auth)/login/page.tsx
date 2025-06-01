"use client";

import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { authService } from "@/lib/api/services";
import { toast } from "sonner";
import { AxiosError } from "axios";
import type { LoginRequest } from "@/types/api/requests";
import type { LoginResponse } from "@/types/api/responses";
import type { ApiResponse } from "@/types/api/common";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response: ApiResponse<LoginResponse> = await authService.login(formData);
      if (response.status === "success" && response.data?.user) {
        // Store the token
        authService.setToken(response.data.accessToken);
        toast.success("Login successful!");
        // Force a page refresh to update the auth state
        window.location.href = "/dashboard";
      } else {
        toast.error("Invalid response from server");
      }
    } catch (error) {
      if (error instanceof AxiosError) {
        toast.error(error.response?.data?.message || "Login failed");
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.error("Google login not implemented yet");
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
                  disabled={isLoading}
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
                  disabled={isLoading}
                />
                <div className="flex justify-end mt-1">
                  <Link
                    href="/forgot-password"
                    className="text-sm text-kc-orange hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-kc-orange text-white py-2 font-bold rounded-md hover:bg-kc-green transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-sm text-center text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
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
              disabled={isLoading}
              className="flex items-center justify-center w-full border border-gray-300 py-2 px-4 rounded-lg hover:bg-gray-700 transition mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
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
