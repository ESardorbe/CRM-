export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: string
  avatarUrl?: string
  isVerify?: boolean
  createdAt?: string
}

export interface Direction {
  id: string
  name: string
  description?: string
  dayType: 'odd' | 'even' | 'daily'
  startTime: string
  endTime: string
  createdAt: string
}

export interface Student {
  id: string
  studentId: string
  user: User
  courses: Course[]
  parentName?: string
  parentPhone?: string
  additionalInfo?: Record<string, unknown>
  createdAt: string
}

export interface Teacher {
  id: string
  teacherId?: string
  user: User
  direction?: Direction | null
  courses: Course[]
  bio?: string
  isActive: boolean
  createdAt: string
}

export interface Course {
  id: string
  title: string
  description?: string
  code?: string
  teacher?: Teacher | null
  direction?: Direction | null
  students: Student[]
  startDate?: string
  endDate?: string
  isActive: boolean
  credits?: number
  schedule?: string[]
  capacity?: number
  createdAt: string
}

export interface Payment {
  id: string
  student: Student
  course: Course
  amount: number
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  method: 'cash' | 'card' | 'bank_transfer' | 'online'
  paymentDate: string
  description?: string
}

export interface StudentMovement {
  id: string
  student: Student
  course: Course
  type: 'joined' | 'left'
  date: string
  reason?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface MonthlyReport {
  period: { year: number; month: number; startDate: string; endDate: string }
  studentMovements: {
    total: number
    joined: number
    left: number
    netChange: number
    byCourse: { courseId: string; title: string; joined: number; left: number; netChange: number }[]
    joinedStudents: { id: string; studentId: string; studentName: string; courseTitle: string; date: string }[]
    leftStudents: { id: string; studentId: string; studentName: string; courseTitle: string; date: string }[]
  }
  payments: {
    total: number
    completed: number
    pending: number
    revenue: number
    byCourse: { courseId: string; title: string; totalAmount: number; count: number }[]
  }
}
