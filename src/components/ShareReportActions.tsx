'use client'

export function ShareReportActions({ brandName, slug }: { brandName: string; slug: string }) {
  const tweetUrl = `https://twitter.com/intent/tweet?text=Check+out+${encodeURIComponent(brandName)}%27s+AI+visibility+report&url=${encodeURIComponent(`https://www.clouts.com/r/${slug}`)}`

  return (
    <div className="hidden sm:flex items-center gap-2 no-print">
      <a
        href={tweetUrl}
        target="_blank"
        rel="noopener"
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors"
      >
        Share on X
      </a>
      <span className="text-white/10">·</span>
      <button
        onClick={() => window.print()}
        className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white transition-colors"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
        Download PDF
      </button>
    </div>
  )
}
