import { Send } from 'lucide-react'
export default function PublishPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <h1 className="text-2xl font-black text-white tracking-tight">Publish Queue</h1>
      <div className="rounded-2xl border border-dashed border-emerald-400/10 p-16 text-center">
        <Send size={32} className="mx-auto mb-3 text-white/10" />
        <p className="text-sm text-white/30">Clips queued for publishing will appear here</p>
      </div>
    </div>
  )
}
