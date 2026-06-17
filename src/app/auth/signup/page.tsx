'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Eye, EyeOff, Check } from 'lucide-react'

export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { emailRedirectTo: `${window.location.origin}/api/auth/callback` },
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    setDone(true)
  }

  const handleGoogle = async () => {
    setOauthLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/api/auth/callback` },
    })
  }

  if (done) return (
    <div className="min-h-screen bg-[#08090A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mb-6">
          <Link href="/" className="text-2xl font-black text-white">Clouts<span className="text-violet-400">.</span></Link>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 border border-emerald-400/20">
            <Check size={20} className="text-emerald-400" />
          </div>
          <h2 className="text-lg font-black text-white mb-2">Check your email</h2>
          <p className="text-sm text-white/40 mb-1">
            We sent a confirmation link to
          </p>
          <p className="text-sm font-semibold text-white mb-6">{email}</p>
          <p className="text-xs text-white/30 mb-4">Click it to activate your account and get started.</p>
          <Link href="/auth/login" className="text-sm text-violet-400 hover:text-violet-300">
            Back to login →
          </Link>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#08090A] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-black text-white">Clouts<span className="text-violet-400">.</span></Link>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
          <div className="mb-6">
            <h2 className="text-xl font-black text-white mb-1">Create your account</h2>
            <p className="text-sm text-white/40">Start monitoring your brand in AI engines</p>
          </div>

          <button onClick={handleGoogle} disabled={oauthLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/[0.10] bg-white/[0.04] py-3 text-sm font-medium text-white/80 hover:bg-white/[0.08] disabled:opacity-50 transition-colors mb-5">
            {oauthLoading ? <Loader2 size={16} className="animate-spin" /> : (
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-xs text-white/30">or</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Work email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com" required
                className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/50 mb-1.5">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min 8 characters" required minLength={8}
                  className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 pr-10" />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-500 disabled:opacity-50 transition-colors">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-white/20">
            By signing up you agree to our{' '}
            <Link href="#" className="text-white/40 hover:text-white">Terms</Link>{' '}
            and{' '}
            <Link href="#" className="text-white/40 hover:text-white">Privacy Policy</Link>
          </p>
        </div>

        <p className="mt-4 text-center text-sm text-white/30">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-violet-400 hover:text-violet-300">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
