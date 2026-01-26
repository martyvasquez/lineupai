import Link from 'next/link'
import { brandFont } from '@/lib/fonts'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/10 bg-anthropic-slate">
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className={`${brandFont.className} text-xl text-anthropic-cream`}>
              Peanut Manager
            </span>
          </div>
          <nav className="flex items-center gap-6 text-sm text-anthropic-cream-muted">
            <Link href="/login" className="hover:text-anthropic-cream transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="hover:text-anthropic-cream transition-colors">
              Sign Up
            </Link>
          </nav>
        </div>
        <div className="mt-8 pt-6 border-t border-white/10 text-center text-sm text-anthropic-cream-muted">
          <p>&copy; {currentYear} Peanut Manager. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
