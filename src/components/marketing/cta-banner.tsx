import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CtaBanner() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="rounded-3xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 via-transparent to-emerald-400/[0.06] p-16 text-center">
        <div className="mb-4 text-xs font-bold uppercase tracking-widest text-violet-400">
          Get Started Today
        </div>
        <h2 className="mx-auto mb-4 max-w-2xl text-4xl font-black leading-tight tracking-tight text-white lg:text-5xl">
          Your brand is being talked about. Are you listening?
        </h2>
        <p className="mx-auto mb-10 max-w-lg text-lg leading-relaxed text-white/40">
          Join thousands of brands using Clouts to monitor AI visibility and repurpose
          top moments into clips that drive traffic.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/auth/signup"
            className="group flex items-center gap-2 rounded-xl bg-violet-600 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-violet-500 hover:-translate-y-0.5"
          >
            Get a Demo
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-xl border border-white/10 px-8 py-4 text-base font-medium text-white/70 transition-all hover:border-white/20 hover:text-white hover:-translate-y-0.5"
          >
            Start Free — No credit card
          </Link>
        </div>
      </div>
    </section>
  )
}
