import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown, ChevronRight, Users, BookOpen, Phone } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { teachersApi } from '../../api/teachers'
import { coursesApi } from '../../api/courses'
import type { Course } from '../../types'

export default function TeacherGroups() {
  const { user } = useAuthContext()
  const { t } = useLang()
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: teacherRecord } = useQuery({
    queryKey: ['my-teacher', user?.id],
    queryFn: () => teachersApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const { data: courses, isLoading } = useQuery({
    queryKey: ['teacher-courses', teacherRecord?.id],
    queryFn: () => coursesApi.getTeacherCourses(teacherRecord!.id),
    enabled: !!teacherRecord?.id,
  })

  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id))

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('myGroups')}</h1>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !courses || courses.length === 0 ? (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-10 text-center shadow-sm">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t('notFound')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((c: Course) => (
            <div key={c.id} className="bg-white dark:bg-card-dark rounded-2xl shadow-sm overflow-hidden">
              {/* Course header */}
              <button
                onClick={() => toggle(c.id)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 dark:text-white text-sm">{c.title}</p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Users size={11} className="shrink-0" />
                      {c.students?.length ?? 0} {t('students')}
                    </span>
                    {c.direction && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">{c.direction.name}</span>
                    )}
                    {c.direction && (
                      <span className="text-xs text-gray-400">
                        {c.direction.startTime}–{c.direction.endTime}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.isActive ? t('active') : t('inactive')}
                </span>
                {expandedId === c.id ? <ChevronDown size={16} className="text-gray-400 shrink-0" /> : <ChevronRight size={16} className="text-gray-400 shrink-0" />}
              </button>

              {/* Students list */}
              {expandedId === c.id && (
                <div className="border-t border-gray-100 dark:border-gray-700 px-4 pb-4">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mt-3 mb-2">
                    {t('studentsInGroup')}
                  </p>
                  {!c.students || c.students.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4 text-center">{t('noStudents')}</p>
                  ) : (
                    <div className="space-y-2">
                      {c.students.map((s, idx) => (
                        <div key={s.id} className="flex items-center gap-3 py-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                          <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0 overflow-hidden">
                            {s.user.avatarUrl
                              ? <img src={s.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                              : s.user.firstName?.[0]?.toUpperCase()
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-800 dark:text-white">
                              {s.user.firstName} {s.user.lastName}
                            </p>
                            {s.user.phone && (
                              <p className="text-xs text-gray-400 flex items-center gap-1">
                                <Phone size={10} /> {s.user.phone}
                              </p>
                            )}
                          </div>
                          {s.studentId && (
                            <span className="text-xs text-gray-400">{s.studentId}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
