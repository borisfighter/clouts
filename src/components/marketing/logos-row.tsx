const logos = ['Ramp', 'Notion', 'Figma', 'Linear', 'Vercel', 'Stripe', 'Loom', 'Framer']

export function LogosRow() {
  return (
    <div className="border-t border-white/[0.06] px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8">
        <span className="text-xs text-white/20">Used by the world's best marketing teams</span>
        {logos.map((logo) => (
          <span key={logo} className="text-sm font-semibold text-white/20 transition-colors hover:text-white/40">
            {logo}
          </span>
        ))}
      </div>
    </div>
  )
}
