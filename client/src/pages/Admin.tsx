import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/utils'
import AdminLogin from '@/components/Admin/AdminLogin'
import PostCard from '@/components/Noticeboard/PostCard'
import type { Post, Checkin, MissingPerson, MapPin, ApiResponse } from '@/types'
import { Users, HeartPulse, ClipboardList, Radio, UserSearch, RefreshCw, LogOut } from 'lucide-react'

function MissingStatusSection() {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery<ApiResponse<MissingPerson[]>>({
    queryKey: ['missing'],
    queryFn: () => api.get<MissingPerson[]>('/missing'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/missing/${id}/status`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['missing'] }),
  })

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      missing: 'bg-danger-muted text-danger',
      found: 'bg-success-muted text-success',
      unverified: 'bg-warning-muted text-warning',
    }
    return (
      <span className={`text-caption font-bold uppercase tracking-wider px-2 py-1 ${colors[status] ?? ''}`}>{status}</span>
    )
  }

  if (isLoading) return <div className="space-y-3">{[1,2].map(i => <div key={i} className="animate-pulse h-16 bg-surface" />)}</div>
  if (isError) return <div className="error-state"><p className="text-body text-danger">{t('Could not load missing persons.', 'নিখোঁজ ব্যক্তিদের লোড করা যায়নি।')}</p></div>
  if (!data?.data || data.data.length === 0) return <div className="bg-surface border border-border p-6 text-center"><p className="text-sm text-text-muted">{t('No missing person reports.', 'কোনো নিখোঁজ রিপোর্ট নেই।')}</p></div>

  return (
    <div className="space-y-3">
      {data.data.map((person) => (
        <div key={person.id} className="bg-surface border border-border p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-bold text-text-primary">{person.name}</h3>
              <p className="text-xs text-text-muted">{person.lastLocation}</p>
            </div>
            {statusBadge(person.status)}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['missing', 'found', 'unverified'] as const).map((s) => (
              <button
                key={s}
                onClick={() => statusMutation.mutate({ id: person.id, status: s })}
                disabled={person.status === s || statusMutation.isPending}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border min-h-[44px] ${
                  person.status === s
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background text-text-muted border-border hover:text-text-primary'
                }`}
              >
                {t(s.charAt(0).toUpperCase() + s.slice(1), s)}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SyncStatusSection() {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  const { data: missingData } = useQuery<ApiResponse<MissingPerson[]>>({
    queryKey: ['missing'],
    queryFn: () => api.get<MissingPerson[]>('/missing'),
  })

  const { data: pinsData } = useQuery<ApiResponse<MapPin[]>>({
    queryKey: ['pins'],
    queryFn: () => api.get<MapPin[]>('/pins'),
  })

  const missingTotal = missingData?.data?.length ?? 0
  const missingSynced = missingData?.data?.filter((m: MissingPerson) => m.synced).length ?? 0
  const pinsTotal = pinsData?.data?.length ?? 0
  const pinsSynced = pinsData?.data?.filter((p: MapPin) => p.synced).length ?? 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-surface border border-border p-6">
          <p className="text-sm text-text-muted uppercase tracking-wider mb-2">{t('Missing Persons', 'নিখোঁজ ব্যক্তি')}</p>
          <p className="text-3xl font-bold text-text-primary tabular-nums">{missingSynced} / {missingTotal}</p>
          <p className="text-xs text-text-muted mt-1">{t('synced to remote', 'রিমোটে সিঙ্ক হয়েছে')}</p>
        </div>
        <div className="bg-surface border border-border p-6">
          <p className="text-sm text-text-muted uppercase tracking-wider mb-2">{t('Map Pins', 'মানচিত্র পিন')}</p>
          <p className="text-3xl font-bold text-text-primary tabular-nums">{pinsSynced} / {pinsTotal}</p>
          <p className="text-xs text-text-muted mt-1">{t('synced to remote', 'রিমোটে সিঙ্ক হয়েছে')}</p>
        </div>
      </div>
      {missingTotal === 0 && pinsTotal === 0 && (
        <div className="bg-surface border border-border p-6 text-center">
          <p className="text-sm text-text-muted">{t('Nothing to sync yet.', 'সিঙ্ক করার মতো কিছু নেই।')}</p>
        </div>
      )}
      <div className="bg-surface border border-border p-4">
        <p className="text-xs text-text-muted">
          {t('Sync is one-directional: local → remote. Data syncs every 5 minutes when internet is available.', 'সিঙ্ক একমুখী: লোকাল → রিমোট। ইন্টারনেট থাকলে প্রতি ৫ মিনিটে ডেটা সিঙ্ক হয়।')}
        </p>
      </div>
    </div>
  )
}

export default function Admin() {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)
  const adminToken = useAuthStore((s) => s.adminToken)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [section, setSection] = useState(0)

  if (!adminToken) return <AdminLogin />

  const handleLogout = () => {
    logout()
    navigate('/chat')
  }

  const sections = [
    { label: t('Users', 'ব্যবহারকারী'), Icon: Users },
    { label: t('Check-ins', 'চেক-ইন'), Icon: HeartPulse },
    { label: t('Posts', 'পোস্ট'), Icon: ClipboardList },
    { label: t('Missing', 'নিখোঁজ'), Icon: UserSearch },
    { label: t('Sync', 'সিঙ্ক'), Icon: RefreshCw },
    { label: t('Broadcast', 'সম্প্রচার'), Icon: Radio },
  ]

  const { data: connData, isLoading: connLoading, isError: connError } = useQuery<ApiResponse<{ count: number }>>({
    queryKey: ['admin-connections'],
    queryFn: () => api.get<{ count: number }>('/admin/connections'),
    refetchInterval: 10_000,
  })

  const { data: checkinData, isLoading: checkinLoading, isError: checkinError } = useQuery<ApiResponse<Checkin[]>>({
    queryKey: ['admin-checkins'],
    queryFn: () => api.get<Checkin[]>('/checkin/status'),
    refetchInterval: 10_000,
  })

  const { data: postsData, isLoading: postsLoading, isError: postsError } = useQuery<ApiResponse<Post[]>>({
    queryKey: ['posts'],
    queryFn: () => api.get<Post[]>('/posts'),
  })

  const pinMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.patch(`/posts/${id}/pin`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const [broadcastText, setBroadcastText] = useState('')
  const [broadcastSent, setBroadcastSent] = useState(false)
  const broadcastMutation = useMutation({
    mutationFn: () => api.post('/admin/broadcast', { message: broadcastText }),
    onSuccess: () => { setBroadcastSent(true); setBroadcastText('') },
  })

  const statusBadge = (status: string) => {
    const isUnresponsive = status === 'unresponsive'
    return (
      <span className={`text-caption font-bold uppercase tracking-wider px-2 py-1 ${isUnresponsive ? 'bg-danger-muted text-danger' : 'bg-primary-muted text-primary'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display font-heading text-heading text-text-heading">
          {t('Admin Panel', 'অ্যাডমিন প্যানেল')}
        </h1>
        <button
          onClick={handleLogout}
          className="btn-ghost flex items-center gap-2 hover:text-danger hover:border-danger"
        >
          <LogOut size={16} />
          {t('Logout', 'লগআউট')}
        </button>
      </div>

      <div className="flex gap-1 bg-surface border border-border p-1 w-fit flex-wrap">
        {sections.map(({ label, Icon }, i) => (
          <button
            key={i}
            onClick={() => setSection(i)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold uppercase tracking-wider min-h-[44px] ${
              section === i ? 'bg-primary text-white' : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>      {section === 0 && (
        <div className="space-y-3">
          {connLoading && <div className="animate-pulse h-6 bg-surface w-32" />}
          {connError && <div className="error-state"><p className="text-body text-danger">{t('Could not load connections.', 'সংযোগ লোড করা যায়নি।')}</p></div>}
          {connData?.data && (
            <div className="bg-surface border border-border p-6">
              <p className="text-3xl font-bold text-text-primary tabular-nums">{connData.data.count}</p>
              <p className="text-sm text-text-muted uppercase tracking-wider">{t('Connected Users', 'সংযুক্ত ব্যবহারকারী')}</p>
            </div>
          )}
        </div>
      )}      {section === 1 && (
        <div className="space-y-3">
          {checkinLoading && [1, 2, 3].map((i) => <div key={i} className="animate-pulse h-12 bg-surface" />)}
          {checkinError && <div className="error-state"><p className="text-body text-danger">{t('Could not load check-ins.', 'চেক-ইন লোড করা যায়নি।')}</p></div>}
          {checkinData?.data && checkinData.data.length === 0 && (
            <div className="bg-surface border border-border p-6 text-center"><p className="text-sm text-text-muted">{t('No check-in registrations yet.', 'এখনো কোনো চেক-ইন নিবন্ধন নেই।')}</p></div>
          )}
          {checkinData?.data && checkinData.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
                    <th className="text-left p-3 font-bold">{t('Name', 'নাম')}</th>
                    <th className="text-left p-3 font-bold">{t('Interval', 'ব্যবধান')}</th>
                    <th className="text-left p-3 font-bold">{t('Last Check-in', 'শেষ চেক-ইন')}</th>
                    <th className="text-left p-3 font-bold">{t('Status', 'অবস্থা')}</th>
                  </tr>
                </thead>
                <tbody>
                  {checkinData.data.map((c) => (
                    <tr key={c.id} className={`border-b border-border ${c.status === 'unresponsive' ? 'bg-danger/5' : ''}`}>
                      <td className="p-3 font-bold text-text-primary">{c.displayName}</td>
                      <td className="p-3 text-text-muted">{c.intervalHours}{t('h', 'ঘ')}</td>
                      <td className="p-3 text-text-muted">{timeAgo(c.lastCheckinAt)}</td>
                      <td className="p-3">{statusBadge(c.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}      {section === 2 && (
        <div className="space-y-3">
          {postsLoading && [1, 2].map((i) => <div key={i} className="animate-pulse h-20 bg-surface" />)}
          {postsError && <div className="error-state"><p className="text-body text-danger">{t('Could not load posts.', 'পোস্ট লোড করা যায়নি।')}</p></div>}
          {postsData?.data && postsData.data.length === 0 && (
            <div className="bg-surface border border-border p-6 text-center"><p className="text-sm text-text-muted">{t('No posts yet.', 'এখনো কোনো পোস্ট নেই।')}</p></div>
          )}
          {postsData?.data && postsData.data.length > 0 && (
            <div className="space-y-3">
              {postsData.data.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isAdmin={true}
                  onPin={(id) => pinMutation.mutate({ id })}
                  onDelete={(id) => { if (window.confirm(t('Delete this post?', 'এই পোস্টটি মুছবেন?'))) deleteMutation.mutate(id) }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {section === 3 && <MissingStatusSection />}

      {section === 4 && <SyncStatusSection />}

      {section === 5 && (
        <div className="max-w-lg space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-text-primary uppercase tracking-wider">
              {t('Broadcast Message', 'সম্প্রচার বার্তা')}
            </label>
            <textarea
              value={broadcastText}
              onChange={(e) => { setBroadcastText(e.target.value); setBroadcastSent(false) }}
              rows={4}
              className="input-field resize-none"
              placeholder={t('Type your emergency broadcast...', 'আপনার জরুরি সম্প্রচার টাইপ করুন...')}
            />
          </div>

          <button
            onClick={() => broadcastMutation.mutate()}
            disabled={!broadcastText.trim() || broadcastMutation.isPending}
            className="w-full bg-danger text-white font-bold uppercase tracking-wider py-3 disabled:opacity-50 min-h-[44px]"
          >
            {broadcastMutation.isPending ? t('Sending...', 'পাঠানো হচ্ছে...') : t('Send Broadcast', 'সম্প্রচার পাঠান')}
          </button>

          {broadcastSent && (
            <div className="border border-primary-muted bg-primary-muted p-3">
              <p className="text-body text-primary">
                {t('Broadcast sent to all connected users.', 'সমস্ত সংযুক্ত ব্যবহারকারীদের কাছে সম্প্রচার পাঠানো হয়েছে।')}
              </p>
            </div>
          )}

          {broadcastMutation.isError && (
            <p className="text-sm text-danger">{t('Failed to send broadcast.', 'সম্প্রচার পাঠাতে ব্যর্থ।')}</p>
          )}
        </div>
      )}
    </div>
  )
}
