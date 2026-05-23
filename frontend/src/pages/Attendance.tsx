import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { statisticsApi, type CreateMovementDto } from '../api/statistics'
import { studentsApi } from '../api/students'
import { coursesApi } from '../api/courses'
import Pagination from '../components/ui/Pagination'
import SearchInput from '../components/ui/SearchInput'
import { format } from 'date-fns'

const EMPTY: CreateMovementDto = {
  studentId: '',
  courseId: '',
  type: 'joined',
  date: format(new Date(), 'yyyy-MM-dd'),
  reason: '',
}

export default function Attendance() {
  const qc = useQueryClient()
  const [form, setForm] = useState<CreateMovementDto>(EMPTY)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['movements', page, typeFilter],
    queryFn: () => statisticsApi.getMovements({ page, limit: 10, movementType: typeFilter || undefined }),
  })

  const { data: students } = useQuery({
    queryKey: ['students-list'],
    queryFn: () => studentsApi.getAll({ limit: 200 }),
  })

  const { data: courses } = useQuery({
    queryKey: ['courses-list'],
    queryFn: () => coursesApi.getAll({ limit: 100 }),
  })

  const createMutation = useMutation({
    mutationFn: statisticsApi.createMovement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movements'] })
      setForm(EMPTY)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  const set = (key: keyof CreateMovementDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const filteredData = data?.data.filter((m) =>
    search
      ? `${m.student.user.firstName} ${m.student.user.lastName}`.toLowerCase().includes(search.toLowerCase())
      : true,
  )

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-5">Davomat qo'shish</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">O'quvchi</label>
            <select className="input-field" value={form.studentId} onChange={set('studentId')} required>
              <option value="">Tanlang</option>
              {students?.data.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.user.firstName} {s.user.lastName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Guruh</label>
            <select className="input-field" value={form.courseId} onChange={set('courseId')} required>
              <option value="">Tanlang</option>
              {courses?.data.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Turi</label>
            <select className="input-field" value={form.type} onChange={set('type')}>
              <option value="joined">Qo'shildi</option>
              <option value="left">Chiqdi</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Sana</label>
            <input className="input-field" type="date" value={form.date ?? ''} onChange={set('date')} />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Sabab (ixtiyoriy)</label>
            <input className="input-field" placeholder="Sabab" value={form.reason ?? ''} onChange={set('reason')} />
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
              {createMutation.isPending ? 'Saqlanmoqda...' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 gap-4">
          <h2 className="text-lg font-bold text-primary">Davomat</h2>
          <div className="flex items-center gap-3">
            <select
              className="input-field w-36"
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
            >
              <option value="">Barchasi</option>
              <option value="joined">Qo'shilganlar</option>
              <option value="left">Chiqqanlar</option>
            </select>
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="O'quvchi ismi" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {['№', "O'quvchi ismi", 'Guruh', 'Turi', 'Sana', 'Sabab'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Yuklanmoqda...</td></tr>
              ) : filteredData?.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Ma'lumot topilmadi</td></tr>
              ) : (
                filteredData?.map((m, i) => (
                  <tr key={m.id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-4 py-3 font-medium">{(page - 1) * 10 + i + 1}</td>
                    <td className="px-4 py-3">{m.student.user.firstName} {m.student.user.lastName}</td>
                    <td className="px-4 py-3">{m.course.title}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        m.type === 'joined' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                      }`}>
                        {m.type === 'joined' ? "Qo'shildi" : 'Chiqdi'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{format(new Date(m.date), 'dd.MM.yyyy')}</td>
                    <td className="px-4 py-3 text-gray-500">{m.reason ?? '—'}</td>
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
