import api from './axios'

export interface Assignment {
  id: string
  title: string
  description: string | null
  dueDate: string | null
  maxScore: number
  createdBy: { id: string; firstName: string; lastName: string } | null
  createdAt: string
}

export interface Submission {
  id: string
  comment: string | null
  fileUrl: string | null
  score: number | null
  feedback: string | null
  submittedAt: string
  student?: { id: string; user?: { firstName: string; lastName: string } }
}

export const assignmentsApi = {
  getByCourse: (courseId: string) =>
    api.get<Assignment[]>('/assignments', { params: { courseId } }).then((r) => r.data),

  create: (data: { courseId: string; title: string; description?: string; dueDate?: string; maxScore?: number }) =>
    api.post<Assignment>('/assignments', data).then((r) => r.data),

  update: (id: string, data: Partial<{ title: string; description: string; dueDate: string; maxScore: number; courseId: string }>) =>
    api.put<Assignment>(`/assignments/${id}`, data).then((r) => r.data),

  remove: (id: string) => api.delete(`/assignments/${id}`),

  submit: (assignmentId: string, formData: FormData) =>
    api.post<Submission>(`/assignments/${assignmentId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  getSubmissions: (assignmentId: string) =>
    api.get<Submission[]>(`/assignments/${assignmentId}/submissions`).then((r) => r.data),

  grade: (submissionId: string, data: { score?: number; feedback?: string }) =>
    api.patch<Submission>(`/assignments/submissions/${submissionId}/grade`, data).then((r) => r.data),
}
