import type { MapPin, PinType } from '@/types'

const PIN_LABELS: Record<PinType, string> = {
  shelter: 'S',
  danger: '!',
  missing: '?',
  medical: 'H',
  general: '·',
}

const PIN_CLASSES: Record<PinType, string> = {
  shelter: 'bg-[var(--color-pin-shelter)]',
  danger: 'bg-[var(--color-pin-danger)]',
  missing: 'bg-[var(--color-pin-missing)]',
  medical: 'bg-[var(--color-pin-medical)]',
  general: 'bg-[var(--color-pin-general)]',
}

export function createPinElement(pin: MapPin): HTMLElement {
  const label = PIN_LABELS[pin.type]
  const bgClass = PIN_CLASSES[pin.type]
  const el = document.createElement('div')
  el.className = `${bgClass} inline-flex items-center justify-center cursor-pointer`
  el.style.cssText += `width:36px;height:36px;border-radius:var(--radius-pill, 9999px);color:var(--color-text-heading, #fff);font-size:14px;font-weight:700;border:2px solid color-mix(in oklch, var(--color-text, #f5f5f5) 60%, transparent);box-shadow:var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.4));transition:transform var(--dur-fast) var(--ease-out)`
  el.textContent = label
  el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.2)' })
  el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)' })
  return el
}

// ponytail: no React component — MapLibre consumes DOM nodes imperatively
