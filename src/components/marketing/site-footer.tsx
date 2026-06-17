import Link from 'next/link'

const footerLinks = {
  Platform: [
    { label: 'Agents',           href: '#' },
    { label: 'Prompt Volumes',   href: '#' },
    { label: 'Agent Analytics',  href: '#' },
    { label: 'AEO Insights',     href: '#' },
    { label: 'Clips',            href: '#clips' },
  ],
  Resources: [
    { label: 'Blog',         href: '/blog' },
    { label: 'Docs',         href: '/docs' },
    { label: 'Customers',    href: '#' },
    { label: 'Integrations', href: '#' },
  ],
  Company: [
    { label: 'Pricing',  href: '/pricing' },
    { label: 'Careers',  href: '#' },
    { label: 'Contact',  href: '#' },
    { label: 'Privacy',  href: '#' },
    { label: 'Terms',    href: '#' },
  ],
}

export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-black text-white">
              Clouts<span className="text-violet-400">.</span>
            </Link>
            <p className="mt-2 text-xs text-white/30">AI Visibility + Content Clipping</p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <p className="mb-4 text-xs font-bold uppercase tracking-widest text-white/20">{group}</p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-white/40 transition-colors hover:text-white/70">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/[0.06] pt-8 sm:flex-row sm:items-center">
          <p className="text-xs text-white/20">© 2026 Clouts.com — All rights reserved</p>
          <div className="flex gap-5">
            {['Twitter', 'LinkedIn', 'GitHub'].map((social) => (
              <a key={social} href="#" className="text-xs text-white/20 transition-colors hover:text-white/50">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
