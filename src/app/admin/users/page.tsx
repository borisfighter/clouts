'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Trash2, Edit2, X, Loader2 } from 'lucide-react'

const PLANS = ['free', 'pro', 'team']
const planBadge = (p: string) => ({ pro: 'text-violet-400 bg-violet-400/10 border-violet-400/20', team: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20', free: 'text-white/30 bg-white/[0.04] border-white/[0.08]' }[p] || 'text-white/30 bg-white/[0.04] border-white/[0.08]')

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [editingPlan, setEditingPlan] = useState<string | null>(null)
  const [savingPlan, setSavingPlan] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page), q, ...(planFilter ? { plan: planFilter } : {}) })
    const res = await fetch(`/api/admin/users?${p}`)
    const data = await res.json()
    setUsers(data.users || [])
    setTotal(data.total || 0)
    setLoading(false)
  }, [page, q, planFilter])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [q, planFilter])

  const updatePlan = async (userId: string, plan: string) => {
    setSavingPlan(userId)
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, plan }) })
    setUsers(u => u.map(x => x.id === userId ? { ...x, plan } : x))
    setEditingPlan(null); setSavingPlan(null)
  }

  const deleteUser = async (userId: string, email: string) => {
    if (!confirm(`Delete user ${email}? This removes ALL their data permanently.`)) return
    setDeletingId(userId)
    await fetch('/api/admin/users', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId }) })
    setUsers(u => u.filter(x => x.id !== userId)); setTotal(t => t - 1); setDeletingId(null)
  }

  const totalPages = Math.ceil(total / 25)

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-black text-white">Users</h1><p className="text-sm text-white/40 mt-1">{total.toLocaleString()} total</p></div>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by email..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
        </div>
        <div className="flex rounded-xl border border-white/[0.08] bg-white/[0.04] p-1 gap-1">
          {['', ...PLANS].map(p => (
            <button key={p} onClick={() => setPlanFilter(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-all ${planFilter === p ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}>
              {p || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {['User', 'Plan', 'Brands', 'Joined', 'Actions'].map(h => (
                <th key={h} className={`px-5 py-3 text-[10px] font-bold text-white/30 uppercase tracking-widest ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center"><Loader2 size={18} className="animate-spin text-white/20 mx-auto" /></td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-sm text-white/20">No users found</td></tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold">{user.email?.[0]?.toUpperCase()}</div>
                    <div><p className="text-sm text-white/80">{user.email}</p><p className="text-[10px] text-white/20 font-mono">{user.id.slice(0,8)}…</p></div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  {editingPlan === user.id ? (
                    <div className="flex items-center gap-1">
                      <select defaultValue={user.plan || 'free'} onChange={e => updatePlan(user.id, e.target.value)}
                        className="rounded-lg border border-white/[0.10] bg-[#1a1a1b] px-2 py-1 text-xs text-white outline-none">
                        {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {savingPlan === user.id ? <Loader2 size={12} className="animate-spin text-white/30" /> : <button onClick={() => setEditingPlan(null)} className="text-white/30"><X size={12} /></button>}
                    </div>
                  ) : (
                    <button onClick={() => setEditingPlan(user.id)} className="group flex items-center gap-1.5">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${planBadge(user.plan || 'free')}`}>{user.plan || 'free'}</span>
                      <Edit2 size={10} className="text-white/20 opacity-0 group-hover:opacity-100" />
                    </button>
                  )}
                </td>
                <td className="px-4 py-3.5">
                  {(user.brands || []).length > 0
                    ? (user.brands || []).slice(0,2).map((b: any) => <p key={b.id} className="text-xs text-white/50 truncate max-w-[140px]">{b.domain}</p>)
                    : <span className="text-xs text-white/20">—</span>}
                  {(user.brands || []).length > 2 && <p className="text-[10px] text-white/20">+{user.brands.length - 2} more</p>}
                </td>
                <td className="px-4 py-3.5 text-xs text-white/40">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3.5 text-right">
                  <button onClick={() => deleteUser(user.id, user.email)} disabled={deletingId === user.id}
                    className="rounded-lg p-1.5 text-white/20 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40 transition-colors">
                    {deletingId === user.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="border-t border-white/[0.07] px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-white/30">Page {page} of {totalPages} · {total} users</p>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1} className="rounded-lg border border-white/[0.08] p-1.5 text-white/30 hover:text-white disabled:opacity-30"><ChevronLeft size={14} /></button>
              <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages} className="rounded-lg border border-white/[0.08] p-1.5 text-white/30 hover:text-white disabled:opacity-30"><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
