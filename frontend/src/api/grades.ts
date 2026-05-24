import api from './axios'

export interface Grade {
  id: string
  score: number
  maxScore: number
  gradeType: string
  comment: string | null
  createdAt: string
  gradedBy: { id: string; firstName: string; lastName: string } | null
  student?: { id: string; user?: { firstName: string; lastName: string } }
  course?: { id: string; title: string }
}

export interface GradeSummary {
  studentId: string
  name: string
  average: number
  count: number
}

export const GRADE_TYPES: Record<string, string> = {
  midterm: 'Oraliq',
  final: 'Yakuniy',
  homework: 'Uy ishi',
  quiz: 'Test',
  project: 'Loyiha',
  other: 'Boshqa',
}

const GRADE_TYPES_RU: Record<string, string> = {
  midterm: 'Промежуточный',
  final: 'Итоговый',
  homework: 'Домашнее задание',
  quiz: 'Тест',
  project: 'Проект',
  other: 'Другое',
}

export function getGradeTypes(lang: string): Record<string, string> {
  return lang === 'ru' ? GRADE_TYPES_RU : GRADE_TYPES
}

export const gradesApi = {
  getByCourse: (courseId: string) =>
    api.get<Grade[]>(`/grades/course/${courseId}`).then((r) => r.data),

  getCourseSummary: (courseId: string) =>
    api.get<GradeSummary[]>(`/grades/course/${courseId}/summary`).then((r) => r.data),

  getByStudent: (studentId: string) =>
    api.get<Grade[]>(`/grades/student/${studentId}`).then((r) => r.data),

  create: (data: { studentId: string; courseId: string; score: number; maxScore?: number; gradeType?: string; comment?: string }) =>
    api.post<Grade>('/grades', data).then((r) => r.data),

  update: (id: string, data: Partial<{ score: number; maxScore: number; gradeType: string; comment: string }>) =>
    api.put<Grade>(`/grades/${id}`, data).then((r) => r.data),

  remove: (id: string) => api.delete(`/grades/${id}`),
}
