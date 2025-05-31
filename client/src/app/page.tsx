"use client";

import CommonHomePage from "@/components/features/home/common-home-page";
import UsersHomePage from "@/components/features/home/users-home-page";
import Footer from "@/components/common/footer/footer";

const isUser = true;

export default function HomePage() {
  return (
    <>
      {isUser ? <UsersHomePage /> : <CommonHomePage />}
      <Footer />
    </>
  );
}
