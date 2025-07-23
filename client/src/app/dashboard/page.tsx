"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function Dashboard() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (user) {
                const route = (() => {
                    switch (user.role) {
                        case 'admin': return '/dashboard/admin';
                        case 'mentor': return '/dashboard/mentor';
                        case 'seller': return '/dashboard/seller';
                        case 'writer': return '/dashboard/writer';
                        default: return '/dashboard/user';
                    }
                })();
                router.replace(route);
            } else {
                router.replace('/login');
            }
        }
    }, [user, isLoading, router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-kc-orange"></div>
        </div>
    );
} 