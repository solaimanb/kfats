"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/hooks/auth/use-auth';
import { UserRole } from "@/config/rbac/types";

// Dashboard-specific redirects
const DASHBOARD_REDIRECTS = {
    admin: "/dashboard/admin",
    mentor: "/dashboard/mentoring",
    writer: "/dashboard/articles",
    seller: "/dashboard/products",
    student: "/dashboard/courses",
    user: "/dashboard/user",
} as const;

export default function DashboardPage() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            console.log('Current user:', user);
            console.log('User roles:', user?.roles);

            if (!user) {
                console.log('No user found, redirecting to login');
                router.push("/login");
                return;
            }

            // Get the highest priority role
            const priorityOrder = [
                UserRole.ADMIN,
                UserRole.MENTOR,
                UserRole.WRITER,
                UserRole.SELLER,
                UserRole.STUDENT,
                UserRole.USER,
            ];

            // Convert user roles to UserRole enum values
            const userRoles = user.roles.map(role => role.toLowerCase() as UserRole);
            console.log('Normalized user roles:', userRoles);

            // Find highest priority role that matches
            const highestRole = priorityOrder.find(role =>
                userRoles.includes(role)
            ) || UserRole.USER;

            console.log('Highest role found:', highestRole);
            console.log('Dashboard redirects:', DASHBOARD_REDIRECTS);

            // Get dashboard-specific redirect path for the role
            const redirectPath = DASHBOARD_REDIRECTS[highestRole];
            console.log('Redirecting to:', redirectPath);

            // Always redirect to a dashboard path
            if (redirectPath) {
                router.replace(redirectPath);
            } else {
                // Fallback to user dashboard if something goes wrong
                router.replace('/dashboard/user');
            }
        }
    }, [user, isLoading, router]);

    return null;
} 