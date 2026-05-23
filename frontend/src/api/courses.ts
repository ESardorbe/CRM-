import api from './axios'
import type { Course, PaginatedResponse } from '../types'

export interface CreateCourseDto {
  title: string
  description?: string
  code?: string
  teacherId?: string
  directionId?: string
  startDate?: string
  endDate?: string
  credits?: number
  capacity?: number
  schedule?: string[]
}

export const coursesApi = {
  getAll: (params?: { page?: number; limit?: number; isActive?: boolean }) =>
    api.get<PaginatedResponse<Course>>('/courses', { params }).then((r) => r.data),

  getOne: (id: string) =>
    api.get<Course>(`/courses/${id}`).then((r) => r.data),

  create: (dto: CreateCourseDto) =>
    api.post<Course>('/courses', dto).then((r) => r.data),

  update: (id: string, dto: Partial<CreateCourseDto>) =>
    api.put<Course>(`/courses/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/courses/${id}`).then((r) => r.data),

  addStudent: (courseId: string, studentId: string) =>
    api.post(`/courses/${courseId}/students/${studentId}`).then((r) => r.data),

  removeStudent: (courseId: string, studentId: string) =>
    api.delete(`/courses/${courseId}/students/${studentId}`).then((r) => r.data),

  getTeacherCourses: (teacherId: string) =>
    api.get<Course[]>(`/courses/teacher/${teacherId}`).then((r) => r.data),

  getStudentCourses: (studentId: string) =>
    api.get<Course[]>(`/courses/student/${studentId}`).then((r) => r.data),
}
