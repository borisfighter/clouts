'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard, Radio, BarChart3, Scissors, Library,
  Send, Bot, LineChart, Settings, Menu, ChevronDown, Zap, LogOut
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
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    await createClient().auth.signOut()
    router.push('/auth/login')
  }

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
        <div className="border-b border-white/[0.07] px-3 py-2.5">
          <Link href="/dashboard/settings"
            className="flex w-full items-center gap-2 rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/70 hover:bg-white/[0.07] transition-colors">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-violet-500/20 text-violet-400 text-[10px] font-bold">C</div>
            <span className="flex-1 text-left truncate">My Brand</span>
            <ChevronDown size={12} className="text-white/30" />
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
          {navSections.map((section) => (
            <div key={section.label}>
              <p className={cn('mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest', section.color)}>
                {section.label}
              </p>
              {section.items.map(({ href, icon: Icon, label }) => {
                const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
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
          ))}
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
          <div className="flex items-center gap-2 rounded-lg bg-emerald-400/[0.06] px-3 py-2 border border-emerald-400/10">
            <Zap size={12} className="text-emerald-400" />
            <span className="text-[10px] text-emerald-400/80 font-medium">Free Plan</span>
            <Link href="/pricing" className="ml-auto text-[10px] text-emerald-400 font-semibold hover:underline">Upgrade</Link>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/[0.07] bg-[#08090A] px-4">
          <button className="rounded-md p-1.5 text-white/40 hover:text-white md:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu size={18} />
          </button>
          <div className="flex-1" />
          <button onClick={handleSignOut}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold hover:bg-violet-500/30 transition-colors">
            K
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
