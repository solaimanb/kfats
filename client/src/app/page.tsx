"use client";

import CommonHomePage from '@/components/home/CommonHomePage';
import UsersHomePage from '@/components/home/UsersHomePage'; // Adjust path as needed
import Footer from '@/components/shared/footer/Footer';
import React from 'react';

const isUser = true;

export default function HomePage() {
  return (
    <>
      {isUser ? <UsersHomePage /> : <CommonHomePage />}
      <Footer />
    </>
  );
}
