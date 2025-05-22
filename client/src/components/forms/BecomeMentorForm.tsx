"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function BecomeMentorForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    profession: "",
    education: "",
    experience: "",
    subject: "",
    bio: "",
    linkedin: "",
    website: "",
  });

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", form);
    console.log("Uploaded Image:", profileImage);
    alert("Form submitted!");
  };

  return (
    <section className="max-w-full bg-gradient-to-br to-kc-text/60 from-kc-dark py-10">
      <Link href="/" className="inline-block">
        <Image
          src="/images/kc-logo.png"
          alt="Logo"
          width={100}
          height={100}
          className="object-contain w-20 ml-8"
        />
      </Link>

      <div className="max-w-4xl mx-auto bg-[#FDFCF8] p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-kc-text mb-6 text-center">Become a Mentor</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-kc-dark">
          {/* Profile Image Upload */}
          <div className="md:col-span-2 text-center">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Preview"
                width={120}
                height={120}
                className="rounded-full mx-auto mb-2 object-cover"
              />
            ) : (
              <div className="w-28 h-28 rounded-full mx-auto mb-2 bg-gray-200 flex items-center justify-center text-sm text-gray-500">
                Preview
              </div>
            )}
            <label className="block text-sm font-medium text-kc-text mb-1">Upload Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} className="p-3 border border-gray-300 rounded" required />
          <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="p-3 border border-gray-300 rounded" required />
          <input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} className="p-3 border border-gray-300 rounded" />
          <input name="education" placeholder="Highest Education" value={form.education} onChange={handleChange} className="p-3 border border-gray-300 rounded" />
          <input name="experience" placeholder="Years of Experience" value={form.experience} onChange={handleChange} className="p-3 border border-gray-300 rounded" />
          <input name="subject" placeholder="Subjects or Skills to Teach" value={form.subject} onChange={handleChange} className="p-3 border border-gray-300 rounded" />
          <input name="linkedin" placeholder="LinkedIn Profile (optional)" value={form.linkedin} onChange={handleChange} className="p-3 border border-gray-300 rounded" />
          <input name="website" placeholder="Website / Portfolio (optional)" value={form.website} onChange={handleChange} className="p-3 border border-gray-300 rounded" />

          <div className="md:col-span-2">
            <textarea name="bio" placeholder="Short Bio or Teaching Philosophy" value={form.bio} onChange={handleChange} className="p-3 border border-gray-300 rounded w-full" rows={4}></textarea>
          </div>

          <div className="md:col-span-2 flex items-center gap-2">
            <input type="checkbox" required className="accent-kc-green" />
            <label>I confirm all information is accurate.</label>
          </div>

          <div className="md:col-span-2 text-center">
            <button type="submit" className="bg-kc-green hover:bg-green-700 text-white px-6 py-2 rounded transition">
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
