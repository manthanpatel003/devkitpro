// Service Worker for Ultimate Tools Suite
// Provides caching and offline functionality

const CACHE_NAME = 'ultimate-tools-suite-v1'
const STATIC_CACHE = 'static-v1'
const DYNAMIC_CACHE = 'dynamic-v1'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/whats-my-ip',
  '/ssl-checker',
  '/dns-lookup',
  '/port-scanner',
  '/website-monitor',
  '/security-headers',
  '/speed-test',
  '/json-formatter',
  '/regex-tester',
  '/jwt-analyzer',
  '/api-client',
  '/code-minifier',
  '/sql-formatter',
  '/cron-generator',
  '/diff-checker',
  '/seo-analyzer',
  '/keyword-research',
  '/social-preview',
  '/sitemap-generator',
  '/base64-converter',
  '/hash-generator',
  '/password-generator',
  '/qr-generator',
  '/markdown-editor',
  '/unit-converter',
  '/url-encoder',
  '/csv-processor',
  '/xml-formatter',
  '/yaml-converter',
  '/image-optimizer',
  '/favicon-generator',
  '/uuid-generator',
  '/lorem-generator'
]

// API routes to cache
const API_ROUTES = [
  '/api/ssl-check',
  '/api/website-monitor',
  '/api/security-headers',
  '/api/ai-generate'
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files...')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('Static files cached successfully')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  event.respondWith(
    handleRequest(request)
  )
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  try {
    // Strategy 1: Cache First for static assets
    if (isStaticAsset(request)) {
      return await cacheFirst(request)
    }
    
    // Strategy 2: Network First for API routes
    if (isApiRoute(request)) {
      return await networkFirst(request)
    }
    
    // Strategy 3: Stale While Revalidate for pages
    if (isPageRequest(request)) {
      return await staleWhileRevalidate(request)
    }
    
    // Default: Network First
    return await networkFirst(request)
    
  } catch (error) {
    console.error('Fetch error:', error)
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return await getOfflinePage()
    }
    
    // Return cached version if available
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return error response
    return new Response('Network error', { status: 503 })
  }
}

// Cache First strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  const networkResponse = await fetch(request)
  if (networkResponse.ok) {
    const cache = await caches.open(STATIC_CACHE)
    cache.put(request, networkResponse.clone())
  }
  
  return networkResponse
}

// Network First strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Stale While Revalidate strategy
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  }).catch(() => cachedResponse)
  
  return cachedResponse || fetchPromise
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url)
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
}

function isApiRoute(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/')
}

function isPageRequest(request) {
  return request.mode === 'navigate' || 
         (request.headers.get('accept') && request.headers.get('accept').includes('text/html'))
}

async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE)
  const offlinePage = await cache.match('/')
  
  if (offlinePage) {
    return offlinePage
  }
  
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Offline - Ultimate Tools Suite</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .offline { color: #666; }
        </style>
      </head>
      <body>
        <h1>You're offline</h1>
        <p class="offline">Please check your internet connection and try again.</p>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  })
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  // Handle any pending offline actions
  console.log('Performing background sync...')
}

// Push notifications (if needed)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/icon-192x192.png',
      badge: '/badge-72x72.png',
      tag: 'tool-notification'
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.openWindow('/')
  )
})