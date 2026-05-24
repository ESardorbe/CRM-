import api from './axios'

export interface AttendanceRecordDto {
  studentId: string
  status: 'present' | 'absent' | 'late'
  note?: string
}

export interface BulkAttendanceDto {
  courseId: string
  date: string
  records: AttendanceRecordDto[]
}

export interface AttendanceRecord {
  id: string
  student: { id: string; user: { firstName: string; lastName: string } }
  course: { id: string; title: string; code?: string }
  date: string
  status: 'present' | 'absent' | 'late'
  note?: string
  createdAt: string
}

export interface PaginatedAttendance {
  data: AttendanceRecord[]
  total: number
  page: number
  limit: number
}

export const attendanceApi = {
  saveBulk: (dto: BulkAttendanceDto) =>
    api.post<AttendanceRecord[]>('/attendance/bulk', dto).then((r) => r.data),

  getAll: (params?: { courseId?: string; date?: string; studentId?: string; page?: number; limit?: number }) =>
    api.get<PaginatedAttendance>('/attendance', { params }).then((r) => r.data),
}
