'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, Radio, TrendingUp, TrendingDown, Bot, Loader2 } from 'lucide-react'

interface Notification {
  id: string
  icon: any
  color: string
  bg: string
  title: string
  body: string
  time: string
  timestamp: number
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export default function NotificationsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [brand, setBrand] = useState<any>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [readIds, setReadIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      setBrand(b)
      if (!b) return setLoading(false)

      const items: Notification[] = []

      const since30 = new Date(Date.now() - 30 * 86400000).toISOString()
      const { data: mentions } = await supabase
        .from('mentions').select('engine, mentioned, score, scraped_at')
        .eq('brand_id', b.id).gte('scraped_at', since30).order('scraped_at', { ascending: false })

      if (mentions && mentions.length > 0) {
        const latestTs = mentions[0].scraped_at
        const latestDay = latestTs.slice(0, 10)
        const sameDayMentions = mentions.filter(m => m.scraped_at.slice(0, 10) === latestDay)
        const matched = sameDayMentions.filter(m => m.mentioned).length
        const rate = Math.round((matched / sameDayMentions.length) * 100)
        const scores = sameDayMentions.filter(m => m.score != null).map(m => m.score)
        const avgScore = scores.length ? Math.round(scores.reduce((a, c) => a + c, 0) / scores.length) : null
        items.push({
          id: 'latest-scan',
          icon: Radio, color: 'text-violet-400', bg: 'bg-violet-400/10',
          title: 'AI scan completed',
          body: `${b.name} was mentioned in ${matched}/${sameDayMentions.length} queries (${rate}% rate)${avgScore !== null ? `. Score: ${avgScore}.` : '.'}`,
          time: timeAgo(latestTs), timestamp: new Date(latestTs).getTime(),
        })

        const nowMs = Date.now()
        const last7 = mentions.filter(m => new Date(m.scraped_at).getTime() > nowMs - 7 * 86400000)
        const prev7 = mentions.filter(m => {
          const t = new Date(m.scraped_at).getTime()
          return t > nowMs - 14 * 86400000 && t <= nowMs - 7 * 86400000
        })
        if (last7.length > 0 && prev7.length > 0) {
          const last7Rate = Math.round((last7.filter(m => m.mentioned).length / last7.length) * 100)
          const prev7Rate = Math.round((prev7.filter(m => m.mentioned).length / prev7.length) * 100)
          const delta = last7Rate - prev7Rate
          if (delta !== 0) {
            items.push({
              id: 'week-trend',
              icon: delta > 0 ? TrendingUp : TrendingDown,
              color: delta > 0 ? 'text-emerald-400' : 'text-yellow-400',
              bg: delta > 0 ? 'bg-emerald-400/10' : 'bg-yellow-400/10',
              title: delta > 0 ? 'Visibility improving' : 'Visibility declining',
              body: `Your mention rate ${delta > 0 ? 'increased' : 'decreased'} by ${Math.abs(delta)}% compared to last week.`,
              time: timeAgo(new Date(nowMs - 6 * 86400000).toISOString()),
              timestamp: nowMs - 6 * 86400000,
            })
          }
        }
      }

      const { data: agent } = await supabase.from('agents').select('id').eq('brand_id', b.id).eq('type', 'aeo').single()
      if (agent) {
        const { data: runs } = await supabase.from('agent_runs')
          .select('status, started_at, output').eq('agent_id', agent.id)
          .order('started_at', { ascending: false }).limit(1)
        if (runs?.[0]) {
          const run = runs[0]
          const score = run.output?.overallScore
          items.push({
            id: 'agent-run',
            icon: Bot, color: 'text-pink-400', bg: 'bg-pink-400/10',
            title: 'AEO analysis ready',
            body: score != null ? `Your AEO visibility score is ${score}/100. View recommendations on the Agents page.` : 'A new AEO analysis is ready to view.',
            time: timeAgo(run.started_at), timestamp: new Date(run.started_at).getTime(),
          })
        }
      }

      items.sort((a, b2) => b2.timestamp - a.timestamp)
      setNotifications(items)
      setLoading(false)
    }
    load()
  }, [])

  const unread = notifications.filter(n => !readIds.has(n.id)).length
  const markAllRead = () => setReadIds(new Set(notifications.map(n => n.id)))

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Notifications</h1>
          <p className="mt-1 text-sm text-white/40">
            {!brand ? 'Add a brand to see notifications' : unread > 0 ? `${unread} unread notification${unread > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
          <Bell size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30">
            {!brand ? 'Add a brand in Settings to get started' : 'No notifications yet — run a scan to see activity here'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(({ id, icon: Icon, color, bg, title, body, time }) => {
            const read = readIds.has(id)
            return (
              <div
                key={id}
                onClick={() => setReadIds(prev => new Set(prev).add(id))}
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
            )
          })}
        </div>
      )}

      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 text-center">
        <p className="text-xs text-white/30 mb-2">Notifications are generated from your real scan results and AEO analyses.</p>
        <a href="/dashboard/settings" className="text-xs text-violet-400 hover:text-violet-300">Manage notification preferences →</a>
      </div>
    </div>
  )
}
