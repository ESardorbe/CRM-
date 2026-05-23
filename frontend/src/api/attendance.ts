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
  course: { id: string; title: string }
  date: string
  status: 'present' | 'absent' | 'late'
  note?: string
  createdAt: string
}

export const attendanceApi = {
  saveBulk: (dto: BulkAttendanceDto) =>
    api.post<AttendanceRecord[]>('/attendance/bulk', dto).then((r) => r.data),

  getAll: (params?: { courseId?: string; date?: string; studentId?: string }) =>
    api.get<AttendanceRecord[]>('/attendance', { params }).then((r) => r.data),
}
