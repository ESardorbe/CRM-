import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import StatCard from '../components/ui/StatCard'
import { statisticsApi } from '../api/statistics'
import { studentsApi } from '../api/students'
import { teachersApi } from '../api/teachers'
import { coursesApi } from '../api/courses'

const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
const CURRENT_YEAR = new Date().getFullYear()

export default function Dashboard() {
  const [chartYear, setChartYear] = useState(CURRENT_YEAR)
  const now = new Date()

  const { data: students } = useQuery({
    queryKey: ['students-count'],
    queryFn: () => studentsApi.getAll({ page: 1, limit: 1 }),
  })
  const { data: teachers } = useQuery({
    queryKey: ['teachers-count'],
    queryFn: () => teachersApi.getAll({ page: 1, limit: 1 }),
  })
  const { data: courses } = useQuery({
    queryKey: ['courses-count'],
    queryFn: () => coursesApi.getAll({ page: 1, limit: 1 }),
  })
  const { data: leftReport } = useQuery({
    queryKey: ['left-report', now.getMonth() + 1, now.getFullYear()],
    queryFn: () => statisticsApi.getMonthlyReport(now.getFullYear(), now.getMonth() + 1),
  })

  const monthlyQueries = useQuery({
    queryKey: ['monthly-chart', chartYear],
    queryFn: async () => {
      const results = await Promise.all(
        MONTHS.map((_, i) =>
          statisticsApi.getMonthlyReport(chartYear, i + 1).catch(() => null),
        ),
      )
      return results.map((r, i) => ({
        name: MONTHS[i].slice(0, 3),
        "Jami o'quvchilar": r?.studentMovements.joined ?? 0,
        'Tark etganlar': r?.studentMovements.left ?? 0,
      }))
    },
  })

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Jami o'quvchilar soni:" value={`${students?.total ?? 0} ta`} />
        <StatCard label="O'qituvchilar soni:" value={`${teachers?.total ?? 0} ta`} />
        <StatCard label="Shu oy tark etganlar" value={`${leftReport?.studentMovements.left ?? 0} ta`} />
        <StatCard label="Jami guruhlar soni" value={`${courses?.total ?? 0} ta`} />
      </div>

      {/* Bar chart */}
      <div className="bg-white dark:bg-card-dark rounded-xl p-6 shadow-sm">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setChartYear((y) => y - 1)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronLeft size={18} />
              </button>
              <span className="font-bold text-gray-800 dark:text-white">{chartYear}-YIL</span>
              <button
                onClick={() => setChartYear((y) => y + 1)}
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 ml-8">
              {MONTHS[now.getMonth()]} oyigacha bo'lgan statistika
            </p>
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-8 h-2 bg-primary rounded inline-block" />
              <span className="text-gray-600 dark:text-gray-300">Jami o'quvchilar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-2 bg-pink-500 rounded inline-block" />
              <span className="text-gray-600 dark:text-gray-300">Tark etganlar</span>
            </div>
          </div>
        </div>

        {monthlyQueries.isLoading ? (
          <div className="h-48 flex items-center justify-center text-gray-400">Yuklanmoqda...</div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyQueries.data} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend wrapperStyle={{ display: 'none' }} />
              <Bar dataKey="Jami o'quvchilar" fill="#3D52D5" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Tark etganlar" fill="#ec4899" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
