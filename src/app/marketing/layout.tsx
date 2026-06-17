import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Clouts — AI Visibility + Content Clipping',
  description: 'Monitor your brand across every AI engine. Auto-clip viral moments. Win in AI search.',
  openGraph: {
    title: 'Clouts — AI Visibility + Content Clipping',
    description: 'Monitor your brand across every AI engine. Auto-clip viral moments. Win in AI search.',
    url: 'https://clouts.com',
    siteName: 'Clouts',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clouts — AI Visibility + Content Clipping',
    description: 'Monitor your brand across every AI engine. Auto-clip viral moments.',
  },
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
