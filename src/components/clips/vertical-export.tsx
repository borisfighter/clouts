'use client'

import { useState } from 'react'
import { Loader2, Smartphone } from 'lucide-react'

interface Cue { start: number; end: number; text: string }

function parseVtt(vtt: string): Cue[] {
  const ts = (t: string) => {
    const p = t.trim().split(':').map(Number)
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]
  }
  const cues: Cue[] = []
  for (const block of vtt.replace(/\r/g, '').split(/\n\n+/)) {
    const lines = block.split('\n')
    const i = lines.findIndex(l => l.includes('-->'))
    if (i < 0) continue
    const [a, b] = lines[i].split('-->')
    const text = lines.slice(i + 1).join(' ').replace(/<[^>]+>/g, '').trim()
    if (text) cues.push({ start: ts(a), end: ts(b.trim().split(/\s+/)[0]), text })
  }
  return cues
}

function pickMime() {
  const types = ['video/mp4;codecs=avc1.640028,mp4a.40.2', 'video/mp4;codecs=avc1.42E01E,mp4a.40.2', 'video/mp4', 'video/webm;codecs=vp9,opus', 'video/webm']
  return types.find(t => typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) || ''
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) { lines.push(line); line = word } else line = next
  }
  if (line) lines.push(line)
  return lines.slice(-3)
}

/** Renders a 1080x1920 center-cropped copy of the clip with burned-in captions, in the browser. */
export async function renderVertical(src: string, vtt: string | null, onProgress: (p: number) => void): Promise<{ blob: Blob; ext: string }> {
  const mime = pickMime()
  if (!mime) throw new Error('This browser cannot record video. Use Chrome, Edge or Safari.')
  const cues = vtt ? parseVtt(vtt) : []

  const video = document.createElement('video')
  video.crossOrigin = 'anonymous'
  video.playsInline = true
  video.preload = 'auto'
  video.src = src
  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve()
    video.onerror = () => reject(new Error('Could not load the clip video'))
  })

  const W = 1080, H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!

  const audioCtx = new AudioContext()
  const audioDest = audioCtx.createMediaStreamDestination()
  audioCtx.createMediaElementSource(video).connect(audioDest)

  const stream = new MediaStream([...canvas.captureStream(30).getVideoTracks(), ...audioDest.stream.getAudioTracks()])
  const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 })
  const chunks: BlobPart[] = []
  recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data) }
  const done = new Promise<void>(resolve => { recorder.onstop = () => resolve() })

  const draw = () => {
    const vw = video.videoWidth, vh = video.videoHeight
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, W, H)
    if (vw && vh) {
      const sw = Math.min(vw, vh * W / H), sh = Math.min(vh, vw * H / W)
      ctx.drawImage(video, (vw - sw) / 2, (vh - sh) / 2, sw, sh, 0, 0, W, H)
    }
    const t = video.currentTime
    const cue = cues.find(c => t >= c.start && t < c.end)
    if (cue) {
      ctx.font = 'bold 68px system-ui, -apple-system, Segoe UI, sans-serif'
      ctx.textAlign = 'center'
      ctx.lineJoin = 'round'
      ctx.lineWidth = 12
      ctx.strokeStyle = '#000'
      ctx.fillStyle = '#fff'
      const lines = wrap(ctx, cue.text, W - 140)
      lines.forEach((l, i) => {
        const y = H * 0.72 + i * 84
        ctx.strokeText(l, W / 2, y)
        ctx.fillText(l, W / 2, y)
      })
    }
    if (video.duration) onProgress(Math.min(1, t / video.duration))
  }

  let raf = 0
  const loop = () => { draw(); raf = requestAnimationFrame(loop) }
  draw()
  recorder.start(1000)
  loop()
  try {
    await audioCtx.resume()
    await video.play()
    await new Promise<void>((resolve, reject) => {
      video.onended = () => resolve()
      video.onerror = () => reject(new Error('Playback failed while rendering'))
    })
  } finally {
    cancelAnimationFrame(raf)
    draw()
    if (recorder.state !== 'inactive') recorder.stop()
    await done
    stream.getTracks().forEach(tr => tr.stop())
    audioCtx.close()
  }
  return { blob: new Blob(chunks, { type: mime.split(';')[0] }), ext: mime.startsWith('video/mp4') ? 'mp4' : 'webm' }
}

export function VerticalExportButton({ clipId, playbackId, title, hasCaptions }: { clipId: string; playbackId: string; title: string; hasCaptions: boolean }) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState('')

  async function run() {
    setError('')
    setProgress(0)
    try {
      const vtt = hasCaptions ? await fetch(`/api/clips/${clipId}/captions`).then(r => (r.ok ? r.text() : null)) : null
      const { blob, ext } = await renderVertical(`https://stream.mux.com/${playbackId}/capped-1080p.mp4`, vtt, setProgress)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = `${title.replace(/[^\w-]+/g, '_').slice(0, 60) || 'clip'}_vertical.${ext}`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 10_000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Render failed')
    } finally {
      setProgress(null)
    }
  }

  return (
    <button onClick={run} disabled={progress !== null} title={error || 'Vertical 9:16 with burned-in captions (renders in your browser in real time)'}
      className={`flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] disabled:opacity-60 ${error ? 'border-red-400/30 text-red-400' : 'border-white/[0.07] text-white/30 hover:text-white hover:border-white/20'}`}>
      {progress !== null ? <><Loader2 size={10} className="animate-spin" /> {Math.round(progress * 100)}%</> : <><Smartphone size={10} /> 9:16</>}
    </button>
  )
}
