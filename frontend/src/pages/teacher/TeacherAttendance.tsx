import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, Save, AlertTriangle, Calendar, Clock } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { teachersApi } from '../../api/teachers'
import { coursesApi } from '../../api/courses'
import { attendanceApi, type AttendanceRecordDto } from '../../api/attendance'
import { format } from 'date-fns'

const UZ_DAYS: Record<string, number> = {
  Dushanba: 1, Seshanba: 2, Chorshanba: 3,
  Payshanba: 4, Juma: 5, Shanba: 6, Yakshanba: 0,
}

const UZ_DAY_NAMES = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba']

type Status = 'present' | 'absent' | 'late'

interface RowState {
  [studentId: string]: { status: Status; note: string }
}

const STATUS_OPTIONS: { value: Status; label: string; color: string }[] = [
  { value: 'present', label: 'Keldi', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
  { value: 'absent', label: 'Kelmadi', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300' },
  { value: 'late', label: 'Kech', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-700' },
]

export default function TeacherAttendance() {
  const { user } = useAuthContext()
  const { t } = useLang()
  const qc = useQueryClient()

  const [selectedCourseId, setSelectedCourseId] = useState('')
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [rows, setRows] = useState<RowState>({})
  const [saved, setSaved] = useState(false)

  const { data: teacherRecord } = useQuery({
    queryKey: ['my-teacher', user?.id],
    queryFn: () => teachersApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const { data: courses } = useQuery({
    queryKey: ['teacher-courses', teacherRecord?.id],
    queryFn: () => coursesApi.getTeacherCourses(teacherRecord!.id),
    enabled: !!teacherRecord?.id,
  })

  const selectedCourse = courses?.find((c) => c.id === selectedCourseId)

  // Parse course schedule to find class day numbers
  const courseClassDays = useMemo(() => {
    if (!selectedCourse?.schedule) return new Set<number>()
    const days = new Set<number>()
    selectedCourse.schedule.forEach((s) => {
      const dayName = s.split(' ')[0]
      const dayNum = UZ_DAYS[dayName]
      if (dayNum !== undefined) days.add(dayNum)
    })
    return days
  }, [selectedCourse])

  // Check if selected date is a class day
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null
  const selectedDateDayNum = selectedDateObj ? selectedDateObj.getDay() : -1
  const isClassDay = courseClassDays.size === 0 || courseClassDays.has(selectedDateDayNum)

  // Preload existing attendance when course+date changes
  useQuery({
    queryKey: ['attendance-load', selectedCourseId, selectedDate],
    queryFn: async () => {
      const records = await attendanceApi.getAll({ courseId: selectedCourseId, date: selectedDate })
      const state: RowState = {}
      records.forEach((r) => {
        state[r.student.id] = { status: r.status, note: r.note ?? '' }
      })
      setRows(state)
      return state
    },
    enabled: !!selectedCourseId && !!selectedDate,
  })

  const saveMutation = useMutation({
    mutationFn: () => {
      const students = selectedCourse?.students ?? []
      const records: AttendanceRecordDto[] = students.map((s) => ({
        studentId: s.id,
        status: rows[s.id]?.status ?? 'present',
        note: rows[s.id]?.note,
      }))
      return attendanceApi.saveBulk({ courseId: selectedCourseId, date: selectedDate, records })
    },
    onSuccess: () => {
      setSaved(true)
      qc.invalidateQueries({ queryKey: ['attendance-load'] })
      setTimeout(() => setSaved(false), 3000)
    },
  })

  const setStatus = (studentId: string, status: Status) => {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }))
  }

  const setNote = (studentId: string, note: string) => {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], note } }))
  }

  const students = selectedCourse?.students ?? []

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('takeAttendance')}</h1>

      {/* Controls */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm p-4 space-y-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-40">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('selectGroup')}</label>
            <select
              className="input-field"
              value={selectedCourseId}
              onChange={(e) => { setSelectedCourseId(e.target.value); setRows({}) }}
            >
              <option value="">— {t('selectGroup')} —</option>
              {courses?.map((c) => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <div className="min-w-40">
            <label className="text-sm text-gray-600 dark:text-gray-400 mb-1 block">{t('selectDate')}</label>
            <input type="date" className="input-field" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>

        {/* Schedule info for selected course */}
        {selectedCourse?.schedule && selectedCourse.schedule.length > 0 && (
          <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
            <Calendar size={15} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-1.5">Dars kunlari:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedCourse.schedule.map((s, i) => {
                  const parts = s.split(' ')
                  const day = parts[0]
                  const time = parts[1] ?? ''
                  return (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-800/40 text-emerald-700 dark:text-emerald-200 rounded-full text-xs font-medium">
                      <span>{day}</span>
                      {time && <span className="opacity-70 flex items-center gap-0.5"><Clock size={10} />{time}</span>}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* Warning: not a class day */}
        {selectedCourseId && selectedDate && !isClassDay && (
          <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              <strong>{UZ_DAY_NAMES[selectedDateDayNum]}</strong> — bu kurs uchun belgilangan dars kuni emas. Siz baribir davomat ola olasiz (qo'shimcha dars uchun).
            </p>
          </div>
        )}
        {selectedCourseId && students.length > 0 && (
          <div className="flex gap-2 items-center flex-wrap">
            <button
              onClick={() => {
                const all: RowState = {}
                students.forEach((s) => { all[s.id] = { status: 'present', note: rows[s.id]?.note ?? '' } })
                setRows(all)
              }}
              className="text-xs px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Barchasini keldi
            </button>
            <button
              onClick={() => {
                const all: RowState = {}
                students.forEach((s) => { all[s.id] = { status: 'absent', note: rows[s.id]?.note ?? '' } })
                setRows(all)
              }}
              className="text-xs px-3 py-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              Barchasini kelmadi
            </button>
          </div>
        )}
      </div>

      {/* Student table */}
      {selectedCourseId && (
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
          {students.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">{t('noStudents')}</p>
          ) : (
            <>
              <table className="w-full text-sm">
                <thead>
                  <tr className="table-header">
                    <th className="px-4 py-3 text-left font-medium w-8">№</th>
                    <th className="px-4 py-3 text-left font-medium">{t('name')}</th>
                    <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
                    <th className="px-4 py-3 text-left font-medium hidden sm:table-cell">Sabab/izoh</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, i) => {
                    const row = rows[s.id] ?? { status: 'present', note: '' }
                    return (
                      <tr key={s.id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                        <td className="px-4 py-3 text-gray-500">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                              {s.user.avatarUrl
                                ? <img src={s.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                                : s.user.firstName?.[0]?.toUpperCase()
                              }
                            </div>
                            <span className="font-medium text-gray-800 dark:text-white">
                              {s.user.firstName} {s.user.lastName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {STATUS_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => setStatus(s.id, opt.value)}
                                className={`px-2 py-1 rounded-full text-xs font-medium transition-all border-2 ${
                                  row.status === opt.value
                                    ? `${opt.color} border-current`
                                    : 'border-transparent bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <input
                            className="input-field py-1 text-xs"
                            placeholder="Izoh..."
                            value={row.note}
                            onChange={(e) => setNote(s.id, e.target.value)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>

              {/* Save */}
              <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                {saved && (
                  <div className="flex items-center gap-2 text-green-600 text-sm">
                    <Check size={14} /> {t('attendanceSaved')}
                  </div>
                )}
                {!saved && <div />}
                <button
                  onClick={() => saveMutation.mutate()}
                  disabled={saveMutation.isPending}
                  className="btn-primary flex items-center gap-2"
                >
                  {saveMutation.isPending
                    ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <><Save size={15} /> {t('save')}</>
                  }
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
