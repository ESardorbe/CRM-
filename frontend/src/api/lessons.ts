import api from './axios'

export interface Lesson {
  id: string
  title: string
  description: string | null
  dayOfWeek: string
  startTime: string
  endTime: string
  isOnline: boolean
  meetingLink: string | null
  room: string | null
  createdAt: string
}

export const DAY_LABELS: Record<string, string> = {
  monday: 'Dushanba',
  tuesday: 'Seshanba',
  wednesday: 'Chorshanba',
  thursday: 'Payshanba',
  friday: 'Juma',
  saturday: 'Shanba',
  sunday: 'Yakshanba',
}

const DAY_LABELS_RU: Record<string, string> = {
  monday: 'Понедельник',
  tuesday: 'Вторник',
  wednesday: 'Среда',
  thursday: 'Четверг',
  friday: 'Пятница',
  saturday: 'Суббота',
  sunday: 'Воскресенье',
}

export function getDayLabels(lang: string): Record<string, string> {
  return lang === 'ru' ? DAY_LABELS_RU : DAY_LABELS
}

export const DAY_ORDER = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export const lessonsApi = {
  getByCourse: (courseId: string) =>
    api.get<Lesson[]>('/lessons', { params: { courseId } }).then((r) => r.data),

  create: (data: Omit<Lesson, 'id' | 'createdAt'> & { courseId: string }) =>
    api.post<Lesson>('/lessons', data).then((r) => r.data),

  update: (id: string, data: Partial<Omit<Lesson, 'id' | 'createdAt'> & { courseId: string }>) =>
    api.put<Lesson>(`/lessons/${id}`, data).then((r) => r.data),

  remove: (id: string) => api.delete(`/lessons/${id}`),
}
