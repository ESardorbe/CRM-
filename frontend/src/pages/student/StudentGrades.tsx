import { useQuery } from '@tanstack/react-query'
import { studentsApi } from '../../api/students'
import { gradesApi, type Grade, getGradeTypes } from '../../api/grades'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'

export default function StudentGrades() {
  const { user } = useAuthContext()
  const { t, lang } = useLang()
  const gradeTypes = getGradeTypes(lang)

  const { data: studentRecord } = useQuery({
    queryKey: ['my-student', user?.id],
    queryFn: () => studentsApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const { data: grades, isLoading } = useQuery({
    queryKey: ['my-grades', studentRecord?.id],
    queryFn: () => gradesApi.getByStudent(studentRecord!.id),
    enabled: !!studentRecord?.id,
  })

  const getPercent = (score: number, max: number) => Math.round((score / max) * 100)
  const getColor = (pct: number) =>
    pct >= 85 ? 'text-green-600 dark:text-green-400' : pct >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-red-500'

  const byCourse = (grades ?? []).reduce<Record<string, Grade[]>>((acc, g) => {
    const key = g.course?.id ?? 'unknown'
    if (!acc[key]) acc[key] = []
    acc[key].push(g)
    return acc
  }, {})

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('myGrades')}</h1>

      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : !grades?.length ? (
        <div className="bg-white dark:bg-card-dark rounded-xl p-10 text-center text-gray-400 text-sm shadow-sm">
          {t('noGrades')}
        </div>
      ) : (
        Object.values(byCourse).map((courseGrades) => {
          const course = courseGrades[0]?.course
          const avg = courseGrades.reduce((s, g) => s + getPercent(Number(g.score), Number(g.maxScore)), 0) / courseGrades.length
          return (
            <div key={course?.id} className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold text-primary">{course?.title ?? t('group')}</h2>
                <span className={`text-sm font-bold ${getColor(Math.round(avg))}`}>
                  {t('average')}: {Math.round(avg)}%
                </span>
              </div>
              <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                {courseGrades.map((g) => {
                  const pct = getPercent(Number(g.score), Number(g.maxScore))
                  return (
                    <li key={g.id} className="flex items-center gap-3 px-5 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {gradeTypes[g.gradeType] ?? g.gradeType}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                          {g.comment && <span>{g.comment}</span>}
                          <span>{new Date(g.createdAt).toLocaleDateString()}</span>
                          {g.gradedBy && <span>· {g.gradedBy.firstName}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-20 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${pct >= 85 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                        <span className={`font-bold text-sm ${getColor(pct)}`}>
                          {g.score}/{g.maxScore}
                        </span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })
      )}
    </div>
  )
}
