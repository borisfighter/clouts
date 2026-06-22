'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Library, Scissors, Search, Filter, Play, Download, Trash2, Loader2, Grid, List } from 'lucide-react'

interface Clip {
  id: string; title: string; status: string; format: string
  mux_playback_id: string | null; duration_sec: number | null
  created_at: string; tags: string[]; views: number
}

const STATUS_COLORS: Record<string, string> = {
  ready: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  processing: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  awaiting_upload: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  failed: 'text-red-400 bg-red-400/10 border-red-400/20',
}

export default function LibraryPage() {
  const supabase = createClient()
  const [clips, setClips] = useState<Clip[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [libraryError, setLibraryError] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data: b } = await supabase.from('brands').select('id').eq('user_id', user.id).eq('is_default', true).single()
      if (b) {
        const { data: c } = await supabase.from('clips').select('*').eq('brand_id', b.id).order('created_at', { ascending: false })
        setClips(c || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this clip? This also removes the video from Mux.')) return
    setDeleting(id)
    setLibraryError('')
    const res = await fetch('/api/clips/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clipId: id }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok || data.error) {
      setLibraryError(data.error || 'Failed to delete clip — please try again')
      setDeleting(null)
      return
    }
    setClips(c => c.filter(x => x.id !== id))
    setDeleting(null)
  }

  const filtered = clips.filter(c => c.title.toLowerCase().includes(search.toLowerCase()))
  const totalViews = clips.reduce((s, c) => s + (c.views || 0), 0)

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Clip Library</h1>
          <p className="mt-1 text-sm text-white/40">All your clips in one place</p>
        </div>
        <a href="/dashboard/clips" className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-[#08090A] hover:opacity-85 transition-opacity">
          <Scissors size={14} /> New clip
        </a>
      </div>

      {libraryError && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.08] px-4 py-2.5 text-sm text-red-300">
          {libraryError}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total clips', value: clips.length },
          { label: 'Ready', value: clips.filter(c => c.status === 'ready').length },
          { label: 'Processing', value: clips.filter(c => c.status === 'processing' || c.status === 'awaiting_upload').length },
          { label: 'Total views', value: totalViews },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Search + view toggle */}
      {clips.length > 0 && (
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clips..."
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
          </div>
          <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.04] p-1 gap-1">
            <button onClick={() => setView('grid')} className={`p-2 rounded-lg transition-colors ${view === 'grid' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><Grid size={14} /></button>
            <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-colors ${view === 'list' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><List size={14} /></button>
          </div>
        </div>
      )}

      {clips.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-400/15 p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
            <Library size={24} className="text-emerald-400" />
          </div>
          <p className="text-base font-bold text-white/60 mb-1">Your library is empty</p>
          <p className="text-sm text-white/30 mb-6">Create your first clip to get started</p>
          <a href="/dashboard/clips" className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#08090A] hover:opacity-85">
            <Scissors size={14} /> Create clip
          </a>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
          <Search size={24} className="mx-auto mb-3 text-white/10" />
          <p className="text-sm text-white/40 mb-1">No clips match "{search}"</p>
          <button onClick={() => setSearch('')} className="text-sm text-emerald-400 hover:text-emerald-300">Clear search</button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map(clip => (
            <div key={clip.id} className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden hover:border-white/[0.14] transition-colors">
              <div className="relative aspect-video bg-white/[0.04] flex items-center justify-center">
                {clip.mux_playback_id ? (
                  <img src={`https://image.mux.com/${clip.mux_playback_id}/thumbnail.jpg?time=1`} alt={clip.title} className="w-full h-full object-cover" onError={e => { (e.target as any).style.display = 'none' }} />
                ) : (
                  <Scissors size={20} className="text-white/10" />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-black/40">
                    <Play size={14} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
                <div className="absolute top-2 right-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[clip.status] || 'text-white/30 bg-white/[0.04] border-white/[0.08]'}`}>
                    {clip.status}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-white truncate">{clip.title}</p>
                <p className="text-xs text-white/30 mt-0.5">{new Date(clip.created_at).toLocaleDateString()}</p>
                <div className="mt-2.5 flex gap-1">
                  <button title="Download" className="flex-1 flex items-center justify-center rounded-lg border border-white/[0.07] py-1.5 text-white/30 hover:text-white hover:border-white/20 transition-colors"><Download size={11} /></button>
                  <button onClick={() => handleDelete(clip.id)} title="Delete" disabled={deleting === clip.id}
                    className="flex-1 flex items-center justify-center rounded-lg border border-white/[0.07] py-1.5 text-white/30 hover:text-red-400 hover:border-red-400/20 transition-colors disabled:opacity-40">
                    {deleting === clip.id ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
          <div className="divide-y divide-white/[0.04]">
            {filtered.map(clip => (
              <div key={clip.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                <div className="h-10 w-16 shrink-0 rounded-lg bg-white/[0.06] overflow-hidden flex items-center justify-center">
                  {clip.mux_playback_id
                    ? <img src={`https://image.mux.com/${clip.mux_playback_id}/thumbnail.jpg?time=1&width=64`} alt="" className="w-full h-full object-cover" />
                    : <Scissors size={12} className="text-white/20" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{clip.title}</p>
                  <p className="text-xs text-white/30">{new Date(clip.created_at).toLocaleDateString()} · {clip.format || '16:9'}</p>
                </div>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[clip.status] || ''}`}>{clip.status}</span>
                <p className="text-xs text-white/30 w-16 text-right">{clip.views || 0} views</p>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg text-white/30 hover:text-white transition-colors"><Download size={13} /></button>
                  <button onClick={() => handleDelete(clip.id)} disabled={deleting === clip.id}
                    className="p-1.5 rounded-lg text-white/30 hover:text-red-400 transition-colors disabled:opacity-40">
                    {deleting === clip.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
