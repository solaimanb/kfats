"use client";

import { motion } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { LoginRequest } from "@/types";
import { useAuth } from '@/hooks/auth/use-auth';
import { authService } from "@/lib/api/services";
import { ApiErrorResponse } from "@/types/api/common/types";

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type ValidationErrors = {
  email?: string;
  password?: string;
};

const RATE_LIMIT = {
  MAX_ATTEMPTS: 15,  // Match server config
  RESET_TIME: 15 * 60 * 1000, // 15 minutes
};

export default function LoginForm() {
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [attempts, setAttempts] = useState({
    count: 0,
    lastAttempt: 0,
  });

  // Reset rate limit after timeout
  useEffect(() => {
    if (attempts.count >= RATE_LIMIT.MAX_ATTEMPTS) {
      const timeoutId = setTimeout(() => {
        setAttempts({ count: 0, lastAttempt: 0 });
      }, RATE_LIMIT.RESET_TIME);
      return () => clearTimeout(timeoutId);
    }
  }, [attempts]);

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: ValidationErrors = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof ValidationErrors] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleResendVerification = async () => {
    try {
      toast.loading('Sending verification email...');
      await authService.resendVerificationEmail(formData.email);
      toast.success('Verification Email Sent', {
        description: 'Please check your inbox and follow the instructions.',
        duration: 4000
      });
    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      toast.error('Failed to Send Email', {
        description: apiError?.response?.data?.message || 'Please try again later.',
        duration: 4000
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Check rate limiting
    if (attempts.count >= RATE_LIMIT.MAX_ATTEMPTS) {
      const timeRemaining = Math.ceil(
        (RATE_LIMIT.RESET_TIME - (Date.now() - attempts.lastAttempt)) / 1000
      );
      toast.error('Too Many Login Attempts', {
        description: `Please wait ${Math.ceil(timeRemaining / 60)} minutes before trying again.`,
        duration: 5000,
        action: {
          label: 'Reset Password?',
          onClick: () => router.push('/forgot-password')
        }
      });
      return;
    }

    // Validate form
    if (!validateForm()) {
      toast.error('Invalid Input', {
        description: 'Please check your email and password format.',
        duration: 3000
      });
      return;
    }

    try {
      setAttempts(prev => ({
        count: prev.count + 1,
        lastAttempt: Date.now(),
      }));

      await login(formData);

    } catch (error: unknown) {
      const apiError = error as ApiErrorResponse;
      console.log('Login error:', apiError);
      const errorMessage = apiError.response?.data?.message || apiError.message || 'An unexpected error occurred';
      
      if (errorMessage.toLowerCase().includes('credentials')) {
        toast.error(errorMessage, {
          action: {
            label: 'Reset Password',
            onClick: () => router.push('/forgot-password')
          }
        });
      } else if (errorMessage.toLowerCase().includes('verify')) {
        toast.error(errorMessage, {
          action: {
            label: 'Resend Email',
            onClick: handleResendVerification
          }
        });
      } else if (errorMessage.toLowerCase().includes('blocked') || errorMessage.toLowerCase().includes('suspended')) {
        toast.error(errorMessage, {
          description: 'Please contact support to resolve this.',
          duration: 5000
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    toast.loading('Redirecting to Google...', {
      duration: 2000
    });
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
                  className={`w-full px-4 py-2 border rounded-md hover:shadow-kc-green hover:shadow-md focus:ring-2 focus:ring-kc-orange ${errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                  required
                  disabled={isLoading || attempts.count >= RATE_LIMIT.MAX_ATTEMPTS}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-gray-600">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2 border rounded-md hover:shadow-kc-green hover:shadow-md focus:ring-2 focus:ring-kc-orange ${errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                  required
                  disabled={isLoading || attempts.count >= RATE_LIMIT.MAX_ATTEMPTS}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
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
                disabled={isLoading || attempts.count >= RATE_LIMIT.MAX_ATTEMPTS}
                className="w-full bg-kc-orange text-white py-2 font-bold rounded-md hover:bg-kc-green transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="text-sm text-center text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href={`/register${searchParams.get("from")
                  ? `?from=${searchParams.get("from")}`
                  : ""
                  }`}
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
              disabled={isLoading || attempts.count >= RATE_LIMIT.MAX_ATTEMPTS}
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
