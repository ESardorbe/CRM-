import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, User, Calendar, Clock, ChevronLeft, ChevronRight, Bell } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { teachersApi } from '../../api/teachers'
import { coursesApi } from '../../api/courses'
import type { Course } from '../../types'

const UZ_DAYS: Record<string, number> = {
  Dushanba: 1, Seshanba: 2, Chorshanba: 3,
  Payshanba: 4, Juma: 5, Shanba: 6, Yakshanba: 0,
}

const UZ_DAY_NAMES_SHORT = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh']
const UZ_MONTH_NAMES = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
]

interface ScheduleEntry {
  dayNum: number
  dayName: string
  time: string
  courseTitle: string
  courseId: string
}

function parseSchedule(courses: Course[]): ScheduleEntry[] {
  const result: ScheduleEntry[] = []
  courses.forEach((course) => {
    course.schedule?.forEach((s) => {
      const parts = s.split(' ')
      const dayName = parts[0]
      const time = parts[1] ?? ''
      const dayNum = UZ_DAYS[dayName]
      if (dayNum !== undefined) {
        result.push({ dayNum, dayName, time, courseTitle: course.title, courseId: course.id })
      }
    })
  })
  return result
}

function getNextClassDays(scheduleEntries: ScheduleEntry[], count = 3) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const results: { date: Date; entries: ScheduleEntry[] }[] = []

  for (let i = 0; i <= 14 && results.length < count; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dayNum = d.getDay()
    const matching = scheduleEntries.filter((e) => e.dayNum === dayNum)
    if (matching.length > 0) {
      results.push({ date: d, entries: matching })
    }
  }
  return results
}

// Calendar: Monday-first weeks
function buildCalendar(year: number, month: number): (number | null)[][] {
  const firstDayJS = new Date(year, month, 1).getDay()
  const firstDayMon = (firstDayJS + 6) % 7 // 0=Mon
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const weeks: (number | null)[][] = []
  let week: (number | null)[] = Array(firstDayMon).fill(null)
  for (let d = 1; d <= daysInMonth; d++) {
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    weeks.push(week)
  }
  return weeks
}

// Day of week for a given date (Mon-based: 0=Mon)
function dayOfWeekMon(year: number, month: number, day: number) {
  return (new Date(year, month, day).getDay() + 6) % 7
}

export default function TeacherDashboard() {
  const { user } = useAuthContext()
  const { t } = useLang()
  const today = new Date()
  const [calYear, setCalYear] = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())

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

  const totalStudents = courses?.reduce((sum, c) => sum + (c.students?.length ?? 0), 0) ?? 0
  const activeCourses = courses?.filter((c) => c.isActive).length ?? 0

  const scheduleEntries = useMemo(() => parseSchedule(courses ?? []), [courses])

  // Class days as Mon-based day numbers (0=Mon)
  const classDaysMon = useMemo(() => {
    const s = new Set<number>()
    scheduleEntries.forEach((e) => s.add((e.dayNum + 6) % 7))
    return s
  }, [scheduleEntries])

  const nextClasses = useMemo(() => getNextClassDays(scheduleEntries, 3), [scheduleEntries])
  const nextClass = nextClasses[0] ?? null

  const calWeeks = useMemo(() => buildCalendar(calYear, calMonth), [calYear, calMonth])

  const isToday = (d: number) =>
    d === today.getDate() && calMonth === today.getMonth() && calYear === today.getFullYear()

  const isClassDayCell = (d: number) => classDaysMon.has(dayOfWeekMon(calYear, calMonth, d))

  const prevMonth = () => {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1) }
    else setCalMonth((m) => m - 1)
  }
  const nextMonth = () => {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1) }
    else setCalMonth((m) => m + 1)
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              : (user?.firstName?.[0]?.toUpperCase() ?? 'T')
            }
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="text-white/80 text-sm mt-0.5">{user?.email}</p>
            {teacherRecord?.teacherId && (
              <p className="text-white/60 text-xs mt-1">ID: {teacherRecord.teacherId}</p>
            )}
            {teacherRecord?.direction && (
              <span className="inline-block mt-1 text-xs bg-white/20 px-2 py-0.5 rounded-full">
                {teacherRecord.direction.name}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <BookOpen size={22} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{activeCourses}</p>
            <p className="text-sm text-gray-500">{t('totalGroups')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Users size={22} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{totalStudents}</p>
            <p className="text-sm text-gray-500">{t('totalStudentsCount')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Calendar size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{courses?.length ?? 0}</p>
            <p className="text-sm text-gray-500">{t('groups')}</p>
          </div>
        </div>
      </div>

      {/* Calendar + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Mini Calendar */}
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-800 dark:text-white">Dars jadvali</h2>
            <div className="flex items-center gap-2">
              <button onClick={prevMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200 min-w-24 text-center">
                {UZ_MONTH_NAMES[calMonth]} {calYear}
              </span>
              <button onClick={nextMonth} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday headers: Du Se Ch Pa Ju Sh Ya */}
          <div className="grid grid-cols-7 mb-2">
            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {calWeeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                if (!day) return <div key={di} />
                const classDay = isClassDayCell(day)
                const todayCell = isToday(day)
                return (
                  <div
                    key={di}
                    className={`
                      relative flex items-center justify-center h-9 rounded-lg mx-0.5 my-0.5 text-sm font-medium
                      ${todayCell
                        ? 'bg-primary text-white shadow-md'
                        : classDay
                          ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-300 dark:ring-emerald-700'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    {day}
                    {classDay && !todayCell && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-500" />
                    )}
                  </div>
                )
              })}
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-4 h-4 rounded bg-primary inline-block" />
              Bugun
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-4 h-4 rounded bg-emerald-100 dark:bg-emerald-900/40 ring-1 ring-emerald-300 inline-block" />
              Dars kuni
            </div>
          </div>
        </div>

        {/* Upcoming classes */}
        <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm p-5">
          <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">Yaqin darslar</h2>

          {nextClasses.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Hali dars jadvali belgilanmagan</p>
          ) : (
            <div className="space-y-3">
              {nextClasses.map(({ date, entries }, idx) => {
                const isNextToday = date.toDateString() === today.toDateString()
                const dayName = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'][date.getDay()]
                const formattedDate = `${date.getDate()} ${UZ_MONTH_NAMES[date.getMonth()]}`
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border ${
                      idx === 0
                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
                        : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {idx === 0 && <Bell size={13} className="text-emerald-600 dark:text-emerald-400" />}
                      <span className={`text-xs font-semibold ${idx === 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-500'}`}>
                        {isNextToday ? 'Bugun' : dayName} — {formattedDate}
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {entries.map((entry, ei) => (
                        <div key={ei} className="flex items-center gap-2 text-sm">
                          <Clock size={12} className="text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-700 dark:text-gray-200">{entry.courseTitle}</span>
                          {entry.time && (
                            <span className="text-xs text-gray-400 ml-auto">{entry.time}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Courses list */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm p-5">
        <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">{t('myGroups')}</h2>
        {!courses || courses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">{t('notFound')}</p>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white text-sm">{c.title}</p>
                  <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <User size={11} /> {c.students?.length ?? 0} {t('students')}
                    </span>
                    {c.direction && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">{c.direction.name}</span>
                    )}
                    {c.schedule && c.schedule.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Calendar size={10} />
                        {c.schedule.map((s) => s.split(' ')[0]).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.isActive ? t('active') : t('inactive')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
