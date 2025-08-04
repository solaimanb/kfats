export default function SellerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="seller-dashboard">
      <main className="seller-content">
        {children}
      </main>
    </div>
  )
}