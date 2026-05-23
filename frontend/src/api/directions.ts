import api from './axios'
import type { Direction, PaginatedResponse } from '../types'

export interface CreateDirectionDto {
  name: string
  description?: string
  dayType: 'odd' | 'even' | 'daily'
  startTime: string
  endTime: string
}

export const directionsApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Direction>>('/directions', { params }).then((r) => r.data),

  getOne: (id: string) =>
    api.get<Direction>(`/directions/${id}`).then((r) => r.data),

  create: (dto: CreateDirectionDto) =>
    api.post<Direction>('/directions', dto).then((r) => r.data),

  update: (id: string, dto: Partial<CreateDirectionDto>) =>
    api.put<Direction>(`/directions/${id}`, dto).then((r) => r.data),

  remove: (id: string) =>
    api.delete(`/directions/${id}`).then((r) => r.data),
}
