import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { MessageSquare, ClipboardList, BookOpen, Users, MapPin, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ToastProvider } from './Toast'
import OfflineBadge from './OfflineBadge'
import LanguageToggle from './LanguageToggle'
import DisplayNameModal from './DisplayNameModal'
import InstallPrompt from './InstallPrompt'

const navItems = [
  { path: '/chat', label: 'Chat', labelBn: 'চ্যাট', icon: MessageSquare },
  { path: '/board', label: 'Board', labelBn: 'বোর্ড', icon: ClipboardList },
  { path: '/info', label: 'Info', labelBn: 'তথ্য', icon: BookOpen },
  { path: '/people', label: 'People', labelBn: 'জনগণ', icon: Users },
  { path: '/map', label: 'Map', labelBn: 'মানচিত্র', icon: MapPin },
] as const

export default function Layout() {
  const { pathname } = useLocation()

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + '/')

  return (
    <ToastProvider>
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      <DisplayNameModal />
      <OfflineBadge />
      <InstallPrompt />

      {/* Top bar */}
      <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-background shrink-0">
        <h1 className="text-lg font-bold uppercase tracking-wider text-text-primary">
          Mukto Mesh
        </h1>
        <LanguageToggle />
      </header>

      <div className="flex flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex w-56 shrink-0 flex-col border-r border-border bg-background">
          <nav className="flex flex-col gap-1 p-4 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider rounded-none min-h-[44px]',
                    active
                      ? 'bg-primary text-white'
                      : 'text-text-muted hover:text-text-primary hover:bg-surface'
                  )}
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <div className="p-4 border-t border-border">
            <NavLink
              to="/admin"
              className={cn(
                'flex items-center gap-3 px-4 py-3 text-sm uppercase tracking-wider rounded-none min-h-[44px]',
                isActive('/admin')
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text-primary hover:bg-surface'
              )}
            >
              <Shield size={18} />
              Admin
            </NavLink>
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 pb-16 lg:pb-0 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around z-40">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = isActive(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 text-xs uppercase tracking-wider min-w-[44px] min-h-[44px]',
                active ? 'text-primary' : 'text-text-muted'
              )}
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
    </div>
    </ToastProvider>
  )
}
