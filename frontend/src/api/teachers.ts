import api from './axios'
import type { Teacher, PaginatedResponse } from '../types'

export interface CreateTeacherDto {
  firstName: string
  lastName?: string
  email: string
  phone?: string
  password: string
  directionId?: string
  bio?: string
}

export interface UpdateTeacherDto {
  firstName?: string
  lastName?: string
  phone?: string
  bio?: string
  avatarUrl?: string
  directionId?: string
}

export const teachersApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Teacher>>('/teachers', { params }).then((r) => r.data),

  getOne: (id: string) =>
    api.get<Teacher>(`/teachers/${id}`).then((r) => r.data),

  create: (dto: CreateTeacherDto) =>
    api.post<Teacher>('/teachers', dto).then((r) => r.data),

  update: (id: string, dto: UpdateTeacherDto) =>
    api.patch<Teacher>(`/teachers/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/teachers/${id}`).then((r) => r.data),

  getByUserId: (userId: string) =>
    api.get<Teacher>(`/teachers/user/${userId}`).then((r) => r.data),

  updateMe: (dto: UpdateTeacherDto) =>
    api.patch<Teacher>('/teachers/me', dto).then((r) => r.data),
}
