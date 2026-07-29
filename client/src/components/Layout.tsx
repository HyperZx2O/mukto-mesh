import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import { LayoutDashboard, MessageSquare, ClipboardList, BookOpen, Users, MapPin, Shield, Volume2, VolumeX, Newspaper, HeartPulse } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSoundStore } from '@/store/useSoundStore'
import { ToastProvider } from './Toast'
import OfflineBadge from './OfflineBadge'
import LanguageToggle from './LanguageToggle'
import DisplayNameModal from './DisplayNameModal'
import InstallPrompt from './InstallPrompt'

interface NavItem {
  path: string
  label: string
  labelBn: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { path: '/', label: 'Home', labelBn: 'হোম', icon: LayoutDashboard },
  { path: '/chat', label: 'Chat', labelBn: 'চ্যাট', icon: MessageSquare },
  { path: '/board', label: 'Board', labelBn: 'বোর্ড', icon: ClipboardList },
  { path: '/news', label: 'News', labelBn: 'সংবাদ', icon: Newspaper },
  { path: '/info', label: 'Info', labelBn: 'তথ্য', icon: BookOpen },
  { path: '/people', label: 'People', labelBn: 'জনগণ', icon: Users },
  { path: '/map', label: 'Map', labelBn: 'মানচিত্র', icon: MapPin },
  { path: '/checkin', label: 'CheckIn', labelBn: 'চেক-ইন', icon: HeartPulse },
]

export default function Layout() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const soundEnabled = useSoundStore((s) => s.enabled)
  const toggleSound = useSoundStore((s) => s.toggle)

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <ToastProvider>
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <DisplayNameModal />
      <OfflineBadge />
      <InstallPrompt />

      {/* Top bar */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
          <button
            type="button"
            onClick={() => navigate('/')}
            className="font-display font-heading text-subhead text-text-heading hover:text-primary transition-colors truncate"
          >
            Mukto Mesh
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleSound}
            className="btn-ghost p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <LanguageToggle />
        </div>
      </header>

      <div className="flex-1 relative">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex fixed top-16 left-0 w-56 flex-col h-[calc(100vh-4rem)] border-r border-border bg-background overflow-y-auto z-30">
          <nav className="flex flex-col gap-0.5 p-3 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 text-sm font-medium tracking-wide rounded min-h-[44px] transition-colors duration-fast ease-out',
                    active
                      ? 'bg-surface text-text-heading'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
                  )}
                >
                  <Icon size={18} className="shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              )
            })}
          </nav>
          <div className="p-3 border-t border-border">
            <NavLink
              to="/admin"
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 text-sm font-medium tracking-wide rounded min-h-[44px] transition-colors duration-fast ease-out',
                isActive('/admin')
                  ? 'bg-surface text-text-heading'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface-hover'
              )}
            >
              <Shield size={18} className="shrink-0" />
              <span className="truncate">Admin</span>
            </NavLink>
          </div>
        </aside>

        {/* Main content area */}
        <main className="lg:pl-56 pb-16 lg:pb-0 h-[calc(100vh-4rem)] overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav data-bottom-nav className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-background border-t border-border flex items-center justify-around z-40 px-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-[0.625rem] font-bold uppercase tracking-wider min-w-[44px] min-h-[44px] rounded transition-colors duration-fast',
                active ? 'text-primary' : 'text-text-dim hover:text-text-muted'
              )}
            >
              <Icon size={18} />
              {item.labelBn || item.label}
            </NavLink>
          )
        })}
      </nav>
    </div>
    </ToastProvider>
  )
}