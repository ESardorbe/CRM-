import { useState, useEffect } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, BookOpen, User, LogOut, Menu, X, ClipboardList, Sun, Moon, FileText, CalendarDays, Star } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import NotificationBell from '../NotificationBell'

export default function StudentLayout() {
  const { user, logout } = useAuthContext()
  const { t, lang, setLang } = useLang()
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  const toggleDark = () => setDark((d) => !d)
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const navItems = [
    { to: '/student/dashboard', icon: Home, label: t('report') },
    { to: '/student/groups', icon: BookOpen, label: t('myCourses') },
    { to: '/student/attendance', icon: ClipboardList, label: t('myAttendance') },
    { to: '/student/materials', icon: FileText, label: t('materials') },
    { to: '/student/schedule', icon: CalendarDays, label: t('schedule') },
    { to: '/student/assignments', icon: ClipboardList, label: t('assignments') },
    { to: '/student/grades', icon: Star, label: t('grades') },
    { to: '/student/profile', icon: User, label: t('myProfile') },
  ]

  return (
    <div className="min-h-screen bg-bg-light dark:bg-bg-dark flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-60 bg-primary dark:bg-sidebar-dark text-white flex flex-col
        transition-transform duration-300
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/20">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold shrink-0 overflow-hidden">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              : (user?.firstName?.[0]?.toUpperCase() ?? 'S')
            }
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs opacity-70 truncate">{user?.email}</p>
          </div>
          <button onClick={() => setOpen(false)} className="ml-auto md:hidden text-white/70 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/20 border-l-4 border-white'
                    : 'hover:bg-white/10 border-l-4 border-transparent'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-white/20 space-y-1">
          <button
            onClick={toggleDark}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
            {dark ? t('lightMode') : t('darkMode')}
          </button>
          <div className="flex gap-1 px-3 py-1">
            {(['uz', 'ru'] as const).map((l) => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-2 py-0.5 rounded text-xs font-medium transition-colors ${lang === l ? 'bg-white text-primary' : 'text-white/60 hover:text-white'}`}
              >{l.toUpperCase()}</button>
            ))}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-300 hover:text-red-200 hover:bg-red-500/20 transition-colors"
          >
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 bg-white dark:bg-card-dark shadow-sm flex items-center px-4 gap-3 shrink-0">
          <button onClick={() => setOpen(true)} className="md:hidden text-gray-500 hover:text-gray-700">
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <NotificationBell />
          <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {t('students')}
          </span>
        </header>

        <main className="flex-1 p-5 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
