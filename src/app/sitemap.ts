import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://www.clouts.com'
  return [
    { url: base,                  lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${base}/pricing`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/auth/signup`, lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.8 },
    { url: `${base}/auth/login`,  lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.5 },
    { url: `${base}/terms`,       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/privacy`,     lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.3 },
    { url: `${base}/changelog`,   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/what-is-aeo`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/blog`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.6 },
    { url: `${base}/agencies`,     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  ]
}
