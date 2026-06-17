'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Scissors, Upload, Play, Loader2, X, Check } from 'lucide-react'

interface Clip {
  id: string; title: string; status: string; format: string
  mux_playback_id: string | null; duration_sec: number | null; created_at: string
}

export default function ClipsPage() {
  const supabase = createClient()
  const [clips, setClips] = useState<Clip[]>([])
  const [brand, setBrand] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState('')
  const [title, setTitle] = useState('')
  const [showForm, setShowForm] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return setLoading(false)
      const { data: b } = await supabase.from('brands').select('*').eq('user_id', user.id).eq('is_default', true).single()
      setBrand(b)
      if (b) {
        const { data: c } = await supabase.from('clips').select('*').eq('brand_id', b.id).order('created_at', { ascending: false })
        setClips(c || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand || !title.trim()) return
    setUploading(true)
    setUploadMsg('Creating clip...')

    try {
      // Get Mux direct upload URL
      const urlRes = await fetch('/api/clips/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, title: title.trim() }),
      })

      if (!urlRes.ok) {
        const err = await urlRes.json()
        // Mux not configured — create clip record only
        if (err.error?.includes('not configured')) {
          const clipRes = await fetch('/api/clips/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ brandId: brand.id, title: title.trim() }),
          })
          const clip = await clipRes.json()
          setUploadMsg('Clip created (Mux not configured — add MUX keys to enable video)')
          setTitle('')
          setShowForm(false)
          // Reload
          const { data: c } = await supabase.from('clips').select('*').eq('brand_id', brand.id).order('created_at', { ascending: false })
          setClips(c || [])
          return
        }
        setUploadMsg(err.error || 'Upload failed')
        return
      }

      const { uploadUrl, clipId } = await urlRes.json()

      // Upload file to Mux directly if file selected
      if (fileRef.current?.files?.[0]) {
        setUploadMsg('Uploading video...')
        const file = fileRef.current.files[0]
        await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } })
        setUploadMsg('Processing video...')
      }

      setTitle('')
      setShowForm(false)
      setUploadMsg('✅ Clip created! Processing may take a minute.')
      const { data: c } = await supabase.from('clips').select('*').eq('brand_id', brand.id).order('created_at', { ascending: false })
      setClips(c || [])
    } catch (err) {
      setUploadMsg('Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setUploadMsg(''), 5000)
    }
  }

  const statusColor = (s: string) => ({
    ready: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    processing: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    awaiting_upload: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
    failed: 'text-red-400 bg-red-400/10 border-red-400/20',
  }[s] || 'text-white/30 bg-white/[0.04] border-white/[0.08]')

  if (loading) return <div className="flex h-48 items-center justify-center"><Loader2 size={20} className="animate-spin text-white/20" /></div>

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Auto Clips</h1>
          <p className="mt-1 text-sm text-white/40">AI-detected moments clipped and ready to publish</p>
        </div>
        {brand && (
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-[#08090A] hover:opacity-85 transition-opacity">
            <Upload size={14} /> Upload video
          </button>
        )}
      </div>

      {/* Upload form */}
      {showForm && brand && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
          <form onSubmit={handleUpload} className="space-y-3">
            <h3 className="text-sm font-bold text-white">New clip</h3>
            <div>
              <label className="block text-xs text-white/40 mb-1">Title</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. ChatGPT mention — Jan 2026" required
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-emerald-400/50" />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1">Video file <span className="text-white/20">(optional — requires Mux)</span></label>
              <input ref={fileRef} type="file" accept="video/*"
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-xs text-white/50 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-400 file:px-3 file:py-1 file:text-xs file:font-bold file:text-[#08090A]" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={uploading}
                className="flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2 text-sm font-bold text-[#08090A] hover:opacity-85 disabled:opacity-50">
                {uploading ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                {uploading ? 'Uploading...' : 'Create clip'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="rounded-xl border border-white/[0.08] px-4 py-2 text-sm text-white/40 hover:text-white">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {uploadMsg && (
        <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-2.5 text-sm text-emerald-300">
          {uploadMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total clips', value: clips.length },
          { label: 'Ready', value: clips.filter(c => c.status === 'ready').length },
          { label: 'Processing', value: clips.filter(c => c.status === 'processing').length },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30 mb-1">{label}</p>
            <p className="text-2xl font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Clips grid */}
      {clips.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clips.map(clip => (
            <div key={clip.id} className="group rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden hover:border-white/[0.14] transition-colors">
              {/* Thumbnail */}
              <div className="relative aspect-video bg-white/[0.04] flex items-center justify-center">
                {clip.mux_playback_id ? (
                  <img
                    src={`https://image.mux.com/${clip.mux_playback_id}/thumbnail.jpg?time=1`}
                    alt={clip.title} className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <Scissors size={24} className="text-white/10" />
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/60 bg-black/40">
                    <Play size={16} className="text-white ml-0.5" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusColor(clip.status)}`}>
                    {clip.status}
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="p-3">
                <p className="text-sm font-semibold text-white truncate">{clip.title}</p>
                <p className="text-xs text-white/30 mt-0.5">
                  {clip.format || '16:9'} · {new Date(clip.created_at).toLocaleDateString()}
                </p>
                <div className="mt-3 flex gap-1.5">
                  {['✂ Trim', '↗ Export', '⊕ Share'].map(action => (
                    <button key={action}
                      className="flex-1 rounded-lg border border-white/[0.07] py-1 text-[10px] font-medium text-white/30 hover:border-emerald-400/30 hover:text-emerald-400 transition-colors">
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : brand ? (
        <div className="rounded-2xl border border-dashed border-emerald-400/15 bg-emerald-400/[0.02] p-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
            <Scissors size={24} className="text-emerald-400" />
          </div>
          <p className="text-base font-bold text-white/60 mb-1">No clips yet</p>
          <p className="text-sm text-white/30 mb-6 max-w-sm mx-auto">
            Upload a video to create your first clip. Add MUX_TOKEN_ID and MUX_TOKEN_SECRET to enable video processing.
          </p>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 mx-auto rounded-xl bg-emerald-400 px-5 py-2.5 text-sm font-bold text-[#08090A] hover:opacity-85 transition-opacity">
            <Upload size={14} /> Upload video
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/[0.08] p-12 text-center">
          <p className="text-sm text-white/30 mb-4">Add a brand in Settings first</p>
          <a href="/dashboard/settings" className="text-sm text-violet-400 hover:text-violet-300">Go to Settings →</a>
        </div>
      )}
    </div>
  )
}
