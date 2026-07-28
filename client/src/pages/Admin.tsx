import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/utils'
import AdminLogin from '@/components/Admin/AdminLogin'
import PostCard from '@/components/Noticeboard/PostCard'
import type { Post, Checkin, ApiResponse } from '@/types'
import { Users, HeartPulse, ClipboardList, Radio, LogOut } from 'lucide-react'

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
    mutationFn: ({ id, pinned }: { id: string; pinned: boolean }) =>
      api.patch(`/posts/${id}`, { pinned }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  })

  const [broadcastText, setBroadcastText] = useState('')
  const [broadcastSent, setBroadcastSent] = useState(false)
  const broadcastMutation = useMutation({
    mutationFn: () => api.post('/admin/broadcast', { content: broadcastText }),
    onSuccess: () => { setBroadcastSent(true); setBroadcastText('') },
  })

  const statusBadge = (status: string) => {
    const isUnresponsive = status === 'unresponsive'
    return (
      <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 ${isUnresponsive ? 'bg-danger/20 text-danger' : 'bg-primary/20 text-primary'}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-text-primary uppercase tracking-wider">
          {t('Admin Panel', 'অ্যাডমিন প্যানেল')}
        </h1>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-3 text-sm font-bold uppercase tracking-wider text-text-muted border border-border min-h-[44px] hover:text-danger hover:border-danger"
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
        <div className="space-y-3">
          {connLoading && <div className="animate-pulse h-6 bg-surface w-32" />}
          {connError && <div className="border border-danger/30 bg-danger/10 p-4"><p className="text-sm text-danger">{t('Could not load connections.', 'সংযোগ লোড করা যায়নি।')}</p></div>}
          {connData?.data && (
            <div className="bg-surface border border-border p-6">
              <p className="text-3xl font-bold text-text-primary tabular-nums">{connData.data.count}</p>
              <p className="text-sm text-text-muted uppercase tracking-wider">{t('Connected Users', 'সংযুক্ত ব্যবহারকারী')}</p>
            </div>
          )}
        </div>
      )}

      {section === 1 && (
        <div className="space-y-3">
          {checkinLoading && [1, 2, 3].map((i) => <div key={i} className="animate-pulse h-12 bg-surface" />)}
          {checkinError && <div className="border border-danger/30 bg-danger/10 p-4"><p className="text-sm text-danger">{t('Could not load check-ins.', 'চেক-ইন লোড করা যায়নি।')}</p></div>}
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
          {postsError && <div className="border border-danger/30 bg-danger/10 p-4"><p className="text-sm text-danger">{t('Could not load posts.', 'পোস্ট লোড করা যায়নি।')}</p></div>}
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
                  onPin={(id, pinned) => pinMutation.mutate({ id, pinned })}
                  onDelete={(id) => { if (window.confirm(t('Delete this post?', 'এই পোস্টটি মুছবেন?'))) deleteMutation.mutate(id) }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {section === 3 && (
        <div className="max-w-lg space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-bold text-text-primary uppercase tracking-wider">
              {t('Broadcast Message', 'সম্প্রচার বার্তা')}
            </label>
            <textarea
              value={broadcastText}
              onChange={(e) => { setBroadcastText(e.target.value); setBroadcastSent(false) }}
              rows={4}
              className="w-full bg-surface border border-border text-text-primary p-3 text-sm outline-none focus:border-primary resize-none"
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
            <div className="border border-primary/30 bg-primary/10 p-3">
              <p className="text-sm text-primary">
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
