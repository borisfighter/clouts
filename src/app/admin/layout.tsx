'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Users, Globe, Radio, Scissors, Shield, Menu, X, Loader2, Plug } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/admin',               icon: LayoutDashboard, label: 'Overview' },
  { href: '/admin/users',         icon: Users,           label: 'Users' },
  { href: '/admin/brands',        icon: Globe,           label: 'Brands' },
  { href: '/admin/mentions',      icon: Radio,           label: 'Mentions' },
  { href: '/admin/clips',         icon: Scissors,        label: 'Clips' },
  { href: '/admin/integrations',  icon: Plug,            label: 'Integrations' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    async function check() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      const res = await fetch('/api/admin/stats')
      if (res.status === 403 || res.status === 401) { router.push('/dashboard'); return }
      setAuthorized(true)
      setChecking(false)
    }
    check()
  }, [])

  if (checking) return (
    <div className="flex h-screen items-center justify-center bg-[#08090A]">
      <div className="text-center">
        <Loader2 size={24} className="animate-spin text-violet-400 mx-auto mb-3" />
        <p className="text-sm text-white/30">Verifying admin access...</p>
      </div>
    </div>
  )

  if (!authorized) return null

  return (
    <div className="flex h-screen bg-[#08090A] text-white">
      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-52 flex-col border-r border-white/[0.07] bg-[#0a0a0b] transition-transform md:relative md:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex h-14 items-center gap-2 border-b border-white/[0.07] px-4">
          <Shield size={16} className="text-red-400 shrink-0" />
          <span className="text-sm font-black text-white">Admin Panel</span>
          <Link href="/dashboard" className="ml-auto text-[10px] text-white/30 hover:text-white transition-colors">← App</Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  active ? 'bg-red-500/15 text-red-300' : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                )}>
                <Icon size={14} />{label}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-white/[0.07] p-3">
          <div className="rounded-lg bg-red-500/[0.08] border border-red-500/15 px-3 py-2">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Admin Mode</p>
            <p className="text-[10px] text-white/20 mt-0.5">Changes affect all users</p>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-3 border-b border-white/[0.07] px-4">
          <button className="md:hidden text-white/40 hover:text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <span className="text-sm text-white/30">Clouts Admin</span>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-red-500/15 border border-red-500/20 px-2.5 py-1 text-[10px] font-bold text-red-400">ADMIN</span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  )
}
