import { useEffect, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { API_URL } from '@/lib/config'
import maplibregl from 'maplibre-gl'
import { Protocol } from 'pmtiles'
import type { ApiResponse } from '@/types'
import type { MapPin as MapPinType } from '@/types'
import { createPinElement } from '@/components/Map/PinMarker'
import AddPinForm from '@/components/Map/AddPinForm'
import 'maplibre-gl/dist/maplibre-gl.css'
import '@/components/Map/Map.css'

function darkStyle(sourceUrl: string): maplibregl.StyleSpecification {
  return {
    version: 8,
    name: 'Mukto Mesh Dark',
    sources: {
      bangladesh: { type: 'vector', url: sourceUrl },
    },
    glyphs: 'https://fonts.openmaptiles.org/{fontstack}/{range}.pbf',
    layers: [
      { id: 'bg', type: 'background', paint: { 'background-color': 'var(--color-paper, #0a0a0a)' } },
      { id: 'land', type: 'fill', source: 'bangladesh', 'source-layer': 'land', paint: { 'fill-color': 'var(--color-paper-alt, #141414)' } },
      { id: 'water', type: 'fill', source: 'bangladesh', 'source-layer': 'water', paint: { 'fill-color': 'var(--color-surface, #1f1f1f)' } },
      { id: 'water_oo', type: 'line', source: 'bangladesh', 'source-layer': 'water', paint: { 'line-color': 'var(--color-border, #2e2e2e)', 'line-width': 0.5 } },
      { id: 'roads', type: 'line', source: 'bangladesh', 'source-layer': 'roads', paint: { 'line-color': 'var(--color-elevated, #262626)', 'line-width': 1 }, filter: ['==', ['geometry-type'], 'LineString'] },
      { id: 'buildings', type: 'fill', source: 'bangladesh', 'source-layer': 'buildings', paint: { 'fill-color': 'var(--color-surface-hover, #242424)', 'fill-opacity': 0.6 } },
      { id: 'places', type: 'symbol', source: 'bangladesh', 'source-layer': 'places', layout: { 'text-field': '{name}', 'text-size': 10, 'text-transform': 'uppercase' }, paint: { 'text-color': 'var(--color-text-muted, #737373)', 'text-halo-color': 'var(--color-paper, #0a0a0a)', 'text-halo-width': 1 } },
    ],
  }
}

export default function MapPage() {
  const lang = useLanguageStore((s) => s.lang)
  const isOffline = useOfflineStatus()
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<maplibregl.Map | null>(null)
  const markersRef = useRef<maplibregl.Marker[]>([])
  const protocolRef = useRef<Protocol | null>(null)

  const [placing, setPlacing] = useState(false)
  const [newPin, setNewPin] = useState<{ lat: number; lng: number } | null>(null)

  const { data, isLoading, isError } = useQuery<ApiResponse<MapPinType[]>>({
    queryKey: ['pins'],
    queryFn: () => api.get<MapPinType[]>('/pins'),
    refetchInterval: 30_000,
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const protocol = new Protocol()
    maplibregl.addProtocol('pmtiles', protocol.tile)
    protocolRef.current = protocol

    const map = new maplibregl.Map({
      container,
      style: darkStyle(`pmtiles://${API_URL}/tiles/bangladesh.pmtiles`),
      center: [90.3563, 23.6850],
      zoom: 7,
      attributionControl: false,
    })
    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl(), 'bottom-right')

    if (placing) {
      map.getCanvas().style.cursor = 'crosshair'
    }

    return () => {
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []
      map.remove()
      mapRef.current = null
      if (protocolRef.current) {
        maplibregl.removeProtocol('pmtiles')
        protocolRef.current = null
      }
    }
    // ponytail: init once on mount; placing changes handled via a separate effect
  }, [])

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

    if (placing) {
      map.once('click', handler)
    }

    return () => { map.off('click', handler) }
  }, [placing])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !data?.data) return

    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    const popup = new maplibregl.Popup({ offset: 25, closeButton: true, closeOnClick: false })

    data.data.forEach((pin) => {
      const el = createPinElement(pin)
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([pin.lng, pin.lat])
        .addTo(map)

      el.addEventListener('click', () => {
        const time = new Date(pin.createdAt).toLocaleString()
        const typeLabel = pin.type.charAt(0).toUpperCase() + pin.type.slice(1)
        const desc = pin.description ? `<br/><span style="color:#bbbbbb;font-size:12px">${pin.description}</span>` : ''
        popup.setLngLat([pin.lng, pin.lat])
          .setHTML(`<strong>${pin.label}</strong><br/><span style="color:#737373;font-size:11px">${typeLabel}</span>${desc}<br/><span style="color:#737373;font-size:10px">${time}</span>`)
          .addTo(map)
      })

      markersRef.current.push(marker)
    })
  }, [data])

  return (
    <div className="relative h-[calc(100dvh-var(--top-bar-h,56px)-var(--bottom-nav-h,64px))] min-h-[400px]">
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
