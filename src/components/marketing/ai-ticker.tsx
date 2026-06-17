const engines = [
  'ChatGPT', 'Perplexity', 'Claude', 'Gemini', 'Grok',
  'Copilot', 'Meta AI', 'DeepSeek', 'Google AIO',
]

export function AiTicker() {
  return (
    <div className="border-y border-white/[0.06] bg-white/[0.02] px-6 py-4">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3">
        <span className="text-xs font-medium text-white/30">Your brand, mentioned in →</span>
        {engines.map((engine) => (
          <span
            key={engine}
            className="rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1 text-xs font-medium text-white/40 transition-colors hover:border-white/[0.15] hover:text-white/70 cursor-default"
          >
            {engine}
          </span>
        ))}
      </div>
    </div>
  )
}
