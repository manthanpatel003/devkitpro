import { seoConfig } from '@/lib/constants'
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.name,
    short_name: 'DevTools Hub',
    description: seoConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#3b82f6',
    orientation: 'portrait-primary',
    categories: ['productivity', 'developer', 'utilities'],
    lang: 'en',
    dir: 'ltr',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    screenshots: [
      {
        src: '/screenshot-wide.png',
        sizes: '1280x720',
        type: 'image/png',
        // form_factor: 'wide',
      },
      {
        src: '/screenshot-narrow.png',
        sizes: '720x1280',
        type: 'image/png',
        // form_factor: 'narrow',
      },
    ],
  }
}
