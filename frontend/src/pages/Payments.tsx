import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, CheckCheck } from 'lucide-react'
import { statisticsApi, type CreatePaymentDto } from '../api/statistics'
import { studentsApi } from '../api/students'
import { coursesApi } from '../api/courses'
import SearchInput from '../components/ui/SearchInput'
import Pagination from '../components/ui/Pagination'
import { format } from 'date-fns'

const EMPTY: CreatePaymentDto = {
  studentId: '',
  courseId: '',
  amount: 0,
  status: 'completed',
  method: 'cash',
  paymentDate: format(new Date(), 'yyyy-MM-dd'),
  description: '',
}

export default function Payments() {
  const qc = useQueryClient()
  const [form, setForm] = useState<CreatePaymentDto>(EMPTY)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ['payments', page],
    queryFn: () => statisticsApi.getPayments({ page, limit: 10 }),
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
    mutationFn: statisticsApi.createPayment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      setForm(EMPTY)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate(form)
  }

  const set = (key: keyof CreatePaymentDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [key]: key === 'amount' ? Number(e.target.value) : e.target.value }))

  const filteredData = data?.data.filter((p) =>
    search ? `${p.student.user.firstName} ${p.student.user.lastName}`.toLowerCase().includes(search.toLowerCase()) : true,
  )

  return (
    <div className="space-y-6">
      {/* Add form */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-primary mb-5">To'lov qilish</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">O'quvchi ismi</label>
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
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Yo'nalish</label>
            <select className="input-field" value={form.courseId} onChange={set('courseId')} required>
              <option value="">Tanlang</option>
              {courses?.data.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Telefon raqam</label>
            <input className="input-field" placeholder="+998 xx xxx xx xx" value={
              students?.data.find((s) => s.id === form.studentId)?.user.phone ?? ''
            } readOnly />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">O'qituvchi ismi</label>
            <input className="input-field" value={
              courses?.data.find((c) => c.id === form.courseId)?.teacher
                ? `${courses.data.find((c) => c.id === form.courseId)!.teacher!.user.firstName} ${courses.data.find((c) => c.id === form.courseId)!.teacher!.user.lastName}`
                : ''
            } readOnly placeholder="Avtomatik" />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">To'lov qilayotgan kun</label>
            <input className="input-field" type="date" value={form.paymentDate} onChange={set('paymentDate')} required />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">Summa (so'm)</label>
            <input className="input-field" type="number" placeholder="0" value={form.amount || ''} onChange={set('amount')} required />
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">To'lov usuli</label>
            <select className="input-field" value={form.method} onChange={set('method')}>
              <option value="cash">Naqd</option>
              <option value="card">Karta</option>
              <option value="bank_transfer">Bank o'tkazmasi</option>
              <option value="online">Online</option>
            </select>
          </div>
          <div className="col-start-3 flex items-end">
            <button type="submit" disabled={createMutation.isPending} className="btn-primary w-full">
              {createMutation.isPending ? 'Saqlanmoqda...' : "To'lov qilish"}
            </button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <h2 className="text-lg font-bold text-primary">
            To'lov qilganlar{' '}
            <span className="text-sm font-normal text-gray-500">(shu oy bo'yicha)</span>
          </h2>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1) }} placeholder="O'quvchi ismini kiriting" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                {['№', "O'quvchi ismi", 'Telefon nomer', "Yo'nalish", "O'qituvchisi", "To'lov vaqti", ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">Yuklanmoqda...</td></tr>
              ) : filteredData?.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-400">To'lovlar topilmadi</td></tr>
              ) : (
                filteredData?.map((p, i) => (
                  <tr key={p.id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                    <td className="px-4 py-3 font-medium">{(page - 1) * 10 + i + 1}</td>
                    <td className="px-4 py-3">{p.student.user.firstName} {p.student.user.lastName}</td>
                    <td className="px-4 py-3">{p.student.user.phone ?? '—'}</td>
                    <td className="px-4 py-3">{p.course.title}</td>
                    <td className="px-4 py-3">
                      {p.course.teacher
                        ? `${p.course.teacher.user.firstName} ${p.course.teacher.user.lastName}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{format(new Date(p.paymentDate), 'dd.MM.yyyy')}</td>
                    <td className="px-4 py-3">
                      {p.status === 'completed' ? (
                        <CheckCheck size={16} className="text-primary" />
                      ) : (
                        <Check size={16} className="text-gray-400" />
                      )}
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
