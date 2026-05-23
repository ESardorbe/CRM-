import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Trash2, Pencil, X } from 'lucide-react'
import { directionsApi, type CreateDirectionDto } from '../api/directions'
import Pagination from '../components/ui/Pagination'
import type { Direction } from '../types'
import { useLang } from '../context/LangContext'

const DAY_TYPE_DAYS: Record<string, string[]> = {
  odd: ['Dushanba', 'Chorshanba', 'Juma'],
  even: ['Seshanba', 'Payshanba', 'Shanba'],
  daily: ['Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma'],
}

const EMPTY: CreateDirectionDto = {
  name: '',
  description: '',
  dayType: 'odd',
  startTime: '09:00',
  endTime: '11:00',
}

function schedulePreviewText(form: CreateDirectionDto) {
  const days = DAY_TYPE_DAYS[form.dayType] ?? []
  return days.map((d) => `${d} ${form.startTime}-${form.endTime}`).join(' | ')
}

export default function Directions() {
  const qc = useQueryClient()
  const { t } = useLang()
  const [form, setForm] = useState<CreateDirectionDto>(EMPTY)
  const [page, setPage] = useState(1)
  const [editDirection, setEditDirection] = useState<Direction | null>(null)
  const [editForm, setEditForm] = useState<CreateDirectionDto>(EMPTY)

  const { data, isLoading } = useQuery({
    queryKey: ['directions', page],
    queryFn: () => directionsApi.getAll({ page, limit: 10 }),
  })

  const createMutation = useMutation({
    mutationFn: directionsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['directions'] })
      qc.invalidateQueries({ queryKey: ['directions-list'] })
      setForm(EMPTY)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: Partial<CreateDirectionDto> }) =>
      directionsApi.update(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['directions'] })
      qc.invalidateQueries({ queryKey: ['directions-list'] })
      setEditDirection(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: directionsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['directions'] })
      qc.invalidateQueries({ queryKey: ['directions-list'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  const openEdit = (d: Direction) => {
    setEditDirection(d)
    setEditForm({
      name: d.name,
      description: d.description ?? '',
      dayType: d.dayType as any,
      startTime: d.startTime,
      endTime: d.endTime,
    })
  }

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editDirection) return
    updateMutation.mutate({ id: editDirection.id, dto: editForm })
  }

  const set = (key: keyof CreateDirectionDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const setE = (key: keyof CreateDirectionDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setEditForm((f) => ({ ...f, [key]: e.target.value }))

  const dayTypeOptions = [
    { value: 'odd', label: t('oddDays') },
    { value: 'even', label: t('evenDays') },
    { value: 'daily', label: t('allDays') },
  ]

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-5">{t('directionAdd')}</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('directionName')}</label>
            <input className="input-field" placeholder="Masalan: Matematika" value={form.name} onChange={set('name')} required />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('dayType')}</label>
            <select className="input-field" value={form.dayType} onChange={set('dayType')}>
              {dayTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('description')}</label>
            <input className="input-field" placeholder="Qisqacha tavsif" value={form.description} onChange={set('description')} />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('startTime')}</label>
            <input className="input-field" type="time" value={form.startTime} onChange={set('startTime')} required />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('endTime')}</label>
            <input className="input-field" type="time" value={form.endTime} onChange={set('endTime')} required />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
              {createMutation.isPending ? t('loading') : t('add')}
            </button>
          </div>
        </form>

        {form.name && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{t('schedulePreview')}</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">{schedulePreviewText(form)}</p>
          </div>
        )}

        {createMutation.isError && (
          <p className="text-red-500 text-sm mt-2">Xatolik yuz berdi. Bu nomli yo'nalish mavjud bo'lishi mumkin.</p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold text-primary">{t('directionList')}</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {['№', t('directionName'), t('dayType'), t('schedule'), t('description'), ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">{t('loading')}</td></tr>
              ) : data?.data.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">{t('notFound')}</td></tr>
              ) : (
                data?.data.map((d, i) => (
                  <tr key={d.id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-4 py-3 font-medium">{(page - 1) * 10 + i + 1}</td>
                    <td className="px-4 py-3 font-medium">{d.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                        {dayTypeOptions.find((o) => o.value === d.dayType)?.label ?? d.dayType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {(DAY_TYPE_DAYS[d.dayType] ?? []).map((day) => `${day} ${d.startTime}-${d.endTime}`).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{d.description || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(d)} className="text-blue-400 hover:text-blue-600 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteMutation.mutate(d.id)} className="text-red-400 hover:text-red-600 transition-colors">
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
      {editDirection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-card-dark rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                {t('directionEdit')}: {editDirection.name}
              </h2>
              <button onClick={() => setEditDirection(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('directionName')}</label>
                <input className="input-field" value={editForm.name} onChange={setE('name')} required />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('dayType')}</label>
                <select className="input-field" value={editForm.dayType} onChange={setE('dayType')}>
                  {dayTypeOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('startTime')}</label>
                  <input className="input-field" type="time" value={editForm.startTime} onChange={setE('startTime')} required />
                </div>
                <div className="flex-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('endTime')}</label>
                  <input className="input-field" type="time" value={editForm.endTime} onChange={setE('endTime')} required />
                </div>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('description')}</label>
                <input className="input-field" value={editForm.description ?? ''} onChange={setE('description')} />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">{t('schedulePreview')}</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">{schedulePreviewText(editForm)}</p>
              </div>

              {updateMutation.isError && (
                <p className="text-red-500 text-sm">Xatolik yuz berdi.</p>
              )}

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditDirection(null)}
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
