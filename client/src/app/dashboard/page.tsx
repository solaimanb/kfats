"use client";



export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen flex">
      <main className="flex-1 p-6 bg-white">
        {children}
      </main>
    </div>
  );
}
