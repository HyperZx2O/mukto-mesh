import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { CacheFirst, NetworkFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'

// ponytail: self.__WB_MANIFEST is injected by vite-plugin-pwa at build time
precacheAndRoute((self as unknown as { __WB_MANIFEST: Array<{ url: string; revision: string | null }> }).__WB_MANIFEST)

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/news'),
  new CacheFirst({
    cacheName: 'news-cache',
    plugins: [
      new ExpirationPlugin({ maxAgeSeconds: 86400 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/posts'),
  new NetworkFirst({
    cacheName: 'posts-cache',
    plugins: [new CacheableResponsePlugin({ statuses: [0, 200] })],
  }),
)

registerRoute(
  ({ url }) => url.pathname.includes('/tiles/'),
  new CacheFirst({
    cacheName: 'tile-cache',
    plugins: [
      new ExpirationPlugin({ maxAgeSeconds: 86400 * 30 }),
      new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
  }),
)

// Background Sync: When connectivity returns, trigger the server-side sync job
// The actual data push (unsynced missing persons + pins → remote) is handled by
// server/src/integrations/remoteSync.ts running every 5 minutes.
// The Background Sync API just gives us a faster initial attempt.
self.addEventListener('sync', ((event: Event) => {
  const syncEvent = event as unknown as { tag: string; waitUntil: (p: Promise<unknown>) => void }
  if (syncEvent.tag === 'sync-missing' || syncEvent.tag === 'sync-pins') {
    syncEvent.waitUntil(
      fetch('/health', { method: 'GET' }).catch(() => {}),
    )
  }
}) as EventListener)
