import Link from 'next/link'
import { brandFont } from '@/lib/fonts'

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-anthropic-slate/95 backdrop-blur supports-[backdrop-filter]:bg-anthropic-slate/80">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <span className={`${brandFont.className} text-xl sm:text-2xl text-anthropic-cream whitespace-nowrap`}>
              Peanut Manager
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium text-anthropic-cream/80 hover:text-anthropic-cream transition-colors whitespace-nowrap"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm font-medium rounded-lg bg-anthropic-terracotta text-white hover:bg-anthropic-terracotta-light transition-colors whitespace-nowrap"
            >
              Start Free
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
