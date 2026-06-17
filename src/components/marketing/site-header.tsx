'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const navLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Clips', href: '#clips' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
]

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.08] bg-[#08090A]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 text-xl font-black tracking-tight text-white">
          Clouts<span className="text-violet-400">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-white/50 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* CTAs */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="rounded-lg border border-white/10 px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:border-white/20 hover:text-white"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Get a Demo
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-md p-2 text-white/60 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-white/[0.08] bg-[#08090A] px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-white/60 hover:text-white"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-white/[0.08] pt-4">
              <Link href="/auth/login" className="rounded-lg border border-white/10 px-4 py-2 text-center text-sm font-medium text-white/80">
                Log in
              </Link>
              <Link href="/auth/signup" className="rounded-lg bg-violet-600 px-4 py-2 text-center text-sm font-semibold text-white">
                Get a Demo
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
