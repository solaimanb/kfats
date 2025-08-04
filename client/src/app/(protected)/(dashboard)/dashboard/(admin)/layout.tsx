
export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="admin-dashboard">
            <main className="admin-content">
                {children}
            </main>
        </div>
    )
}