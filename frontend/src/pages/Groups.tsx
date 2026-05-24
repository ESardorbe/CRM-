import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { coursesApi, type CreateCourseDto } from '../api/courses'
import { teachersApi } from '../api/teachers'
import { directionsApi } from '../api/directions'
import SearchInput from '../components/ui/SearchInput'
import Pagination from '../components/ui/Pagination'
import { useLang } from '../context/LangContext'

const DAY_TYPE_DAYS: Record<string, string[]> = {
  odd: ['Dushanba', 'Chorshanba', 'Juma'],
  even: ['Seshanba', 'Payshanba', 'Shanba'],
  daily: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
}

function generateCode(directionName: string, existingCodes: string[]): string {
  const prefix = directionName.replace(/\s+/g, '').substring(0, 3).toUpperCase()
  let code: string
  let attempts = 0
  do {
    const num = Math.floor(Math.random() * 900) + 100
    code = `${prefix}-${num}`
    attempts++
  } while (existingCodes.includes(code) && attempts < 20)
  return code
}

const EMPTY: CreateCourseDto = {
  title: '',
  description: '',
  code: '',
  teacherId: '',
  directionId: '',
  schedule: [],
  capacity: undefined,
}

interface EditForm {
  title: string
  teacherId: string
  directionId: string
  capacity: number | undefined
}

export default function Groups() {
  const qc = useQueryClient()
  const { t } = useLang()
  const [form, setForm] = useState<CreateCourseDto>(EMPTY)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditForm>({ title: '', teacherId: '', directionId: '', capacity: undefined })

  const { data, isLoading } = useQuery({
    queryKey: ['courses', page, search],
    queryFn: () => coursesApi.getAll({ page, limit: 10 }),
  })

  const { data: teachers } = useQuery({
    queryKey: ['teachers-list'],
    queryFn: () => teachersApi.getAll({ limit: 100 }),
  })

  const { data: directions } = useQuery({
    queryKey: ['directions-list'],
    queryFn: () => directionsApi.getAll({ limit: 100 }),
  })

  const existingCodes = data?.data.map((c) => c.code ?? '') ?? []

  useEffect(() => {
    if (!form.directionId) {
      setForm((f) => ({ ...f, schedule: [], code: '' }))
      return
    }
    const dir = directions?.data.find((d) => d.id === form.directionId)
    if (!dir) return
    const days = DAY_TYPE_DAYS[dir.dayType] ?? []
    const schedule = days.map((day) => `${day} ${dir.startTime}-${dir.endTime}`)
    const code = generateCode(dir.name, existingCodes)
    const title = form.title || dir.name
    setForm((f) => ({ ...f, schedule, code, title }))
  }, [form.directionId, directions?.data])

  const createMutation = useMutation({
    mutationFn: coursesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      setForm(EMPTY)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateCourseDto> }) =>
      coursesApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] })
      setEditId(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: coursesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const dto: CreateCourseDto = {
      title: form.title,
      code: form.code || undefined,
      description: form.description || undefined,
      teacherId: form.teacherId || undefined,
      directionId: form.directionId || undefined,
      startDate: form.startDate || undefined,
      schedule: form.schedule?.length ? form.schedule : undefined,
      capacity: form.capacity || undefined,
    }
    createMutation.mutate(dto)
  }

  const startEdit = (c: typeof data extends undefined ? never : NonNullable<typeof data>['data'][number]) => {
    setEditId(c.id)
    setEditForm({
      title: c.title,
      teacherId: c.teacher?.id ?? '',
      directionId: c.direction?.id ?? '',
      capacity: c.capacity ?? undefined,
    })
  }

  const saveEdit = () => {
    if (!editId) return
    updateMutation.mutate({ id: editId, dto: editForm })
  }

  const set = (key: keyof CreateCourseDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const selectedDir = directions?.data.find((d) => d.id === form.directionId)

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-5">{t('groupAdd')}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('direction')}</label>
            <select className="input-field" value={form.directionId ?? ''} onChange={set('directionId')} required>
              <option value="">Yo'nalishni tanlang</option>
              {directions?.data.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('groupName')}</label>
            <input className="input-field" placeholder="Guruh nomi" value={form.title} onChange={set('title')} required />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('groupCode')}</label>
            <input className="input-field bg-gray-50" placeholder="Avtomatik generatsiya" value={form.code ?? ''} onChange={set('code')} />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('teacher')}</label>
            <select className="input-field" value={form.teacherId ?? ''} onChange={set('teacherId')}>
              <option value="">Tanlang</option>
              {teachers?.data.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.firstName} {teacher.user.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('startDate')}</label>
            <input className="input-field" type="date" value={form.startDate ?? ''} onChange={set('startDate')} />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('capacity')}</label>
            <input className="input-field" type="number" placeholder="20" value={form.capacity ?? ''} onChange={set('capacity')} />
          </div>

          {selectedDir && form.schedule && form.schedule.length > 0 && (
            <div className="col-span-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-2">
                {t('schedule')} ({selectedDir.name}):
              </p>
              <div className="flex flex-wrap gap-2">
                {form.schedule.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-200 rounded-full text-xs font-medium">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="col-span-2">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('description')}</label>
            <input className="input-field" placeholder="Qo'shimcha ma'lumot" value={form.description ?? ''} onChange={set('description')} />
          </div>
          <div className="flex items-end">
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
          <h2 className="text-lg font-bold text-primary">{t('groupList')}</h2>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="Guruh nomini kiriting" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {['№', t('groupName'), t('groupCode'), t('direction'), t('teacher'), "O'quvchilar", t('schedule'), t('status'), ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">{t('loading')}</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-8 text-gray-400">{t('notFound')}</td></tr>
              ) : (
                data?.data.map((c, i) => (
                  <tr key={c.id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-4 py-3 font-medium">{(page - 1) * 10 + i + 1}</td>
                    <td className="px-4 py-3">
                      {editId === c.id ? (
                        <input
                          className="input-field text-xs py-1"
                          value={editForm.title}
                          onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                        />
                      ) : c.title}
                    </td>
                    <td className="px-4 py-3 text-xs">{c.code ?? '—'}</td>
                    <td className="px-4 py-3">
                      {editId === c.id ? (
                        <select
                          className="input-field text-xs py-1"
                          value={editForm.directionId}
                          onChange={(e) => setEditForm((f) => ({ ...f, directionId: e.target.value }))}
                        >
                          <option value="">—</option>
                          {directions?.data.map((d) => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                      ) : c.direction?.name ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {editId === c.id ? (
                        <select
                          className="input-field text-xs py-1"
                          value={editForm.teacherId}
                          onChange={(e) => setEditForm((f) => ({ ...f, teacherId: e.target.value }))}
                        >
                          <option value="">—</option>
                          {teachers?.data.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                              {teacher.user.firstName} {teacher.user.lastName}
                            </option>
                          ))}
                        </select>
                      ) : (
                        c.teacher ? `${c.teacher.user.firstName} ${c.teacher.user.lastName}` : '—'
                      )}
                    </td>
                    <td className="px-4 py-3">{c.students?.length ?? 0} ta</td>
                    <td className="px-4 py-3 text-xs text-gray-500 max-w-40">
                      {c.schedule?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {c.schedule.map((s, si) => (
                            <span key={si} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">{s}</span>
                          ))}
                        </div>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {editId === c.id ? (
                        <input
                          className="input-field text-xs py-1 w-16"
                          type="number"
                          value={editForm.capacity ?? ''}
                          onChange={(e) => setEditForm((f) => ({ ...f, capacity: e.target.value ? Number(e.target.value) : undefined }))}
                          placeholder="—"
                        />
                      ) : (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                          {c.isActive ? t('active') : t('inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {editId === c.id ? (
                          <>
                            <button onClick={saveEdit} disabled={updateMutation.isPending} className="text-green-500 hover:text-green-700 transition-colors">
                              <Check size={16} />
                            </button>
                            <button onClick={() => setEditId(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                              <X size={16} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => startEdit(c)} className="text-blue-400 hover:text-blue-600 transition-colors">
                              <Pencil size={16} />
                            </button>
                            <button onClick={() => deleteMutation.mutate(c.id)} className="text-red-400 hover:text-red-600 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
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
    </div>
  )
}
