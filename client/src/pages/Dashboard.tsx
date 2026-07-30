import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useLanguageStore } from '@/store/useLanguageStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useWs } from '@/lib/ws'
import { api } from '@/lib/api'
import { timeAgo } from '@/lib/utils'
import OnlineUsers from '@/components/Chat/OnlineUsers'
import type { Post, MissingPerson, NewsArticle, MapPin, NodeStatus, ApiResponse } from '@/types'
import {
  MessageSquare, ClipboardList, BookOpen, Users, MapPin as MapPinIcon,
  Newspaper, ShieldAlert, Wifi, HeartPulse,
  ArrowRight, Clock, LayoutDashboard,
} from 'lucide-react'

const quickLinks = [
  { path: '/chat', label: 'Chat', labelBn: 'চ্যাট', icon: MessageSquare, desc: 'Real-time messaging', descBn: 'রিয়েল-টাইম বার্তা' },
  { path: '/board', label: 'Board', labelBn: 'বোর্ড', icon: ClipboardList, desc: 'Community alerts & updates', descBn: 'কমিউনিটি এলার্ট ও আপডেট' },
  { path: '/info', label: 'Info', labelBn: 'তথ্য', icon: BookOpen, desc: 'Know your rights & first aid', descBn: 'আপনার অধিকার ও প্রাথমিক চিকিৎসা' },
  { path: '/people', label: 'People', labelBn: 'জনগণ', icon: Users, desc: 'Find missing persons', descBn: 'নিখোঁজ ব্যক্তি অনুসন্ধান' },
  { path: '/map', label: 'Map', labelBn: 'মানচিত্র', icon: MapPinIcon, desc: 'Offline Bangladesh map', descBn: 'অফলাইন বাংলাদেশ মানচিত্র' },
  { path: '/news', label: 'News', labelBn: 'সংবাদ', icon: Newspaper, desc: 'Verified news feed', descBn: 'যাচাইকৃত সংবাদ' },
]

function DashboardSkeleton() {
  return (
    <div className="space-y-5 sm:space-y-6 animate-pulse">
      <div className="h-8 sm:h-9 bg-surface w-48 sm:w-64 rounded" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-24 sm:h-28 bg-surface border border-border rounded" />
        ))}
      </div>
      <div className="h-5 sm:h-6 bg-surface w-32 sm:w-48 rounded" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="h-20 sm:h-24 bg-surface border border-border rounded" />
        ))}
      </div>
    </div>
  )
}

function MetricCard({
  label, labelBn, value, sub, Icon, trend,
}: {
  label: string; labelBn: string; value: string | number; sub?: string; Icon: React.ComponentType<{ size?: number; className?: string }>; trend?: 'up' | 'down' | 'neutral'
}) {
  const lang = useLanguageStore((s) => s.lang)
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  return (
    <div className="metric-card group">
      <div className="flex items-center justify-between">
        <Icon size={18} className="text-text-dim group-hover:text-primary-text transition-colors duration-fast" />
        {trend && (
          <span className={`text-caption font-bold uppercase tracking-wider ${
            trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-text-muted'
          }`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
          </span>
        )}
      </div>
      <p className="stat-value">{value}</p>
      <p className="text-caption text-text-muted uppercase tracking-wider leading-tight">{t(label, labelBn)}</p>
      {sub && <p className="text-caption text-text-dim leading-tight hidden sm:block">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const lang = useLanguageStore((s) => s.lang)
  const displayName = useAuthStore((s) => s.displayName)
  const isAdmin = useAuthStore((s) => s.isAdmin)
  const connectionStatus = useWs((s) => s.connectionStatus)
  const navigate = useNavigate()
  const t = (en: string, bn: string) => (lang === 'bn' ? bn : en)

  // Public data queries
  const { data: postsData, isLoading: postsLoading } = useQuery<ApiResponse<Post[]>>({
    queryKey: ['posts'],
    queryFn: () => api.get<Post[]>('/api/posts'),
    refetchInterval: 30_000,
  })

  const { data: missingData, isLoading: missingLoading } = useQuery<ApiResponse<MissingPerson[]>>({
    queryKey: ['missing'],
    queryFn: () => api.get<MissingPerson[]>('/api/missing'),
    refetchInterval: 30_000,
  })

  const { data: newsData, isLoading: newsLoading } = useQuery<ApiResponse<NewsArticle[]>>({
    queryKey: ['news'],
    queryFn: () => api.get<NewsArticle[]>('/api/news'),
    refetchInterval: 60_000,
  })

  const { data: pinsData, isLoading: pinsLoading } = useQuery<ApiResponse<MapPin[]>>({
    queryKey: ['pins'],
    queryFn: () => api.get<MapPin[]>('/api/pins'),
    refetchInterval: 30_000,
  })

  // Live node status: connection count + check-in summary
  const { data: statusData, isLoading: statusLoading } = useQuery<ApiResponse<NodeStatus>>({
    queryKey: ['status'],
    queryFn: () => api.get<NodeStatus>('/api/status'),
    refetchInterval: 10_000,
  })

  const posts = postsData?.data ?? []
  const missing = missingData?.data ?? []
  const news = newsData?.data ?? []
  const pins = pinsData?.data ?? []

  const status = statusData?.data
  const connectedUsers = status?.connectedUsers ?? 0
  const activeCheckins = status?.checkins.active ?? 0
  const unresponsiveCheckins = status?.checkins.unresponsive ?? 0
  const totalCheckins = status?.checkins.total ?? 0

  const pinnedPosts = useMemo(() => posts.filter(p => p.pinned).slice(0, 5), [posts])
  const recentPosts = useMemo(() => posts.filter(p => !p.pinned).slice(0, 3), [posts])
  const missingCount = useMemo(() => missing.filter(m => m.status === 'missing').length, [missing])
  const foundCount = useMemo(() => missing.filter(m => m.status === 'found').length, [missing])

  const isLoading = postsLoading || missingLoading || newsLoading || pinsLoading || statusLoading

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-5 sm:space-y-6">
        <DashboardSkeleton />
      </div>
    )
  }

  const statusColor = connectionStatus === 'connected' ? 'bg-success'
    : connectionStatus === 'connecting' ? 'bg-warning' : 'bg-danger'
  const statusText = connectionStatus === 'connected' ? t('Connected', 'সংযুক্ত')
    : connectionStatus === 'connecting' ? t('Connecting...', 'সংযোগ হচ্ছে...')
    : t('Disconnected', 'সংযোগ বিচ্ছিন্ন')

  return (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Welcome + Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-0.5 sm:space-y-1 min-w-0">
          <h1 className="font-display font-heading text-display text-text-heading leading-tight uppercase tracking-wider">
            {t('Dashboard', 'ড্যাশবোর্ড')}
          </h1>
          {displayName && (
            <p className="text-small sm:text-body text-text-muted accent-bar mt-2">
              {t('Welcome', 'স্বাগতম')}, <span className="text-text-primary font-bold">{displayName}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="pill bg-primary-muted text-primary-text hover:bg-primary/20 transition-colors cursor-pointer"
            >
              <ShieldAlert size={12} />
              <span className="hidden sm:inline">{t('Admin', 'অ্যাডমিন')}</span>
            </button>
          )}
          <div className="pill bg-surface border border-border">
            <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
            <span className="text-caption text-text-muted uppercase tracking-wider">{statusText}</span>
          </div>
        </div>
      </div>

      <div className="space-y-5 sm:space-y-6">
        {/* Tagline */}
        <p className="text-small sm:text-body text-text-muted italic accent-bar leading-relaxed">
          &ldquo;{t('Stay connected when they cut the cord.', 'তারা সংযোগ কেটে দিলেও সংযুক্ত থাকুন।')}&rdquo;
        </p>

        {/* Metric Cards: 2-col mobile, 3-col tablet, 6-col desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 pt-2">
          <MetricCard
            label="Online" labelBn="অনলাইন"
            value={connectedUsers}
            sub={t(`${connectedUsers} connected`, `${connectedUsers} সংযুক্ত`)}
            Icon={Wifi}
            trend={connectedUsers > 0 ? 'up' : 'neutral'}
          />
          <MetricCard
            label="Check-ins" labelBn="চেক-ইন"
            value={activeCheckins}
            sub={t(`${totalCheckins} total · ${unresponsiveCheckins} unresponsive`, `${totalCheckins} মোট · ${unresponsiveCheckins} অনুত্তরিত`)}
            Icon={HeartPulse}
            trend={unresponsiveCheckins > 0 ? 'down' : totalCheckins > 0 ? 'up' : 'neutral'}
          />
          <MetricCard
            label="Posts" labelBn="পোস্ট"
            value={posts.length}
            sub={pinnedPosts.length > 0 ? t(`${pinnedPosts.length} pinned`, `${pinnedPosts.length}টি পিন করা`): t('No pinned posts', 'কোনো পিন করা পোস্ট নেই')}
            Icon={ClipboardList}
          />
          <MetricCard
            label="Missing" labelBn="নিখোঁজ"
            value={missing.length}
            sub={t(`${missingCount} missing · ${foundCount} found`, `${missingCount} নিখোঁজ · ${foundCount} পাওয়া`)}
            Icon={Users}
            trend={missingCount > 0 ? 'up' : 'neutral'}
          />
          <MetricCard
            label="News" labelBn="সংবাদ"
            value={news.length}
            sub={news.length > 0 ? t('Articles cached', 'নিবন্ধ ক্যাশে') : t('No news yet', 'এখনো কোনো সংবাদ নেই')}
            Icon={Newspaper}
          />
          <MetricCard
            label="Pins" labelBn="পিন"
            value={pins.length}
            sub={pins.length > 0 ? t('Map markers', 'মানচিত্র চিহ্নিতকারী') : t('No pins yet', 'এখনো কোনো পিন নেই')}
            Icon={MapPinIcon}
          />
        </div>

        {/* Quick Action Buttons: 1-col mobile, 2-col tablet, 3-col desktop */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="section-head">{t('Quick Actions', 'দ্রুত কার্যকলাপ')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
            {quickLinks.map((link) => {
              const Icon = link.icon
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="card-hover p-3 sm:p-4 text-left space-y-1.5 sm:space-y-2 group"
                >
                  <div className="w-9 h-9 flex items-center justify-center bg-primary-muted group-hover:bg-primary/20 transition-colors">
                    <Icon size={16} className="text-primary-text" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-small sm:text-body font-bold text-text-primary tracking-wide truncate">
                      {t(link.label, link.labelBn)}
                    </p>
                    <p className="text-caption text-text-muted mt-0.5 truncate">
                      {t(link.desc, link.descBn)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* Pinned Alerts */}
        {pinnedPosts.length > 0 && (
          <section className="space-y-2 sm:space-y-3">
            <h2 className="section-head">
              <ShieldAlert size={14} className="text-primary-text" />
              {t('Pinned Alerts', 'পিন করা এলার্ট')}
            </h2>
            <div className="space-y-1.5 sm:space-y-2">
              {pinnedPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => navigate('/board')}
                  className="card-hover p-3 sm:p-4 text-left w-full"
                >
                  <div className="flex items-center gap-2 text-caption text-text-muted mb-1">
                    <span className="badge bg-primary-muted text-primary-text">Pinned</span>
                    <span>·</span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                  <p className="text-small sm:text-body text-text-primary line-clamp-2 leading-relaxed">{post.content}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* Recent Activity */}
        <section className="space-y-3 sm:space-y-4">
          <h2 className="section-head">
            <Clock size={14} className="text-primary-text" />
            {t('Recent Activity', 'সাম্প্রতিক কার্যকলাপ')}
          </h2>

          {recentPosts.length === 0 && posts.length === 0 && (
            <div className="empty-state">
              <LayoutDashboard size={24} className="mx-auto mb-3 text-text-dim" />
              <p className="text-body text-text-muted leading-relaxed">
                {t('No activity yet. Start by posting to the noticeboard or checking in.', 'এখনো কোনো কার্যকলাপ নেই। নোটিশ বোর্ডে পোস্ট করে বা চেক-ইন করে শুরু করুন।')}
              </p>
            </div>
          )}

          {recentPosts.length > 0 && (
            <div className="space-y-1.5 sm:space-y-2">
              {recentPosts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => navigate('/board')}
                  className="card-hover p-3 sm:p-4 text-left w-full"
                >
                  <div className="flex items-center gap-2 text-caption text-text-muted mb-1">
                    <span className="text-text-primary font-bold text-small">{post.displayName}</span>
                    <span>·</span>
                    <span>{timeAgo(post.createdAt)}</span>
                  </div>
                  <p className="text-small sm:text-body text-text-muted line-clamp-2 leading-relaxed">{post.content}</p>
                </button>
              ))}
              <button
                onClick={() => navigate('/board')}
                className="flex items-center gap-1 text-caption text-primary-text hover:text-primary font-bold uppercase tracking-wider mt-1 transition-colors group"
              >
                {t('View all posts', 'সব পোস্ট দেখুন')}
                <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          )}
        </section>

        {/* Online Users Panel + Community Stats Footer */}
        <div className="lg:grid lg:grid-cols-4 gap-6 pt-5 sm:pt-6 border-t border-border">
          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="text-center p-2 sm:p-3">
                <p className="text-body sm:text-subhead font-bold text-text-heading tabular-nums">{connectedUsers}</p>
                <p className="text-caption text-text-muted uppercase tracking-wider leading-tight">{t('Online', 'অনলাইন')}</p>
              </div>
              <div className="text-center p-2 sm:p-3">
                <p className="text-body sm:text-subhead font-bold text-text-heading tabular-nums">{totalCheckins}</p>
                <p className="text-caption text-text-muted uppercase tracking-wider leading-tight">{t('Check-ins', 'চেক-ইন')}</p>
              </div>
              <div className="text-center p-2 sm:p-3">
                <p className="text-body sm:text-subhead font-bold text-text-heading tabular-nums">{posts.length}</p>
                <p className="text-caption text-text-muted uppercase tracking-wider leading-tight">{t('Posts', 'পোস্ট')}</p>
              </div>
              <div className="text-center p-2 sm:p-3">
                <p className="text-body sm:text-subhead font-bold text-text-heading tabular-nums">{missing.length}</p>
                <p className="text-caption text-text-muted uppercase tracking-wider leading-tight">{t('Reports', 'রিপোর্ট')}</p>
              </div>
              <div className="text-center p-2 sm:p-3">
                <p className="text-body sm:text-subhead font-bold text-text-heading tabular-nums">{news.length}</p>
                <p className="text-caption text-text-muted uppercase tracking-wider leading-tight">{t('News', 'সংবাদ')}</p>
              </div>
              <div className="text-center p-2 sm:p-3">
                <p className="text-body sm:text-subhead font-bold text-text-heading tabular-nums">{pins.length}</p>
                <p className="text-caption text-text-muted uppercase tracking-wider leading-tight">{t('Pins', 'পিন')}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 lg:mt-0 p-3 sm:p-4 bg-surface border border-border rounded">
            <OnlineUsers variant="panel" />
          </div>
        </div>
      </div>
    </div>
  )
}
