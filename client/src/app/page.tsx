"use client";

import { useAuth } from '@/hooks/auth/use-auth';
import CommonHomePage from "@/components/features/home/common-home-page";
import UsersHomePage from "@/components/features/home/users-home-page";
import Footer from "@/components/common/footer/footer";

export default function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <>
      {user ? <UsersHomePage /> : <CommonHomePage />}
      <Footer />
    </>
  );
}
