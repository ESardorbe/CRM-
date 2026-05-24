import api from './axios'
import type { Student, PaginatedResponse } from '../types'

export interface CreateStudentDto {
  firstName: string
  lastName: string
  email: string
  phone: string
  parentName?: string
  parentPhone?: string
  password: string
  courseId?: string
}

export interface UpdateStudentDto {
  firstName?: string
  lastName?: string
  phone?: string
  avatarUrl?: string
  parentName?: string
  parentPhone?: string
  courseId?: string
}

export const studentsApi = {
  getAll: (params?: { page?: number; limit?: number; search?: string; directionId?: string }) =>
    api.get<PaginatedResponse<Student>>('/students', { params }).then((r) => r.data),

  getOne: (id: string) =>
    api.get<Student>(`/students/${id}`).then((r) => r.data),

  create: (dto: CreateStudentDto) =>
    api.post<Student>('/students', dto).then((r) => r.data),

  update: (id: string, dto: UpdateStudentDto) =>
    api.patch<Student>(`/students/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/students/${id}`).then((r) => r.data),

  getByUserId: (userId: string) =>
    api.get<Student>(`/students/user/${userId}`).then((r) => r.data),

  updateMe: (dto: UpdateStudentDto) =>
    api.patch<Student>('/students/me', dto).then((r) => r.data),
}
