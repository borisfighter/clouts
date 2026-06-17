'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      // Ensure public.users row exists for email/password logins
      try { await fetch('/api/auth/ensure-user', { method: 'POST' }) } catch {}
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleGoogle = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08090A] px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex justify-center text-2xl font-black text-white">
          Clouts<span className="text-violet-400">.</span>
        </Link>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
          <h1 className="mb-1 text-xl font-bold text-white">Welcome back</h1>
          <p className="mb-6 text-sm text-white/40">Sign in to your Clouts account</p>

          <button onClick={handleGoogle}
            className="mb-4 flex w-full items-center justify-center gap-3 rounded-xl border border-white/[0.10] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex-1 border-t border-white/[0.07]" />
            <span className="text-xs text-white/20">or</span>
            <div className="flex-1 border-t border-white/[0.07]" />
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60" />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/50">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3.5 py-2.5 pr-10 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/60" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="mt-1.5 flex justify-end">
                <Link href="/auth/forgot" className="text-xs text-violet-400 hover:text-violet-300">Forgot password?</Link>
              </div>
            </div>

            {error && <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</div>}

            <button type="submit" disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-violet-500 disabled:opacity-60">
              {loading && <Loader2 size={14} className="animate-spin" />}
              Sign in
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-sm text-white/30">
          No account?{' '}
          <Link href="/auth/signup" className="text-violet-400 hover:text-violet-300">Create one free</Link>
        </p>
      </div>
    </div>
  )
}
