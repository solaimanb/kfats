export default function WriterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="writer-dashboard">
      <main className="writer-content">
        {children}
      </main>
    </div>
  )
}