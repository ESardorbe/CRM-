import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import { statisticsApi, type CreateMovementDto } from '../api/statistics'
import { studentsApi } from '../api/students'
import { coursesApi } from '../api/courses'
import { directionsApi } from '../api/directions'
import { attendanceApi } from '../api/attendance'
import Pagination from '../components/ui/Pagination'
import SearchInput from '../components/ui/SearchInput'

type Tab = 'attendance' | 'movements'

const EMPTY: CreateMovementDto = {
  studentId: '',
  courseId: '',
  type: 'joined',
  date: format(new Date(), 'yyyy-MM-dd'),
  reason: '',
}

const statusColors: Record<string, string> = {
  present: 'bg-green-100 text-green-700',
  absent: 'bg-red-100 text-red-600',
  late: 'bg-yellow-100 text-yellow-700',
}
const statusLabels: Record<string, string> = {
  present: 'Keldi',
  absent: 'Kelmadi',
  late: 'Kech',
}

export default function Attendance() {
  const qc = useQueryClient()
  const [tab, setTab] = useState<Tab>('attendance')

  // Attendance tab state
  const [attDirectionId, setAttDirectionId] = useState('')
  const [attCourseId, setAttCourseId] = useState('')
  const [attDate, setAttDate] = useState('')
  const [attSearch, setAttSearch] = useState('')

  // Movements tab state
  const [form, setForm] = useState<CreateMovementDto>(EMPTY)
  const [movSearch, setMovSearch] = useState('')
  const [movPage, setMovPage] = useState(1)
  const [typeFilter, setTypeFilter] = useState('')

  const { data: directions } = useQuery({
    queryKey: ['directions-list'],
    queryFn: () => directionsApi.getAll({ limit: 100 }),
  })

  const { data: allCourses } = useQuery({
    queryKey: ['courses-list'],
    queryFn: () => coursesApi.getAll({ limit: 200 }),
  })

  const { data: students } = useQuery({
    queryKey: ['students-list'],
    queryFn: () => studentsApi.getAll({ limit: 200 }),
  })

  const { data: movements, isLoading: movLoading } = useQuery({
    queryKey: ['movements', movPage, typeFilter],
    queryFn: () => statisticsApi.getMovements({ page: movPage, limit: 10, movementType: typeFilter || undefined }),
    enabled: tab === 'movements',
  })

  // Teacher-taken attendance: filter courses by direction
  const attCourses = attDirectionId
    ? allCourses?.data.filter((c) => c.direction?.id === attDirectionId)
    : allCourses?.data ?? []

  const { data: attRecords, isLoading: attLoading } = useQuery({
    queryKey: ['admin-attendance', attCourseId, attDate],
    queryFn: () => attendanceApi.getAll({ courseId: attCourseId || undefined, date: attDate || undefined }),
    enabled: !!(attCourseId || attDate),
  })

  const filteredAtt = attRecords?.filter((r) =>
    attSearch
      ? `${r.student.user.firstName} ${r.student.user.lastName}`.toLowerCase().includes(attSearch.toLowerCase())
      : true,
  )

  const createMutation = useMutation({
    mutationFn: statisticsApi.createMovement,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['movements'] })
      setForm(EMPTY)
    },
  })

  const handleMovSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  const set = (key: keyof CreateMovementDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const filteredMov = movements?.data.filter((m) =>
    movSearch
      ? `${m.student.user.firstName} ${m.student.user.lastName}`.toLowerCase().includes(movSearch.toLowerCase())
      : true,
  )

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('attendance')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'attendance' ? 'bg-white dark:bg-card-dark text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          Davomat (O'qituvchi)
        </button>
        <button
          onClick={() => setTab('movements')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'movements' ? 'bg-white dark:bg-card-dark text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}
        >
          Harakatlar (Qo'shildi/Chiqdi)
        </button>
      </div>

      {tab === 'attendance' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm">
            <h2 className="text-base font-bold text-primary mb-4">Davomat ko'rish</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Yo'nalish</label>
                <select
                  className="input-field"
                  value={attDirectionId}
                  onChange={(e) => { setAttDirectionId(e.target.value); setAttCourseId('') }}
                >
                  <option value="">Barchasi</option>
                  {directions?.data.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Guruh</label>
                <select
                  className="input-field"
                  value={attCourseId}
                  onChange={(e) => setAttCourseId(e.target.value)}
                >
                  <option value="">Barchasi</option>
                  {attCourses?.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Sana</label>
                <input
                  type="date"
                  className="input-field"
                  value={attDate}
                  onChange={(e) => setAttDate(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Qidirish</label>
                <SearchInput value={attSearch} onChange={setAttSearch} placeholder="O'quvchi ismi" />
              </div>
            </div>
          </div>

          {/* Attendance table */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    {['№', "O'quvchi ismi", 'Guruh', "Yo'nalish", "O'qituvchi", 'Holat', 'Sana', 'Izoh'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {!attCourseId && !attDate ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-gray-400 text-sm">
                        Guruh yoki sanani tanlang
                      </td>
                    </tr>
                  ) : attLoading ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">Yuklanmoqda...</td></tr>
                  ) : filteredAtt?.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-8 text-gray-400">Davomat topilmadi</td></tr>
                  ) : (
                    filteredAtt?.map((r, i) => (
                      <tr key={r.id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                        <td className="px-4 py-3 font-medium">{i + 1}</td>
                        <td className="px-4 py-3">
                          {r.student.user.firstName} {r.student.user.lastName}
                        </td>
                        <td className="px-4 py-3">{r.course.title}</td>
                        <td className="px-4 py-3">{(r.course as any).direction?.name ?? '—'}</td>
                        <td className="px-4 py-3">
                          {(r.course as any).teacher?.user
                            ? `${(r.course as any).teacher.user.firstName} ${(r.course as any).teacher.user.lastName}`
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status] ?? ''}`}>
                            {statusLabels[r.status] ?? r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">{format(new Date(r.date), 'dd.MM.yyyy')}</td>
                        <td className="px-4 py-3 text-gray-500">{r.note ?? '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'movements' && (
        <div className="space-y-4">
          {/* Add movement form */}
          <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm">
            <h2 className="text-base font-bold text-primary mb-4">Harakatni qo'shish</h2>
            <form onSubmit={handleMovSubmit} className="grid grid-cols-3 gap-4">
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
                  {allCourses?.data.map((c) => (
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

          {/* Movements table */}
          <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 gap-4">
              <h2 className="text-base font-bold text-primary">Harakatlar ro'yxati</h2>
              <div className="flex items-center gap-3">
                <select
                  className="input-field w-36"
                  value={typeFilter}
                  onChange={(e) => { setTypeFilter(e.target.value); setMovPage(1) }}
                >
                  <option value="">Barchasi</option>
                  <option value="joined">Qo'shilganlar</option>
                  <option value="left">Chiqqanlar</option>
                </select>
                <SearchInput value={movSearch} onChange={(v) => { setMovSearch(v); setMovPage(1) }} placeholder="O'quvchi ismi" />
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
                  {movLoading ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">Yuklanmoqda...</td></tr>
                  ) : filteredMov?.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-8 text-gray-400">Ma'lumot topilmadi</td></tr>
                  ) : (
                    filteredMov?.map((m, i) => (
                      <tr key={m.id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                        <td className="px-4 py-3 font-medium">{(movPage - 1) * 10 + i + 1}</td>
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
              <Pagination page={movPage} total={movements?.total ?? 0} limit={10} onChange={setMovPage} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
