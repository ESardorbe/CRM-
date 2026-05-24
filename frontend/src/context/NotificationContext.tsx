import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthContext } from './AuthContext'
import { notificationsApi, type Notification } from '../api/notifications'

interface NotificationCtx {
  notifications: Notification[]
  unreadCount: number
  markRead: (id: string) => void
  markAllRead: () => void
}

const Ctx = createContext<NotificationCtx>({
  notifications: [],
  unreadCount: 0,
  markRead: () => {},
  markAllRead: () => {},
})

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [socket, setSocket] = useState<Socket | null>(null)

  const unreadCount = notifications.filter((n) => !n.isRead).length

  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('accessToken')
    notificationsApi.getAll().then(setNotifications).catch(() => {})

    const s = io('http://localhost:4001', { auth: { token }, transports: ['websocket'] })
    s.on('notification', (n: Notification) => {
      setNotifications((prev) => [n, ...prev])
    })
    setSocket(s)
    return () => { s.disconnect(); setSocket(null) }
  }, [user])

  const markRead = useCallback((id: string) => {
    notificationsApi.markRead(id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
    socket?.emit('mark-read', id)
  }, [socket])

  const markAllRead = useCallback(() => {
    notificationsApi.markAllRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }, [])

  return (
    <Ctx.Provider value={{ notifications, unreadCount, markRead, markAllRead }}>
      {children}
    </Ctx.Provider>
  )
}

export const useNotifications = () => useContext(Ctx)
