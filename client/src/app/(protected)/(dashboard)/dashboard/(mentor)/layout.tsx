export default function MentorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="mentor-dashboard">
            <main className="mentor-content">
                {children}
            </main>
        </div>
    )
}