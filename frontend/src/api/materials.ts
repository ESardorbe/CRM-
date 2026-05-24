import api from './axios'

export interface Material {
  id: string
  title: string
  description: string | null
  fileUrl: string
  fileName: string
  fileType: 'pdf' | 'video' | 'image' | 'document' | 'other'
  uploadedBy: { id: string; firstName: string; lastName: string } | null
  createdAt: string
}

export const materialsApi = {
  getByCourse: (courseId: string) =>
    api.get<Material[]>('/materials', { params: { courseId } }).then((r) => r.data),

  upload: (formData: FormData) =>
    api.post<Material>('/materials', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  remove: (id: string) => api.delete(`/materials/${id}`),
}
