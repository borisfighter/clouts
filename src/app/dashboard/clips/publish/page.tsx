'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Send, Check, Scissors, ExternalLink } from 'lucide-react'

interface Account { configured: boolean; connected: boolean; name: string | null }

const ERRORS: Record<string, string> = {
  youtube_not_configured: 'YouTube publishing is not set up on this server yet.',
  youtube_state: 'The YouTube sign-in expired. Try connecting again.',
  youtube_denied: 'YouTube access was not granted.',
  youtube_no_refresh: 'Google did not return offline access. Remove Clouts from your Google account permissions and connect again.',
  youtube_connect: 'Connecting YouTube failed. Try again.',
}

const MANUAL = [
  { id: 'tiktok', label: 'TikTok', icon: '📱' },
  { id: 'instagram', label: 'Instagram Reels', icon: '📸' },
]

function PublishView() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [clips, setClips] = useState<any[]>([])
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<any | null>(null)
  const [youtube, setYoutube] = useState<Account | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<'private' | 'unlisted' | 'public'>('private')
  const [publishing, setPublishing] = useState(false)
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null)

  async function loadHistory(ids: string[]) {
    if (!ids.length) return setHistory([])
    const { data } = await supabase.from('clip_publishes').select('*, clips(title)').in('clip_id', ids)
      .order('created_at', { ascending: false }).limit(20)
    setHistory(data || [])
  }

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const [{ data: b }, acc] = await Promise.all([
        supabase.from('brands').select('id').eq('user_id', user.id).eq('is_default', true).single(),
        fetch('/api/social/accounts').then(r => (r.ok ? r.json() : null)),
      ])
      setYoutube(acc?.youtube ?? null)
      if (b) {
        const { data: c } = await supabase.from('clips').select('*').eq('brand_id', b.id).eq('kind', 'clip').order('created_at', { ascending: false })
        const list = c || []
        setClips(list)
        const pre = list.find((x: any) => x.id === searchParams.get('clipId'))
        if (pre) choose(pre)
        await loadHistory(list.map((x: any) => x.id))
      }
      setLoading(false)
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function choose(clip: any) {
    setSelected(clip)
    setTitle(clip.title || '')
    setDescription(clip.description || '')
    setResult(null)
  }

  async function publish() {
    if (!selected) return
    setPublishing(true)
    setResult(null)
    const res = await fetch('/api/social/youtube/publish', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clipId: selected.id, title, description, privacy }),
    })
    const json = await res.json().catch(() => ({}))
    setResult(res.ok ? { url: json.url } : { error: json.error || 'Publishing failed' })
    setPublishing(false)
    loadHistory(clips.map(c => c.id))
  }

  async function disconnect() {
    await fetch('/api/social/accounts?provider=youtube', { method: 'DELETE' })
    setYoutube(y => (y ? { ...y, connected: false, name: null } : y))
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  const flashError = ERRORS[searchParams.get('error') || '']
  const ready = selected?.status === 'ready' && selected?.mux_playback_id

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Publish</h1>
        <p className="mt-1 text-sm text-white/40">Post clips straight to YouTube Shorts, or download them for TikTok and Instagram</p>
      </div>

      {flashError && <div className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-3 py-2 text-xs text-red-300">{flashError}</div>}
      {searchParams.get('connected') === 'youtube' && <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-3 py-2 text-xs text-emerald-300">YouTube channel connected.</div>}

      {clips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-400/15 p-16 text-center">
          <Scissors size={24} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-3">No clips yet. Create one first.</p>
          <a href="/dashboard/clips" className="text-sm text-emerald-400 hover:text-emerald-300">Create a clip →</a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white">1. Choose a clip</h2>
            <div className="space-y-2">
              {clips.map(clip => (
                <button key={clip.id} onClick={() => choose(clip)}
                  className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-all ${clip.id === selected?.id ? 'border-violet-500/40 bg-violet-500/[0.08]' : 'border-white/[0.07] bg-white/[0.02] hover:border-white/20'}`}>
                  <div className="h-10 w-16 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 overflow-hidden">
                    {clip.mux_playback_id
                      ? <img src={`https://image.mux.com/${clip.mux_playback_id}/thumbnail.jpg?time=1&width=64`} alt="" className="w-full h-full object-cover" />
                      : <Scissors size={12} className="text-white/20" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{clip.title}</p>
                    <p className="text-xs text-white/30">{new Date(clip.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${clip.status === 'ready' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>{clip.status}</span>
                  {clip.id === selected?.id && <Check size={14} className="text-violet-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-white">2. Publish</h2>

            <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🎬</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80">YouTube Shorts</p>
                  <p className="text-xs text-white/30">
                    {!youtube?.configured ? 'Not set up on this server yet' : youtube.connected ? `Connected: ${youtube.name}` : 'Connect your channel to post directly'}
                  </p>
                </div>
                {youtube?.configured && (youtube.connected
                  ? <button onClick={disconnect} className="text-xs text-white/30 hover:text-red-400">Disconnect</button>
                  : <a href="/api/social/youtube/connect" className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500">Connect</a>)}
              </div>

              {youtube?.connected && selected && (
                <div className="space-y-2">
                  <input value={title} onChange={e => setTitle(e.target.value)} maxLength={100} placeholder="Title"
                    className="w-full rounded-lg border border-white/[0.07] bg-black/30 px-3 py-2 text-sm text-white" />
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Description"
                    className="w-full rounded-lg border border-white/[0.07] bg-black/30 px-3 py-2 text-sm text-white" />
                  <select value={privacy} onChange={e => setPrivacy(e.target.value as any)}
                    className="w-full rounded-lg border border-white/[0.07] bg-black/30 px-3 py-2 text-sm text-white">
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                    <option value="public">Public</option>
                  </select>
                  <button onClick={publish} disabled={!ready || publishing}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50">
                    {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {publishing ? 'Uploading to YouTube…' : ready ? 'Publish to YouTube' : 'Clip is not ready yet'}
                  </button>
                  <p className="text-[11px] text-white/25">Uploads the clip as-is; YouTube treats videos up to 3 minutes as Shorts when they are vertical or square.</p>
                </div>
              )}
              {result?.url && <a href={result.url} target="_blank" rel="noopener" className="flex items-center gap-1 text-xs text-emerald-400"><ExternalLink size={11} /> Published: {result.url}</a>}
              {result?.error && <p className="text-xs text-red-300">{result.error}</p>}
            </div>

            {MANUAL.map(p => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                <span className="text-lg">{p.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/80">{p.label}</p>
                  <p className="text-xs text-white/30">Direct posting needs an approved {p.id === 'tiktok' ? 'TikTok' : 'Meta'} developer app. For now, download the 9:16 version from Clips and post it.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="border-b border-white/[0.07] px-5 py-3"><p className="text-sm font-semibold text-white">History</p></div>
          <div className="divide-y divide-white/[0.04]">
            {history.map(item => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3">
                <span className="text-lg">{item.platform === 'youtube' ? '🎬' : '📤'}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/60">{item.clips?.title || 'Clip'}</p>
                  {item.error && <p className="text-[10px] text-red-300/80 truncate mt-0.5">{item.error}</p>}
                </div>
                {item.external_url && <a href={item.external_url} target="_blank" rel="noopener" className="text-white/30 hover:text-white"><ExternalLink size={12} /></a>}
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  item.status === 'published' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' :
                  item.status === 'failed' ? 'text-red-400 bg-red-400/10 border-red-400/20' :
                  'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function PublishPage() {
  return (
    <Suspense fallback={<div className="flex h-48 items-center justify-center"><span className="text-white/20 text-sm">Loading…</span></div>}>
      <PublishView />
    </Suspense>
  )
}
