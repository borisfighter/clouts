'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { X, BarChart3, Satellite, Scissors, BookOpen, Send, Bot, Settings, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

const platformNav = [
  { label: 'AI Visibility',    href: '/dashboard/visibility',  icon: Satellite },
  { label: 'Prompt Volumes',   href: '/dashboard/volumes',     icon: BarChart3 },
  { label: 'Agent Analytics',  href: '/dashboard/analytics',   icon: Zap },
  { label: 'Agents',           href: '/dashboard/agents',      icon: Bot },
]

const clipsNav = [
  { label: 'Auto Clips',    href: '/dashboard/clips',          icon: Scissors },
  { label: 'My Library',   href: '/dashboard/clips/library',  icon: BookOpen },
  { label: 'Publish Queue',href: '/dashboard/clips/publish',  icon: Send },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function DashboardSidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-white/[0.06] bg-[#0c0d0e] transition-transform duration-200 lg:static lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex h-14 items-center justify-between border-b border-white/[0.06] px-4">
          <Link href="/" className="text-base font-black tracking-tight text-white">
            Clouts<span className="text-violet-400">.</span>
          </Link>
          <button onClick={onClose} className="rounded p-1 text-white/40 hover:text-white lg:hidden">
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Platform */}
          <div>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-white/20">
              Platform
            </p>
            {platformNav.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
                    active
                      ? 'bg-violet-500/15 text-violet-300'
                      : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                  )}
                >
                  <Icon size={14} />
                  {label}
                  {active && <ChevronRight size={12} className="ml-auto opacity-50" />}
                </Link>
              )
            })}
          </div>

          {/* Clips */}
          <div>
            <p className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-widest text-emerald-400/60">
              ✂ Clips
            </p>
            {clipsNav.map(({ label, href, icon: Icon }) => {
              const active = pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
                    active
                      ? 'bg-emerald-400/10 text-emerald-300'
                      : 'text-white/40 hover:bg-white/[0.04] hover:text-white/70'
                  )}
                >
                  <Icon size={14} />
                  {label}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Bottom */}
        <div className="border-t border-white/[0.06] p-3">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium text-white/40 hover:bg-white/[0.04] hover:text-white/70 transition-colors"
          >
            <Settings size={14} />
            Settings
          </Link>
          <div className="mt-2 flex items-center gap-2.5 px-2.5 py-2">
            <div className="h-6 w-6 rounded-full bg-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-300">
              K
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-white/70 truncate">Kseniya</p>
              <p className="text-[10px] text-white/30 truncate">clouts.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
