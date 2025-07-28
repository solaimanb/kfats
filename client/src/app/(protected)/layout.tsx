export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-card border-r border-border">
          <div className="p-6">
            <h1 className="text-2xl font-bold">KFATS</h1>
          </div>
          <nav className="px-4 space-y-2">
            {/* Navigation will be added later */}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="h-16 border-b border-border bg-card px-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dashboard</h2>
            {/* User menu will be added later */}
          </div>
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
