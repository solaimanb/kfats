export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="student-dashboard">
      <main className="student-content">
        {children}
      </main>
    </div>
  )
}