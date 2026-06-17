export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-bold text-white">Settings</h1>
        <p className="text-xs text-white/40 mt-0.5">Account, billing, and brand configuration</p>
      </div>
      <div className="grid gap-4">
        {[
          { label: 'Brand Name',  value: 'Clouts',            desc: 'Your primary brand' },
          { label: 'Domain',      value: 'clouts.com',        desc: 'Primary tracking domain' },
          { label: 'Plan',        value: 'Free',              desc: 'Upgrade for more scrapes' },
          { label: 'Email',       value: 'deals@kumbaya.com', desc: 'Account email' },
        ].map(({ label, value, desc }) => (
          <div key={label} className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-5 py-4">
            <div>
              <p className="text-xs font-medium text-white/70">{label}</p>
              <p className="text-[11px] text-white/30 mt-0.5">{desc}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/60">{value}</span>
              <button className="text-[11px] text-violet-400 hover:text-violet-300 transition-colors">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
