'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Send, Check, Scissors, ExternalLink } from 'lucide-react'

const PLATFORMS = [
  { id: 'tiktok',    label: 'TikTok',          icon: '📱', desc: 'Short-form video, up to 10 min', color: 'border-pink-500/20 hover:border-pink-500/40 hover:bg-pink-500/[0.04]' },
  { id: 'instagram', label: 'Instagram Reels',  icon: '📸', desc: 'Up to 90 seconds, vertical', color: 'border-violet-500/20 hover:border-violet-500/40 hover:bg-violet-500/[0.04]' },
  { id: 'youtube',   label: 'YouTube Shorts',   icon: '🎬', desc: 'Up to 60 seconds, vertical', color: 'border-red-500/20 hover:border-red-500/40 hover:bg-red-500/[0.04]' },
  { id: 'linkedin',  label: 'LinkedIn',          icon: '💼', desc: 'Up to 10 min, all orientations', color: 'border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/[0.04]' },
  { id: 'twitter',   label: 'X (Twitter)',       icon: '🐦', desc: 'Up to 2:20, horizontal preferred', color: 'border-white/20 hover:border-white/40 hover:bg-white/[0.04]' },
]

export default function PublishQueuePage() {
  const supabase = createClient()
  const [clips, setClips] = useState<any[]>([])
  const [queued, setQueued] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClip, setSelectedClip] = useState<string | null>(null)
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
  const [publishing, setPublishing] = useState(false)
  const [published, setPublished] = useState<string[]>([])
  const [queueError, setQueueError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data: b } = await supabase.from('brands').select('id').eq('user_id', user.id).eq('is_default', true).single()
      if (b) {
        const { data: c } = await supabase.from('clips').select('*').eq('brand_id', b.id).order('created_at', { ascending: false })
        setClips(c || [])
        // clip_publishes must be scoped via clip IDs — related table filters don't work in Supabase JS client
        const clipIds = (c || []).map((clip: any) => clip.id)
        if (clipIds.length > 0) {
          const { data: q } = await supabase.from('clip_publishes')
            .select('*, clips(title, status)').in('clip_id', clipIds)
            .order('created_at', { ascending: false }).limit(20)
          setQueued(q || [])
        }
      }
      setLoading(false)
    }
    load()
  }, [])

  const togglePlatform = (id: string) => setSelectedPlatforms(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleQueue = async () => {
    if (!selectedClip || !selectedPlatforms.length) return
    setPublishing(true)
    setQueueError('')
    const succeeded: string[] = []
    const failed: string[] = []
    for (const platform of selectedPlatforms) {
      const { error } = await supabase.from('clip_publishes').insert({ clip_id: selectedClip, platform, status: 'queued' })
      if (error) failed.push(platform)
      else succeeded.push(platform)
    }
    setPublishing(false)
    if (succeeded.length > 0) setPublished(succeeded)
    if (failed.length > 0) {
      setQueueError(
        succeeded.length > 0
          ? `Queued to ${succeeded.length} platform${succeeded.length > 1 ? 's' : ''}, but failed for: ${failed.join(', ')}`
          : `Failed to queue — please try again`
      )
    }
    // Refresh full queue history scoped to brand's clips (deduplicated by id)
    const allClipIds = clips.map((clip: any) => clip.id)
    if (allClipIds.length > 0) {
      const { data: freshQ } = await supabase.from('clip_publishes')
        .select('*, clips(title, status)').in('clip_id', allClipIds)
        .order('created_at', { ascending: false }).limit(30)
      setQueued(freshQ || [])
    }
    if (succeeded.length > 0) {
      setTimeout(() => { setSelectedClip(null); setSelectedPlatforms([]); setPublished([]) }, 3000)
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Publish Queue</h1>
        <p className="mt-1 text-sm text-white/40">Queue clips for publishing across social platforms</p>
      </div>

      {clips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-400/15 p-16 text-center">
          <Scissors size={24} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-3">No clips yet — create one first</p>
          <a href="/dashboard/clips" className="text-sm text-emerald-400 hover:text-emerald-300">Create a clip →</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Select clip */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white">1. Choose a clip</h2>
            <div className="space-y-2">
              {clips.map(clip => (
                <button key={clip.id} onClick={() => setSelectedClip(clip.id === selectedClip ? null : clip.id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${clip.id === selectedClip ? 'border-violet-500/40 bg-violet-500/[0.08]' : 'border-white/[0.07] bg-white/[0.02] hover:border-white/20'}`}>
                  <div className="h-10 w-16 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                    {clip.mux_playback_id
                      ? <img src={`https://image.mux.com/${clip.mux_playback_id}/thumbnail.jpg?time=1&width=64`} alt="" className="w-full h-full object-cover" />
                      : <Scissors size={12} className="text-white/20" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{clip.title}</p>
                    <p className="text-xs text-white/30">{new Date(clip.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${clip.status === 'ready' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>
                    {clip.status}
                  </span>
                  {clip.id === selectedClip && <Check size={14} className="text-violet-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Select platforms */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white">2. Choose platforms</h2>
            <div className="space-y-2">
              {PLATFORMS.map(({ id, label, icon, desc, color }) => (
                <button key={id} onClick={() => togglePlatform(id)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${selectedPlatforms.includes(id) ? 'border-violet-500/40 bg-violet-500/[0.08]' : `border-white/[0.07] bg-white/[0.02] ${color}`}`}>
                  <span className="text-lg">{icon}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white/80">{label}</p>
                    <p className="text-xs text-white/30">{desc}</p>
                  </div>
                  {selectedPlatforms.includes(id) && <Check size={14} className="text-violet-400 shrink-0" />}
                </button>
              ))}
            </div>

            <button onClick={handleQueue} disabled={!selectedClip || !selectedPlatforms.length || publishing}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors">
              {publishing ? <Loader2 size={14} className="animate-spin" /> : published.length > 0 ? <Check size={14} /> : <Send size={14} />}
              {publishing ? 'Queuing...' : published.length > 0 ? `Queued to ${published.length} platform${published.length > 1 ? 's' : ''}!` : `Queue to ${selectedPlatforms.length || 0} platform${selectedPlatforms.length !== 1 ? 's' : ''}`}
            </button>

            {queueError && (
              <div className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-3 py-2 text-xs text-red-300">
                {queueError}
              </div>
            )}

            <p className="text-xs text-center text-white/20">
              Native platform integrations coming in Q3 2026.{' '}
              <a href="/changelog" className="text-white/30 hover:text-white">See roadmap →</a>
            </p>
          </div>
        </div>
      )}

      {/* Queue history */}
      {queued.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3">
            <p className="text-sm font-semibold text-white">Queue history</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {queued.slice(0, 10).map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <span className="text-lg">{PLATFORMS.find(p => p.id === item.platform)?.icon || '📤'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/60">{PLATFORMS.find(p => p.id === item.platform)?.label || item.platform}</p>
                  {item.clips?.title && <p className="text-[10px] text-white/25 truncate mt-0.5">"{item.clips.title}"</p>}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  item.status === 'published' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                  item.status === 'queued' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                  'text-white/30 bg-white/[0.04] border-white/[0.07]'}`}>
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
