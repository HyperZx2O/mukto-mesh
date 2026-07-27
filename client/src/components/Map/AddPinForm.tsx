import { useState } from 'react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { MapPin, PinType } from '@/types'
import { PIN_TYPES } from '@/lib/constants'

interface Props {
  lat: number
  lng: number
  onSuccess: () => void
  onCancel: () => void
}

export default function AddPinForm({ lat, lng, onSuccess, onCancel }: Props) {
  const lang = useLanguageStore((s) => s.lang)
  const queryClient = useQueryClient()
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const [label, setLabel] = useState('')
  const [type, setType] = useState<PinType>('general')
  const [description, setDescription] = useState('')
  const [labelError, setLabelError] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      api.post<MapPin>('/pins', { label, type, description: description || null, lat, lng }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pins'] })
      onSuccess()
    },
  })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) { setLabelError(t('Label is required', 'লেবেল প্রয়োজনীয়')); return }
    setLabelError('')
    mutation.mutate()
  }

  const typeLabels: Record<PinType, string> = {
    shelter: t('Shelter', 'আশ্রয়'),
    danger: t('Danger', 'বিপদ'),
    missing: t('Missing', 'নিখোঁজ'),
    medical: t('Medical', 'চিকিৎসা'),
    general: t('General', 'সাধারণ'),
  }

  return (
    <div className="absolute bottom-4 left-4 right-4 z-10 max-w-sm mx-auto bg-surface border border-border p-4 shadow-xl">
      <form onSubmit={submit} className="space-y-3">
        <p className="text-xs text-text-muted">
          {t('Pin at', 'পিনের অবস্থান')}: {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>

        <div className="space-y-1">
          <label className="text-sm font-bold text-text-primary uppercase tracking-wider">
            {t('Label', 'লেবেল')} <span className="text-danger">*</span>
          </label>
          <input value={label} onChange={(e) => setLabel(e.target.value)} className="w-full bg-surface border border-border text-text-primary p-3 text-sm outline-none focus:border-primary" />
          {labelError && <p className="text-xs text-danger">{labelError}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-text-primary uppercase tracking-wider">
            {t('Type', 'ধরন')}
          </label>
          <select value={type} onChange={(e) => setType(e.target.value as PinType)} className="w-full bg-surface border border-border text-text-primary p-3 text-sm outline-none focus:border-primary">
            {PIN_TYPES.map((pt) => (
              <option key={pt} value={pt}>{typeLabels[pt]}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-bold text-text-primary uppercase tracking-wider">
            {t('Description', 'বর্ণনা')}
          </label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className="w-full bg-surface border border-border text-text-primary p-3 text-sm outline-none focus:border-primary resize-none" />
        </div>

        <div className="flex gap-2">
          <button type="submit" disabled={mutation.isPending} className="flex-1 bg-primary text-white font-bold uppercase tracking-wider py-3 disabled:opacity-50 min-h-[44px]">
            {mutation.isPending ? t('Adding...', 'যোগ করা হচ্ছে...') : t('Add Pin', 'পিন যোগ করুন')}
          </button>
          <button type="button" onClick={onCancel} className="flex-1 bg-surface text-text-muted font-bold uppercase tracking-wider border border-border py-3 min-h-[44px]">
            {t('Cancel', 'বাতিল')}
          </button>
        </div>

        {mutation.isError && (
          <p className="text-xs text-danger">{t('Failed to add pin.', 'পিন যোগ করতে ব্যর্থ।')}</p>
        )}
      </form>
    </div>
  )
}
