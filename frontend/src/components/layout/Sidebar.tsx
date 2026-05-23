import { NavLink } from 'react-router-dom'
import {
  BarChart2,
  GraduationCap,
  Users,
  CreditCard,
  ClipboardList,
  MessageSquare,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import clsx from 'clsx'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { user } = useAuthContext()
  const { t } = useLang()

  const isAdminOrHigher = user?.role === 'admin' || user?.role === 'superadmin'

  const baseNavItems = [
    { to: '/dashboard', icon: BarChart2, label: t('report') },
    { to: '/students', icon: GraduationCap, label: t('students') },
    { to: '/teachers', icon: UserCheck, label: t('teachers') },
    { to: '/directions', icon: BookOpen, label: t('directions') },
    { to: '/groups', icon: Users, label: t('groups') },
    { to: '/payments', icon: CreditCard, label: t('payments') },
    { to: '/attendance', icon: ClipboardList, label: t('attendance') },
    { to: '/requests', icon: MessageSquare, label: t('requests'), badge: 0 },
  ]

  const navItems = isAdminOrHigher
    ? [...baseNavItems, { to: '/users', icon: ShieldCheck, label: t('users') }]
    : baseNavItems

  return (
    <aside
      className={clsx(
        'flex flex-col bg-primary dark:bg-sidebar-dark text-white transition-all duration-300 min-h-screen shrink-0',
        collapsed ? 'w-16' : 'w-52',
      )}
    >
      {/* Logo */}
      <div
        className={clsx(
          'flex items-center border-b border-white/20',
          collapsed ? 'justify-center py-5' : 'gap-3 px-4 py-5',
        )}
      >
        {!collapsed && (
          <>
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center shrink-0">
              <span className="text-xs font-bold">CRM</span>
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm">CRM</p>
              <p className="text-xs opacity-80">PANEL</p>
            </div>
          </>
        )}
        <button
          onClick={onToggle}
          className={clsx(
            'text-white/70 hover:text-white transition-colors',
            !collapsed && 'ml-auto',
          )}
          title={collapsed ? t('expand') : t('collapse')}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 space-y-1 px-2">
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-white/20 border-l-4 border-white'
                  : 'hover:bg-white/10 border-l-4 border-transparent',
              )
            }
          >
            <Icon size={18} className="shrink-0" />
            {!collapsed && <span>{label}</span>}
            {badge !== undefined && badge > 0 && (
              <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
