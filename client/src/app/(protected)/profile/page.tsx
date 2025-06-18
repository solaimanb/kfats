"use client";

import { useAuth } from "@/contexts/auth-context/auth-context";
import { useEffect } from "react";

export default function ProfilePage() {
  const { user } = useAuth();

  useEffect(() => {
    console.log("[Profile] Component mounted");
    console.log("[Profile] User data:", user ? {
      email: user.email,
      roles: user.roles,
      hasProfile: !!user.profile
    } : "No user");
  }, [user]);

  if (!user) {
    console.log("[Profile] No user data, returning null");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Personal Information</h2>
            <div className="mt-2">
              <p><span className="font-medium">Name:</span> {user.profile.firstName} {user.profile.lastName}</p>
              <p><span className="font-medium">Email:</span> {user.email}</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Roles</h2>
            <div className="mt-2">
              <ul className="list-disc list-inside">
                {user.roles.map((role) => (
                  <li key={role} className="capitalize">{role}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 