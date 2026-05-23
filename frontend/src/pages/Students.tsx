import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Pencil, X, Camera } from 'lucide-react'
import { studentsApi, type CreateStudentDto, type UpdateStudentDto } from '../api/students'
import { coursesApi } from '../api/courses'
import SearchInput from '../components/ui/SearchInput'
import Pagination from '../components/ui/Pagination'
import type { Student } from '../types'
import { useLang } from '../context/LangContext'

const EMPTY: CreateStudentDto = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '+998',
  parentName: '',
  parentPhone: '+998',
  password: 'password123',
  courseId: '',
}

interface EditForm {
  firstName: string
  lastName: string
  phone: string
  parentName: string
  parentPhone: string
  courseId: string
  avatarUrl: string
}

export default function Students() {
  const qc = useQueryClient()
  const { t } = useLang()
  const [form, setForm] = useState<CreateStudentDto>(EMPTY)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editStudent, setEditStudent] = useState<Student | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    firstName: '', lastName: '', phone: '', parentName: '', parentPhone: '', courseId: '', avatarUrl: '',
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search],
    queryFn: () => studentsApi.getAll({ page, limit: 10, search }),
  })

  const { data: courses } = useQuery({
    queryKey: ['courses-list'],
    queryFn: () => coursesApi.getAll({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: studentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      setForm(EMPTY)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateStudentDto }) =>
      studentsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] })
      setEditStudent(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: studentsApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ ...form, courseId: form.courseId || undefined })
  }

  const openEdit = (s: Student) => {
    setEditStudent(s)
    setEditForm({
      firstName: s.user.firstName,
      lastName: s.user.lastName ?? '',
      phone: s.user.phone ?? '+998',
      parentName: s.parentName ?? '',
      parentPhone: s.parentPhone ?? '+998',
      courseId: s.courses[0]?.id ?? '',
      avatarUrl: s.user.avatarUrl ?? '',
    })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editStudent) return
    updateMutation.mutate({
      id: editStudent.id,
      dto: {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        parentName: editForm.parentName,
        parentPhone: editForm.parentPhone,
        courseId: editForm.courseId || '',
        avatarUrl: editForm.avatarUrl || undefined,
      },
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setEditForm((f) => ({ ...f, avatarUrl: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const set = (key: keyof CreateStudentDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const setE = (key: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-5">{t('studentAdd')}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('name')}</label>
            <input className="input-field" placeholder="Ism" value={form.firstName} onChange={set('firstName')} required />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('phone')}</label>
            <input className="input-field" placeholder="+998 XX XXX XX XX" value={form.phone} onChange={set('phone')} />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('group')}</label>
            <select className="input-field" value={form.courseId ?? ''} onChange={set('courseId')}>
              <option value="">—</option>
              {courses?.data.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.direction?.name ? `${c.direction.name} • ` : ''}{c.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('parentName')}</label>
            <input className="input-field" placeholder="Ota-onasi ismi" value={form.parentName} onChange={set('parentName')} />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('parentPhone')}</label>
            <input className="input-field" placeholder="+998 XX XXX XX XX" value={form.parentPhone} onChange={set('parentPhone')} />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('email')}</label>
            <input className="input-field" placeholder="email@example.com" type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="col-start-3 flex items-end">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
              {createMutation.isPending ? t('loading') : t('add')}
            </button>
          </div>
        </form>
        {createMutation.isError && (
          <p className="text-red-500 text-sm mt-2">Xatolik yuz berdi. Qaytadan urinib ko'ring.</p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-bold text-primary">{t('studentList')}</h2>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="O'quvchi ismini kiriting" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {['№', t('name'), t('phone'), t('group'), t('parentName'), t('parentPhone'), ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">{t('loading')}</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">{t('notFound')}</td></tr>
              ) : (
                data?.data.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-4 py-3 font-medium">{(page - 1) * 10 + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                          {s.user.avatarUrl
                            ? <img src={s.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : (s.user.firstName[0]?.toUpperCase() ?? 'S')
                          }
                        </div>
                        <span>{s.user.firstName} {s.user.lastName}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{s.user.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      {s.courses[0]
                        ? <span>{s.courses[0].direction?.name ? `${s.courses[0].direction.name} • ` : ''}{s.courses[0].title}</span>
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{s.parentName ?? '—'}</td>
                    <td className="px-4 py-3">{s.parentPhone ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(s)} className="text-blue-400 hover:text-blue-600 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(s.id)} className="text-red-400 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4">
          <Pagination page={page} total={data?.total ?? 0} limit={10} onChange={setPage} />
        </div>
      </div>

      {/* Edit modal */}
      {editStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {t('studentEdit')}: {editStudent.user.firstName}
              </h2>
              <button onClick={() => setEditStudent(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3">
              {/* Photo upload */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden shrink-0 border-2 border-gray-200 dark:border-gray-600">
                  {editForm.avatarUrl
                    ? <img src={editForm.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : <span className="text-xl font-bold text-gray-400">{editStudent.user.firstName[0]?.toUpperCase()}</span>
                  }
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('photo')}</p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Camera size={13} />
                    {t('uploadPhoto')}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('name')}</label>
                  <input className="input-field" value={editForm.firstName} onChange={setE('firstName')} required />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('lastName')}</label>
                  <input className="input-field" value={editForm.lastName} onChange={setE('lastName')} />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('phone')}</label>
                <input className="input-field" value={editForm.phone} onChange={setE('phone')} placeholder="+998 XX XXX XX XX" />
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('parentName')}</label>
                  <input className="input-field" value={editForm.parentName} onChange={setE('parentName')} />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('parentPhone')}</label>
                  <input className="input-field" value={editForm.parentPhone} onChange={setE('parentPhone')} placeholder="+998 XX XXX XX XX" />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('group')}</label>
                <select className="input-field" value={editForm.courseId} onChange={setE('courseId')}>
                  <option value="">—</option>
                  {courses?.data.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.direction?.name ? `${c.direction.name} • ` : ''}{c.title}
                    </option>
                  ))}
                </select>
              </div>

              {updateMutation.isError && (
                <p className="text-red-500 text-sm">Xatolik yuz berdi.</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditStudent(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="flex-1 btn-primary flex items-center justify-center gap-2"
                >
                  {updateMutation.isPending
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : t('save')
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
