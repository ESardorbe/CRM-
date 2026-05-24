import { useQuery } from '@tanstack/react-query'
import { useAuthContext } from '../../context/AuthContext'
import { useLang } from '../../context/LangContext'
import { studentsApi } from '../../api/students'
import { attendanceApi } from '../../api/attendance'

const statusColor = {
  present: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  absent: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300',
  late: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-700',
}

export default function StudentAttendance() {
  const { user } = useAuthContext()
  const { t } = useLang()

  const { data: studentRecord } = useQuery({
    queryKey: ['my-student', user?.id],
    queryFn: () => studentsApi.getByUserId(user!.id),
    enabled: !!user?.id,
  })

  const { data: attendanceRes, isLoading } = useQuery({
    queryKey: ['my-attendance', studentRecord?.id],
    queryFn: () => attendanceApi.getAll({ studentId: studentRecord!.id, limit: 500 }),
    enabled: !!studentRecord?.id,
  })

  const records = attendanceRes?.data
  const totalPresent = records?.filter((r) => r.status === 'present').length ?? 0
  const totalAbsent = records?.filter((r) => r.status === 'absent').length ?? 0
  const totalLate = records?.filter((r) => r.status === 'late').length ?? 0

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-bold text-gray-800 dark:text-white">{t('attendanceHistory')}</h1>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{totalPresent}</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">{t('present')}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">{totalAbsent}</p>
          <p className="text-xs text-red-500 dark:text-red-400 mt-1">{t('absent')}</p>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">{totalLate}</p>
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{t('late')}</p>
        </div>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-card-dark rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !records || records.length === 0 ? (
          <p className="text-center text-gray-400 py-10 text-sm">{t('notFound')}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3 text-left font-medium">№</th>
                <th className="px-4 py-3 text-left font-medium">{t('group')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('date')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('status')}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'table-row-even' : 'table-row-odd'}>
                  <td className="px-4 py-3">{i + 1}</td>
                  <td className="px-4 py-3 font-medium">{r.course.title}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[r.status]}`}>
                      {t(r.status as any)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
