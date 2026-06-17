'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-20 pt-24 text-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5 text-sm font-medium text-violet-300"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
        AI Visibility + Content Clipping — in one platform
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.08 }}
        className="mx-auto max-w-4xl text-5xl font-black leading-[1.07] tracking-[-2px] text-white md:text-6xl lg:text-7xl"
      >
        Win in AI Search.{' '}
        <span className="bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
          Clip. Repurpose. Dominate.
        </span>
      </motion.h1>

      {/* Subheadline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.16 }}
        className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/50"
      >
        Clouts monitors your brand across every AI engine, optimizes your presence in LLM answers,
        and turns your best content moments into viral short clips — automatically.
      </motion.p>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.24 }}
        className="mt-10 flex flex-wrap items-center justify-center gap-3"
      >
        <Link
          href="/auth/signup"
          className="group flex items-center gap-2 rounded-xl bg-violet-600 px-7 py-3.5 text-base font-semibold text-white transition-all hover:bg-violet-500 hover:-translate-y-0.5"
        >
          Get a Demo
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/auth/signup"
          className="rounded-xl border border-white/10 px-7 py-3.5 text-base font-medium text-white/80 transition-all hover:border-white/20 hover:text-white hover:-translate-y-0.5"
        >
          Start Free →
        </Link>
      </motion.div>

      {/* Social proof */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mt-6 text-xs text-white/30"
      >
        No credit card required · Free plan available · Setup in 2 minutes
      </motion.p>
    </section>
  )
}
