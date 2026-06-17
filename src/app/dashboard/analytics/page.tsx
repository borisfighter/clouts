import { LineChart } from 'lucide-react'

export default function AnalyticsPage() {
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Agent Analytics</h1>
        <p className="mt-1 text-sm text-white/40">How AI bots crawl and cite your site</p>
      </div>
      <div className="rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
        <LineChart size={32} className="mx-auto mb-3 text-white/10" />
        <p className="text-sm font-medium text-white/30 mb-1">No analytics yet</p>
        <p className="text-xs text-white/20">Connect your brand to start tracking AI bot traffic</p>
      </div>
    </div>
  )
}
