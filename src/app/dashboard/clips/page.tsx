'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Scissors, Upload, Loader2, Play, Download, Trash2, ExternalLink, RefreshCw } from 'lucide-react'

interface Clip {
  id: string; title: string; status: string; format: string
  mux_playback_id: string | null; mux_asset_id: string | null
  duration_sec: number | null; created_at: string; views: number
}

const STATUS_COLOR: Record<string, string> = {
  ready:          'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  processing:     'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  awaiting_upload:'text-blue-400 bg-blue-400/10 border-blue-400/20',
  failed:         'text-red-400 bg-red-400/10 border-red-400/20',
}

export default function ClipsPage() {
  const supabase = createClient()
  const [clips, setClips] = useState<Clip[]>([])
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [sourceUrl, setSourceUrl] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)

  async function loadClips(brandId: string) {
    const { data } = await supabase.from('clips').select('*').eq('brand_id', brandId).order('created_at', { ascending: false })
    setClips(data || [])
  }

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      setBrand(b)
      if (b) await loadClips(b.id)
      setLoading(false)
    }
    init()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand || !title.trim()) return
    setCreating(true)
    setErrorMsg('')
    try {
      const res = await fetch('/api/clips/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, title: title.trim(), sourceUrl: sourceUrl.trim() || undefined }),
      })
      const data = await res.json()
      if (data.error) { setErrorMsg(data.error); return }
      setSuccessMsg(sourceUrl ? 'Clip created — video processing via Mux' : 'Clip created (Mux not configured — add MUX keys to enable video)')
      setTitle(''); setSourceUrl(''); setShowForm(false)
      await loadClips(brand.id)
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch {
      setErrorMsg('Failed to create clip — check your connection and try again')
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this clip? This also removes the video from Mux.')) return
    setDeleting(id)
    setErrorMsg('')
    const res = await fetch('/api/clips/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clipId: id }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.error) {
      setErrorMsg(data.error || 'Failed to delete clip — please try again')
      setDeleting(null)
      return
    }
    setClips(c => c.filter(x => x.id !== id))
    setDeleting(null)
  }

  const totalViews = clips.reduce((s, c) => s + (c.views || 0), 0)

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Auto Clips</h1>
          <p className="mt-1 text-sm text-white/40">AI-detected moments clipped and ready to publish</p>
        </div>
        {brand && (
          <button onClick={() => { setShowForm(s => !s); setErrorMsg('') }}
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-[#08090A] hover:opacity-85 transition-opacity">
            <Upload size={14} />{showForm ? 'Cancel' : 'Upload video'}
          </button>
        )}
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.08] px-4 py-2.5 text-sm text-emerald-300">
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-2.5 text-sm text-red-300 flex items-center justify-between gap-3">
          <span>{errorMsg}</span>
          {errorMsg.toLowerCase().includes('upgrade') && (
            <a href="/pricing" className="shrink-0 rounded-lg bg-red-400/15 px-3 py-1 text-xs font-bold text-red-200 hover:bg-red-400/25 transition-colors">
              Upgrade →
            </a>
          )}
        </div>
      )}

      {/* Create form */}
      {showForm && brand && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5 space-y-4">
          <h2 className="text-sm font-bold text-white">New clip</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Title *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} required
                placeholder="e.g. ChatGPT mention — Jan 2026"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-400/40" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">
                Video URL <span className="text-white/20">(optional — requires Mux)</span>
              </label>
              <input value={sourceUrl} onChange={e => setSourceUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-400/40" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={creating || !title.trim()}
              className="flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#08090A] hover:opacity-85 disabled:opacity-40 transition-opacity">
              {creating ? <Loader2 size={14} className="animate-spin" /> : <Scissors size={14} />}
              {creating ? 'Creating...' : 'Create clip'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-white/40 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total clips',    value: clips.length },
          { label: 'Ready',          value: clips.filter(c => c.status === 'ready').length },
          { label: 'Processing',     value: clips.filter(c => ['processing','awaiting_upload'].includes(c.status)).length },
          { label: 'Total views',    value: totalViews },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {!brand ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <Scissors size={24} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/30 mb-3">Add a brand in Settings first</p>
          <a href="/dashboard/settings" className="text-sm text-emerald-400 hover:text-emerald-300">Go to Settings →</a>
        </div>
      ) : clips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-400/15 p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
            <Scissors size={24} className="text-emerald-400" />
          </div>
          <p className="text-base font-bold text-white/60 mb-1">No clips yet</p>
          <p className="text-sm text-white/30 mb-6 max-w-sm mx-auto">
            Create a clip to save brand moments from AI mentions. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET to enable video processing.
          </p>
          <button onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#08090A] hover:opacity-85">
            <Upload size={14} /> Upload video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clips.map(clip => (
            <div key={clip.id} className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden hover:border-white/[0.14] transition-colors">
              <div className="relative aspect-video bg-white/[0.04] flex items-center justify-center">
                {clip.mux_playback_id ? (
                  <img src={`https://image.mux.com/${clip.mux_playback_id}/thumbnail.jpg?time=1`}
                    alt={clip.title} className="w-full h-full object-cover"
                    onError={e => { (e.target as any).style.display = 'none' }} />
                ) : (
                  <Scissors size={20} className="text-white/10" />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                  {clip.mux_playback_id && (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-black/40">
                      <Play size={14} className="text-white ml-0.5" fill="white" />
                    </div>
                  )}
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLOR[clip.status] || 'text-white/30 bg-white/[0.04] border-white/[0.06]'}`}>
                    {clip.status}
                  </span>
                </div>
                {clip.duration_sec && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white/60">
                    {Math.floor(clip.duration_sec / 60)}:{String(clip.duration_sec % 60).padStart(2, '0')}
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-white truncate mb-0.5">{clip.title}</p>
                <p className="text-xs text-white/30">{new Date(clip.created_at).toLocaleDateString()}{clip.views > 0 ? ` · ${clip.views} views` : ''}</p>
                <div className="mt-3 flex gap-1">
                  {clip.mux_playback_id && (
                    <a href={`https://stream.mux.com/${clip.mux_playback_id}.m3u8`} target="_blank" rel="noopener"
                      className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-white/[0.07] py-1.5 text-[11px] text-white/30 hover:text-white hover:border-white/20 transition-colors">
                      <ExternalLink size={10} /> View
                    </a>
                  )}
                  <a href={`/dashboard/clips/publish`}
                    className="flex-1 flex items-center justify-center gap-1 rounded-lg border border-white/[0.07] py-1.5 text-[11px] text-white/30 hover:text-emerald-400 hover:border-emerald-400/20 transition-colors">
                    Publish
                  </a>
                  <button onClick={() => handleDelete(clip.id)} disabled={deleting === clip.id}
                    className="flex items-center justify-center rounded-lg border border-white/[0.07] px-2.5 py-1.5 text-white/20 hover:text-red-400 hover:border-red-400/20 disabled:opacity-40 transition-colors">
                    {deleting === clip.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
