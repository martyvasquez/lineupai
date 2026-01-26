import { MarketingHeader } from './_components/marketing-header'
import { Footer } from './_components/footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
