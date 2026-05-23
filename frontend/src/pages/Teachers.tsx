import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Pencil, X } from 'lucide-react'
import { teachersApi, type CreateTeacherDto, type UpdateTeacherDto } from '../api/teachers'
import { directionsApi } from '../api/directions'
import Pagination from '../components/ui/Pagination'
import SearchInput from '../components/ui/SearchInput'
import type { Teacher } from '../types'
import { useLang } from '../context/LangContext'

const EMPTY: CreateTeacherDto = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '+998',
  password: 'teacher123',
  directionId: '',
  bio: '',
}

interface EditForm {
  firstName: string
  lastName: string
  phone: string
  directionId: string
  bio: string
}

export default function Teachers() {
  const qc = useQueryClient()
  const { t } = useLang()

  const [form, setForm] = useState<CreateTeacherDto>(EMPTY)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({
    firstName: '', lastName: '', phone: '', directionId: '', bio: '',
  })

  const { data, isLoading } = useQuery({
    queryKey: ['teachers', page, search],
    queryFn: () => teachersApi.getAll({ page, limit: 10 }),
  })

  const { data: directions } = useQuery({
    queryKey: ['directions-list'],
    queryFn: () => directionsApi.getAll({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: teachersApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] })
      qc.invalidateQueries({ queryKey: ['teachers-list'] })
      setForm(EMPTY)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateTeacherDto }) =>
      teachersApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] })
      qc.invalidateQueries({ queryKey: ['teachers-list'] })
      setEditTeacher(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: teachersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] })
      qc.invalidateQueries({ queryKey: ['teachers-list'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({ ...form, directionId: form.directionId || undefined })
  }

  const openEdit = (teacher: Teacher) => {
    setEditTeacher(teacher)
    setEditForm({
      firstName: teacher.user.firstName,
      lastName: teacher.user.lastName ?? '',
      phone: teacher.user.phone ?? '+998',
      directionId: teacher.direction?.id ?? '',
      bio: teacher.bio ?? '',
    })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTeacher) return
    updateMutation.mutate({
      id: editTeacher.id,
      dto: {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phone: editForm.phone,
        directionId: editForm.directionId || undefined,
        bio: editForm.bio,
      },
    })
  }

  const setF = (key: keyof CreateTeacherDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-5">{t('teacherAdd')}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('name')} *</label>
            <input className="input-field" placeholder="Ism" value={form.firstName} onChange={setF('firstName')} required />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('lastName')}</label>
            <input className="input-field" placeholder="Familiya" value={form.lastName ?? ''} onChange={setF('lastName')} />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('email')} *</label>
            <input className="input-field" type="email" placeholder="email@example.com" value={form.email} onChange={setF('email')} required />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('phone')}</label>
            <input className="input-field" placeholder="+998 XX XXX XX XX" value={form.phone ?? ''} onChange={setF('phone')} />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('direction')}</label>
            <select className="input-field" value={form.directionId ?? ''} onChange={setF('directionId')}>
              <option value="">— {t('direction')} tanlang</option>
              {directions?.data.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('password')} *</label>
            <input className="input-field" type="password" placeholder="teacher123" value={form.password} onChange={setF('password')} required />
          </div>
          <div className="col-span-2">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('bio')}</label>
            <input className="input-field" placeholder="Qisqacha ma'lumot" value={form.bio ?? ''} onChange={setF('bio')} />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
              {createMutation.isPending ? t('loading') : t('add')}
            </button>
          </div>
        </form>
        {createMutation.isError && (
          <p className="text-red-500 text-sm mt-2">Xatolik yuz berdi. Bu email allaqachon ro'yxatdan o'tgan bo'lishi mumkin.</p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-bold text-primary">{t('teacherList')}</h2>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="O'qituvchi ismini kiriting" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {['№', t('name'), t('email'), t('phone'), t('direction'), t('bio'), t('status'), t('actions')].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">{t('loading')}</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">{t('notFound')}</td></tr>
              ) : (
                data?.data.map((teacher, i) => (
                  <tr key={teacher.id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-4 py-3 font-medium">{(page - 1) * 10 + i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                          {teacher.user.avatarUrl
                            ? <img src={teacher.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                            : (teacher.user.firstName[0]?.toUpperCase() ?? 'T')
                          }
                        </div>
                        <div>
                          <p className="font-medium">{teacher.user.firstName} {teacher.user.lastName}</p>
                          {teacher.teacherId && <p className="text-xs text-gray-400">{teacher.teacherId}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{teacher.user.email}</td>
                    <td className="px-4 py-3">{teacher.user.phone ?? '—'}</td>
                    <td className="px-4 py-3">
                      {teacher.direction
                        ? <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">{teacher.direction.name}</span>
                        : '—'
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-32 truncate">{teacher.bio || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${teacher.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                        {teacher.isActive ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(teacher)} className="text-blue-400 hover:text-blue-600 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(teacher.id)} className="text-red-400 hover:text-red-600 transition-colors">
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
      {editTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {t('teacherEdit')}: {editTeacher.user.firstName}
              </h2>
              <button onClick={() => setEditTeacher(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('name')}</label>
                  <input
                    className="input-field"
                    value={editForm.firstName}
                    onChange={(e) => setEditForm((f) => ({ ...f, firstName: e.target.value }))}
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('lastName')}</label>
                  <input
                    className="input-field"
                    value={editForm.lastName}
                    onChange={(e) => setEditForm((f) => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('phone')}</label>
                <input
                  className="input-field"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="+998 XX XXX XX XX"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('direction')}</label>
                <select
                  className="input-field"
                  value={editForm.directionId}
                  onChange={(e) => setEditForm((f) => ({ ...f, directionId: e.target.value }))}
                >
                  <option value="">—</option>
                  {directions?.data.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('bio')}</label>
                <input
                  className="input-field"
                  value={editForm.bio}
                  onChange={(e) => setEditForm((f) => ({ ...f, bio: e.target.value }))}
                  placeholder="Qisqacha ma'lumot"
                />
              </div>

              {updateMutation.isError && (
                <p className="text-red-500 text-sm">Xatolik yuz berdi.</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditTeacher(null)}
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
