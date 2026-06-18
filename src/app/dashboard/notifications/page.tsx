'use client'

import { useState } from 'react'
import { Bell, Radio, TrendingUp, AlertTriangle, Check } from 'lucide-react'

const SAMPLE_NOTIFICATIONS = [
  {
    id: '1',
    type: 'scan',
    icon: Radio,
    color: 'text-violet-400',
    bg: 'bg-violet-400/10',
    title: 'AI scan completed',
    body: 'Your brand was mentioned in 4/4 Perplexity queries (100% rate). Score: 85.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'insight',
    icon: TrendingUp,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    title: 'Visibility improving',
    body: 'Your mention rate increased by 12% compared to last week. Keep it up!',
    time: '1 day ago',
    read: false,
  },
  {
    id: '3',
    type: 'alert',
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    title: 'Competitor gaining ground',
    body: 'A competitor was mentioned 3x in recent scans. Consider updating your content strategy.',
    time: '2 days ago',
    read: true,
  },
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS)
  const unread = notifications.filter(n => !n.read).length

  const markAllRead = () => setNotifications(n => n.map(x => ({ ...x, read: true })))

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-white/40">
            {unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
            <Check size={12} /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
          <Bell size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30">No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(({ id, icon: Icon, color, bg, title, body, time, read }) => (
            <div
              key={id}
              onClick={() => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x))}
              className={`flex items-start gap-4 rounded-2xl border p-5 cursor-pointer transition-all ${
                read ? 'border-white/[0.07] bg-white/[0.02] opacity-60' : 'border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.06]'
              }`}
            >
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon size={15} className={color} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-white">{title}</p>
                  {!read && <div className="h-1.5 w-1.5 rounded-full bg-violet-400 shrink-0" />}
                </div>
                <p className="text-xs text-white/50 leading-relaxed">{body}</p>
                <p className="text-[10px] text-white/25 mt-1.5">{time}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
        <p className="text-xs text-white/30 mb-2">Notifications are generated from scan results and insights.</p>
        <a href="/dashboard/settings" className="text-xs text-violet-400 hover:text-violet-300">Manage notification preferences →</a>
      </div>
    </div>
  )
}
