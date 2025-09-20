import { seoConfig } from '@/lib/constants'
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/admin/', '/_next/', '/static/'],
    },
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  }
}
