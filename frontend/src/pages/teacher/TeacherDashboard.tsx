import { useQuery } from '@tanstack/react-query'
import { Users, BookOpen, User, Calendar } from 'lucide-react'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { teachersApi } from '../../api/teachers'
import { coursesApi } from '../../api/courses'

export default function TeacherDashboard() {
  const { user } = useAuthContext()
  const { t } = useLang()

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
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <User size={11} /> {c.students?.length ?? 0} {t('students')}
                    </span>
                    {c.direction && (
                      <span className="text-xs text-blue-600 dark:text-blue-400">{c.direction.name}</span>
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
