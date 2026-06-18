import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Clouts — AI Visibility + Content Clipping',
  description: 'Monitor your brand across 9 AI engines. Get AI-powered recommendations. Auto-clip your best brand moments into viral content.',
  keywords: ['AI visibility', 'brand monitoring', 'ChatGPT', 'Perplexity', 'AI search', 'content clipping', 'AEO'],
  authors: [{ name: 'Clouts' }],
  creator: 'Clouts',
  publisher: 'Clouts',
  metadataBase: new URL('https://www.clouts.com'),
  openGraph: {
    title: 'Clouts — AI Visibility + Content Clipping',
    description: 'Monitor your brand across 9 AI engines. Win in AI search.',
    url: 'https://www.clouts.com',
    siteName: 'Clouts',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clouts — Win in AI Search',
    description: 'Monitor your brand across ChatGPT, Perplexity, Claude, Gemini, Grok and more. Auto-clip viral moments.',
    creator: '@cloutsdotcom',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#08090A] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
