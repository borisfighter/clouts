'use client'
import { useEffect, useState, useCallback } from 'react'
import { Search, ChevronLeft, ChevronRight, Trash2, Loader2, ExternalLink } from 'lucide-react'

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const p = new URLSearchParams({ page: String(page), q })
    const res = await fetch(`/api/admin/brands?${p}`)
    const data = await res.json()
    setBrands(data.brands || []); setTotal(data.total || 0); setLoading(false)
  }, [page, q])

  useEffect(() => { load() }, [load])
  useEffect(() => { setPage(1) }, [q])

  const deleteBrand = async (brandId: string, name: string) => {
    if (!confirm(`Delete brand "${name}" and all its data?`)) return
    setDeletingId(brandId)
    await fetch('/api/admin/brands', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ brandId }) })
    setBrands(b => b.filter(x => x.id !== brandId)); setTotal(t => t - 1); setDeletingId(null)
  }

  const planBadge = (p: string) => ({ pro: 'text-violet-400 bg-violet-400/10 border-violet-400/20', team: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' }[p] || 'text-white/20 bg-white/[0.04] border-white/[0.06]')
  const totalPages = Math.ceil(total / 25)

  return (
    <div className="max-w-6xl space-y-6">
      <div><h1 className="text-2xl font-black text-white">Brands</h1><p className="text-sm text-white/40 mt-1">{total.toLocaleString()} total brands</p></div>
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or domain..."
          className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-white/20" />
      </div>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/[0.07]">
              {['Brand', 'Owner', 'Keywords', 'Plan', 'Created', ''].map((h, i) => (
                <th key={i} className={`px-5 py-3 text-[10px] font-bold text-white/30 uppercase tracking-widest ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {loading ? (
              <tr><td colSpan={6} className="py-12 text-center"><Loader2 size={18} className="animate-spin text-white/20 mx-auto" /></td></tr>
            ) : brands.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-white/20">No brands found</td></tr>
            ) : brands.map(brand => (
              <tr key={brand.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sm font-bold text-white/60">{brand.name?.[0]?.toUpperCase()}</div>
                    <div>
                      <p className="text-sm text-white/80 font-medium">{brand.name}</p>
                      <a href={`https://${brand.domain}`} target="_blank" rel="noopener" className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60">
                        {brand.domain}<ExternalLink size={9} />
                      </a>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5 text-xs text-white/50">{(brand.users as any)?.email || '—'}</td>
                <td className="px-4 py-3.5">
                  <div className="flex flex-wrap gap-1 max-w-[180px]">
                    {(brand.keywords || []).slice(0, 3).map((kw: string) => (
                      <span key={kw} className="rounded bg-violet-500/10 px-1.5 py-0.5 text-[9px] text-violet-300/70 truncate max-w-[80px]">{kw}</span>
                    ))}
                    {(brand.keywords || []).length > 3 && <span className="text-[9px] text-white/20">+{brand.keywords.length - 3}</span>}
                    {(brand.keywords || []).length === 0 && <span className="text-[10px] text-white/20">none</span>}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold capitalize ${planBadge((brand.users as any)?.plan || 'free')}`}>
                    {(brand.users as any)?.plan || 'free'}
                  </span>
                </td>
                <td className="px-4 py-3.5 text-xs text-white/40">{new Date(brand.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3.5 text-right">
                  <button onClick={() => deleteBrand(brand.id, brand.name)} disabled={deletingId === brand.id}
                    className="rounded-lg p-1.5 text-white/20 hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40 transition-colors">
                    {deletingId === brand.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="border-t border-white/[0.07] px-5 py-3 flex items-center justify-between">
            <p className="text-xs text-white/30">Page {page} of {totalPages} · {total} brands</p>
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
