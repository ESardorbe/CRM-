import api from './axios'
import type { User } from '../types'

export interface LoginDto {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  message: string
}

export interface RegisterDto {
  firstName: string
  lastName?: string
  email: string
  password: string
}

export interface UpdateProfileDto {
  firstName?: string
  lastName?: string
  phone?: string
  avatarUrl?: string
}

export interface UpdateRoleDto {
  role: string
}

export interface RegisterWithRoleDto {
  firstName: string
  lastName?: string
  email: string
  password: string
  role: string
}

export interface UsersResponse {
  data: User[]
  total: number
  page: number
  limit: number
}

export const authApi = {
  login: (dto: LoginDto) =>
    api.post<LoginResponse>('/auth/login', dto).then((r) => r.data),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  getProfile: () =>
    api.get<User>('/auth/profile').then((r) => r.data),

  updateProfile: (dto: UpdateProfileDto) =>
    api.put<User>('/auth/profile', dto).then((r) => r.data),

  register: (dto: RegisterDto) =>
    api.post<{ message: string }>('/auth/register', dto).then((r) => r.data),

  verifyEmail: (email: string, verifyCode: string) =>
    api.post<{ message: string }>('/auth/verify-email', { email, verifyCode }).then((r) => r.data),

  getAllUsers: (page = 1, limit = 10, search?: string) =>
    api.get<UsersResponse>('/auth/all-users', { params: { page, limit, search } }).then((r) => r.data),

  updateUserRole: (userId: string, dto: UpdateRoleDto) =>
    api.put<User>(`/auth/users/${userId}/role`, dto).then((r) => r.data),

  deleteUser: (userId: string) =>
    api.delete<{ message: string }>(`/auth/users/${userId}`).then((r) => r.data),

  registerWithRole: (dto: RegisterWithRoleDto) =>
    api.post<{ message: string }>('/auth/register-with-role', dto).then((r) => r.data),

  resetPassword: (email: string) =>
    api.post<{ message: string }>('/auth/reset-password', { email }).then((r) => r.data),

  updatePassword: (dto: { email: string; verifyCode: string; newPassword: string }) =>
    api.post<{ message: string }>('/auth/update-password', dto).then((r) => r.data),
}
