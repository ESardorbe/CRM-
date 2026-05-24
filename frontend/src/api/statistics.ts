import api from './axios'
import type { Payment, StudentMovement, PaginatedResponse, MonthlyReport } from '../types'

export interface CreatePaymentDto {
  studentId: string
  courseId: string
  amount: number
  currency?: string
  status: 'pending' | 'completed'
  method: 'cash' | 'card' | 'bank_transfer' | 'online'
  paymentDate: string
  description?: string
}

export interface CreateMovementDto {
  studentId: string
  courseId: string
  type: 'joined' | 'left'
  date?: string
  reason?: string
}

export const statisticsApi = {
  getPayments: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string; courseId?: string; paymentStatus?: string }) =>
    api.get<PaginatedResponse<Payment>>('/statistics/payments', { params }).then((r) => r.data),

  createPayment: (dto: CreatePaymentDto) =>
    api.post<Payment>('/statistics/payments', dto).then((r) => r.data),

  updatePayment: (id: string, dto: Partial<CreatePaymentDto>) =>
    api.put<Payment>(`/statistics/payments/${id}`, dto).then((r) => r.data),

  deletePayment: (id: string) =>
    api.delete(`/statistics/payments/${id}`).then((r) => r.data),

  getMovements: (params?: { page?: number; limit?: number; startDate?: string; endDate?: string; courseId?: string; movementType?: string }) =>
    api.get<PaginatedResponse<StudentMovement>>('/statistics/student-movements', { params }).then((r) => r.data),

  createMovement: (dto: CreateMovementDto) =>
    api.post<StudentMovement>('/statistics/student-movements', dto).then((r) => r.data),

  getMonthlyReport: (year: number, month: number, courseId?: string) =>
    api.get<MonthlyReport>('/statistics/monthly-report', { params: { year, month, courseId } }).then((r) => r.data),

  getRegistrations: (year: number) =>
    api.get<{ month: number; students: number; teachers: number }[]>('/statistics/registrations', { params: { year } }).then((r) => r.data),
}
