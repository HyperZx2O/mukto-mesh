import type { MapPin, PinType } from '@/types'

const PIN_COLORS: Record<PinType, string> = {
  shelter: '#006A4E',
  danger: '#C8102E',
  missing: '#f4b400',
  medical: '#1c69d4',
  general: '#737373',
}

const PIN_LABELS: Record<PinType, string> = {
  shelter: 'S',
  danger: '!',
  missing: '?',
  medical: 'H',
  general: '·',
}

export function createPinElement(pin: MapPin): HTMLElement {
  const color = PIN_COLORS[pin.type]
  const label = PIN_LABELS[pin.type]
  const el = document.createElement('div')
  el.style.cssText = `width:36px;height:36px;border-radius:50%;background:${color};color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;cursor:pointer;border:2px solid rgba(255,255,255,0.6);box-shadow:0 2px 8px rgba(0,0,0,0.5);transition:transform .15s`
  el.textContent = label
  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)' })
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
  return el
}

// ponytail: no React component — MapLibre consumes DOM nodes imperatively
