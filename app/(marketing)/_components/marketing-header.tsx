import Link from 'next/link'
import { brandFont } from '@/lib/fonts'

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-anthropic-slate/95 backdrop-blur supports-[backdrop-filter]:bg-anthropic-slate/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className={`${brandFont.className} text-2xl text-anthropic-cream`}>
              Peanut Manager
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-anthropic-cream/80 hover:text-anthropic-cream transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-anthropic-terracotta text-white hover:bg-anthropic-terracotta-light transition-colors"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
