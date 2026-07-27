export function registerBackgroundSync(): void {
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then((reg) => {
      const sw = reg as unknown as { sync: { register: (tag: string) => Promise<void> } }
      sw.sync.register('sync-missing')
      sw.sync.register('sync-pins')
    }).catch(() => {})
  }
}
