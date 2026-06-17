import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: {
    default: 'Clouts — AI Visibility + Content Clipping',
    template: '%s | Clouts',
  },
  description: 'Monitor your brand across ChatGPT, Perplexity, Gemini, Claude, and Grok. Auto-clip your best moments into viral content.',
  keywords: ['AI visibility', 'AEO', 'answer engine optimization', 'brand monitoring', 'content clipping', 'ChatGPT', 'Perplexity'],
  openGraph: {
    title: 'Clouts — AI Visibility + Content Clipping',
    description: 'Monitor your brand across 9 AI engines. Auto-clip viral content. Dominate AI search.',
    url: 'https://www.clouts.com',
    siteName: 'Clouts',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clouts — AI Visibility + Content Clipping',
    description: 'Monitor your brand across 9 AI engines.',
  },
  robots: { index: true, follow: true },
  metadataBase: new URL('https://www.clouts.com'),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  )
}
