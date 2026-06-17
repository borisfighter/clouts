'use client'

import { Menu, Bell, Search } from 'lucide-react'

interface TopbarProps {
  onMenuClick: () => void
}

export function DashboardTopbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#0c0d0e] px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="rounded-md p-1.5 text-white/40 hover:text-white lg:hidden"
        >
          <Menu size={18} />
        </button>
        <div className="hidden items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 sm:flex">
          <Search size={13} className="text-white/30" />
          <input
            type="text"
            placeholder="Search brands, clips, mentions..."
            className="w-52 bg-transparent text-xs text-white/60 placeholder-white/20 outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-lg p-1.5 text-white/40 hover:text-white/70 transition-colors">
          <Bell size={16} />
          <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-violet-400" />
        </button>
        <div className="h-7 w-7 rounded-full bg-violet-500/30 flex items-center justify-center text-[10px] font-bold text-violet-300 cursor-pointer hover:bg-violet-500/40 transition-colors">
          K
        </div>
      </div>
    </header>
  )
}
