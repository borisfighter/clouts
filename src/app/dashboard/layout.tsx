'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Radio, BarChart3, Scissors, Library,
  Send, Bot, LineChart, Settings, Menu, ChevronDown, Zap, LogOut, Crown, Plus, Check, TrendingUp, Clock, Bell
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

const navSections = [
  {
    label: 'Platform',
    color: 'text-violet-400',
    items: [
      { href: '/dashboard',            icon: LayoutDashboard, label: 'Overview' },
      { href: '/dashboard/visibility', icon: Radio,           label: 'AI Visibility' },
      { href: '/dashboard/volumes',    icon: BarChart3,       label: 'Prompt Volumes' },
      { href: '/dashboard/agents',     icon: Bot,             label: 'Agents' },
      { href: '/dashboard/analytics',  icon: LineChart,       label: 'Analytics' },
      { href: '/dashboard/competitors', icon: TrendingUp,     label: 'Competitors' },
      { href: '/dashboard/history',     icon: Clock,          label: 'Scan History' },
      { href: '/dashboard/notifications', icon: Bell,           label: 'Notifications' },
    ],
  },
  {
    label: '✂ Clips',
    color: 'text-emerald-400',
    items: [
      { href: '/dashboard/clips',         icon: Scissors, label: 'Auto Clips' },
      { href: '/dashboard/clips/library', icon: Library,  label: 'My Library' },
      { href: '/dashboard/clips/publish', icon: Send,     label: 'Publish Queue' },
    ],
  },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [brands, setBrands] = useState<any[]>([])
  const [activeBrand, setActiveBrand] = useState<any>(null)
  const [showBrandMenu, setShowBrandMenu] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [plan, setPlan] = useState<string>('free')
  const [brandSwitchError, setBrandSwitchError] = useState('')
  const brandMenuRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUser(user)
      const [{ data: b }, { data: u }] = await Promise.all([
        supabase.from('brands').select('id, name, domain, is_default').eq('user_id', user.id).order('created_at'),
        supabase.from('users').select('plan').eq('id', user.id).single(),
      ])
      if (b) {
        setBrands(b)
        setActiveBrand(b.find(x => x.is_default) || b[0] || null)
      }
      if (u) setPlan(u.plan || 'free')
    }
    load()
  }, [pathname])

  // Close brand menu when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (brandMenuRef.current && !brandMenuRef.current.contains(e.target as Node)) {
        setShowBrandMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const switchBrand = async (brandId: string) => {
    setShowBrandMenu(false)
    setBrandSwitchError('')
    try {
      const res = await fetch('/api/brands', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, is_default: true }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok || data.error) {
        setBrandSwitchError(data.error || 'Failed to switch brands — please try again')
        return
      }
      const newActive = brands.find(b => b.id === brandId)
      setActiveBrand(newActive)
      // Every dashboard page is a Client Component that fetches its own
      // brand-scoped data once via Supabase in a useEffect keyed on mount,
      // not on router/pathname state. router.refresh() only re-runs Server
      // Component data fetching, and router.push() to the SAME route (e.g.
      // switching brands while already on /dashboard, the most common case)
      // is a no-op in the App Router — it does not remount the page or
      // re-run its effects. Confirmed live: switching brands updated the
      // sidebar selector instantly but Overview kept showing the previous
      // brand's data indefinitely (bug present 2026-06-19, "fixed" with
      // router.push in 609d27f but that fix only worked when switching FROM
      // a different page, not from Overview itself). A full reload is the
      // simplest fix that's guaranteed correct everywhere without requiring
      // every page to subscribe to a shared brand context.
      window.location.href = '/dashboard'
    } catch {
      setBrandSwitchError('Failed to switch brands — check your connection and try again')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const initials = (user?.user_metadata?.full_name || user?.email || 'U')
    .split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="flex h-screen overflow-hidden bg-[#08090A] text-white">
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-white/[0.07] bg-[#0f1011] transition-transform duration-200 md:relative md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b border-white/[0.07] px-4">
          <Link href="/" className="text-base font-black text-white tracking-tight">
            Clouts<span className="text-violet-400">.</span>
          </Link>
          <span className="ml-auto rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-300">Beta</span>
        </div>

        {/* Brand selector */}
        <div className="border-b border-white/[0.07] px-3 py-2.5 relative" ref={brandMenuRef}>
          <button
            onClick={() => setShowBrandMenu(s => !s)}
            className="flex w-full items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.07] transition-colors"
          >
            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-violet-500/20 text-violet-400 text-[10px] font-bold">
              {activeBrand?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="flex-1 text-left truncate">{activeBrand?.name || 'Add your brand'}</span>
            <ChevronDown size={12} className={`text-white/30 shrink-0 transition-transform ${showBrandMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Brand dropdown */}
          {showBrandMenu && (
            <div className="absolute top-full left-3 right-3 mt-1 rounded-xl border border-white/[0.10] bg-[#1a1a1b] shadow-xl z-50 overflow-hidden">
              {brands.map(brand => (
                <button key={brand.id} onClick={() => switchBrand(brand.id)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-left hover:bg-white/[0.06] transition-colors">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-violet-500/15 text-violet-400 text-[10px] font-bold">
                    {brand.name[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white/80 truncate">{brand.name}</p>
                    <p className="text-white/30 text-[10px] truncate">{brand.domain}</p>
                  </div>
                  {brand.is_default && <Check size={11} className="text-violet-400 shrink-0" />}
                </button>
              ))}
              <div className="border-t border-white/[0.07]">
                <Link href="/dashboard/settings" onClick={() => setShowBrandMenu(false)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-xs text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors">
                  <Plus size={11} /> Add brand
                </Link>
              </div>
            </div>
          )}
        </div>

        {brandSwitchError && (
          <div className="mx-3 mt-2 rounded-lg border border-red-400/20 bg-red-400/[0.08] px-3 py-2 text-[11px] text-red-300">
            {brandSwitchError}
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {(() => {
            // Pick the single most specific (longest) href that matches the
            // current path, so a sub-route like /dashboard/clips/library
            // highlights only "My Library" — not also "Auto Clips", which
            // happened previously because pathname.startsWith('/dashboard/clips')
            // is true for every clips sub-route, and each nav item was
            // computing its own "active" independently with no awareness
            // of more specific sibling matches.
            const allHrefs = navSections.flatMap(s => s.items.map(i => i.href))
            const matches = allHrefs.filter(href => pathname === href || (href !== '/dashboard' && pathname.startsWith(href + '/')))
            const activeHref = matches.sort((a, b) => b.length - a.length)[0]
            return navSections.map((section) => (
              <div key={section.label}>
                <p className={cn('mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest', section.color)}>
                  {section.label}
                </p>
                {section.items.map(({ href, icon: Icon, label }) => {
                  const active = href === activeHref
                  return (
                    <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors mb-0.5',
                        active ? 'bg-violet-500/15 text-violet-300' : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                      )}>
                      <Icon size={14} />{label}
                    </Link>
                  )
                })}
              </div>
            ))
          })()}
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/[0.07] p-3 space-y-1">
          <Link href="/dashboard/settings"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-colors">
            <Settings size={14} />Settings
          </Link>
          <button onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-white/30 hover:bg-white/[0.04] hover:text-red-400 transition-colors">
            <LogOut size={14} />Sign out
          </button>

          {plan === 'free' ? (
            <Link href="/pricing"
              className="flex items-center gap-2 rounded-lg bg-violet-500/[0.08] border border-violet-500/15 px-3 py-2 hover:bg-violet-500/[0.12] transition-colors">
              <Zap size={12} className="text-violet-400" />
              <span className="text-[10px] text-violet-400/80 font-medium flex-1">Free Plan</span>
              <span className="text-[10px] text-violet-400 font-bold">Upgrade →</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-emerald-400/[0.06] border border-emerald-400/10 px-3 py-2">
              <Crown size={12} className="text-emerald-400" />
              <span className="text-[10px] text-emerald-400/80 font-medium capitalize">{plan} Plan</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#08090A] px-4">
          <button className="rounded-md p-1.5 text-white/40 hover:text-white md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <button onClick={handleSignOut}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold hover:bg-violet-500/30 transition-colors"
            title={`Signed in as ${user?.email} — click to sign out`}>
            {initials}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
