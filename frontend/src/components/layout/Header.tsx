import { Sun, Moon, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

interface HeaderProps {
  title: string
  dark: boolean
  onToggleDark: () => void
}

export default function Header({ title, dark, onToggleDark }: HeaderProps) {
  const { user, logout } = useAuthContext()
  const { lang, setLang, t } = useLang()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="h-14 bg-white dark:bg-card-dark border-b border-gray-200 dark:border-gray-700 flex items-center px-6 gap-4 shrink-0">
      <h1 className="text-xl font-bold text-primary dark:text-blue-400 flex-1">{title}</h1>

      <span className="text-sm text-gray-500 dark:text-gray-400">
        {format(new Date(), 'dd.MM.yyyy')}
      </span>

      {/* Language toggle */}
      <div className="flex rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden text-xs font-semibold">
        <button
          onClick={() => setLang('uz')}
          className={`px-2.5 py-1 transition-colors ${lang === 'uz' ? 'bg-primary text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
          UZ
        </button>
        <button
          onClick={() => setLang('ru')}
          className={`px-2.5 py-1 transition-colors ${lang === 'ru' ? 'bg-primary text-white' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
        >
          RU
        </button>
      </div>

      {/* Dark mode toggle */}
      <button
        onClick={onToggleDark}
        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        title={dark ? t('lightMode') : t('darkMode')}
      >
        {dark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-gray-600" />}
      </button>

      {/* User name */}
      {user && (
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:block">
          {user.firstName}
        </span>
      )}

      {/* Avatar → Profile link */}
      <Link
        to="/profile"
        className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center cursor-pointer overflow-hidden shrink-0 hover:opacity-90 transition-opacity"
        title={t('profile')}
      >
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt="avatar"
            className="w-full h-full object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <span>{user?.firstName?.[0]?.toUpperCase() ?? 'U'}</span>
        )}
      </Link>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 text-gray-500 transition-colors"
        title={t('logout')}
      >
        <LogOut size={15} />
      </button>
    </header>
  )
}
