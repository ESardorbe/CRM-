import { BarChart2 } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string | number
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="bg-white dark:bg-card-dark rounded-xl p-5 flex items-center justify-between shadow-sm">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="text-3xl font-bold mt-1 text-gray-800 dark:text-white">{value}</p>
      </div>
      <div className="w-14 h-14 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
        <BarChart2 size={26} className="text-primary" />
      </div>
    </div>
  )
}
