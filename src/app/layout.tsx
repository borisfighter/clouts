import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: { default: 'Clouts — AI Visibility + Content Clipping', template: '%s | Clouts' },
  description: 'Monitor your brand across ChatGPT, Perplexity, Gemini, Grok, and Claude. Get AI-powered AEO recommendations and auto-clip your best brand moments.',
  keywords: ['AI visibility', 'brand monitoring', 'ChatGPT', 'Perplexity', 'AI search', 'content clipping', 'AEO', 'AI search optimization'],
  authors: [{ name: 'Clouts' }],
  creator: 'Clouts',
  publisher: 'Clouts',
  metadataBase: new URL('https://www.clouts.com'),
  openGraph: {
    title: 'Clouts — AI Visibility + Content Clipping',
    description: 'Monitor your brand across ChatGPT, Perplexity, Gemini, Grok, and Claude. Win in AI search.',
    url: 'https://www.clouts.com',
    siteName: 'Clouts',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Clouts — Win in AI Search',
    description: 'Monitor your brand across ChatGPT, Perplexity, Claude, Gemini, and Grok.',
    creator: '@cloutsdotcom',
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Clouts',
  applicationCategory: 'BusinessApplication',
  description: 'AI Visibility monitoring and content clipping platform',
  url: 'https://www.clouts.com',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free plan available',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${inter.className} bg-[#08090A] text-white antialiased`}>
        {children}
      </body>
    </html>
  )
}
