import { useQuery } from '@tanstack/react-query'
import { BookOpen, ClipboardList, User } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { studentsApi } from '../../api/students'
import { coursesApi } from '../../api/courses'

export default function StudentDashboard() {
  const { user } = useAuthContext()
  const { t } = useLang()

  const { data: studentRecord } = useQuery({
    queryKey: ['my-student', user?.id],
    queryFn: () => studentsApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const { data: courses } = useQuery({
    queryKey: ['my-courses', studentRecord?.id],
    queryFn: () => coursesApi.getStudentCourses(studentRecord!.id),
    enabled: !!studentRecord?.id,
  })

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold shrink-0 overflow-hidden">
            {user?.avatarUrl
              ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
              : (user?.firstName?.[0]?.toUpperCase() ?? 'S')
            }
          </div>
          <div>
            <h1 className="text-xl font-bold">{user?.firstName} {user?.lastName}</h1>
            <p className="text-white/80 text-sm mt-0.5">{user?.email}</p>
            {studentRecord?.studentId && (
              <p className="text-white/60 text-xs mt-1">ID: {studentRecord.studentId}</p>
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
            <p className="text-2xl font-bold text-gray-800 dark:text-white">{courses?.length ?? 0}</p>
            <p className="text-sm text-gray-500">{t('myCourses')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <ClipboardList size={22} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">—</p>
            <p className="text-sm text-gray-500">{t('myAttendance')}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card-dark rounded-xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <User size={22} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white capitalize">{user?.role}</p>
            <p className="text-sm text-gray-500">{t('role')}</p>
          </div>
        </div>
      </div>

      {/* My courses */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm p-5">
        <h2 className="text-base font-bold text-gray-800 dark:text-white mb-4">{t('enrolledGroups')}</h2>
        {!courses || courses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">{t('noGroups')}</p>
        ) : (
          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen size={18} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 dark:text-white text-sm truncate">{c.title}</p>
                  {c.teacher && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {t('teacher')}: {c.teacher.user.firstName} {c.teacher.user.lastName}
                    </p>
                  )}
                  {c.direction && (
                    <span className="inline-block text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full mt-1">
                      {c.direction.name}
                    </span>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
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
