import { useState, useRef } from 'react'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { playCue } from '@/lib/uiSFX'
import { PHONE_REGEX } from '@/lib/utils'
import type { MissingPerson } from '@/types'

interface Props {
  onSuccess?: () => void
}

export default function MissingPersonForm({ onSuccess }: Props) {
  const lang = useLanguageStore((s) => s.lang)
  const isOffline = useOfflineStatus()
  const queryClient = useQueryClient()
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [lastLocation, setLastLocation] = useState('')
  const [description, setDescription] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [photo, setPhoto] = useState<File | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileRef = useRef<HTMLInputElement>(null)
  const [submittedName, setSubmittedName] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      if (photo) {
        const fd = new FormData()
        fd.append('name', name)
        if (age) fd.append('age', age)
        if (gender) fd.append('gender', gender)
        fd.append('last_location', lastLocation)
        if (description) fd.append('description', description)
        fd.append('contact_name', contactName)
        fd.append('contact_phone', contactPhone)
        fd.append('photo', photo)
        return api.post<MissingPerson>('/api/missing', fd)
      }
      return api.post<MissingPerson>('/api/missing', {
        name, age: age || null, gender: gender || null,
        last_location: lastLocation, description: description || null,
        contact_name: contactName, contact_phone: contactPhone,
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['missing'] })
      setSubmittedName(name)
      setName(''); setAge(''); setGender(''); setLastLocation('')
      setDescription(''); setContactName(''); setContactPhone('')
      setPhoto(null); setErrors({})
      if (fileRef.current) fileRef.current.value = ''
      onSuccess?.()
      playCue('success')
    },
    onError: () => { playCue('error') },
  })

  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!name.trim()) errs.name = t('This field is required', 'এই ক্ষেত্রটি প্রয়োজনীয়')
    if (!lastLocation.trim()) errs.lastLocation = t('This field is required', 'এই ক্ষেত্রটি প্রয়োজনীয়')
    if (!contactName.trim()) errs.contactName = t('This field is required', 'এই ক্ষেত্রটি প্রয়োজনীয়')
    if (!contactPhone.trim()) {
      errs.contactPhone = t('This field is required', 'এই ক্ষেত্রটি প্রয়োজনীয়')
    } else if (!PHONE_REGEX.test(contactPhone.trim())) {
      errs.contactPhone = t('Invalid phone number', 'অবৈধ ফোন নম্বর')
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    mutation.mutate()
  }

  if (submittedName) {
    return (
      <div className="bg-surface border border-primary p-6 text-center space-y-3">
        <p className="text-text-primary font-bold">
          {t('Report submitted for', 'এর জন্য রিপোর্ট জমা দেওয়া হয়েছে')}
        </p>
        <p className="text-lg font-bold text-primary">{submittedName}</p>
        <button
          onClick={() => setSubmittedName('')}
          className="px-4 py-2 text-sm font-bold uppercase tracking-wider border border-border text-text-muted hover:text-text-primary min-h-[44px]"
        >
          {t('Submit Another', 'আরেকটি জমা দিন')}
        </button>
      </div>
    )
  }

  const fieldId = (name: string) => `missing-${name}`
  const Field = ({ id, label, labelBn, children, error, required }: {
    id: string; label: string; labelBn: string; children: React.ReactNode; error?: string; required?: boolean
  }) => (
    <div className="space-y-1">
      <label htmlFor={fieldId(id)} className="section-label">
        {lang === 'bn' ? labelBn : label}{required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-caption text-danger">{error}</p>}
    </div>
  )

  return (
    <form onSubmit={submit} className="space-y-4">
      {isOffline && (
        <div className="bg-surface border border-border p-3">
          <p className="text-sm text-text-muted">
            {t('This report will sync to the central server when connectivity returns.', 'সংযোগ ফিরে এলে এই রিপোর্ট কেন্দ্রীয় সার্ভারে সিঙ্ক হবে।')}
          </p>
        </div>
      )}

      <Field id="name" label="Name" labelBn="নাম" error={errors.name} required>
        <input id={fieldId('name')} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="age" label="Age" labelBn="বয়স">
          <input id={fieldId('age')} type="number" value={age} onChange={(e) => setAge(e.target.value)} className="input-field" />
        </Field>
        <Field id="gender" label="Gender" labelBn="লিঙ্গ">
          <select id={fieldId('gender')} value={gender} onChange={(e) => setGender(e.target.value)} className="input-field">
            <option value="">—</option>
            <option value="male">{t('Male', 'পুরুষ')}</option>
            <option value="female">{t('Female', 'নারী')}</option>
            <option value="other">{t('Other', 'অন্যান্য')}</option>
          </select>
        </Field>
      </div>

      <Field id="location" label="Last Known Location" labelBn="শেষ অবস্থান" error={errors.lastLocation} required>
        <input id={fieldId('location')} autoComplete="street-address" value={lastLocation} onChange={(e) => setLastLocation(e.target.value)} className="input-field" />
      </Field>

      <Field id="description" label="Description" labelBn="বর্ণনা">
        <textarea id={fieldId('description')} value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-field resize-none" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field id="contact-name" label="Contact Name" labelBn="যোগাযোগের নাম" error={errors.contactName} required>
          <input id={fieldId('contact-name')} autoComplete="name" value={contactName} onChange={(e) => setContactName(e.target.value)} className="input-field" />
        </Field>
        <Field id="contact-phone" label="Contact Phone" labelBn="যোগাযোগের ফোন" error={errors.contactPhone} required>
          <input id={fieldId('contact-phone')} autoComplete="tel" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} placeholder="+8801XXXXXXXXX" className="input-field" />
        </Field>
      </div>

      <Field id="photo" label="Photo (optional)" labelBn="ছবি (ঐচ্ছিক)">
        <div className="flex items-center gap-3">
          <input ref={fileRef} type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} className="text-sm text-text-muted file:mr-3 file:py-2 file:px-4 file:border file:border-border file:bg-surface file:text-text-primary file:text-sm file:font-bold file:uppercase file:tracking-wider file:cursor-pointer" />
          {photo && <span className="text-xs text-text-muted">{photo.name}</span>}
        </div>
      </Field>

      <button
        type="submit"
        disabled={mutation.isPending}
        className="btn-primary w-full"
      >
        {mutation.isPending ? t('Submitting...', 'জমা দেওয়া হচ্ছে...') : t('Submit Report', 'রিপোর্ট জমা দিন')}
      </button>

      {mutation.isError && (
        <p className="text-sm text-danger">
          {t('Failed to submit. Try again.', 'জমা দিতে ব্যর্থ। আবার চেষ্টা করুন।')}
        </p>
      )}
    </form>
  )
}
