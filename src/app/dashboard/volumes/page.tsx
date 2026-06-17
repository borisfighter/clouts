import { BarChart3 } from 'lucide-react'
export default function VolumesPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Prompt Volumes</h1>
        <p className="mt-1 text-sm text-white/40">What people are asking AI engines every day</p>
      </div>
      <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
        <BarChart3 size={32} className="mx-auto mb-3 text-white/10" />
        <p className="text-sm text-white/30">Coming soon — prompt volume intelligence</p>
      </div>
    </div>
  )
}
