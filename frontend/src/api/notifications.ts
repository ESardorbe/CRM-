import api from './axios'

export interface Notification {
  id: string
  title: string
  body: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
  link: string | null
  createdAt: string
}

export const notificationsApi = {
  getAll: () => api.get<Notification[]>('/notifications').then((r) => r.data),
  getUnreadCount: () => api.get<{ count: number }>('/notifications/unread-count').then((r) => r.data.count),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
}
