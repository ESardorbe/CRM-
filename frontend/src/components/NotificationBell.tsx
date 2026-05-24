import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { useNotifications } from '../context/NotificationContext'
import { useLang } from '../context/LangContext'
import type { Notification } from '../api/notifications'

const TYPE_ICON: Record<string, React.ReactNode> = {
  info: <Info size={14} className="text-blue-500" />,
  success: <CheckCircle size={14} className="text-green-500" />,
  warning: <AlertTriangle size={14} className="text-amber-500" />,
  error: <XCircle size={14} className="text-red-500" />,
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <Bell size={18} className="text-gray-600 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-80 bg-white dark:bg-card-dark rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <span className="font-semibold text-sm text-gray-800 dark:text-white">{t('notifications')}</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-primary hover:text-primary/70 transition-colors">
                <CheckCheck size={13} /> {t('markAllRead')}
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">{t('noNotifications')}</p>
            ) : (
              notifications.map((n: Notification) => (
                <div
                  key={n.id}
                  onClick={() => { if (!n.isRead) markRead(n.id) }}
                  className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors border-b border-gray-50 dark:border-gray-700/50 ${
                    !n.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''
                  }`}
                >
                  <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type] ?? TYPE_ICON.info}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate">{n.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.body}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                  </div>
                  {!n.isRead && (
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5 shrink-0" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
