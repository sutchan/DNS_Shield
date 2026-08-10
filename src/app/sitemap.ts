// src/app/sitemap.ts v3.7.16
import type { MetadataRoute } from 'next'

const SITE_URL = 'https://dns.ewuse.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/#generator`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/#rules`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/#faq`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]
}
