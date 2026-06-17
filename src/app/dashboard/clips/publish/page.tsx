'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Send, Loader2, Twitter, Instagram, Youtube, Plus, Check, ExternalLink } from 'lucide-react'

const PLATFORMS = [
  { id: 'twitter',   label: 'X / Twitter',    icon: Twitter,   color: 'border-sky-500/20 bg-sky-500/[0.04]' },
  { id: 'instagram', label: 'Instagram Reels', icon: Instagram, color: 'border-pink-500/20 bg-pink-500/[0.04]' },
  { id: 'youtube',   label: 'YouTube Shorts',  icon: Youtube,   color: 'border-red-500/20 bg-red-500/[0.04]' },
  { id: 'linkedin',  label: 'LinkedIn',        icon: Send,      color: 'border-blue-500/20 bg-blue-500/[0.04]' },
]

interface Clip { id: string; title: string; status: string; mux_playback_id: string | null; created_at: string }
interface Publish { id: string; clip_id: string; platform: string; status: string; published_at: string | null; views: number }

export default function PublishPage() {
  const supabase = createClient()
  const [clips, setClips] = useState<Clip[]>([])
  const [publishes, setPublishes] = useState<Publish[]>([])
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [selected, setSelected] = useState<Record<string, string[]>>({})

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      setBrand(b)
      if (b) {
        const [{ data: c }, { data: p }] = await Promise.all([
          supabase.from('clips').select('*').eq('brand_id', b.id).order('created_at', { ascending: false }),
          supabase.from('clip_publishes').select('*').order('created_at', { ascending: false }),
        ])
        setClips(c || [])
        setPublishes(p || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const togglePlatform = (clipId: string, platform: string) => {
    setSelected(s => {
      const current = s[clipId] || []
      return { ...s, [clipId]: current.includes(platform) ? current.filter(p => p !== platform) : [...current, platform] }
    })
  }

  const handlePublish = async (clipId: string) => {
    const platforms = selected[clipId] || []
    if (!platforms.length) return
    setPublishing(clipId)
    try {
      const inserts = platforms.map(platform => ({ clip_id: clipId, platform, status: 'queued' }))
      await supabase.from('clip_publishes').insert(inserts)
      const { data: p } = await supabase.from('clip_publishes').select('*').order('created_at', { ascending: false })
      setPublishes(p || [])
      setSelected(s => ({ ...s, [clipId]: [] }))
    } finally {
      setPublishing(null)
    }
  }

  const getPublishesForClip = (clipId: string) => publishes.filter(p => p.clip_id === clipId)
  const statusColor = (s: string) => ({ queued: 'text-yellow-400', published: 'text-emerald-400', failed: 'text-red-400' }[s] || 'text-white/30')

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Publish Queue</h1>
        <p className="mt-1 text-sm text-white/40">Select platforms and queue clips for publishing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Queued',    value: publishes.filter(p => p.status === 'queued').length },
          { label: 'Published', value: publishes.filter(p => p.status === 'published').length },
          { label: 'Total clips', value: clips.length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {clips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-400/15 p-16 text-center">
          <Send size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-3">No clips to publish yet</p>
          <a href="/dashboard/clips" className="text-sm text-emerald-400 hover:text-emerald-300">Create your first clip →</a>
        </div>
      ) : (
        <div className="space-y-4">
          {clips.map(clip => {
            const clipPublishes = getPublishesForClip(clip.id)
            const selectedPlatforms = selected[clip.id] || []
            return (
              <div key={clip.id} className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
                <div className="flex items-center gap-4 p-4 border-b border-white/[0.07]">
                  {/* Thumbnail */}
                  <div className="h-14 w-24 shrink-0 rounded-lg bg-white/[0.06] overflow-hidden flex items-center justify-center">
                    {clip.mux_playback_id ? (
                      <img src={`https://image.mux.com/${clip.mux_playback_id}/thumbnail.jpg?time=1&width=96`} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Send size={14} className="text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{clip.title}</p>
                    <p className="text-xs text-white/30 mt-0.5">{new Date(clip.created_at).toLocaleDateString()} · {clip.status}</p>
                  </div>
                  <button
                    onClick={() => handlePublish(clip.id)}
                    disabled={!selectedPlatforms.length || publishing === clip.id}
                    className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-[#08090A] hover:opacity-85 disabled:opacity-30 transition-opacity"
                  >
                    {publishing === clip.id ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                    {publishing === clip.id ? 'Queuing...' : `Queue ${selectedPlatforms.length ? `(${selectedPlatforms.length})` : ''}`}
                  </button>
                </div>

                {/* Platform selector */}
                <div className="p-4">
                  <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest mb-3">Select platforms to publish</p>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {PLATFORMS.map(({ id, label, icon: Icon, color }) => {
                      const isSelected = selectedPlatforms.includes(id)
                      const published = clipPublishes.find(p => p.platform === id)
                      return (
                        <button key={id} onClick={() => togglePlatform(clip.id, id)}
                          className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-all ${
                            published ? 'border-emerald-400/20 bg-emerald-400/[0.06] text-emerald-400' :
                            isSelected ? 'border-violet-500/40 bg-violet-500/15 text-violet-300' :
                            `${color} text-white/50 hover:text-white`
                          }`}>
                          {published ? <Check size={12} /> : <Icon size={12} />}
                          <span className="truncate">{label}</span>
                          {published && (
                            <span className={`ml-auto text-[9px] font-bold uppercase ${statusColor(published.status)}`}>{published.status}</span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Published history for this clip */}
                {clipPublishes.length > 0 && (
                  <div className="border-t border-white/[0.07] px-4 py-3 flex flex-wrap gap-2">
                    {clipPublishes.map(p => (
                      <div key={p.id} className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-2.5 py-1">
                        <span className={`text-[10px] font-semibold capitalize ${statusColor(p.status)}`}>{p.platform}</span>
                        <span className="text-[10px] text-white/20">·</span>
                        <span className={`text-[10px] ${statusColor(p.status)}`}>{p.status}</span>
                        {p.views > 0 && <span className="text-[10px] text-white/30">{p.views} views</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Note about real publishing */}
      <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
        <p className="text-xs text-white/30 leading-relaxed">
          <strong className="text-white/50">Publishing integrations coming soon.</strong> Clips are queued in the database. Connect your social accounts via Settings to enable one-click publishing to X, Instagram Reels, YouTube Shorts, and LinkedIn.
        </p>
      </div>
    </div>
  )
}
