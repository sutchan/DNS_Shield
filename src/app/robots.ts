// src/app/robots.ts v3.7.3
import type { MetadataRoute } from 'next'

const SITE_URL = 'https://dns.ewuse.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/_next/', '/admin/'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
