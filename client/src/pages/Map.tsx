import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import maplibregl from 'maplibre-gl'
import type { ApiResponse } from '@/types'
import type { MapPin as MapPinType } from '@/types'
import { createPinElement } from '@/components/Map/PinMarker'
import AddPinForm from '@/components/Map/AddPinForm'
import 'maplibre-gl/dist/maplibre-gl.css'

export default function MapPage() {
  const lang = useLanguageStore((s) => s.lang)
  const isOffline = useOfflineStatus()
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const queryClient = useQueryClient()
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const [mapH, setMapH] = useState(400)

  const [placing, setPlacing] = useState(false)
  const [newPin, setNewPin] = useState<{ lat: number; lng: number } | null>(null)

  const { data, isLoading, isError } = useQuery<ApiResponse<MapPinType[]>>({
    queryKey: ['pins'],
    queryFn: () => api.get<MapPinType[]>('/api/pins'),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const header = document.querySelector<HTMLElement>('header')
    const bottomNav = document.querySelector<HTMLElement>('[data-bottom-nav]')
    const headerH = header?.offsetHeight || 64
    const bottomNavH = bottomNav?.offsetHeight || 0
    const h = Math.max(window.innerHeight - headerH - bottomNavH, 400)
    setMapH(h)
  }, [])

  useEffect(() => {
    const el = containerRef.current
    if (!el || mapH <= 400 && window.innerHeight > 600) return
    el.style.height = `${mapH}px`
    el.style.width = '100%'

    const map = new maplibregl.Map({
      container: el,
      style: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
      center: [90.3563, 23.6850],
      zoom: 7,
    })
    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right')
    map.on('error', (e) => console.error('[Map err]', e.error?.message))

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
    }
  }, [mapH])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    map.getCanvas().style.cursor = placing ? 'crosshair' : ''

    const handler = (e: maplibregl.MapMouseEvent) => {
      if (!placing) return
      setNewPin({ lat: e.lngLat.lat, lng: e.lngLat.lng })
      setPlacing(false)
      map.getCanvas().style.cursor = ''
    }

    if (placing) map.once('click', handler)
    return () => { map.off('click', handler) }
  }, [placing])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !data?.data) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const popup = new maplibregl.Popup({ offset: 25, closeButton: true, closeOnClick: false })

    const deleting = new Set<string>()

    data.data.forEach((pin) => {
      const el = createPinElement(pin)
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map)

      el.addEventListener('click', () => {
        const time = new Date(pin.createdAt).toLocaleString()
        const typeLabel = pin.type.charAt(0).toUpperCase() + pin.type.slice(1)

        const root = document.createElement('div')
        root.style.cssText = 'font-family:inherit;line-height:1.4'

        const title = document.createElement('strong')
        title.textContent = pin.label

        const meta = document.createElement('div')
        meta.style.cssText = 'color:var(--color-text-dim, #888);font-size:11px'
        meta.textContent = typeLabel

        root.append(title, document.createElement('br'), meta)

        if (pin.description) {
          const desc = document.createElement('div')
          desc.style.cssText = 'color:var(--color-text-muted, #aaa);font-size:12px;margin-top:2px'
          desc.textContent = pin.description
          root.append(document.createElement('br'), desc)
        }

        const timeEl = document.createElement('div')
        timeEl.style.cssText = 'color:var(--color-text-dim, #888);font-size:10px;margin-top:2px'
        timeEl.textContent = time
        root.append(document.createElement('br'), timeEl)

        if (isAdmin && !deleting.has(pin.id)) {
          const del = document.createElement('button')
          del.textContent = t('Delete', 'মুছুন')
          del.style.cssText = 'margin-top:4px;background:none;color:#ef4444;border:none;padding:0;cursor:pointer;font-size:10px;text-decoration:underline;text-underline-offset:2px;float:right'
          del.addEventListener('click', async (e) => {
            e.stopPropagation()
            if (!confirm(t('Delete this pin?', 'এই পিনটি মুছবেন?'))) return
            deleting.add(pin.id)
            del.textContent = '...'
            del.disabled = true
            await api.delete('/api/pins/' + pin.id)
            deleting.delete(pin.id)
            popup.remove()
            queryClient.invalidateQueries({ queryKey: ['pins'] })
          })
          root.appendChild(del)
        }

        popup.setLngLat([pin.lng, pin.lat]).setDOMContent(root).addTo(map)
      })

      markersRef.current.push(marker)
    })
  }, [data, isAdmin, queryClient, t])

  return (
    <div className="relative" style={{ height: mapH }}>
      {isOffline && (
        <div className="absolute top-3 left-3 right-3 z-20 bg-surface border border-border p-2 text-center">
          <p className="text-xs text-text-muted">
            {t('Map requires connection to the local node.', 'মানচিত্র লোকাল নোডের সাথে সংযোগ প্রয়োজন।')}
          </p>
        </div>
      )}

      <div ref={containerRef} className="absolute inset-0" />

      <button
        onClick={() => { setPlacing(true); setNewPin(null) }}
        disabled={placing}
        className="absolute top-3 right-3 z-20 bg-primary text-white font-bold uppercase tracking-wider px-4 py-3 disabled:opacity-50 flex items-center gap-2 min-h-[44px]"
      >
        <Plus size={16} />
        {t('Add Pin', 'পিন যোগ করুন')}
      </button>

      {isLoading && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-surface border border-border px-4 py-2">
          <p className="text-xs text-text-muted">{t('Loading pins...', 'পিন লোড হচ্ছে...')}</p>
        </div>
      )}

      {isError && (
        <div className="absolute top-16 left-3 right-3 z-20 bg-danger/10 border border-danger/30 p-2">
          <p className="text-xs text-danger">{t('Could not load pins.', 'পিন লোড করা যায়নি।')}</p>
        </div>
      )}

      {newPin && (
        <AddPinForm
          lat={newPin.lat}
          lng={newPin.lng}
          onSuccess={() => setNewPin(null)}
          onCancel={() => setNewPin(null)}
        />
      )}
    </div>
  )
}