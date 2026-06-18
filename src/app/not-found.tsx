import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#08090A] flex items-center justify-center text-white">
      <div className="text-center max-w-md px-6">
        <p className="text-9xl font-black text-white/[0.06] mb-2 leading-none">404</p>
        <h1 className="text-2xl font-black text-white mb-2">Page not found</h1>
        <p className="text-white/40 text-sm mb-8">
          This page doesn't exist or was moved. Here are some helpful links:
        </p>
        <div className="flex flex-col gap-2 mb-8">
          {[
            { href: '/dashboard',  label: '→ Dashboard', sub: 'View your AI visibility data' },
            { href: '/pricing',    label: '→ Pricing',   sub: 'Free, Pro, and Team plans' },
            { href: '/changelog',  label: '→ Changelog', sub: "What's new in Clouts" },
            { href: '/auth/login', label: '→ Log in',    sub: 'Sign in to your account' },
          ].map(({ href, label, sub }) => (
            <Link key={href} href={href}
              className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 hover:bg-white/[0.04] hover:border-white/[0.12] transition-colors text-left">
              <span className="text-sm font-medium text-white/70">{label}</span>
              <span className="text-xs text-white/30">{sub}</span>
            </Link>
          ))}
        </div>
        <Link href="/" className="text-sm text-white/30 hover:text-white transition-colors">
          ← Back to homepage
        </Link>
      </div>
    </div>
  )
}
