"use client";

import React from "react";

export default function BecomeSellerForm() {
  return (
    <form className="max-w-2xl mx-auto bg-white text-kc-dark shadow-md rounded-lg p-6 space-y-4">
      <h2 className="text-2xl font-bold text-kc-text mb-4">সেলার হওয়ার জন্য আবেদন</h2>

      <input
        type="text"
        placeholder="আপনার নাম"
        className="w-full border p-2 rounded-md"
      />

      <input
        type="email"
        placeholder="ইমেইল"
        className="w-full border p-2 rounded-md"
      />

      <input
        type="text"
        placeholder="মোবাইল নম্বর"
        className="w-full border p-2 rounded-md"
      />

      <textarea
        placeholder="আপনার ব্যবসার বর্ণনা দিন"
        rows={4}
        className="w-full border p-2 rounded-md"
      ></textarea>

      <button
        type="submit"
        className="bg-kc-green text-white px-6 py-2 rounded hover:bg-green-700"
      >
        আবেদন করুন
      </button>
    </form>
  );
}
