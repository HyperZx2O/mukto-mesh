import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { playCue } from '@/lib/uiSFX'
import { timeAgo } from '@/lib/utils'
import AdminLogin from '@/components/Admin/AdminLogin'
import PostCard from '@/components/Noticeboard/PostCard'
import type { Post, Checkin, MissingPerson, MapPin, ApiResponse } from '@/types'
import { Users, HeartPulse, ClipboardList, Radio, UserSearch, RefreshCw, LogOut, Trash2 } from 'lucide-react'

function MissingStatusSection() {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const [pendingId, setPendingId] = useState<string | null>(null)

  const { data, isLoading, isError } = useQuery<ApiResponse<MissingPerson[]>>({
    queryKey: ['missing'],
    queryFn: () => api.get<MissingPerson[]>('/api/missing'),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/api/missing/${id}/status`, { status }),
    onMutate: ({ id }) => setPendingId(id),
    onSettled: () => setPendingId(null),
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

  const people = data?.data ?? []
  const filtered = !search.trim()
    ? people
    : people.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.lastLocation.toLowerCase().includes(search.toLowerCase()) ||
        p.status.includes(search.toLowerCase())
      )

  return (
    <div className="space-y-3">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('Search by name, location or status...', 'নাম, অবস্থান বা স্ট্যাটাস অনুসন্ধান...')}
        className="input-field"
      />
      {filtered.length === 0 && (
        <div className="bg-surface border border-border p-6 text-center">
          <p className="text-sm text-text-muted">
            {search ? t('No results found.', 'কোনো ফলাফল পাওয়া যায়নি।') : t('No missing person reports.', 'কোনো নিখোঁজ রিপোর্ট নেই।')}
          </p>
        </div>
      )}
      {filtered.map((person) => (
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
                disabled={person.status === s || (pendingId === person.id && statusMutation.isPending)}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border min-h-[44px] ${
                  person.status === s
                    ? 'bg-primary text-white border-primary'
                    : 'bg-background text-text-muted border-border hover:text-text-primary'
                }`}
              >
                {pendingId === person.id && statusMutation.isPending
                  ? '...'
                  : t(s.charAt(0).toUpperCase() + s.slice(1), s)}
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
    queryFn: () => api.get<MissingPerson[]>('/api/missing'),
  })

  const { data: pinsData } = useQuery<ApiResponse<MapPin[]>>({
    queryKey: ['pins'],
    queryFn: () => api.get<MapPin[]>('/api/pins'),
  })

  const missingTotal = missingData?.data?.length ?? 0
  const missingSynced = missingData?.data?.filter((m: MissingPerson) => m.synced).length ?? 0
  const pinsTotal = pinsData?.data?.length ?? 0
  const pinsSynced = pinsData?.data?.filter((p: MapPin) => p.synced).length ?? 0

  function SyncBar({ label, synced, total }: { label: string; synced: number; total: number }) {
    const pct = total > 0 ? Math.round((synced / total) * 100) : 0
    return (
      <div className="bg-surface border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-text-muted uppercase tracking-wider">{label}</p>
          <p className="text-sm font-bold text-text-primary tabular-nums">{synced} / {total}</p>
        </div>
        <div className="h-2 bg-background">
          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <SyncBar
        label={t('Missing Persons', 'নিখোঁজ ব্যক্তি')}
        synced={missingSynced}
        total={missingTotal}
      />
      <SyncBar
        label={t('Map Pins', 'মানচিত্র পিন')}
        synced={pinsSynced}
        total={pinsTotal}
      />
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

function ClearChatButton() {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)
  const [confirming, setConfirming] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleClear = async () => {
    setClearing(true)
    setError(null)
    const res = await api.delete<{ ok: boolean }>('/api/admin/messages')
    if (res.error) {
      setError(res.error)
      playCue('error')
    } else {
      setDone(true)
      setConfirming(false)
    }
    setClearing(false)
  }

  if (done) {
    return (
      <div className="border border-success-muted bg-success-muted p-3">
        <p className="text-body text-success">{t('Chat history cleared.', 'চ্যাট ইতিহাস মুছে ফেলা হয়েছে।')}</p>
      </div>
    )
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={handleClear}
          disabled={clearing}
          className="bg-danger text-white font-bold uppercase tracking-wider px-4 py-2 disabled:opacity-50 min-h-[44px]"
        >
          {clearing ? t('Clearing...', 'মুছে ফেলা হচ্ছে...') : t('Yes, Clear Everything', 'হ্যাঁ, সব মুছুন')}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="btn-ghost min-h-[44px]"
        >
          {t('Cancel', 'বাতিল')}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <button
        onClick={() => setConfirming(true)}
        className="border border-danger text-danger font-bold uppercase tracking-wider px-4 py-2 hover:bg-danger hover:text-white transition-colors min-h-[44px]"
      >
        {t('Clear Chat History', 'চ্যাট ইতিহাস মুছুন')}
      </button>
      {error && (
        <p className="text-sm text-danger">{error}</p>
      )}
    </div>
  )
}

/** Authenticated admin panel — extracted into its own component to avoid
 *  conditional hooks (React error #310). Admin() renders this only when
 *  adminToken is truthy, so hooks here always run in the same count/order. */
function AdminPanel({ onLogout, section, setSection }: {
  onLogout: () => void
  section: number
  setSection: (s: number) => void
}) {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)
  const queryClient = useQueryClient()

  const sections = [
    { label: t('Dashboard', 'ড্যাশবোর্ড'), Icon: Users },
    { label: t('Check-ins', 'চেক-ইন'), Icon: HeartPulse },
    { label: t('Posts', 'পোস্ট'), Icon: ClipboardList },
    { label: t('Missing', 'নিখোঁজ'), Icon: UserSearch },
    { label: t('Sync', 'সিঙ্ক'), Icon: RefreshCw },
    { label: t('Broadcast', 'সম্প্রচার'), Icon: Radio },
    { label: 'Danger', Icon: Trash2 },
  ]

  const { data: connData, isLoading: connLoading, isError: connError } = useQuery<ApiResponse<{ count: number }>>({
    queryKey: ['admin-connections'],
    queryFn: () => api.get<{ count: number }>('/api/admin/connections'),
    refetchInterval: 10_000,
  })

  const { data: checkinData, isLoading: checkinLoading, isError: checkinError } = useQuery<ApiResponse<Checkin[]>>({
    queryKey: ['admin-checkins'],
    queryFn: () => api.get<Checkin[]>('/api/checkin/status'),
    refetchInterval: 10_000,
  })

  const { data: postsData, isLoading: postsLoading, isError: postsError } = useQuery<ApiResponse<Post[]>>({
    queryKey: ['posts'],
    queryFn: () => api.get<Post[]>('/api/posts'),
  })

  const pinMutation = useMutation({
    mutationFn: ({ id }: { id: string }) =>
      api.patch(`/api/posts/${id}/pin`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/api/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const { data: missingData } = useQuery<ApiResponse<MissingPerson[]>>({
    queryKey: ['missing'],
    queryFn: () => api.get<MissingPerson[]>('/api/missing'),
  })

  const { data: pinsData } = useQuery<ApiResponse<MapPin[]>>({
    queryKey: ['pins'],
    queryFn: () => api.get<MapPin[]>('/api/pins'),
  })

  const activeCheckins = useMemo(() => checkinData?.data?.filter((c) => c.status === 'active').length ?? 0, [checkinData])
  const unresponsiveCheckins = useMemo(() => checkinData?.data?.filter((c) => c.status === 'unresponsive').length ?? 0, [checkinData])
  const missingCount = useMemo(() => missingData?.data?.filter((m) => m.status === 'missing').length ?? 0, [missingData])
  const foundCount = useMemo(() => missingData?.data?.filter((m) => m.status === 'found').length ?? 0, [missingData])

  const [postSearch, setPostSearch] = useState('')
  const filteredPosts = useMemo(() => {
    if (!postsData?.data) return []
    if (!postSearch.trim()) return postsData.data
    const q = postSearch.toLowerCase()
    return postsData.data.filter((p) => p.content.toLowerCase().includes(q) || p.tag.includes(q) || p.displayName.toLowerCase().includes(q))
  }, [postsData, postSearch])

  const [broadcastText, setBroadcastText] = useState('')
  const [broadcastSent, setBroadcastSent] = useState(false)
  const BROADCAST_MAX = 500
  const broadcastMutation = useMutation({
    mutationFn: () => api.post('/api/admin/broadcast', { message: broadcastText }),
    onSuccess: () => { setBroadcastSent(true); setBroadcastText(''); playCue('send') },
    onError: () => { playCue('error') },
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
          onClick={onLogout}
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
      </div>

      {section === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-surface border border-border p-6">
            <p className="text-3xl font-bold text-text-primary tabular-nums">
              {connLoading ? '..' : connError ? '—' : connData?.data?.count ?? '—'}
            </p>
            <p className="text-sm text-text-muted uppercase tracking-wider mt-1">{t('Connected Users', 'সংযুক্ত ব্যবহারকারী')}</p>
          </div>
          <div className="bg-surface border border-border p-6">
            <p className="text-3xl font-bold text-text-primary tabular-nums">
              {checkinLoading ? '..' : checkinError ? '—' : `${activeCheckins} / ${unresponsiveCheckins}`}
            </p>
            <p className="text-sm text-text-muted uppercase tracking-wider mt-1">{t('Check-ins (Active / Unresponsive)', 'চেক-ইন (সক্রিয় / প্রতিক্রিয়াহীন)')}</p>
          </div>
          <div className="bg-surface border border-border p-6">
            <p className="text-3xl font-bold text-text-primary tabular-nums">{postsData?.data?.length ?? '—'}</p>
            <p className="text-sm text-text-muted uppercase tracking-wider mt-1">{t('Posts', 'পোস্ট')}</p>
          </div>
          <div className="bg-surface border border-border p-6">
            <p className="text-3xl font-bold text-text-primary tabular-nums">{missingCount} / {foundCount}</p>
            <p className="text-sm text-text-muted uppercase tracking-wider mt-1">{t('Missing / Found', 'নিখোঁজ / পাওয়া')}</p>
          </div>
          <div className="bg-surface border border-border p-6">
            <p className="text-3xl font-bold text-text-primary tabular-nums">{pinsData?.data?.length ?? '—'}</p>
            <p className="text-sm text-text-muted uppercase tracking-wider mt-1">{t('Map Pins', 'মানচিত্র পিন')}</p>
          </div>
        </div>
      )}

      {section === 1 && (
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
      )}

      {section === 2 && (
        <div className="space-y-3">
          {postsLoading && [1, 2].map((i) => <div key={i} className="animate-pulse h-20 bg-surface" />)}
          {postsError && <div className="error-state"><p className="text-body text-danger">{t('Could not load posts.', 'পোস্ট লোড করা যায়নি।')}</p></div>}
          {postsData?.data && (
            <>
              <input
                value={postSearch}
                onChange={(e) => setPostSearch(e.target.value)}
                placeholder={t('Search posts by content, tag or author...', 'পোস্ট অনুসন্ধান করুন...')}
                className="input-field"
              />
              {filteredPosts.length === 0 && (
                <div className="bg-surface border border-border p-6 text-center">
                  <p className="text-sm text-text-muted">
                    {postSearch ? t('No matching posts.', 'কোনো মিল পাওয়া যায়নি।') : t('No posts yet.', 'এখনো কোনো পোস্ট নেই।')}
                  </p>
                </div>
              )}
              {filteredPosts.length > 0 && (
                <div className="space-y-3">
                  {filteredPosts.map((post) => (
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
            </>
          )}
        </div>
      )}

      {section === 3 && <MissingStatusSection />}
      {section === 4 && (
        <div className="space-y-4">
          <h2 className="section-head">{t('Data Sync Status', 'ডেটা সিঙ্ক স্ট্যাটাস')}</h2>
          <SyncStatusSection />
        </div>
      )}

      {section === 5 && (
        <div className="max-w-lg space-y-4">
          <div className="space-y-1">
            <label htmlFor="broadcast-message" className="text-sm font-bold text-text-primary uppercase tracking-wider">
              {t('Broadcast Message', 'সম্প্রচার বার্তা')}
            </label>
            <textarea
              id="broadcast-message"
              value={broadcastText}
              onChange={(e) => { if (e.target.value.length <= BROADCAST_MAX) setBroadcastText(e.target.value); setBroadcastSent(false) }}
              rows={4}
              className="input-field resize-none"
              placeholder={t('Type your emergency broadcast...', 'আপনার জরুরি সম্প্রচার টাইপ করুন...')}
            />
            <div className="flex justify-end">
              <span className={`text-xs ${broadcastText.length > BROADCAST_MAX * 0.9 ? 'text-danger' : 'text-text-muted'}`}>
                {broadcastText.length} / {BROADCAST_MAX}
              </span>
            </div>
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

      {section === 6 && (
        <div className="max-w-lg space-y-4">
          <h2 className="section-head">{t('Danger Zone', 'ডেঞ্জার জোন')}</h2>
          <p className="text-body text-text-muted">
            {t('These actions are irreversible. Proceed with caution.', 'এই ক্রিয়াগুলি অপরিবর্তনীয়। সাবধানতার সাথে এগিয়ে যান।')}
          </p>

          <div className="bg-surface border border-danger/30 p-6 space-y-3">
            <h3 className="font-bold text-text-primary">{t('Clear Chat History', 'চ্যাট ইতিহাস মুছুন')}</h3>
            <p className="text-sm text-text-muted">
              {t('Delete every message from all channels. All users will see an empty chat.', 'সমস্ত চ্যানেল থেকে প্রতিটি বার্তা মুছুন। সমস্ত ব্যবহারকারী একটি খালি চ্যাট দেখতে পাবেন।')}
            </p>
            <ClearChatButton />
          </div>
        </div>
      )}
    </div>
  )
}

export default function Admin() {
  const adminToken = useAuthStore((s) => s.adminToken)
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()
  const [section, setSection] = useState(0)

  if (!adminToken) return <AdminLogin />

  const handleLogout = () => {
    logout()
    navigate('/chat')
  }

  return (
    <AdminPanel
      onLogout={handleLogout}
      section={section}
      setSection={setSection}
    />
  )
}
