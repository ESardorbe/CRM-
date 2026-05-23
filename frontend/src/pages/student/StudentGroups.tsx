import { useQuery } from '@tanstack/react-query'
import { BookOpen, User, Clock } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { studentsApi } from '../../api/students'
import { coursesApi } from '../../api/courses'

export default function StudentGroups() {
  const { user } = useAuthContext()
  const { t } = useLang()

  const { data: studentRecord } = useQuery({
    queryKey: ['my-student', user?.id],
    queryFn: () => studentsApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const { data: courses, isLoading } = useQuery({
    queryKey: ['my-courses', studentRecord?.id],
    queryFn: () => coursesApi.getStudentCourses(studentRecord!.id),
    enabled: !!studentRecord?.id,
  })

  const dayTypeLabel = (type: string) => {
    if (type === 'odd') return t('oddDays')
    if (type === 'even') return t('evenDays')
    return t('allDays')
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('myCourses')}</h1>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !courses || courses.length === 0 ? (
        <div className="bg-white dark:bg-card-dark rounded-2xl p-10 text-center shadow-sm">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">{t('noGroups')}</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {courses.map((c) => (
            <div key={c.id} className="bg-white dark:bg-card-dark rounded-2xl shadow-sm p-5 flex flex-col gap-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen size={20} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-800 dark:text-white truncate">{c.title}</h3>
                  {c.direction && (
                    <span className="inline-block text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full mt-1">
                      {c.direction.name}
                    </span>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {c.isActive ? t('active') : t('inactive')}
                </span>
              </div>

              {c.teacher && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <User size={14} className="text-gray-400 shrink-0" />
                  <span className="truncate">
                    {c.teacher.user.firstName} {c.teacher.user.lastName}
                  </span>
                </div>
              )}

              {c.direction && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock size={14} className="text-gray-400 shrink-0" />
                  <span>
                    {dayTypeLabel(c.direction.dayType)} &nbsp;
                    {c.direction.startTime} — {c.direction.endTime}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex gap-2 text-xs text-gray-400">
                {c.capacity && <span>{t('capacity')}: {c.students?.length ?? 0}/{c.capacity}</span>}
                {c.startDate && <span>{t('startDate')}: {new Date(c.startDate).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
