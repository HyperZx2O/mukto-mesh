import PageStub from '@/components/PageStub'
import { useAuthStore } from '@/store/useAuthStore'
import { useLanguageStore } from '@/store/useLanguageStore'

export default function Admin() {
  const adminToken = useAuthStore((s) => s.adminToken)
  const lang = useLanguageStore((s) => s.lang)

  if (!adminToken) {
    return (
      <div className="p-4">
        <h1 className="text-2xl font-bold text-text-primary">Admin</h1>
        <p className="text-text-muted mt-2">
          {lang === 'bn' ? 'অনুমোদিত নয়' : 'Not authorised'}
        </p>
      </div>
    )
  }

  return <PageStub title="Admin" titleBn="অ্যাডমিন" />
}
